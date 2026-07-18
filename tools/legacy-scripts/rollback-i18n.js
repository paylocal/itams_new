const fs = require("fs");
const path = require("path");

const code = `"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Locale = string;

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  languages: { code: string; name: string; flag: string | null }[];
  loading: boolean;
}

// Default translations tu file JSON
import viMessages from "../messages/vi/common.json";
import enMessages from "../messages/en/common.json";

const allStatic: Record<string, any> = {
  vi: viMessages,
  en: enMessages,
};

const I18nContext = createContext<I18nContextType>({
  locale: "vi",
  setLocale: () => {},
  t: (k) => {
    // Helper lay gia tri tu object theo key "a.b.c"
    const get = (obj: any, k: string) => {
      return k.split(".").reduce((o, i) => (o ? o[i] : null), obj);
    };
    return get(allStatic.vi, k) || k;
  },
  languages: [
    { code: "vi", name: "Tieng Viet", flag: "VN" },
    { code: "en", name: "English", flag: "US" },
  ],
  loading: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Load translations tu API (override file JSON neu co)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/translations/" + locale);
        if (res.ok) {
          const data = await res.json();
          setTranslations(data || {});
        }
      } catch (e) {
        // Ignore - su dung file JSON fallback
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

  const t = useCallback(
    (key: string): string => {
      // Uu tien DB translations
      if (translations[key]) return translations[key];
      // Fallback file JSON
      const get = (obj: any, k: string) => {
        return k.split(".").reduce((o, i) => (o ? o[i] : null), obj);
      };
      const fromFile = get(allStatic[locale] || allStatic.vi, key);
      if (fromFile) return fromFile;
      // Fallback tieng Viet
      return get(allStatic.vi, key) || key;
    },
    [translations, locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, languages: I18nContext.defaultValue?.languages || [], loading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
`;

const file = path.join(__dirname, "src", "components", "i18n-provider.tsx");
fs.writeFileSync(file, code);
console.log("Done");