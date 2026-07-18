const fs = require("fs");
const path = require("path");

const code = `"use client";
import { useState } from "react";
import { Globe, Type } from "lucide-react";
import { LanguageManager } from "./language-manager";
import { TranslationManager } from "./translation-manager";

export function AdminLanguageTabs() {
  const [tab, setTab] = useState("languages");
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Quan ly Ngon ngu & Translations</h1>
        <p className="text-gray-500 mt-1">
          Them, sua, xoa ngon ngu va noi dung dich
        </p>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b flex">
          <button
            onClick={() => setTab("languages")}
            className={
              "px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 " +
              (tab === "languages"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500")
            }
          >
            <Globe className="w-4 h-4" />
            Ngon ngu
          </button>
          <button
            onClick={() => setTab("translations")}
            className={
              "px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 " +
              (tab === "translations"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500")
            }
          >
            <Type className="w-4 h-4" />
            Translations
          </button>
        </div>
        <div className="p-6">
          {tab === "languages" ? <LanguageManager /> : <TranslationManager />}
        </div>
      </div>
    </div>
  );
}
`;

const dir = path.join(__dirname, "src/components/admin");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "admin-language-tabs.tsx");
fs.writeFileSync(file, code, "utf-8");
console.log("Created admin-language-tabs.tsx");
