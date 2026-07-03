const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/i18n-provider.tsx");
const code = `"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const I18nContext = createContext<any>({
  locale: "vi",
  setLocale: () => {},
  t: (k: string) => k,
  languages: [],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState("vi");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [languages, setLanguages] = useState<any[]>([]);

  // Load languages
  useEffect(() => {
    fetch("/api/languages")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setLanguages(data);
        if (data.length > 0) {
          const def = data.find((l: any) => l.isDefault) || data[0];
          setLocaleState(def.code);
        }
      })
      .catch(() => {});
  }, []);

  // Load translations
  useEffect(() => {
    if (!locale) return;
    fetch("/api/translations/" + locale)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (data && typeof data === "object") {
          setTranslations(data);
        }
      })
      .catch(() => setTranslations({}));
  }, [locale]);

  const setLocale = (l: string) => {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
    } catch {}
  };

  const t = useCallback(
    (key: string) => {
      // Tra ve value neu co, neu khong thi return key
      if (translations[key] !== undefined) {
        return translations[key];
      }
      return key;
    },
    [translations]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, languages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
`;

fs.writeFileSync(file, code, "utf-8");
console.log("Created i18n-provider v2");
