const fs = require("fs");
const path = require("path");

const code = `"use client";
import { signOut } from "next-auth/react";
import { LogOut, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "../i18n-provider";

export function Header({ user }: { user: any }) {
  const { locale, setLocale, t, languages } = useI18n();
  const [showLang, setShowLang] = useState(false);

  const langs = languages && languages.length > 0
    ? languages
    : [{ code: "vi", name: "Tieng Viet", flag: "VN" }];

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <div></div>

      <div className="flex items-center gap-4">
        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-gray-50 text-sm"
          >
            <Globe className="w-4 h-4" />
            {locale.toUpperCase()}
          </button>

          {showLang && (
            <div
              className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[150px]"
              onMouseLeave={() => setShowLang(false)}
            >
              {langs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLocale(l.code);
                    setShowLang(false);
                  }}
                  className={
                    "block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 " +
                    (locale === l.code ? "bg-blue-50 font-medium" : "")
                  }
                >
                  {l.flag} {l.name}
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
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
`;

const file = path.join(__dirname, "src/components/layout/header.tsx");
fs.writeFileSync(file, code, "utf-8");
console.log("Created header");