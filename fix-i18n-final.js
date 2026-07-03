const fs = require("fs");
const path = require("path");

const code = `"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import viMessages from "../messages/vi/common.json";
import enMessages from "../messages/en/common.json";

type Locale = "vi" | "en";
type Messages = any;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType>({
  locale: "vi",
  setLocale: () => {},
  t: (key: string) => {
    // Mac dinh tra ve tieng Viet neu chua mount
    const keys = key.split(".");
    let value: any = viMessages;
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  },
  messages: viMessages,
});

const allMessages: Record<Locale, Messages> = {
  vi: viMessages,
  en: enMessages,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  // Load tu localStorage khi mount
  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && (saved === "vi" || saved === "en")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
    }
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = allMessages[locale];
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        messages: allMessages[locale],
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useClientI18n() {
  // Alias cho useI18n (giu de tuong thich)
  return useContext(I18nContext);
}

export function useFormatCurrency() {
  const { locale } = useContext(I18nContext);
  return (amount: number) => {
    if (locale === "vi") {
      return new Intl.NumberFormat("vi-VN").format(amount) + " d";
    }
    return "$" + new Intl.NumberFormat("en-US").format(amount);
  };
}

export function useFormatDate() {
  const { locale } = useContext(I18nContext);
  return (date: Date | string) => {
    const d = new Date(date);
    if (locale === "vi") {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    }
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };
}
`;

const file = path.join(__dirname, "src", "components", "i18n-provider.tsx");
fs.writeFileSync(file, code);
console.log("Updated i18n-provider");