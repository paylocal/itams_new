import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultTranslations } from "@/lib/default-translations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const locale = params.locale;
  const language = await prisma.language.findFirst({
    where: { code: locale, isActive: true },
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

  const dict: Record<string, string> = {};

  // 1. Start with in-code defaults for the requested locale, fallback to default locale.
  const fallbackLocale = defaultTranslations[locale] ? locale : "vi";
  Object.assign(dict, defaultTranslations[fallbackLocale] || defaultTranslations["vi"] || {});

  // 2. Override with default language from DB (admin customizations).
  if (defaultLanguage) {
    defaultLanguage.translations.forEach((t) => {
      if (t.value) dict[t.key] = t.value;
    });
  }

  // 3. Override with requested locale values from DB.
  if (language) {
    language.translations.forEach((t) => {
      if (t.value) dict[t.key] = t.value;
    });
  }

  return NextResponse.json(dict);
}
