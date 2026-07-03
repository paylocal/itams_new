const fs = require("fs");
const path = require("path");

const code = `"use client";
import { useState, useEffect } from "react";
import { Save, Search, Globe, Trash2, Edit3, Check, Plus } from "lucide-react";
import { useI18n } from "../i18n-provider";

export function TranslationManager() {
  const { t } = useI18n();
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({ key: "", value: "", category: "common" });

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLang) {
      loadTranslations();
    }
  }, [selectedLang]);

  async function fetchLanguages() {
    try {
      const res = await fetch("/api/admin/translations");
      if (res.ok) {
        const data = await res.json();
        const active = (data as any[]).filter((l) => l.isActive !== false);
        setLanguages(active);
        if (active.length > 0 && !selectedLang) {
          setSelectedLang(active[0].code);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadTranslations() {
    try {
      const res = await fetch("/api/admin/translations");
      if (res.ok) {
        const data = await res.json();
        const lang = (data as any[]).find((l) => l.code === selectedLang);
        if (lang) {
          const dict: Record<string, string> = {};
          lang.translations.forEach((t: any) => {
            dict[t.key] = t.value;
          });
          setTranslations(dict);
          setOriginal(dict);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  function startEdit(key: string, value: string) {
    setEditKey(key);
    setEditValue(value);
  }

  function saveEdit() {
    if (!editKey) return;
    setTranslations((p) => ({ ...p, [editKey]: editValue }));
    setOriginal((p) => ({ ...p, [editKey]: editValue }));
    setEditKey(null);
  }

  async function saveAll() {
    setSaving(true);
    try {
      const changed = Object.entries(translations).filter(
        ([k, v]) => original[k] !== v
      );
      if (changed.length === 0) {
        alert("Khong co thay doi!");
        setSaving(false);
        return;
      }
      const trans = changed.map(([k, v]) => ({
        languageCode: selectedLang,
        key: k,
        value: v,
        category: k.split(".")[0],
      }));
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translations: trans }),
      });
      if (res.ok) {
        alert("Da luu " + changed.length + " translations!");
        await loadTranslations();
      } else {
        alert("Loi: " + res.status);
      }
    } catch (e) {
      alert("Loi: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function addNew() {
    if (!newKey.key || !newKey.value) {
      alert("Nhap key va value");
      return;
    }
    try {
      const res = await fetch("/api/admin/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languageCode: selectedLang,
          key: newKey.key,
          value: newKey.value,
          category: newKey.category,
        }),
      });
      if (res.ok) {
        setTranslations((p) => ({ ...p, [newKey.key]: newKey.value }));
        setOriginal((p) => ({ ...p, [newKey.key]: newKey.value }));
        setNewKey({ key: "", value: "", category: "common" });
        setShowAddForm(false);
        alert("Them thanh cong!");
      }
    } catch (e) {
      alert("Loi: " + (e as Error).message);
    }
  }

  async function deleteKey(key: string) {
    if (!confirm("Xoa translation key '" + key + "'?")) return;
    try {
      const url =
        "/api/admin/translations?languageCode=" +
        selectedLang +
        "&key=" +
        encodeURIComponent(key);
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        const newT = { ...translations };
        delete newT[key];
        setTranslations(newT);
        setOriginal(newT);
        alert("Da xoa!");
      }
    } catch (e) {
      alert("Loi: " + (e as Error).message);
    }
  }

  const allKeys = Object.keys(translations).sort();
  const filteredKeys = allKeys.filter(
    (k) => !searchTerm || k.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const hasChanges = Object.entries(translations).some(
    ([k, v]) => original[k] !== v
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("admin.translations")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("admin.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t("admin.addTranslation")}
          </button>
          <button
            onClick={saveAll}
            disabled={!hasChanges || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {t("admin.saveAll")}
            {hasChanges && " *"}
          </button>
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex flex-wrap gap-2">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setSelectedLang(l.code)}
            className={
              "px-3 py-1.5 rounded text-sm flex items-center gap-1 " +
              (selectedLang === l.code
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200")
            }
          >
            <Globe className="w-3 h-3" />
            {l.flag} {l.name}
            {l.isDefault && " (default)"}
          </button>
        ))}
      </div>

      {/* Add new form */}
      {showAddForm && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <div className="grid grid-cols-12 gap-2">
            <input
              placeholder="common.hello"
              value={newKey.key}
              onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
              className="col-span-5 border rounded px-2 py-1.5 text-sm"
            />
            <select
              value={newKey.category}
              onChange={(e) => setNewKey({ ...newKey, category: e.target.value })}
              className="col-span-2 border rounded px-2 py-1.5 text-sm"
            >
              <option value="common">common</option>
              <option value="nav">nav</option>
              <option value="roles">roles</option>
              <option value="status">status</option>
              <option value="admin">admin</option>
            </select>
            <input
              placeholder="Gia tri"
              value={newKey.value}
              onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
              className="col-span-4 border rounded px-2 py-1.5 text-sm"
            />
            <button
              onClick={addNew}
              className="col-span-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder={t("admin.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border rounded text-sm"
        />
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-700">
          Co {Object.entries(translations).filter(([k, v]) => original[k] !== v).length} thay doi chua luu. Click "{t("admin.saveAll")}" de luu.
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">{t("admin.loading")}</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredKeys.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t("admin.emptyTranslations")}
              </div>
            ) : (
              filteredKeys.map((key) => (
                <div
                  key={key}
                  className="grid grid-cols-12 gap-2 p-3 border-b hover:bg-gray-50 items-center"
                >
                  <div className="col-span-3 text-sm font-mono text-gray-700">
                    {key}
                  </div>
                  <div className="col-span-7">
                    {editKey === key ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(key, translations[key] || "")}
                        className={
                          "cursor-pointer hover:bg-blue-50 rounded px-2 py-1 text-sm " +
                          (original[key] !== translations[key]
                            ? "bg-yellow-50 font-medium"
                            : "")
                        }
                      >
                        {translations[key] || (
                          <span className="text-gray-400 italic">
                            {t("admin.empty")}
                          </span>
                        )}
                        {original[key] !== translations[key] && (
                          <span className="ml-2 text-xs text-yellow-600">*</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex gap-1 justify-end">
                    {editKey === key ? (
                      <button
                        onClick={saveEdit}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title={t("admin.saveAll")}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(key, translations[key] || "")}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title={t("admin.edit")}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteKey(key)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title={t("admin.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {hasChanges && (
        <div className="text-right">
          <button
            onClick={saveAll}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Dang luu..." : t("admin.saveAll")}
          </button>
        </div>
      )}
    </div>
  );
}
`;

const file = path.join(__dirname, "src/components/admin/translation-manager.tsx");
fs.writeFileSync(file, code, "utf-8");
console.log("Created translation-manager");