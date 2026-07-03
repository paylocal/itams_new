"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save, Globe } from "lucide-react";
import { useI18n } from "../i18n-provider";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export function LanguageManager() {
  const { t } = useI18n();
  const [languages, setLanguages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", flag: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLanguages();
  }, []);

  async function loadLanguages() {
    try {
      const res = await fetch("/api/admin/languages");
      if (res.ok) {
        const data = await res.json();
        setLanguages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(lang: any) {
    setEditing(lang);
    setForm({ code: lang.code, name: lang.name, flag: lang.flag || "" });
    setShowForm(true);
  }

  function resetForm() {
    setEditing(null);
    setForm({ code: "", name: "", flag: "" });
    setShowForm(false);
  }

  async function save() {
    if (!form.code || !form.name) {
      alert(t("admin.codeRequired"));
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? "/api/admin/languages/" + editing.id
        : "/api/admin/languages";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await loadLanguages();
        resetForm();
        alert(t("admin.addSuccess"));
      } else {
        const d = await res.json();
        alert(t("admin.error") + ": " + (d.error || res.status));
      }
    } catch (e) {
      alert(t("admin.error") + ": " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(lang: any) {
    if (!confirm(t("admin.deleteConfirm"))) return;
    try {
      const res = await fetch("/api/admin/languages/" + lang.id, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadLanguages();
        alert(t("admin.deleteSuccess"));
      }
    } catch (e) {
      alert(t("admin.error") + ": " + (e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("admin.languages")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("admin.subtitle")}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t("admin.addLanguage")}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow border-2 border-blue-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">
              {editing ? t("admin.edit") + " " + editing.code : t("admin.addLanguage")}
            </h3>
            <button onClick={resetForm} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t("admin.code")} *
              </label>
              <input
                placeholder="vi, en, ja"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })}
                disabled={!!editing}
                className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t("admin.name")} *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {t("admin.flag")}
              </label>
              <input
                placeholder="🇻🇳"
                value={form.flag}
                onChange={(e) => setForm({ ...form, flag: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              {saving ? "..." : editing ? t("admin.edit") : t("admin.add")}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {t("admin.cancel")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">
          {t("admin.loading")}
        </div>
      ) : languages.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Chua co ngon ngu nao
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">{t("admin.code")}</th>
                <th className="text-left p-3">{t("admin.name")}</th>
                <th className="text-left p-3">{t("admin.flag")}</th>
                <th className="text-center p-3">
                  {t("admin.translationsCount")}
                </th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((l) => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono">{l.code}</td>
                  <td className="p-3 font-medium">
                    {l.name}
                    {l.isDefault && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {t("admin.default")}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-2xl">{l.flag || "-"}</td>
                  <td className="p-3 text-center text-gray-500">
                    {l._count?.translations || 0}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => startEdit(l)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                      title={t("admin.edit")}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(l)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded ml-1"
                      title={t("admin.delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
