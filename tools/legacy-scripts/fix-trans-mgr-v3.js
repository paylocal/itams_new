const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src/components/admin/translation-manager.tsx"
);

const content = `"use client";
import { useState, useEffect, useRef } from "react";
import { Save, Search, Globe, Trash2, Edit3, Check, Plus, X } from "lucide-react";
import { useI18n } from "../i18n-provider";

export function TranslationManager() {
  const { t, locale, languages } = useI18n();
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [allLanguages, setAllLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({ key: "", value: "", category: "common" });
  const inputRef = useRef<HTMLInputElement>(null);

  // Set default language
  useEffect(() => {
    if (languages && languages.length > 0 && !selectedLang) {
      const def = languages.find((l: any) => l.isDefault) || languages[0];
      if (def) setSelectedLang(def.code);
    }
  }, [languages, selectedLang]);

  // Load ALL languages tu /api/admin/translations
  useEffect(() => {
    console.log("Loading translations...");
    fetch("/api/admin/translations", {
      credentials: "include",
    })
      .then((r) => {
        console.log("Status:", r.status);
        return r.ok ? r.json() : [];
      })
      .then((data) => {
        console.log("Loaded languages:", Array.isArray(data) ? data.length : 0);
        if (Array.isArray(data)) {
          setAllLanguages(data);
        }
      })
      .catch((e) => console.error("Load error:", e))
      .finally(() => setLoading(false));
  }, []);

  // Khi doi selectedLang, lay translations tu data da co
  useEffect(() => {
    if (!selectedLang || allLanguages.length === 0) return;
    const lang = allLanguages.find((l: any) => l.code === selectedLang);
    console.log("Selected lang:", selectedLang, "Found:", !!lang);
    if (lang && lang.translations) {
      const dict: Record<string, string> = {};
      lang.translations.forEach((t: any) => {
        dict[t.key] = t.value;
      });
      setTranslations(dict);
    }
  }, [selectedLang, allLanguages]);

  function startEdit(key: string, value: string) {
    setEditKey(key);
    setEditValue(value);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 50);
  }

  function saveEdit() {
    if (!editKey) return;
    setTranslations((p) => ({ ...p, [editKey]: editValue }));
    setEditKey(null);
  }

  async function reloadAll() {
    const r = await fetch("/api/admin/translations", { credentials: "include" });
    if (r.ok) {
      const data = await r.json();
      setAllLanguages(data);
      return data;
    }
    return null;
  }

  async function saveAll() {
    if (saving) return;
    setSaving(true);
    try {
      const trans = Object.entries(translations)
        .filter(([k, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => ({
          languageCode: selectedLang,
          key: k,
          value: String(v),
          category: k.split(".")[0],
        }));

      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ translations: trans }),
      });

      if (res.ok) {
        await reloadAll();
        alert("Da luu " + trans.length + " translations!");
      } else {
        const err = await res.json();
        alert("Loi: " + (err.error || res.status));
      }
    } catch (e) {
      alert("Loi: " + e.message);
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
        credentials: "include",
        body: JSON.stringify({
          languageCode: selectedLang,
          key: newKey.key,
          value: newKey.value,
          category: newKey.category,
        }),
      });
      if (res.ok) {
        setTranslations((p) => ({ ...p, [newKey.key]: newKey.value }));
        setNewKey({ key: "", value: "", category: "common" });
        setShowAddForm(false);
        await reloadAll();
        alert("Them thanh cong!");
      }
    } catch (e) {
      alert("Loi: " + e.message);
    }
  }

  async function deleteKey(key: string) {
    if (!confirm("Xoa key '" + key + "'?")) return;
    try {
      const url =
        "/api/admin/translations?languageCode=" +
        selectedLang +
        "&key=" +
        encodeURIComponent(key);
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        const newT = { ...translations };
        delete newT[key];
        setTranslations(newT);
        await reloadAll();
      }
    } catch (e) {
      alert("Loi: " + e.message);
    }
  }

  // Gom keys tu tat ca cac ngon ngu
  const allKeysSet = new Set<string>();
  allLanguages.forEach((lang: any) => {
    if (lang.translations) {
      lang.translations.forEach((t: any) => allKeysSet.add(t.key));
    }
  });
  Object.keys(translations).forEach((k) => allKeysSet.add(k));

  const allKeys = Array.from(allKeysSet).sort();
  const filteredKeys = allKeys.filter(
    (k) => !searchTerm || k.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Globe className="w-8 h-8 animate-spin mx-auto mb-2" />
        Dang tai...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Translations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {allLanguages.length} ngon ngu, {allKeys.length} keys
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Them key moi
          </button>
          <button
            onClick={saveAll}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Dang luu..." : "Luu tat ca"}
          </button>
        </div>
      </div>

      {/* Language tabs - Hien thi TAT CA */}
      {allLanguages.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {allLanguages.map((l: any) => (
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
              <span>{l.flag} {l.name}</span>
              {l._count && (
                <span className="text-xs opacity-70 ml-1">
                  ({l._count.translations})
                </span>
              )}
              {l.isDefault && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                  *
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
          Khong co ngon ngu nao. Hay tao ngon ngu truoc.
        </div>
      )}

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tim kiem key..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border rounded text-sm"
        />
      </div>

      {filteredKeys.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded border">
          <p className="text-gray-500">
            {allLanguages.length === 0
              ? "Chua co ngon ngu nao"
              : "Chua co keys dich"}
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredKeys.map((key) => {
              const val = translations[key] || "";
              const isNew = !allLanguages.some(
                (l: any) =>
                  l.code === selectedLang &&
                  l.translations?.some((t: any) => t.key === key)
              );
              const hasAllLangs = allLanguages
                .filter((l) => l.code !== selectedLang)
                .every((l) =>
                  l.translations?.some((t: any) => t.key === key)
                );
              return (
                <div
                  key={key}
                  className={
                    "grid grid-cols-12 gap-2 p-3 border-b hover:bg-gray-50 items-center " +
                    (isNew ? "bg-yellow-50" : "")
                  }
                >
                  <div className="col-span-3 text-sm font-mono text-gray-700">
                    {key}
                    {isNew && (
                      <span className="ml-2 text-xs text-yellow-600">new</span>
                    )}
                    {hasAllLangs && (
                      <span className="ml-1 text-xs text-green-600">✓</span>
                    )}
                  </div>
                  <div className="col-span-7">
                    {editKey === key ? (
                      <div className="flex gap-1">
                        <input
                          ref={inputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") setEditKey(null);
                          }}
                          className="flex-1 border border-blue-500 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={saveEdit}
                          className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => startEdit(key, val)}
                        className="cursor-pointer hover:bg-blue-50 rounded px-2 py-1 text-sm min-h-[28px]"
                      >
                        {val || (
                          <span className="text-gray-400 italic">
                            (empty - click de nhap)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex gap-1 justify-end">
                    {editKey !== key && (
                      <>
                        <button
                          onClick={() => startEdit(key, val)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Sua"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteKey(key)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Xoa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(file, content);
console.log("Updated translation-manager v3");
