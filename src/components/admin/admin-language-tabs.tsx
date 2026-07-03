"use client";
import { useState, useEffect } from "react";
import { Globe, Type } from "lucide-react";
import { useI18n } from "../i18n-provider";
import { LanguageManager } from "./language-manager";
import { TranslationManager } from "./translation-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export function AdminLanguageTabs() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState("languages");

  // Reload khi doi ngon ngu de cap nhat data
  useEffect(() => {
    setTab((t) => t);
  }, [locale]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
          <p className="text-gray-500 mt-1">{t("admin.subtitle")}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b flex">
          <button
            onClick={() => setTab("languages")}
            className={
              "px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 " +
              (tab === "languages"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700")
            }
          >
            <Globe className="w-4 h-4" />
            {t("admin.tabLanguages")}
          </button>
          <button
            onClick={() => setTab("translations")}
            className={
              "px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 " +
              (tab === "translations"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700")
            }
          >
            <Type className="w-4 h-4" />
            {t("admin.tabTranslations")}
          </button>
        </div>
        <div className="p-6" key={locale + tab}>
          {tab === "languages" ? <LanguageManager key="lang" /> : <TranslationManager key="trans" />}
        </div>
      </div>
    </div>
  );
}
