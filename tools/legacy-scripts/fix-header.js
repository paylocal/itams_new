const fs = require("fs");
const path = require("path");

const code = `"use client";

import { signOut } from "next-auth/react";
import { LogOut, Globe, ChevronDown, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "../i18n-provider";

const roleKeys = {
  EMPLOYEE: "roles.EMPLOYEE",
  MANAGER: "roles.MANAGER",
  IT_STAFF: "roles.IT_STAFF",
  PURCHASING: "roles.PURCHASING",
  ADMIN: "roles.ADMIN",
};

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  if (!mounted) {
    return (
      <button className="p-2 rounded-md">
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      title={theme === "light" ? "Chuyen sang dark mode" : "Chuyen sang light mode"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-gray-600" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
}

export function Header({ user }: { user: any }) {
  const { locale, setLocale, t } = useI18n();
  const [showLang, setShowLang] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-sm text-gray-500 dark:text-gray-400">
          {t("common.appName")}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1 px-3 py-1.5 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            <Globe className="w-4 h-4" />
            {locale === "vi" ? "VI" : "EN"}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showLang && (
            <div
              className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-10"
              onMouseLeave={() => setShowLang(false)}
            >
              <button
                onClick={() => {
                  setLocale("vi");
                  setShowLang(false);
                }}
                className={
                  "block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 " +
                  (locale === "vi" ? "bg-blue-50 dark:bg-blue-900/30" : "")
                }
              >
                Tiếng Việt
              </button>
              <button
                onClick={() => {
                  setLocale("en");
                  setShowLang(false);
                }}
                className={
                  "block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 " +
                  (locale === "en" ? "bg-blue-50 dark:bg-blue-900/30" : "")
                }
              >
                English
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t(roleKeys[user.role] || user.role)}
            </p>
          </div>
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-medium">
            {user.name?.[0]?.toUpperCase()}
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-red-600"
          title={t("common.logout")}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
`;

const file = path.join(__dirname, "src", "components", "layout", "header.tsx");
fs.writeFileSync(file, code);
console.log("Updated header with ThemeToggle");