import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


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
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
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
    if (isDefault) {
      await prisma.language.updateMany({
        where: { id: { not: undefined } },
        data: { isDefault: false },
      });
    }
    const lang = await prisma.language.create({
      data: { code, name, flag, isDefault: !!isDefault },
    });
    // Copy translations tu ngon ngu goc
    const sourceCode = copyFrom || "vi";
    const sourceLang = await prisma.language.findUnique({
      where: { code: sourceCode },
    });
    if (sourceLang && sourceLang.id !== lang.id) {
      const sourceTrans = await prisma.translation.findMany({
        where: { languageId: sourceLang.id },
      });
      if (sourceTrans.length > 0) {
        await prisma.translation.createMany({
          data: sourceTrans.map((t) => ({
            languageId: lang.id,
            key: t.key,
            value: t.value,
            category: t.category,
          })),
        });
      }
    }
    return NextResponse.json(lang, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}