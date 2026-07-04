import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const language = await prisma.language.findFirst({
    where: { code: params.locale, isActive: true },
    include: { translations: true },
  });

  const defaultLanguage =
    (await prisma.language.findFirst({
      where: { isActive: true, isDefault: true },
      include: { translations: true },
    })) ||
    (await prisma.language.findFirst({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { translations: true },
    }));

  if (!language && !defaultLanguage) return NextResponse.json({});

  const dict: Record<string, string> = {};

  // Start with default language so missing keys in any locale still render valid text.
  if (defaultLanguage) {
    defaultLanguage.translations.forEach((t) => {
      dict[t.key] = t.value;
    });
  }

  // Override with requested locale values.
  if (language) {
    language.translations.forEach((t) => {
      dict[t.key] = t.value;
    });
  }

  return NextResponse.json(dict);
}
