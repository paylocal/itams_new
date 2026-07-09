"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale, t, languages } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const activeLanguages =
    Array.isArray(languages) && languages.length > 0
      ? languages
      : [
          { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1 px-2 py-1 border rounded text-sm hover:bg-gray-50"
          >
            <Globe className="w-3 h-3" />
            {String(currentLang?.code || locale).toUpperCase()}
          </button>
          {showLang && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-10">
              {activeLanguages.map(
                (lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code);
                      setShowLang(false);
                    }}
                    className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    {(lang.flag || "🌐") + " " + (lang.name || lang.code.toUpperCase())}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-blue-600 text-center">
          {t("common.appName", "ITAMS")}
        </h1>
        <p className="text-gray-500 text-center mt-2 mb-6">
          {t("auth.subtitle", "IT Asset Management")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.username", "Username")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@company.com"
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
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="password123"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t("common.loading", "Loading...") : t("common.login", "Login")}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
          <p className="font-semibold mb-1">
            {t("auth.testAccounts", "Test accounts:")}
          </p>
          <p>👑 {t("roles.ADMIN", "Administrator")}: admin@company.com / password123</p>
          <p>👔 {t("roles.MANAGER", "Manager")}: manager@company.com / password123</p>
          <p>💻 IT: it1@company.com / password123</p>
          <p>🛒 {t("roles.PURCHASING", "Purchasing")}: purchase@company.com / password123</p>
          <p>👤 {t("roles.EMPLOYEE", "Employee")}: employee1@company.com / password123</p>
        </div>
      </div>
    </div>
  );
}
