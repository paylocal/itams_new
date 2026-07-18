const fs = require("fs");
const path = require("path");

const code = `"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";

export function LanguageManager() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", flag: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguages();
  }, []);

  async function loadLanguages() {
    try {
      const res = await fetch("/api/admin/languages");
      if (res.ok) setLanguages(await res.json());
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
      alert("Code va name khong duoc trong");
      return;
    }
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
      if (!res.ok) {
        const d = await res.json();
        alert("Loi: " + (d.error || res.status));
        return;
      }
      await loadLanguages();
      resetForm();
    } catch (e) {
      alert("Loi: " + (e as Error).message);
    }
  }

  async function remove(lang: any) {
    if (!confirm("Xoa " + lang.name + "?")) return;
    const res = await fetch("/api/admin/languages/" + lang.id, {
      method: "DELETE",
    });
    if (res.ok) await loadLanguages();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Quan ly Ngon ngu</h2>
          <p className="text-sm text-gray-500">Them, sua, xoa ngon ngu</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Them ngon ngu
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">{editing ? "Sua" : "Them moi"}</h3>
            <button onClick={resetForm} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Code (vi, en) *"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              disabled={!!editing}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Ten *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Flag"
              value={form.flag}
              onChange={(e) => setForm({ ...form, flag: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={save}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editing ? "Cap nhat" : "Tao moi"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Huy
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Dang tai...</div>
      ) : languages.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Chua co ngon ngu</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Ten</th>
                <th className="text-left p-3">Flag</th>
                <th className="text-center p-3">Translations</th>
                <th className="text-right p-3">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((l) => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono">{l.code}</td>
                  <td className="p-3 font-medium">{l.name}</td>
                  <td className="p-3 text-2xl">{l.flag || "-"}</td>
                  <td className="p-3 text-center text-gray-500">{l._count?.translations || 0}</td>
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
        </div>
      )}
    </div>
  );
}
`;

const file = path.join(__dirname, "src/components/admin/language-manager.tsx");
fs.writeFileSync(file, code, "utf-8");
console.log("Created language-manager");