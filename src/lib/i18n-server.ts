import { cookies } from "next/headers";
import { prisma } from "./prisma";

type TranslationMap = Record<string, string>;

const cache = new Map<string, TranslationMap>();

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const val = vars[name];
    return val !== undefined ? String(val) : `{{${name}}}`;
  });
}

export async function getServerLocale(): Promise<string> {
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value;
  if (locale) return locale;

  const def = await prisma.language.findFirst({ where: { isDefault: true } });
  return def?.code || "vi";
}

export async function getServerT(locale?: string) {
  const loc = locale || (await getServerLocale());

  let translations = cache.get(loc);
  if (!translations) {
    const rows = await prisma.translation.findMany({
      where: { language: { code: loc } },
      select: { key: true, value: true },
    });
    translations = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    cache.set(loc, translations);
  }

  return {
    locale: loc,
    t: (key: string, fallback?: string, vars?: Record<string, string | number>) => {
      const translated = translations[key];
      if (translated) return interpolate(translated, vars);
      if (fallback !== undefined) return interpolate(fallback, vars);
      return key;
    },
  };
}
