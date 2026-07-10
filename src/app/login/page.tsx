"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale, t, languages } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLang(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLanguages =
    Array.isArray(languages) && languages.length > 0
      ? languages
      : [
          { code: "vi", name: "Tieng Viet", flag: "🇻🇳" },
          { code: "en", name: "English", flag: "🇬🇧" },
        ];

  const currentLang =
    activeLanguages.find((l: { code: string }) => l.code === locale) ||
    activeLanguages[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError(t("auth.invalidCredentials", "Invalid username or password"));
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative">
        {/* Language selector */}
        <div className="absolute top-4 right-4" ref={langRef}>
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm hover:bg-gray-50 transition"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-base leading-none">{currentLang?.flag || "🌐"}</span>
            <span className="hidden sm:inline">{currentLang?.name || locale.toUpperCase()}</span>
          </button>
          {showLang && (
            <div className="absolute right-0 top-full mt-2 bg-white border rounded-xl shadow-xl z-10 min-w-[160px] overflow-hidden">
              {activeLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code);
                    setShowLang(false);
                  }}
                  className="flex items-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag || "🌐"}</span>
                    <span>{lang.name || lang.code.toUpperCase()}</span>
                  </span>
                  {lang.code === locale && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">
            IT
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("common.appName", "ITAMS")}
          </h1>
          <p className="text-gray-500 mt-2">
            {t("auth.subtitle", "IT Asset Management")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.username", "Username")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={t("auth.emailPlaceholder", "name@company.com")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("common.password", "Password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={t("auth.passwordPlaceholder", "Enter password")}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? t("common.loading", "Loading...") : t("common.login", "Login")}
          </button>
        </form>

        {process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true" && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1">{t("auth.testAccounts", "Demo accounts")} (Password123!):</p>
            <div className="grid grid-cols-2 gap-1">
              <p>👑 admin@itams.local</p>
              <p>🎯 leader@itams.local</p>
              <p>👔 manager@itams.local</p>
              <p>📋 bod@itams.local</p>
              <p>💻 it@itams.local</p>
              <p>🛒 purchase@itams.local</p>
              <p>👤 employee@itams.local</p>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          © {new Date().getFullYear()} ITAMS
        </p>
      </div>
    </div>
  );
}
