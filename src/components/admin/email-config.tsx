"use client";

import { useEffect, useState } from "react";
import { Mail, Save, AlertCircle, Send } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

const FIELDS = [
  { key: "SMTP_HOST", labelKey: "email.smtpHost", fallback: "SMTP Host", type: "text" },
  { key: "SMTP_PORT", labelKey: "email.smtpPort", fallback: "SMTP Port", type: "text" },
  { key: "SMTP_USER", labelKey: "email.smtpUser", fallback: "SMTP User", type: "text" },
  { key: "SMTP_PASS", labelKey: "email.smtpPass", fallback: "SMTP Password", type: "password" },
  { key: "SMTP_FROM", labelKey: "email.smtpFrom", fallback: "From Email", type: "text" },
  { key: "SMTP_REPLY_TO", labelKey: "email.smtpReplyTo", fallback: "Reply-To Email", type: "text" },
];

export function EmailConfig() {
  const { t } = useI18n();
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/email-config")
      .then((r) => r.json())
      .then((d) => {
        // backward compatible default for secure
        if (d.SMTP_SECURE === undefined || d.SMTP_SECURE === null) {
          d.SMTP_SECURE = "false";
        }
        setConfig(d || {});
      })
      .catch((e) => console.error(e));
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/email-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          EMAIL_ENABLED: config.EMAIL_ENABLED === "true" ? "true" : "false",
          SMTP_SECURE: config.SMTP_SECURE === "true" ? "true" : "false",
        }),
      });
      if (res.ok) {
        setMessage(t("common.saved", "Saved"));
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

  async function sendTest() {
    setTesting(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/email-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      const d = await res.json();
      if (res.ok) {
        setMessage(
          d.dev
            ? t("email.testDev", "Email config valid. Real sending is disabled; logged to console.")
            : t("email.testSent", "Test email sent") + (d.messageId ? ` (ID: ${d.messageId})` : "")
        );
      } else {
        setMessage(d.error || t("common.error", "Error"));
      }
    } catch (e) {
      setMessage(t("common.error", "Error"));
    } finally {
      setTesting(false);
    }
  }

  const update = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">{t("email.title", "Email Configuration")}</h1>
      </div>

      {message && (
        <div
          className={`p-3 rounded flex items-center gap-2 ${
            message.includes(t("common.saved", "Saved")) ||
            message.includes(t("email.testSent", "Test email sent")) ||
            message.includes(t("email.testDev", "Email config valid"))
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.EMAIL_ENABLED === "true"}
            onChange={(e) => update("EMAIL_ENABLED", e.target.checked ? "true" : "false")}
          />
          <span>{t("email.enabled", "Enable sending real emails")}</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.SMTP_SECURE === "true"}
            onChange={(e) => update("SMTP_SECURE", e.target.checked ? "true" : "false")}
          />
          <span>{t("email.smtpSecure", "Use SSL/TLS (secure)")}</span>
        </label>

        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(f.labelKey, f.fallback)}
            </label>
            <input
              type={f.type}
              value={config[f.key] || ""}
              onChange={(e) => update(f.key, e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder={f.fallback}
            />
          </div>
        ))}

        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? t("common.saving", "Saving...") : t("common.save", "Save")}
          </button>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm font-medium mb-2">{t("email.testTitle", "Send test email")}</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder={t("email.testPlaceholder", "Recipient email")}
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              onClick={sendTest}
              disabled={testing}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {testing ? t("common.sending", "Sending...") : t("common.send", "Send")}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          {t("email.devNote", "If disabled or user is empty, emails are logged to console only.")}
        </p>
      </div>
    </div>
  );
}
