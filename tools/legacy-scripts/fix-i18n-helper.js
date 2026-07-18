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
  mounted: boolean;
}

const defaultMessages: Messages = viMessages;
const I18nContext = createContext<I18nContextType>({
  locale: "vi",
  setLocale: () => {},
  t: (key: string) => key,
  messages: defaultMessages,
  mounted: false,
});

const allMessages: Record<Locale, Messages> = {
  vi: viMessages,
  en: enMessages,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    // Tra ve key neu chua mount (SSR)
    if (!mounted) return key;

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
        mounted,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Hook chi su dung khi da mount (client side)
export function useClientI18n() {
  const context = useContext(I18nContext);
  if (!context.mounted) {
    return {
      locale: "vi" as Locale,
      setLocale: () => {},
      t: (key: string) => key,
      messages: defaultMessages,
      mounted: false,
    };
  }
  return context;
}

export function useFormatCurrency() {
  const { locale } = useClientI18n();
  return (amount: number) => {
    if (locale === "vi") {
      return new Intl.NumberFormat("vi-VN").format(amount) + " d";
    }
    return "$" + new Intl.NumberFormat("en-US").format(amount);
  };
}

export function useFormatDate() {
  const { locale } = useClientI18n();
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
console.log("Updated:", file);