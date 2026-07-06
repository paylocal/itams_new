const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/layout/header.tsx");
const code = `"use client";
import { signOut } from "next-auth/react";
import { LogOut, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../i18n-provider";

export function Header({ user }: { user: any }) {
  const { locale, setLocale, t, languages } = useI18n();
  const [showLang, setShowLang] = useState(false);

  const langs = languages && languages.length > 0
    ? languages
    : [{ code: "vi", name: "Tieng Viet", flag: "VN" }];

  const currentLang = langs.find((l: any) => l.code === locale) || langs[0];

  return (
    <header key={locale} className="h-16 bg-white border-b px-6 flex items-center justify-between">
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
                  onClick={() => {
                    setLocale(l.code);
                    setShowLang(false);
                    window.location.reload();
                  }}
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
          <p className="text-xs text-gray-500">
            {user.role}
          </p>
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

fs.writeFileSync(file, code, "utf-8");
console.log("Updated header with key={locale}");