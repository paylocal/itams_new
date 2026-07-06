const fs = require("fs");
const path = require("path");

const code = `"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const I18nContext = createContext({
  locale: "vi",
  setLocale: () => {},
  t: (k) => k,
  languages: [],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState("vi");
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);

  // Load languages 1 lan
  useEffect(() => {
    fetch("/api/languages")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setLanguages(data);
        if (data.length > 0) {
          const def = data.find((l) => l.isDefault) || data[0];
          setLocaleState(def.code);
        }
      })
      .catch(() => {});
  }, []);

  // Load translations khi doi locale
  useEffect(() => {
    if (!locale) return;
    fetch("/api/translations/" + locale)
      .then((r) => (r.ok ? r.json() : {}))
      .then(setTranslations)
      .catch(() => setTranslations({}));
  }, [locale]);

  const setLocale = (l) => {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
    } catch {}
  };

  const t = useCallback(
    (key) => {
      if (translations[key]) return translations[key];
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

const file = path.join(__dirname, "src/components/i18n-provider.tsx");
fs.writeFileSync(file, code, "utf-8");
console.log("Created i18n-provider");