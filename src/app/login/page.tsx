"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError(locale === "vi" ? "Email hoặc mật khẩu không đúng" : "Invalid email or password");
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
            {locale === "vi" ? "VI" : "EN"}
          </button>
          {showLang && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-10">
              <button
                onClick={() => {
                  setLocale("vi");
                  setShowLang(false);
                }}
                className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-50"
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                onClick={() => {
                  setLocale("en");
                  setShowLang(false);
                }}
                className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-50"
              >
                🇬🇧 English
              </button>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-blue-600 text-center">
          {t("common.appName")}
        </h1>
        <p className="text-gray-500 text-center mt-2 mb-6">
          {locale === "vi" ? "Quản lý Tài sản CNTT" : "IT Asset Management"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("user.email")}
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
              {locale === "vi" ? "Mật khẩu" : "Password"}
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
            {loading ? t("common.loading") : t("common.login")}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
          <p className="font-semibold mb-1">
            {locale === "vi" ? "Tài khoản test:" : "Test accounts:"}
          </p>
          <p>👑 {locale === "vi" ? "Quản trị viên" : "Admin"}: admin@company.com / password123</p>
          <p>👔 {locale === "vi" ? "Quản lý" : "Manager"}: manager@company.com / password123</p>
          <p>💻 IT: it1@company.com / password123</p>
          <p>🛒 {locale === "vi" ? "Mua sắm" : "Purchasing"}: purchase@company.com / password123</p>
          <p>👤 {locale === "vi" ? "Nhân viên" : "Employee"}: employee1@company.com / password123</p>
        </div>
      </div>
    </div>
  );
}