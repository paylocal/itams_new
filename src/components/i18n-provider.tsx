"use client";
import { createContext, useContext, useState, useEffect } from "react";

type LanguageItem = {
  code: string;
  name?: string | null;
  flag?: string | null;
};

type TranslationMap = Record<string, string>;

type I18nValue = {
  locale: string;
  setLocale: (l: string) => void;
  t: (key: string) => string;
  languages: LanguageItem[];
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("vi");
  const [data, setData] = useState<{ languages: LanguageItem[]; translations: TranslationMap; fallbackTranslations: TranslationMap }>({
    languages: [],
    translations: {},
    fallbackTranslations: {},
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("locale");
    if (stored && stored !== locale) {
      setLocale(stored);
    }
  }, [locale]);

  // Load languages
  useEffect(() => {
    fetch("/api/languages")
      .then(r => r.json())
      .then((l: LanguageItem[]) => setData(d => ({ ...d, languages: Array.isArray(l) ? l : [] })))
      .catch(() => {});
  }, []);

  // Load Vietnamese fallback dictionary once so missing locale keys never render raw key text.
  useEffect(() => {
    fetch("/api/translations/vi")
      .then(r => r.json())
      .then((t: TranslationMap) => setData(d => ({ ...d, fallbackTranslations: t || {} })))
      .catch(() => {});
  }, []);

  // Load translations khi locale thay doi
  useEffect(() => {
    let alive = true;
    fetch("/api/translations/" + locale)
      .then(r => r.json())
      .then((t: TranslationMap) => {
        if (!alive) return;
        setData(d => ({ ...d, translations: t || {} }));
      })
      .catch(() => {
        if (!alive) return;
        setData(d => ({ ...d, translations: {} }));
      });

    return () => {
      alive = false;
    };
  }, [locale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = {
    locale,
    setLocale: (l: string) => {
      setLocale(l);
      if (typeof window !== "undefined") {
        localStorage.setItem("locale", l);
      }
    },
    t: (key: string) => data.translations[key] || data.fallbackTranslations[key] || key,
    languages: data.languages,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
