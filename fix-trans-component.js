const fs = require("fs");
const path = require("path");

const code = `"use client";
import { useState, useEffect } from "react";
import { Save, Search, Globe, Trash2, Edit3, Check } from "lucide-react";

interface Language {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  isDefault: boolean;
}

export function TranslationManager() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [originalTranslations, setOriginalTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newKey, setNewKey] = useState({ key: "", value: "", category: "common" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/translations");
      if (res.ok) {
        const data: any[] = await res.json();
        setLanguages(data.filter((l) => l.isActive !== false));
        if (data.length > 0) {
          const def = data.find((l) => l.isDefault) || data[0];
          setSelectedLang(def.code);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedLang) return;
    const lang = languages.find((l) => l.code === selectedLang);
    if (lang) {
      const dict: Record<string, string> = {};
      lang.translations.forEach((t) => {
        dict[t.key] = t.value;
      });
      setTranslations(dict);
      setOriginalTranslations(dict);
    }
  }, [selectedLang, languages]);

  async function saveAll() {
    try {
      setSaving(true);
      const trans = Object.entries(translations).map(([key, value]) => ({
        languageCode: selectedLang,
        key,
        value,
        category: key.split(".")[0],
      }));
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translations: trans }),
      });
      if (res.ok) {
        setOriginalTranslations({ ...translations });
        alert("Da luu tat ca translations!");
      } else {
        const d = await res.json();
        alert("Loi: " + (d.error || "Unknown"));
      }
    } catch (e: any) {
      alert("Loi: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteKey(key: string) {
    const ok = window.confirm("Xoa translation key " + key + "?");
    if (!ok) return;
    try {
      const url = "/api/admin/translations?languageCode=" + selectedLang + "&key=" + encodeURIComponent(key);
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        const newTrans = { ...translations };
        delete newTrans[key];
        setTranslations(newTrans);
        setOriginalTranslations(newTrans);
        alert("Da xoa!");
      }
    } catch (e: any) {
      alert("Loi: " + e.message);
    }
  }

  function startEdit(key: string, value: string) {
    setEditKey(key);
    setEditValue(value);
  }

  async function saveEdit() {
    if (!editKey) return;
    try {
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          translations: [{
            languageCode: selectedLang,
            key: editKey,
            value: editValue,
            category: editKey.split(".")[0],
          }],
        }),
      });
      if (res.ok) {
        setTranslations((prev) => ({ ...prev, [editKey]: editValue }));
        setOriginalTranslations((prev) => ({ ...prev, [editKey]: editValue }));
        setEditKey(null);
      }
    } catch (e: any) {
      alert("Loi: " + e.message);
    }
  }

  async function addNew() {
    if (!newKey.key || !newKey.value) {
      alert("Vui long dien key va value");
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
        setTranslations((prev) => ({ ...prev, [newKey.key]: newKey.value }));
        setOriginalTranslations((prev) => ({ ...prev, [newKey.key]: newKey.value }));
        setNewKey({ key: "", value: "", category: "common" });
      }
    } catch (e: any) {
      alert("Loi: " + e.message);
    }
  }

  const allKeysSet = new Set<string>(Object.keys(translations));
  if (allKeysSet.size < 10) {
    const defaultKeys = [
      "common.appName", "common.welcome", "common.login", "common.logout",
      "common.save", "common.cancel", "common.create", "common.edit",
      "common.delete", "common.search", "common.loading", "common.total",
      "common.status", "common.actions", "common.back",
      "nav.dashboard", "nav.requests", "nav.approvals", "nav.assets",
      "nav.purchaseOrders", "nav.handovers", "nav.reports",
      "nav.createRequest", "nav.categories", "nav.suppliers", "nav.users",
    ];
    defaultKeys.forEach((k) => allKeysSet.add(k));
  }
  const allKeys = Array.from(allKeysSet).sort();

  const filteredKeys = allKeys.filter((k) => {
    if (searchTerm && !k.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (category !== "all" && !k.startsWith(category + ".")) return false;
    return true;
  });

  const hasChanges = JSON.stringify(translations) !== JSON.stringify(originalTranslations);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Translations</h2>
          <p className="text-sm text-gray-500">
            Sua noi dung dich cho tung ngon ngu
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map((l) => (
          <button
            key={l.id}
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
            {l.isDefault && <span className="text-xs">(default)</span>}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Tim kiem key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">Tat ca</option>
          <option value="common">Common</option>
          <option value="nav">Navigation</option>
          <option value="roles">Roles</option>
          <option value="status">Status</option>
        </select>
        <button
          onClick={saveAll}
          disabled={saving || !hasChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
        >
          <Save className="w-4 h-4" /> {saving ? "Dang luu..." : "Luu tat ca"}
        </button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-700">
          Co thay doi chua luu. Click "Luu tat ca" de luu.
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded p-3">
        <p className="text-sm font-medium text-green-700 mb-2">+ Them translation moi</p>
        <div className="grid grid-cols-4 gap-2">
          <input
            placeholder="category.key (vd: common.hello)"
            value={newKey.key}
            onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
            className="border rounded px-2 py-1.5 text-sm"
          />
          <select
            value={newKey.category}
            onChange={(e) => setNewKey({ ...newKey, category: e.target.value })}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="common">common</option>
            <option value="nav">nav</option>
            <option value="roles">roles</option>
            <option value="status">status</option>
          </select>
          <input
            placeholder="Gia tri"
            value={newKey.value}
            onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
            className="border rounded px-2 py-1.5 text-sm col-span-1"
          />
          <button
            onClick={addNew}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Them
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Dang tai...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredKeys.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Khong co keys</div>
            ) : (
              filteredKeys.map((key) => (
                <div
                  key={key}
                  className="grid grid-cols-12 gap-2 p-3 border-b hover:bg-gray-50 items-center"
                >
                  <div className="col-span-3 text-sm font-mono text-gray-700">{key}</div>
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
                        className="cursor-pointer hover:bg-blue-50 rounded px-2 py-1 text-sm min-h-[28px]"
                      >
                        {translations[key] || (
                          <span className="text-gray-400 italic">(chua co)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex gap-1 justify-end">
                    {editKey === key ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Luu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditKey(null)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Huy"
                        >
                          X
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(key, translations[key] || "")}
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
              ))
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-right">
        {filteredKeys.length} / {allKeys.length} keys
      </div>
    </div>
  );
}
`;

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "translation-manager.tsx"
);
fs.writeFileSync(file, code);
console.log("Updated translation-manager");