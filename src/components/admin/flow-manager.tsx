"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { WorkflowConfig } from "@/components/admin/workflow-config";

type UserGroup = {
  id: string;
  name: string;
};

type GroupFlow = {
  id: string;
  fromGroupId: string;
  toGroupId: string;
  minAmountUsd: number;
  description?: string | null;
  fromGroupName?: string | null;
  toGroupName?: string | null;
};

export function FlowManager() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [flows, setFlows] = useState<GroupFlow[]>([]);
  const [editingFlow, setEditingFlow] = useState<GroupFlow | null>(null);
  const [showFlowForm, setShowFlowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [error, setError] = useState("");

  const [flowForm, setFlowForm] = useState<{
    fromGroupId: string;
    toGroupId: string;
    minAmountUsd: string;
    description: string;
  }>({
    fromGroupId: "",
    toGroupId: "",
    minAmountUsd: "",
    description: "",
  });

  useEffect(() => {
    loadGroups();
    loadFlows();
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

  async function loadFlows() {
    setLoadingFlows(true);
    try {
      const res = await fetch("/api/admin/user-groups/flows", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Khong tai duoc flow");
      } else {
        setFlows(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Khong tai duoc flow");
    } finally {
      setLoadingFlows(false);
    }
  }

  function resetFlowForm() {
    setEditingFlow(null);
    setShowFlowForm(false);
    setFlowForm({
      fromGroupId: "",
      toGroupId: "",
      minAmountUsd: "",
      description: "",
    });
  }

  function startEditFlow(flow: GroupFlow) {
    setEditingFlow(flow);
    setShowFlowForm(true);
    setFlowForm({
      fromGroupId: flow.fromGroupId,
      toGroupId: flow.toGroupId,
      minAmountUsd: String(flow.minAmountUsd || 0),
      description: flow.description || "",
    });
  }

  async function saveFlow() {
    if (!flowForm.fromGroupId || !flowForm.toGroupId) {
      setError("Chon day du nhom nguon va nhom dich");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEdit = Boolean(editingFlow);
      const res = await fetch(
        isEdit ? `/api/admin/user-groups/flows/${editingFlow?.id}` : "/api/admin/user-groups/flows",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromGroupId: flowForm.fromGroupId,
            toGroupId: flowForm.toGroupId,
            minAmountUsd: Number(flowForm.minAmountUsd || 0),
            description: flowForm.description,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Khong luu duoc flow");
        return;
      }

      await loadFlows();
      resetFlowForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Khong luu duoc flow");
    } finally {
      setLoading(false);
    }
  }

  async function removeFlow(flow: GroupFlow) {
    if (!confirm(`Xoa flow ${flow.fromGroupName} -> ${flow.toGroupName}?`)) return;
    const res = await fetch(`/api/admin/user-groups/flows/${flow.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Khong xoa duoc flow");
      return;
    }
    setFlows((prev) => prev.filter((f) => f.id !== flow.id));
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold">Flow duyet</h2>
            <p className="text-sm text-gray-500">Tao/chinh tuyen duyet giua cac nhom va nguong tien</p>
          </div>
          <button
            onClick={() => {
              resetFlowForm();
              setShowFlowForm(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2"
            disabled={loadingGroups}
          >
            <Plus className="w-4 h-4" /> Tao flow
          </button>
        </div>

        <WorkflowConfig embedded />

        {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>}

        {showFlowForm && (
          <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={flowForm.fromGroupId}
                onChange={(e) => setFlowForm({ ...flowForm, fromGroupId: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">Chon nhom nguon</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <select
                value={flowForm.toGroupId}
                onChange={(e) => setFlowForm({ ...flowForm, toGroupId: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">Chon nhom dich</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={flowForm.minAmountUsd}
                onChange={(e) => setFlowForm({ ...flowForm, minAmountUsd: e.target.value })}
                placeholder="Nguong tien (USD)"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={flowForm.description}
                onChange={(e) => setFlowForm({ ...flowForm, description: e.target.value })}
                placeholder="Mo ta (tuy chon)"
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveFlow}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> {loading ? "Dang luu..." : "Luu flow"}
              </button>
              <button onClick={resetFlowForm} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Huy
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Tu nhom</th>
                <th className="text-left p-3">Den nhom</th>
                <th className="text-left p-3">Nguong USD</th>
                <th className="text-left p-3">Mo ta</th>
                <th className="text-right p-3">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {loadingFlows ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">Dang tai flow...</td>
                </tr>
              ) : flows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">Chua co flow nao</td>
                </tr>
              ) : (
                flows.map((flow) => (
                  <tr key={flow.id} className="border-b">
                    <td className="p-3">{flow.fromGroupName || flow.fromGroupId}</td>
                    <td className="p-3">{flow.toGroupName || flow.toGroupId}</td>
                    <td className="p-3">{Number(flow.minAmountUsd).toLocaleString("vi-VN")} USD</td>
                    <td className="p-3 text-gray-600">{flow.description || "-"}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => startEditFlow(flow)}
                        className="p-1.5 hover:bg-blue-100 rounded text-blue-600 mr-1"
                        title="Sua"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFlow(flow)}
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
    </div>
  );
}
