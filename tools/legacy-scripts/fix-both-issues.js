const fs = require("fs");
const path = require("path");

// 1. SUA i18n-provider de luu translations
const i18nFile = path.join(__dirname, "src/components/i18n-provider.tsx");
let i18nCode = `"use client";
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
          // Lay tu localStorage
          let saved = "vi";
          try {
            const ls = localStorage.getItem("locale");
            if (ls && data.find((l: any) => l.code === ls)) {
              saved = ls;
            } else {
              const def = data.find((l: any) => l.isDefault) || data[0];
              if (def) saved = def.code;
            }
          } catch {}
          setLocaleState(saved);
        }
      })
      .catch(() => {});
  }, []);

  // Load translations khi doi locale
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
    (key: string) => translations[key] !== undefined ? translations[key] : key,
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

fs.writeFileSync(i18nFile, i18nCode);
console.log("Updated i18n-provider with localStorage");