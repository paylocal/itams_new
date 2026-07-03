const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "supplier-manager.tsx"
);
fs.mkdirSync(path.dirname(file), { recursive: true });

const code = `"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save, Building2 } from "lucide-react";
import { useI18n } from "../i18n-provider";

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxCode: string | null;
  isActive: boolean;
}

export function SupplierManager() {
  const { t } = useI18n();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    taxCode: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      const res = await fetch("/api/suppliers");
      if (res.ok) {
        setSuppliers(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(s: Supplier) {
    setEditing(s);
    setForm({
      name: s.name,
      contactName: s.contactName || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      taxCode: s.taxCode || "",
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditing(null);
    setForm({ name: "", contactName: "", phone: "", email: "", address: "", taxCode: "" });
    setShowForm(false);
  }

  async function save() {
    if (!form.name) {
      alert("Ten khong duoc trong");
      return;
    }
    try {
      const url = editing
        ? "/api/suppliers/" + editing.id
        : "/api/suppliers";
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
      await loadSuppliers();
      resetForm();
    } catch (e) {
      alert("Loi: " + (e as Error).message);
    }
  }

  async function remove(s: Supplier) {
    if (!confirm("Xoa " + s.name + "?")) return;
    const res = await fetch("/api/suppliers/" + s.id, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadSuppliers();
    } else {
      alert("Loi");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{t("nav.suppliers")}</h2>
          <p className="text-sm text-gray-500">
            Quan ly nha cung cap (Suppliers)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t("admin.addSupplier")}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">
              {editing ? "Sua nha cung cap" : "Them moi"}
            </h3>
            <button onClick={resetForm} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Ten nha cung cap *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Nguoi lien he"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="So dien thoai"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Ma so thue"
              value={form.taxCode}
              onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Dia chi"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Ma</th>
                <th className="text-left p-3">Ten</th>
                <th className="text-left p-3">Lien he</th>
                <th className="text-left p-3">SDT</th>
                <th className="text-left p-3">Email</th>
                <th className="text-right p-3">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Chua co nha cung cap
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono">{s.code}</td>
                    <td className="p-3 font-medium">
                      <Building2 className="w-4 h-4 inline mr-1 text-gray-400" />
                      {s.name}
                    </td>
                    <td className="p-3 text-gray-600">{s.contactName || "-"}</td>
                    <td className="p-3 text-gray-600">{s.phone || "-"}</td>
                    <td className="p-3 text-gray-600">{s.email || "-"}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => startEdit(s)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(s)}
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
console.log("Created supplier-manager");