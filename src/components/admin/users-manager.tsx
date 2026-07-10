"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search, X, Check, Upload, Download, KeyRound } from "lucide-react";
import * as XLSX from "xlsx";
import { useI18n } from "../i18n-provider";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  isActive: boolean;
  managerId?: string | null;
  manager: { id: string; name: string } | null;
}

interface Props {
  users: User[];
  managers: Array<{ id: string; name: string; role: string }>;
}

export function UsersManager({ users: initial, managers }: Props) {
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
    managerId: "",
    department: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

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
      managerId: user.managerId || "",
      department: user.department || "",
      password: "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ email: "", name: "", role: "EMPLOYEE", managerId: "", department: "", password: "" });
    setShowForm(false);
    setError("");
  };

  const save = async () => {
    if (!form.email || !form.name) {
      setError(t("user.errorNameEmail", "Please enter email and name"));
      return;
    }
    if (!editing && !form.password) {
      setError(t("user.errorPassword", "Please enter password"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = editing
        ? "/api/users/" + editing.id
        : "/api/users";
      const method = editing ? "PUT" : "POST";
      const payload = {
        ...form,
        managerId: form.role === "EMPLOYEE" ? form.managerId || null : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("common.error", "Error"));
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

  const downloadTemplate = () => {
    const rows = [
      ["Email", "Name", "Role", "Department", "ManagerEmail", "Position"],
      ["nv1@company.com", "Nguyen Van A", "EMPLOYEE", "IT", "leader1@company.com", "Developer"],
      ["leader1@company.com", "Tran Thi B", "LEAD", "IT", "", "Team Lead"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_import_template.xlsx");
  };

  const handleResetPassword = async () => {
    if (!resettingUser) return;
    setResetLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${resettingUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.errors?.join(", ") || t("common.error", "Error"));
      } else {
        alert(t("user.resetSuccess", "Password reset successfully"));
        setResettingUser(null);
        setResetPassword("");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImportLoading(true);
    setImportResult(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch("/api/users/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("common.error", "Error"));
      } else {
        setImportResult({
          created: data.created || 0,
          skipped: data.skipped || 0,
          errors: data.errors || [],
        });
        setImportFile(null);
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setImportLoading(false);
    }
  };

  const toggleActive = async (user: User) => {
    if (!confirm(user.isActive ? t("user.confirmDeactivate", "Deactivate user?") : t("user.confirmActivate", "Activate user?"))) return;

    const res = await fetch("/api/users/" + user.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
    } else {
      alert(t("common.error", "Error"));
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    MANAGER: "bg-blue-100 text-blue-700",
    LEAD: "bg-indigo-100 text-indigo-700",
    IT_STAFF: "bg-green-100 text-green-700",
    PURCHASING: "bg-yellow-100 text-yellow-700",
    EMPLOYEE: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("user.title", "Users")}</h1>
          <p className="text-gray-500 mt-1">{users.length} {t("user.count", "users")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> {t("user.downloadTemplate", "Template")}
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("user.addUser", "Add user")}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("common.search", "Search") + "..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-2">{t("user.importExcel", "Import from Excel")}</p>
          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="text-sm flex-1"
            />
            <button
              onClick={handleImport}
              disabled={!importFile || importLoading}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 text-sm"
            >
              <Upload className="w-4 h-4" /> {importLoading ? t("common.importing", "Importing...") : t("common.import", "Import")}
            </button>
          </div>
          {importResult && (
            <div className="mt-2 text-sm">
              <p className="text-green-700">{t("user.imported", "Created")}: {importResult.created}</p>
              <p className="text-yellow-700">{t("user.skipped", "Skipped (duplicate)")}: {importResult.skipped}</p>
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 text-red-700 p-2 rounded mt-1">
                  <ul className="list-disc pl-4">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">
              {t("user.resetPassword", "Reset password")}: {resettingUser.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {t("user.resetPasswordHint", "Leave blank to generate default password")}
            </p>
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder={t("user.newPassword", "New password")}
              className="w-full border rounded px-3 py-2 text-sm mb-3"
            />
            {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm mb-3">{error}</div>}
            <div className="flex gap-2">
              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {resetLoading ? t("common.saving", "Saving...") : t("common.save", "Save")}
              </button>
              <button
                onClick={() => { setResettingUser(null); setResetPassword(""); setError(""); }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {t("common.cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold">
              {editing ? t("user.editUser", "Edit user") : t("user.addUser", "Add user")}
            </h2>
            <button onClick={resetForm} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              placeholder={t("user.email", "Email") + " *"}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
              disabled={!!editing}
            />
            <input
              type="text"
              placeholder={t("user.name", "Name") + " *"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder={t("user.department", "Department")}
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
              <option value="LEAD">LEAD</option>
              <option value="IT_STAFF">IT_STAFF</option>
              <option value="PURCHASING">PURCHASING</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select
              value={form.managerId}
              onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
              disabled={form.role !== "EMPLOYEE"}
            >
              <option value="">{t("user.noManager", "No manager")}</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
            {!editing && (
              <input
                type="password"
                placeholder={t("user.password", "Password") + " *"}
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
              {loading ? t("common.saving", "Saving...") : t("common.save", "Save")}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {t("common.cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">{t("user.email", "Email")}</th>
              <th className="text-left p-3">{t("user.name", "Name")}</th>
              <th className="text-left p-3">{t("user.role", "Role")}</th>
              <th className="text-left p-3">{t("user.department", "Department")}</th>
              <th className="text-left p-3">{t("common.status", "Status")}</th>
              <th className="text-right p-3">{t("common.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {t("user.empty", "No users")}
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
                      <span className="text-xs text-green-600">{t("common.active", "Active")}</span>
                    ) : (
                      <span className="text-xs text-red-600">{t("common.inactive", "Inactive")}</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => startEdit(user)}
                      className="p-1.5 hover:bg-blue-100 rounded text-blue-600 mr-1"
                      title={t("common.edit", "Edit")}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setResettingUser(user)}
                      className="p-1.5 hover:bg-yellow-100 rounded text-yellow-600 mr-1"
                      title={t("user.resetPassword", "Reset password")}
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(user)}
                      className={
                        "p-1.5 rounded " +
                        (user.isActive
                          ? "hover:bg-red-100 text-red-600"
                          : "hover:bg-green-100 text-green-600")
                      }
                      title={user.isActive ? t("common.deactivate", "Deactivate") : t("common.activate", "Activate")}
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
