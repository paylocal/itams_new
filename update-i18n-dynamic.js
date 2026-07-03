const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "components", "i18n-provider.tsx");
const code = `"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const I18nContext = createContext({
  locale: "vi",
  setLocale: () => {},
  t: (k) => k,
  languages: [],
  loading: true,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState("vi");
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState([]);
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
          const valid = langs.find((l) => l.code === saved);
          if (valid) {
            setLocaleState(saved as string);
          } else {
            const def = langs.find((l) => l.isDefault) || langs[0];
            if (def) setLocaleState(def.code);
          }
        }
      } catch (e) {
        console.error("Load languages error:", e);
      }
    })();
  }, []);

  // Load translations khi doi locale
  useEffect(() => {
    if (!locale) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/translations/" + locale);
        if (res.ok) {
          const data = await res.json();
          setTranslations(data || {});
        }
      } catch (e) {
        console.error("Load translations error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [locale]);

  const setLocale = (l) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", l);
    }
  };

  // Ham t() uu tien translations tu DB, fallback file JSON
  const t = useCallback(
    (key) => {
      if (translations[key]) return translations[key];
      return key;
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

fs.writeFileSync(file, code);
console.log("Updated i18n-provider");