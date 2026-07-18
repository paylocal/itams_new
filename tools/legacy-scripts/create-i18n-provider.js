const fs = require("fs");
const path = require("path");

const code = `"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Locale = "vi" | "en";
type Messages = any;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

import viMessages from "@/messages/vi/common.json";
import enMessages from "@/messages/en/common.json";

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
    localStorage.setItem("locale", newLocale);
  };

  // Helper de lay text theo key (dung dau cham)
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = allMessages[locale];
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key; // Khong tim thay -> tra ve key
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
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n phai dung trong I18nProvider");
  }
  return context;
}

// Hook tien ich de format tien theo locale
export function useFormatCurrency() {
  const { locale } = useI18n();
  return (amount: number) => {
    if (locale === "vi") {
      return new Intl.NumberFormat("vi-VN").format(amount) + " d";
    }
    return "$" + new Intl.NumberFormat("en-US").format(amount);
  };
}

// Hook format ngay thang
export function useFormatDate() {
  const { locale } = useI18n();
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
console.log("Created:", file);
