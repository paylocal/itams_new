const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "category-manager.tsx"
);
fs.mkdirSync(path.dirname(file), { recursive: true });

const code = `"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save, Tag } from "lucide-react";
import { useI18n } from "../i18n-provider";

interface Category {
  id: string;
  code: string;
  name: string;
  hasModel: boolean;
  order: number;
  isActive: boolean;
  _count?: { models: number };
}

export function CategoryManager() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", hasModel: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/device-categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setForm({ code: cat.code, name: cat.name, hasModel: cat.hasModel });
    setShowForm(true);
  }

  function resetForm() {
    setEditing(null);
    setForm({ code: "", name: "", hasModel: false });
    setShowForm(false);
  }

  async function save() {
    if (!form.code || !form.name) {
      alert("Code va name khong duoc trong");
      return;
    }
    try {
      const url = editing
        ? "/api/device-categories/" + editing.id
        : "/api/device-categories";
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
      await loadCategories();
      resetForm();
    } catch (e) {
      alert("Loi: " + (e as Error).message);
    }
  }

  async function remove(cat: Category) {
    if (!confirm("Xoa " + cat.name + "?")) return;
    const res = await fetch("/api/device-categories/" + cat.id, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadCategories();
    } else {
      alert("Loi khi xoa");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{t("nav.categories")}</h2>
          <p className="text-sm text-gray-500">
            Quan ly cac danh muc thiet bi (Laptop, Desktop, ...)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t("admin.addCategory")}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">
              {editing ? "Sua danh muc" : "Them moi"}
            </h3>
            <button onClick={resetForm} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Code (LAPTOP, DESKTOP) *"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              disabled={!!editing}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Ten hien thi *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.hasModel}
                onChange={(e) => setForm({ ...form, hasModel: e.target.checked })}
              />
              Co chon model
            </label>
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
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Ten</th>
                <th className="text-left p-3">Model</th>
                <th className="text-center p-3">So model</th>
                <th className="text-right p-3">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Chua co danh muc
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono">{c.code}</td>
                    <td className="p-3 font-medium">
                      <Tag className="w-4 h-4 inline mr-1 text-gray-400" />
                      {c.name}
                    </td>
                    <td className="p-3">
                      {c.hasModel ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Co
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          Khong
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center text-gray-500">
                      {c._count?.models || 0}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(c)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(file, code, "utf-8");
console.log("Created category-manager");