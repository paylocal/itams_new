const fs = require("fs");
const path = require("path");

const code = `"use client";
import { useState, useEffect } from "react";
import { Save, Search, Globe, Trash2, Edit3, Check } from "lucide-react";

export function TranslationManager() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetch("/api/admin/translations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const active = (data as any[]).filter((l) => l.isActive !== false);
        setLanguages(active);
        if (active.length > 0) {
          setSelectedLang(active[0].code);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedLang) return;
    fetch("/api/admin/translations")
      .then((r) => r.json())
      .then((data) => {
        const lang = (data as any[]).find((l) => l.code === selectedLang);
        if (lang) {
          const dict: Record<string, string> = {};
          lang.translations.forEach((t: any) => {
            dict[t.key] = t.value;
          });
          setTranslations(dict);
          setOriginal(dict);
        }
      });
  }, [selectedLang]);

  const allKeys = Array.from(new Set(Object.keys(translations))).sort();
  const filteredKeys = allKeys.filter((k) =>
    !searchTerm || k.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    const trans = Object.entries(translations).map(([k, v]) => ({
      languageCode: selectedLang,
      key: k,
      value: v,
      category: k.split(".")[0],
    }));
    try {
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translations: trans }),
      });
      if (res.ok) {
        alert("Da luu!");
        window.location.reload();
      } else {
        alert("Loi: " + res.status);
      }
    } catch (e) {
      alert("Loi: " + (e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Translations</h2>
          <p className="text-sm text-gray-500">Sua noi dung dich cho tung ngon ngu</p>
        </div>
        <button
          onClick={saveAll}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Luu tat ca
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setSelectedLang(l.code)}
            className={
              "px-3 py-1.5 rounded text-sm flex items-center gap-1 " +
              (selectedLang === l.code ? "bg-blue-600 text-white" : "bg-gray-100")
            }
          >
            <Globe className="w-3 h-3" />
            {l.flag} {l.name}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tim kiem key..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border rounded text-sm"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Dang tai...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredKeys.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Chua co keys</div>
            ) : (
              filteredKeys.map((key) => (
                <div key={key} className="grid grid-cols-12 gap-2 p-3 border-b hover:bg-gray-50 items-center">
                  <div className="col-span-3 text-sm font-mono">{key}</div>
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
                        className="cursor-pointer hover:bg-blue-50 rounded px-2 py-1 text-sm"
                      >
                        {translations[key] || <span className="text-gray-400">(empty)</span>}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex gap-1 justify-end">
                    {editKey === key ? (
                      <button
                        onClick={saveEdit}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(key, translations[key] || "")}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert("Xoa qua API")}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
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
    </div>
  );
}
`;

const file = path.join(__dirname, "src/components/admin/translation-manager.tsx");
fs.writeFileSync(file, code, "utf-8");
console.log("Created translation-manager");