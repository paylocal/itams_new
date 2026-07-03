"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search, X, Check } from "lucide-react";
import { useI18n } from "../i18n-provider";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  isActive: boolean;
  manager: { name: string } | null;
}

interface Props {
  users: User[];
}

export function UsersManager({ users: initial }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [users, setUsers] = useState(initial);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "EMPLOYEE",
    department: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      searchTerm === "" ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startEdit = (user: User) => {
    setEditing(user);
    setForm({
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department || "",
      password: "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ email: "", name: "", role: "EMPLOYEE", department: "", password: "" });
    setShowForm(false);
    setError("");
  };

  const save = async () => {
    if (!form.email || !form.name) {
      setError("Vui long dien email va ten");
      return;
    }
    if (!editing && !form.password) {
      setError("Vui long nhap mat khau");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = editing
        ? "/api/users/" + editing.id
        : "/api/users";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Loi");
      } else {
        if (editing) {
          setUsers(users.map((u) => (u.id === editing.id ? data : u)));
        } else {
          setUsers([data, ...users]);
        }
        resetForm();
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (user: User) => {
    if (!confirm(user.isActive ? "Vo hieu hoa user?" : "Kich hoat user?")) return;

    const res = await fetch("/api/users/" + user.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
    } else {
      alert("Loi");
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    MANAGER: "bg-blue-100 text-blue-700",
    IT_STAFF: "bg-green-100 text-green-700",
    PURCHASING: "bg-yellow-100 text-yellow-700",
    EMPLOYEE: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("user.title")}</h1>
          <p className="text-gray-500 mt-1">{users.length} nguoi dung</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("user.addUser")}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("common.search") + "..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold">
              {editing ? "Sua nguoi dung" : "Them nguoi dung moi"}
            </h2>
            <button onClick={resetForm} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              placeholder={t("user.email") + " *"}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
              disabled={!!editing}
            />
            <input
              type="text"
              placeholder={t("user.name") + " *"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder={t("user.department")}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="MANAGER">MANAGER</option>
              <option value="IT_STAFF">IT_STAFF</option>
              <option value="PURCHASING">PURCHASING</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            {!editing && (
              <input
                type="password"
                placeholder="Mat khau *"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border rounded px-3 py-2 text-sm col-span-2"
              />
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded text-sm mt-3">
              {error}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={save}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              {loading ? "Dang luu..." : t("common.save")}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">{t("user.email")}</th>
              <th className="text-left p-3">{t("user.name")}</th>
              <th className="text-left p-3">{t("user.role")}</th>
              <th className="text-left p-3">{t("user.department")}</th>
              <th className="text-left p-3">Trang thai</th>
              <th className="text-right p-3">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Khong co nguoi dung
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={"border-b " + (!user.isActive ? "bg-gray-50 opacity-60" : "")}
                >
                  <td className="p-3 font-mono text-xs">{user.email}</td>
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">
                    <span
                      className={
                        "text-xs px-2 py-0.5 rounded " + (roleColors[user.role] || "bg-gray-100")
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {user.department || "-"}
                  </td>
                  <td className="p-3">
                    {user.isActive ? (
                      <span className="text-xs text-green-600">Hoat dong</span>
                    ) : (
                      <span className="text-xs text-red-600">Vo hieu hoa</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => startEdit(user)}
                      className="p-1.5 hover:bg-blue-100 rounded text-blue-600 mr-1"
                      title="Sua"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(user)}
                      className={
                        "p-1.5 rounded " +
                        (user.isActive
                          ? "hover:bg-red-100 text-red-600"
                          : "hover:bg-green-100 text-green-600")
                      }
                      title={user.isActive ? "Vo hieu hoa" : "Kich hoat"}
                    >
                      {user.isActive ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
