const fs = require("fs");
const path = require("path");

// HEADER
const headerCode = `"use client";
import { signOut } from "next-auth/react";
import { LogOut, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "../i18n-provider";

export function Header({ user }: { user: any }) {
  const { locale, setLocale, languages } = useI18n();
  const [showLang, setShowLang] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Khi locale thay doi (do setLocale), reload sau 100ms
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const isReload = sessionStorage.getItem("i18n-reload");
      if (isReload === "yes") {
        sessionStorage.removeItem("i18n-reload");
        window.location.reload();
      }
    }
  }, [locale, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const langs = languages && languages.length > 0
    ? languages
    : [{ code: "vi", name: "Tieng Viet", flag: "VN" }];

  const currentLang = langs.find((l: any) => l.code === locale) || langs[0];

  const handleSwitch = (code: string) => {
    setLocale(code);
    sessionStorage.setItem("i18n-reload", "yes");
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <div></div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-gray-50 text-sm"
          >
            <Globe className="w-4 h-4" />
            {currentLang ? currentLang.flag + " " + (currentLang.code || "").toUpperCase() : locale.toUpperCase()}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showLang && (
            <div
              className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[150px]"
              onMouseLeave={() => setShowLang(false)}
            >
              {langs.map((l: any) => (
                <button
                  key={l.code}
                  onClick={() => handleSwitch(l.code)}
                  className={
                    "block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 " +
                    (locale === l.code ? "bg-blue-50 font-medium" : "")
                  }
                >
                  <span className="text-base">{l.flag || "🌐"}</span>
                  <span>{l.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{(l.code || "").toUpperCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>

        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
          {user.name?.[0]?.toUpperCase()}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 hover:bg-red-50 rounded-full text-red-600"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
`;

fs.writeFileSync("src/components/layout/header.tsx", headerCode);
console.log("Rebuilt header");