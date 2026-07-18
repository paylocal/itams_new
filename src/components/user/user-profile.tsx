"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../i18n-provider";
import { KeyRound, Save, Check, AlertCircle, User, Mail, Briefcase, Shield } from "lucide-react";

interface Props {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department: string | null;
    position: string | null;
    lastPasswordChangeAt: Date | string;
    createdAt: Date | string;
    manager: { name: string } | null;
  };
}

export function UserProfile({ user }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: "", new: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState<string[]>([]);
  const [pwSuccess, setPwSuccess] = useState("");

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErrors([]);
    setPwSuccess("");
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pw.current,
          newPassword: pw.new,
          confirmPassword: pw.confirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwErrors(Array.isArray(data.errors) ? data.errors : [data.error || t("common.error", "Error")]);
      } else {
        setPwSuccess(t("user.passwordChanged", "Password changed successfully"));
        setPw({ current: "", new: "", confirm: "" });
      }
    } finally {
      setPwLoading(false);
    }
  }

  const roleLabels: Record<string, string> = {
    ADMIN: t("roles.ADMIN", "Admin"),
    MANAGER: t("roles.MANAGER", "Manager"),
    LEAD: t("roles.LEAD", "Lead"),
    IT_STAFF: t("roles.IT_STAFF", "IT Staff"),
    PURCHASING: t("roles.PURCHASING", "Purchasing"),
    EMPLOYEE: t("roles.EMPLOYEE", "Employee"),
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> {t("profile.info", "Profile")}
        </h2>
        <form onSubmit={updateProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">{t("user.name", "Name")}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1">
                <Mail className="w-4 h-4" /> {t("user.email", "Email")}
              </label>
              <input value={user.email} disabled className="w-full border rounded px-3 py-2 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1">
                <Shield className="w-4 h-4" /> {t("user.role", "Role")}
              </label>
              <input value={roleLabels[user.role] || user.role} disabled className="w-full border rounded px-3 py-2 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> {t("user.department", "Department")}
              </label>
              <input value={user.department || "-"} disabled className="w-full border rounded px-3 py-2 bg-gray-50" />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? t("common.saving", "Saving...") : t("common.save", "Save")}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5" /> {t("profile.changePassword", "Change password")}
        </h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t("profile.currentPassword", "Current password")}</label>
            <input
              type="password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t("profile.newPassword", "New password")}</label>
            <input
              type="password"
              value={pw.new}
              onChange={(e) => setPw({ ...pw, new: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">{t("profile.confirmPassword", "Confirm password")}</label>
            <input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {pwErrors.length > 0 && (
            <div className="bg-red-50 text-red-700 p-3 rounded flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <ul className="text-sm list-disc pl-4">
                {pwErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {pwSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded flex items-center gap-2">
              <Check className="w-5 h-5" /> {pwSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" /> {pwLoading ? t("common.saving", "Saving...") : t("profile.changePassword", "Change password")}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          {t("profile.lastPasswordChange", "Last password change")}:{" "}
          {new Date(user.lastPasswordChangeAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
