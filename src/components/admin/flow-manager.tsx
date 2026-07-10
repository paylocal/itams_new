"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { useI18n } from "../i18n-provider";

type UserGroup = {
  id: string;
  code: string;
  name: string;
};

type WorkflowRule = {
  id: string;
  name: string;
  description: string | null;
  conditionType: string;
  operator: string;
  value: number;
  requiredLevel: number;
  groupId: string | null;
  group: { code: string; name: string } | null;
  isActive: boolean;
  order: number;
};

export function FlowManager() {
  const { t } = useI18n();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [editing, setEditing] = useState<WorkflowRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    groupId: "",
    value: "0",
    requiredLevel: "1",
    order: "0",
    isActive: true,
  });

  useEffect(() => {
    loadGroups();
    loadRules();
  }, []);

  async function loadGroups() {
    try {
      const res = await fetch("/api/admin/user-groups", { cache: "no-store" });
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadRules() {
    try {
      const res = await fetch("/api/admin/workflow-rules", { cache: "no-store" });
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  function resetForm() {
    setEditing(null);
    setShowForm(false);
    setForm({
      name: "",
      description: "",
      groupId: "",
      value: "0",
      requiredLevel: "1",
      order: "0",
      isActive: true,
    });
    setError("");
  }

  function startEdit(rule: WorkflowRule) {
    setEditing(rule);
    setShowForm(true);
    setForm({
      name: rule.name,
      description: rule.description || "",
      groupId: rule.groupId || "",
      value: String(rule.value),
      requiredLevel: String(rule.requiredLevel),
      order: String(rule.order),
      isActive: rule.isActive,
    });
  }

  async function save() {
    if (!form.name || !form.groupId) {
      setError(t("workflow.ruleNameAndGroupRequired", "Please enter name and select group"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        id: editing?.id,
        value: Number(form.value),
        requiredLevel: Number(form.requiredLevel),
        order: Number(form.order),
      };
      const res = await fetch("/api/admin/workflow-rules", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || t("common.error", "Error"));
      } else {
        await loadRules();
        resetForm();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(rule: WorkflowRule) {
    if (!confirm(t("workflow.confirmDelete", "Delete rule {{name}}?", { name: rule.name }))) return;
    const res = await fetch(`/api/admin/workflow-rules/${rule.id}`, { method: "DELETE" });
    if (res.ok) {
      await loadRules();
    } else {
      alert(t("common.error", "Error"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold">{t("flow.title", "Approval Flow")}</h2>
            <p className="text-sm text-gray-500">{t("flow.subtitle", "Configure approval thresholds by group")}</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t("flow.create", "Create rule")}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>}

        {showForm && (
          <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("workflow.ruleName", "Rule name")}
                className="border rounded px-3 py-2 text-sm"
              />
              <select
                value={form.groupId}
                onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">{t("workflow.selectGroup", "Select group")}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.code})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={t("workflow.thresholdUsd", "Threshold USD")}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={form.requiredLevel}
                onChange={(e) => setForm({ ...form, requiredLevel: e.target.value })}
                placeholder={t("workflow.level", "Level")}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("common.description", "Description")}
                className="border rounded px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                {t("common.active", "Active")}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> {loading ? t("common.saving", "Saving...") : t("flow.save", "Save")}
              </button>
              <button onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                {t("common.cancel", "Cancel")}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">{t("workflow.name", "Name")}</th>
                <th className="text-left p-3">{t("workflow.group", "Group")}</th>
                <th className="text-left p-3">{t("workflow.threshold", "Threshold")}</th>
                <th className="text-left p-3">{t("workflow.level", "Level")}</th>
                <th className="text-left p-3">{t("common.status", "Status")}</th>
                <th className="text-right p-3">{t("common.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    {t("flow.empty", "No rules")}
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="border-b">
                    <td className="p-3 font-medium">{rule.name}</td>
                    <td className="p-3">{rule.group?.name || rule.groupId}</td>
                    <td className="p-3">{Number(rule.value).toLocaleString("vi-VN")} USD</td>
                    <td className="p-3">{rule.requiredLevel}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${rule.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {rule.isActive ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => startEdit(rule)}
                        className="p-1.5 hover:bg-blue-100 rounded text-blue-600 mr-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(rule)}
                        className="p-1.5 hover:bg-red-100 rounded text-red-600"
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
    </div>
  );
}
