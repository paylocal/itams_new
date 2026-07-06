const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "components", "i18n-provider.tsx");
const code = `"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Import file JSON lam fallback
import viJSON from "../messages/vi/common.json";
import enJSON from "../messages/en/common.json";

type Locale = string;

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  languages: { code: string; name: string; flag: string | null }[];
  loading: boolean;
}

const fallbackData: Record<string, any> = {
  vi: viJSON,
  en: enJSON,
};

const I18nContext = createContext<I18nContextType>({
  locale: "vi",
  setLocale: () => {},
  t: (k) => k,
  languages: [],
  loading: true,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [languages, setLanguages] = useState<I18nContextType["languages"]>([]);
  const [dbTranslations, setDbTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load languages tu API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/languages");
        if (res.ok) {
          const langs = await res.json();
          setLanguages(langs);
          const saved = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
          const valid = langs.find((l: any) => l.code === saved);
          if (valid) {
            setLocaleState(saved as string);
          } else {
            const def = langs.find((l: any) => l.isDefault) || langs[0];
            if (def) setLocaleState(def.code);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Load translations tu DB
  useEffect(() => {
    if (!locale) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/translations/" + locale);
        if (res.ok) {
          const data = await res.json();
          setDbTranslations(data || {});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", l);
    }
  };

  // Ham t() uu tien: DB -> File JSON -> Key
  const t = useCallback(
    (key: string): string => {
      // 1. DB translations
      if (dbTranslations[key]) return dbTranslations[key];
      // 2. File JSON fallback
      const getNested = (obj: any, k: string) => {
        return k.split(".").reduce((o, i) => (o ? o[i] : null), obj);
      };
      const fromFile = getNested(fallbackData[locale] || fallbackData.vi, key);
      if (fromFile) return fromFile;
      // 3. Tra ve key
      return key;
    },
    [dbTranslations, locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, languages, loading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
`;

fs.writeFileSync(file, code, "utf-8");
console.log("Created:", file);