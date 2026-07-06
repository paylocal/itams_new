const fs = require("fs");
const path = require("path");

const code = `"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type Locale = string;

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  languages: { code: string; name: string; flag: string | null }[];
  loading: boolean;
}

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
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load languages va default locale
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/languages");
        if (res.ok) {
          const langs = await res.json();
          setLanguages(langs);

          // Determine locale
          const saved = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
          const validSaved = langs.find((l: any) => l.code === saved);
          if (validSaved) {
            setLocaleState(saved as string);
          } else {
            const def = langs.find((l: any) => l.isDefault) || langs[0];
            if (def) setLocaleState(def.code);
          }
        }
      } catch (e) {
        console.error("Load languages error:", e);
      }
    })();
  }, []);

  // Load translations khi locale thay doi
  useEffect(() => {
    if (!locale) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/translations/" + locale);
        if (res.ok) {
          const data = await res.json();
          setTranslations(data);
        }
      } catch (e) {
        console.error("Load translations error:", e);
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
      return translations[key] || key;
    },
    [translations]
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

const file = path.join(__dirname, "src", "components", "i18n-provider.tsx");
fs.writeFileSync(file, code);
console.log("Updated i18n-provider");