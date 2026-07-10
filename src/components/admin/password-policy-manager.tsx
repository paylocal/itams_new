"use client";

import { useEffect, useState } from "react";
import { Save, Shield, RefreshCw } from "lucide-react";
import { useI18n } from "../i18n-provider";

export function PasswordPolicyManager() {
  const { t } = useI18n();
  const [policy, setPolicy] = useState({
    id: "",
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    passwordExpiryDays: 90,
    preventReuseCount: 3,
    lockoutAfterFailedAttempts: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/admin/password-policy");
      if (res.ok) {
        setPolicy(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/password-policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        setMessage(t("common.saved", "Saved"));
        await load();
      } else {
        const d = await res.json();
        setMessage(d.error || t("common.error", "Error"));
      }
    } catch (e) {
      setMessage(t("common.error", "Error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold">{t("admin.passwordPolicy", "Password policy")}</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t("policy.minLength", "Minimum length")}</label>
            <input
              type="number"
              min={6}
              max={128}
              value={policy.minLength}
              onChange={(e) => setPolicy({ ...policy, minLength: Number(e.target.value) })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t("policy.expiryDays", "Expiry days (0 = no expiry)")}</label>
            <input
              type="number"
              min={0}
              value={policy.passwordExpiryDays}
              onChange={(e) => setPolicy({ ...policy, passwordExpiryDays: Number(e.target.value) })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t("policy.preventReuse", "Prevent reuse last N passwords")}</label>
            <input
              type="number"
              min={0}
              max={10}
              value={policy.preventReuseCount}
              onChange={(e) => setPolicy({ ...policy, preventReuseCount: Number(e.target.value) })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t("policy.lockoutAttempts", "Lockout after failed attempts")}</label>
            <input
              type="number"
              min={0}
              value={policy.lockoutAfterFailedAttempts || 0}
              onChange={(e) => setPolicy({ ...policy, lockoutAfterFailedAttempts: Number(e.target.value) })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Toggle
            label={t("policy.requireUppercase", "Require uppercase letter")}
            checked={policy.requireUppercase}
            onChange={(v) => setPolicy({ ...policy, requireUppercase: v })}
          />
          <Toggle
            label={t("policy.requireLowercase", "Require lowercase letter")}
            checked={policy.requireLowercase}
            onChange={(v) => setPolicy({ ...policy, requireLowercase: v })}
          />
          <Toggle
            label={t("policy.requireNumber", "Require number")}
            checked={policy.requireNumber}
            onChange={(v) => setPolicy({ ...policy, requireNumber: v })}
          />
          <Toggle
            label={t("policy.requireSpecial", "Require special character")}
            checked={policy.requireSpecial}
            onChange={(v) => setPolicy({ ...policy, requireSpecial: v })}
          />
        </div>

        {message && (
          <div className={`p-2 rounded text-sm ${message === t("common.saved", "Saved") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? t("common.saving", "Saving...") : t("common.save", "Save")}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
