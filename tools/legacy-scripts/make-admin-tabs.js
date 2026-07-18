const fs = require("fs");
const path = require("path");

const code = `"use client";
import { useState } from "react";
import { Globe, Edit3, Plus, Trash2, Save, X, Search, Type } from "lucide-react";
import { LanguageManager } from "./language-manager";
import { TranslationManager } from "./translation-manager";

type Tab = "languages" | "translations";

export function AdminLanguageTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("languages");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Quan ly Ngon ngu</h1>
        <p className="text-gray-500 mt-1">
          Quan ly ngon ngu va noi dung dich (translations) trong he thong
        </p>
      </div>

      {/* Tabs */}
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
              <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                <LanguageCount />
              </span>
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

        {/* Content */}
        <div className="p-6">
          {activeTab === "languages" ? <LanguageManager /> : <TranslationManager />}
        </div>
      </div>
    </div>
  );
}

// Hien thi so luong ngon ngu
function LanguageCount() {
  const [count, setCount] = useState(0);
  useState; // avoid unused warning
  if (typeof window !== "undefined") {
    fetch("/api/admin/languages")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCount(d.length))
      .catch(() => {});
  }
  return <>{count}</>;
}
`;

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "admin-language-tabs.tsx"
);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code);
console.log("Created");