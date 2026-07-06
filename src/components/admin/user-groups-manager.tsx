"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";

type UserLite = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type GroupMember = {
  id: string;
  userId: string;
  user: UserLite;
};

type UserGroup = {
  id: string;
  code: string;
  name: string;
  level: number;
  managesLevel?: number | null;
  description?: string | null;
  members: GroupMember[];
};

type Props = {
  users: UserLite[];
};

type GroupType = "EMPLOYEE" | "MANAGER" | "LEADER" | "ADMIN";

function typeFromLevel(level: number): GroupType {
  if (level === 2) return "LEADER";
  if (level === 3) return "MANAGER";
  if (level === 4) return "ADMIN";
  return "EMPLOYEE";
}

function defaultManagedLevelByType(type: GroupType): number | null {
  if (type === "LEADER") return 1;
  if (type === "MANAGER") return 2;
  if (type === "ADMIN") return 3;
  return null;
}

function groupLevelLabel(level: number | null | undefined): string {
  if (level === 1) return "Nhan vien";
  if (level === 2) return "Leader";
  if (level === 3) return "Manager";
  if (level === 4) return "User/Admin";
  return "-";
}

export function UserGroupsManager({ users }: Props) {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [editing, setEditing] = useState<UserGroup | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<{
    name: string;
    type: GroupType;
    managesLevel: string;
    description: string;
    memberIds: string[];
  }>({
    name: "",
    type: "EMPLOYEE",
    managesLevel: "",
    description: "",
    memberIds: [],
  });

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoadingGroups(true);
    try {
      const res = await fetch("/api/admin/user-groups", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Khong tai duoc danh sach nhom");
      } else {
        setGroups(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Khong tai duoc danh sach nhom");
    } finally {
      setLoadingGroups(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setShowForm(false);
    setError("");
    setForm({
      name: "",
      type: "EMPLOYEE",
      managesLevel: "",
      description: "",
      memberIds: [],
    });
  }

  function startEdit(group: UserGroup) {
    setEditing(group);
    setShowForm(true);
    setError("");
    setForm({
      name: group.name,
      type: typeFromLevel(group.level),
      managesLevel:
        group.managesLevel === null || group.managesLevel === undefined
          ? ""
          : String(group.managesLevel),
      description: group.description || "",
      memberIds: group.members.map((m) => m.userId),
    });
  }

  function toggleMember(userId: string) {
    setForm((prev) => {
      const exists = prev.memberIds.includes(userId);
      return {
        ...prev,
        memberIds: exists
          ? prev.memberIds.filter((id) => id !== userId)
          : [...prev.memberIds, userId],
      };
    });
  }

  async function save() {
    if (!form.name.trim()) {
      setError("Ten nhom la bat buoc");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEdit = Boolean(editing);
      const res = await fetch(
        isEdit ? `/api/admin/user-groups/${editing?.id}` : "/api/admin/user-groups",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Khong luu duoc nhom");
        return;
      }

      if (isEdit) {
        setGroups((prev) => prev.map((g) => (g.id === data.id ? data : g)));
      } else {
        setGroups((prev) => [data, ...prev]);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Khong luu duoc nhom");
    } finally {
      setLoading(false);
    }
  }

  async function remove(group: UserGroup) {
    if (!confirm(`Xoa nhom ${group.name}?`)) return;
    const res = await fetch(`/api/admin/user-groups/${group.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Khong xoa duoc nhom");
      return;
    }
    setGroups((prev) => prev.filter((g) => g.id !== group.id));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Nhom User</h1>
          <p className="text-gray-500 mt-1">{groups.length} nhom duoc cau hinh</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tao nhom
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">{editing ? "Sua nhom" : "Tao nhom moi"}</h2>
            <button onClick={resetForm} className="text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ten nhom (vd: Nhom 1)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
            <select
              value={form.type}
              onChange={(e) => {
                const nextType = e.target.value as GroupType;
                const defaultManaged = defaultManagedLevelByType(nextType);
                setForm({
                  ...form,
                  type: nextType,
                  managesLevel: defaultManaged === null ? "" : String(defaultManaged),
                });
              }}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="EMPLOYEE">Nhom Nhan vien</option>
              <option value="LEADER">Nhom Leader</option>
              <option value="MANAGER">Nhom Manager</option>
              <option value="ADMIN">Nhom Admin</option>
            </select>
            <select
              value={form.managesLevel}
              onChange={(e) => setForm({ ...form, managesLevel: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Khong quan ly nhom nao</option>
              <option value="1">Quan ly nhom Nhan vien</option>
              <option value="2">Quan ly nhom Leader</option>
              <option value="3">Quan ly nhom Manager</option>
            </select>
            <input
              type="text"
              placeholder="Mo ta (tuy chon)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Thanh vien ({form.memberIds.length})</p>
            <div className="max-h-56 overflow-y-auto border rounded p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {users.map((u) => {
                const selected = form.memberIds.includes(u.id);
                return (
                  <label key={u.id} className="flex items-start gap-2 text-sm border rounded p-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleMember(u.id)}
                      className="mt-0.5"
                    />
                    <span>
                      <strong>{u.name}</strong> ({u.role})
                      <br />
                      <span className="text-xs text-gray-500">{u.email}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>}

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="w-4 h-4" /> {loading ? "Dang luu..." : "Luu"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Huy
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Ten nhom</th>
              <th className="text-left p-3">Loai</th>
              <th className="text-left p-3">Quan ly nhom</th>
              <th className="text-left p-3">Thanh vien</th>
              <th className="text-left p-3">Mo ta</th>
              <th className="text-right p-3">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {loadingGroups ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Dang tai du lieu nhom...
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Chua co nhom nao
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.id} className="border-b">
                  <td className="p-3">
                    <div className="font-medium">{group.name}</div>
                    <div className="text-xs text-gray-500">{group.code}</div>
                  </td>
                  <td className="p-3">{typeFromLevel(group.level)}</td>
                  <td className="p-3">{groupLevelLabel(group.managesLevel ?? null)}</td>
                  <td className="p-3">{group.members.length}</td>
                  <td className="p-3 text-gray-600">{group.description || "-"}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => startEdit(group)}
                      className="p-1.5 hover:bg-blue-100 rounded text-blue-600 mr-1"
                      title="Sua"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(group)}
                      className="p-1.5 hover:bg-red-100 rounded text-red-600"
                      title="Xoa"
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
    </div>
  );
}
