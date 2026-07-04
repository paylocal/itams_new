"use client";
import { createContext, useContext, useState, useEffect } from "react";

type LanguageItem = {
  code: string;
  name?: string | null;
  flag?: string | null;
  isDefault?: boolean;
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
  const [data, setData] = useState<{ languages: LanguageItem[]; translations: TranslationMap }>({
    languages: [],
    translations: {},
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("locale");
    if (stored) {
      setLocale(stored);
    }
  }, []);

  // Load languages
  useEffect(() => {
    fetch("/api/languages")
      .then(r => r.json())
      .then((l: LanguageItem[]) => {
        const list = Array.isArray(l) ? l : [];
        setData(d => ({ ...d, languages: list }));

        if (list.length === 0) return;

        setLocale((prev) => {
          // Keep current locale if still active.
          if (list.some((x) => x.code === prev)) return prev;

          // Prefer stored locale if valid.
          const stored = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
          if (stored && list.some((x) => x.code === stored)) return stored;

          // Else use default language from admin settings.
          const next = list.find((x) => x.isDefault)?.code || list[0].code;
          if (typeof window !== "undefined") {
            localStorage.setItem("locale", next);
          }
          return next;
        });
      })
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
    t: (key: string) => data.translations[key] || key,
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
