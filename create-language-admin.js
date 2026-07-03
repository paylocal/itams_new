const fs = require("fs");
const path = require("path");

// Trang server
const pageCode = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LanguageManager } from "@/components/admin/language-manager";

export default async function LanguagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return <LanguageManager />;
}
`;

const file1 = path.join(
  __dirname,
  "src",
  "app",
  "(dashboard)",
  "admin",
  "languages",
  "page.tsx"
);
fs.mkdirSync(path.dirname(file1), { recursive: true });
fs.writeFileSync(file1, pageCode);

// Component
const compCode = `"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Globe, X, Save, Search } from "lucide-react";
import { useI18n } from "../../i18n-provider";

interface Language {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  isActive: boolean;
  isDefault: boolean;
  order: number;
  _count?: { translations: number };
}

const COMMON_KEYS = [
  "common.appName",
  "common.welcome",
  "common.login",
  "common.save",
  "common.cancel",
  "nav.dashboard",
  "nav.requests",
  "nav.approvals",
  "status.DRAFT",
  "status.COMPLETED",
];

export function LanguageManager() {
  const { t, locale } = useI18n();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [editing, setEditing] = useState<Language | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", flag: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  function startEdit(lang: Language) {
    setEditing(lang);
    setForm({ code: lang.code, name: lang.name, flag: lang.flag || "" });
    setShowForm(true);
  }

  function resetForm() {
    setEditing(null);
    setForm({ code: "", name: "", flag: "" });
    setShowForm(false);
    setError("");
  }

  async function save() {
    if (!form.code || !form.name) {
      setError("Code va name khong duoc trong");
      return;
    }
    try {
      const url = editing ? "/api/admin/languages/" + editing.id : "/api/admin/languages";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Loi");
        return;
      }
      await loadLanguages();
      resetForm();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(lang: Language) {
    if (!confirm("Xoa ngon ngu " + lang.name + "? Tat ca translations se bi xoa!")) return;
    const res = await fetch("/api/admin/languages/" + lang.id, { method: "DELETE" });
    if (res.ok) await loadLanguages();
    else alert("Loi khi xoa");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quan ly Ngon ngu</h1>
          <p className="text-gray-500 mt-1">
            Them, sua, xoa ngon ngu dong trong database
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Them ngon ngu
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold">
              {editing ? "Sua ngon ngu" : "Them ngon ngu moi"}
            </h2>
            <button onClick={resetForm} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Code (vi, en, ja) *"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              disabled={!!editing}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Ten (Tieng Viet, English) *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Flag (emoji VN, US, JP)"
              value={form.flag}
              onChange={(e) => setForm({ ...form, flag: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded text-sm mt-3">{error}</div>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={save}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="w-4 h-4" /> {editing ? "Cap nhat" : "Tao moi"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded">
              Huy
            </button>
          </div>
        </div>
      )}

      {/* Danh sach */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Dang tai...</div>
        ) : languages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Chua co ngon ngu nao
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Ten</th>
                <th className="text-left p-3">Flag</th>
                <th className="text-center p-3">Translations</th>
                <th className="text-center p-3">Mac dinh</th>
                <th className="text-right p-3">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((l) => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono">{l.code}</td>
                  <td className="p-3 font-medium">{l.name}</td>
                  <td className="p-3 text-2xl">{l.flag || "-"}</td>
                  <td className="p-3 text-center text-gray-500">
                    {l._count?.translations || 0}
                  </td>
                  <td className="p-3 text-center">
                    {l.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => startEdit(l)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(l)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        💡 <strong>Tip:</strong> Sau khi them ngon ngu moi, vao trang
        <a href="/admin/translations" className="underline ml-1">
          /admin/translations
        </a>{" "}
        de them translations cho ngon ngu do.
      </div>
    </div>
  );
}
`;

const file2 = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "language-manager.tsx"
);
fs.mkdirSync(path.dirname(file2), { recursive: true });
fs.writeFileSync(file2, compCode);

console.log("Created language admin");