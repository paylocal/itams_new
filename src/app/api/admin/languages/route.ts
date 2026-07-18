import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeLocaleCode(code: string) {
  const c = (code || "").toLowerCase();
  const map: Record<string, string> = {
    jp: "ja",
    ch: "zh-CN",
    cn: "zh-CN",
    kr: "ko",
  };
  return map[c] || c;
}

async function translateText(text: string, sourceCode: string, targetCode: string) {
  if (!text) return text;
  if (sourceCode === targetCode) return text;

  const source = normalizeLocaleCode(sourceCode);
  const target = normalizeLocaleCode(targetCode);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx" +
      "&sl=" +
      encodeURIComponent(source) +
      "&tl=" +
      encodeURIComponent(target) +
      "&dt=t&q=" +
      encodeURIComponent(text);

    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);

    if (!res.ok) return text;
    const data = await res.json();
    const translated = Array.isArray(data?.[0])
      ? (data[0] as unknown[])
          .map((x) => (Array.isArray(x) ? String(x[0] || "") : ""))
          .join("")
      : "";

    return translated || text;
  } catch {
    // Never block language creation due to translation provider/network issues.
    return text;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, idx: number) => Promise<R>
) {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (true) {
      const current = index;
      index += 1;
      if (current >= items.length) break;
      results[current] = await mapper(items[current], current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, () => worker())
  );
  return results;
}


export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const languages = await prisma.language.findMany({
      include: { _count: { select: { translations: true } } },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(languages);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { code, name, flag, isDefault, copyFrom } = await req.json();
    if (!code || !name) {
      return NextResponse.json({ error: "Thieu code/name" }, { status: 400 });
    }

    const targetCode = String(code).toLowerCase();
    if (isDefault) {
      await prisma.language.updateMany({
        where: { id: { not: undefined } },
        data: { isDefault: false },
      });
    }
    const lang = await prisma.language.create({
      data: { code: targetCode, name, flag, isDefault: !!isDefault },
    });

    // Pick source language from request -> default language -> first active language.
    const sourceLang =
      (copyFrom
        ? await prisma.language.findFirst({ where: { code: String(copyFrom).toLowerCase(), isActive: true } })
        : null) ||
      (await prisma.language.findFirst({ where: { isActive: true, isDefault: true } })) ||
      (await prisma.language.findFirst({ where: { isActive: true }, orderBy: { order: "asc" } }));

    if (sourceLang && sourceLang.id !== lang.id) {
      const sourceTrans = await prisma.translation.findMany({
        where: { languageId: sourceLang.id },
      });

      if (sourceTrans.length > 0) {
        const translatedRows = await mapWithConcurrency(sourceTrans, 8, async (t) => {
          const value = await translateText(t.value || "", sourceLang.code, targetCode);
          return {
            languageId: lang.id,
            key: t.key,
            value,
            category: t.category,
          };
        });

        try {
          await prisma.translation.createMany({
            data: translatedRows,
          });
        } catch (insertError) {
          // Avoid leaving a half-created language without translations.
          await prisma.language.delete({ where: { id: lang.id } });
          throw insertError;
        }
      }
    }
    return NextResponse.json(lang, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}