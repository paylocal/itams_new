"use client";
import { createContext, useContext, useState, useEffect } from "react";

const I18nContext = createContext<any>(null);

export function I18nProvider({ children }: { children: any }) {
  const [locale, setLocale] = useState("vi");
  const [data, setData] = useState<{ languages: any[]; translations: any }>({
    languages: [],
    translations: {},
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
      .then(l => setData(d => ({ ...d, languages: l })))
      .catch(() => {});
  }, []);

  // Load translations khi locale thay doi
  useEffect(() => {
    fetch("/api/translations/" + locale)
      .then(r => r.json())
      .then(t => setData(d => ({ ...d, translations: t })))
      .catch(() => setData(d => ({ ...d, translations: {} })));
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
