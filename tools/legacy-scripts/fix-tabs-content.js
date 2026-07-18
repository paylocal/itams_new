const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "admin-language-tabs.tsx"
);
const code = `"use client";
import { useState } from "react";
import { Globe, Type } from "lucide-react";
import { LanguageManager } from "./language-manager";
import { TranslationManager } from "./translation-manager";

type Tab = "languages" | "translations";

export function AdminLanguageTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("languages");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Quan ly Ngon ngu & Translations</h1>
        <p className="text-gray-500 mt-1">
          Them, sua, xoa ngon ngu va noi dung dich
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("languages")}
              className={
                "px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 " +
                (activeTab === "languages"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700")
              }
            >
              <Globe className="w-4 h-4" />
              Ngon ngu
            </button>
            <button
              onClick={() => setActiveTab("translations")}
              className={
                "px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 " +
                (activeTab === "translations"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700")
              }
            >
              <Type className="w-4 h-4" />
              Translations
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "languages" ? <LanguageManager /> : <TranslationManager />}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(file, code);
console.log("Updated");