"use client";
import { useState, useEffect } from "react";
import { useI18n } from "../../../../components/i18n-provider";
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight, Laptop, Tag, Package } from "lucide-react";

interface Model {
  id: string;
  brand: string;
  name: string;
  avgPrice: number | null;
  isActive: boolean;
}

interface Category {
  id: string;
  code: string;
  name: string;
  hasModel: boolean;
  order: number;
  isActive: boolean;
  models: Model[];
  _count?: { models: number };
}

export default function CategoriesAdminPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Category | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddModel, setShowAddModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", name: "", hasModel: false });
  const [modelForm, setModelForm] = useState({ brand: "", name: "", avgPrice: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/device-categories", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  async function saveCategory() {
    if (!form.code || !form.name) {
      setError(t("admin.codeNameRequired"));
      return;
    }
    setError("");
    try {
      const url = editing ? "/api/device-categories/" + editing.id : "/api/device-categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          hasModel: form.hasModel,
        }),
      });
      if (res.ok) {
        await load();
        setEditing(null);
        setShowAddCategory(false);
        setForm({ code: "", name: "", hasModel: false });
      } else {
        const d = await res.json();
        setError(d.error || "Error");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  function startEdit(c: Category) {
    setEditing(c);
    setForm({ code: c.code, name: c.name, hasModel: c.hasModel });
    setShowAddCategory(true);
  }

  async function deleteCategory(c: Category) {
    if (!confirm(t("categories.confirmDelete", "Delete category {{name}}?", { name: c.name }))) return;
    try {
      const res = await fetch("/api/device-categories/" + c.id, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await load();
    } catch (e) {
      console.error(e);
    }
  }

  function startEditModel(c: Category, m?: Model) {
    setShowAddModel(c.id);
    if (m) {
      setEditingModel(m);
      setModelForm({
        brand: m.brand,
        name: m.name,
        avgPrice: m.avgPrice ? String(m.avgPrice) : "",
      });
    } else {
      setEditingModel(null);
      setModelForm({ brand: "", name: "", avgPrice: "" });
    }
  }

  async function saveModel(categoryId: string) {
    if (!modelForm.brand || !modelForm.name) {
      alert(t("models.brandNameRequired", "Please enter brand and name"));
      return;
    }
    try {
      const url = editingModel
        ? "/api/device-models/" + editingModel.id
        : "/api/device-models";
      const method = editingModel ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          categoryId: categoryId,
          brand: modelForm.brand,
          name: modelForm.name,
          avgPrice: modelForm.avgPrice ? parseFloat(modelForm.avgPrice) : null,
        }),
      });
      if (res.ok) {
        await load();
        setEditingModel(null);
        setModelForm({ brand: "", name: "", avgPrice: "" });
      } else {
        const d = await res.json();
        alert(d.error || "Error");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  }

  async function deleteModel(m: Model) {
    if (!confirm(t("models.confirmDelete", "Delete {{brand}} {{name}}?", { brand: m.brand, name: m.name }))) return;
    try {
      const res = await fetch("/api/device-models/" + m.id, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await load();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6" />
            {t("categories.title", "Category management")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {categories.length} {t("categories.count", "categories")}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowAddCategory(true);
            setForm({ code: "", name: "", hasModel: false });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t("categories.add", "Add category")}
        </button>
      </div>

      {showAddCategory && (
        <div className="bg-white p-4 rounded-lg shadow border-2 border-blue-200">
          <h3 className="font-bold mb-3">
            {editing ? t("categories.edit", "Edit category") : t("categories.addNew", "Add new category")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder={t("categories.codePlaceholder", "Code (e.g. LAPTOP, DESKTOP)")}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              disabled={!!editing}
              className="border rounded px-3 py-2 text-sm disabled:bg-gray-100"
            />
            <input
              placeholder={t("categories.namePlaceholder", "Display name")}
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
              {t("categories.hasModel", "Has model selection")}
            </label>
          </div>
          {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm mt-3">{error}</div>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={saveCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="w-4 h-4" /> {editing ? t("common.update", "Update") : t("common.create", "Create")}
            </button>
            <button
              onClick={() => {
                setShowAddCategory(false);
                setEditing(null);
                setForm({ code: "", name: "", hasModel: false });
              }}
              className="px-4 py-2 bg-gray-200 rounded flex items-center gap-1"
            >
              <X className="w-4 h-4" /> {t("common.cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="p-8 bg-gray-50 text-center rounded border">
            <p className="text-gray-500">{t("categories.empty", "No categories yet")}</p>
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="bg-white border rounded-lg">
              <div className="flex items-center p-3">
                <button
                  onClick={() => toggle(c.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expanded[c.id] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <Tag className="w-4 h-4 mx-2 text-gray-400" />
                <span className="font-mono text-sm">{c.code}</span>
                <span className="mx-2">-</span>
                <span className="font-medium">{c.name}</span>
                {c.hasModel && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {c._count?.models || 0} model
                  </span>
                )}
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title={t("common.edit", "Edit")}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(c)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title={t("common.delete", "Delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expanded[c.id] && c.hasModel && (
                <div className="border-t bg-gray-50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{t("models.title", "Models in {{name}}", { name: c.name })}</h4>
                    <button
                      onClick={() => startEditModel(c)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> {t("models.add", "Add model")}
                    </button>
                  </div>

                  {showAddModel === c.id && (
                    <div className="bg-white p-2 rounded border mb-2">
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          placeholder={t("models.brandPlaceholder", "Brand (Apple, Dell)")}
                          value={modelForm.brand}
                          onChange={(e) => setModelForm({ ...modelForm, brand: e.target.value })}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <input
                          placeholder={t("models.namePlaceholder", "Model name")}
                          value={modelForm.name}
                          onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="number"
                          placeholder={t("models.pricePlaceholder", "Reference price")}
                          value={modelForm.avgPrice}
                          onChange={(e) => setModelForm({ ...modelForm, avgPrice: e.target.value })}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveModel(c.id)}
                            className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs"
                          >
                            {t("common.save", "Save")}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddModel(null);
                              setEditingModel(null);
                            }}
                            className="px-2 py-1 bg-gray-200 rounded text-xs"
                          >
                            {t("common.cancel", "Cancel")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {c.models && c.models.length > 0 ? (
                    <div className="bg-white rounded border">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2">{t("models.brand", "Brand")}</th>
                            <th className="text-left p-2">{t("models.name", "Model")}</th>
                            <th className="text-right p-2">{t("models.price", "Price")}</th>
                            <th className="text-right p-2">{t("common.actions", "Actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.models.map((m) => (
                            <tr key={m.id} className="border-t">
                              <td className="p-2">
                                <Laptop className="w-3 h-3 inline mr-1" />
                                {m.brand}
                              </td>
                              <td className="p-2">{m.name}</td>
                              <td className="p-2 text-right">
                                {m.avgPrice
                                  ? m.avgPrice.toLocaleString("vi-VN") + " VND"
                                  : "-"}
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  onClick={() => startEditModel(c, m)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteModel(m)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded ml-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic p-2">
                      {t("models.empty", "No models yet")}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
