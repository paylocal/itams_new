"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, AlertCircle, Calendar, User, Package, FileText } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

interface RequestItem {
  id: string;
  category: { code: string; name: string };
  deviceModel: { brand: string; name: string } | null;
  customName: string | null;
  quantity: number;
}

interface Request {
  id: string;
  requestNumber: string;
  title: string;
  totalAmount: number | null;
  requester: { id: string; name: string; department: string | null };
  items: RequestItem[];
}

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
}

interface Props {
  request?: Request | null;
  availableAssets?: Asset[];
}

export function CreateHandover({ request, availableAssets = [] }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [requests, setRequests] = useState<Request[]>(request ? [request] : []);
  const [assets, setAssets] = useState<Asset[]>(availableAssets);
  const [selectedRequestId, setSelectedRequestId] = useState(request?.id || "");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(request?.requester?.id || "");
  const [handoverDate, setHandoverDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!request) {
      fetch("/api/handover-data")
        .then((r) => r.json())
        .then((d) => {
          setRequests(d.requests || []);
          setAssets(d.assets || []);
        })
        .catch((e) => console.error(e));
    }
  }, [request]);

  useEffect(() => {
    const req = requests.find((r) => r.id === selectedRequestId);
    if (req?.requester?.id) {
      setSelectedEmployeeId(req.requester.id);
    }
  }, [selectedRequestId, requests]);

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequestId,
          employeeId: selectedEmployeeId,
          handoverDate,
          assetIds: Array.from(selectedAssets),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("common.error", "Error"));
      } else {
        router.push("/handovers");
      }
    } catch (e) {
      setError(t("common.error", "Error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Plus className="w-6 h-6 text-blue-600" /> {t("handover.createTitle", "Create Handover")}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4 inline mr-1" /> {t("handover.request", "Request")}
          </label>
          {request ? (
            <div className="border rounded px-3 py-2 bg-gray-50">
              <p className="font-medium">{request.requestNumber} - {request.title}</p>
              <p className="text-sm text-gray-500">{request.requester.name}</p>
            </div>
          ) : (
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- {t("handover.selectRequest", "Select a completed request")} --</option>
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.requestNumber} - {r.title} ({r.requester.name})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <User className="w-4 h-4" /> {t("handover.employee", "Employee")}
            </label>
            <input
              type="text"
              value={requests.find((r) => r.id === selectedRequestId)?.requester.name || ""}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-50"
            />
            <input type="hidden" value={selectedEmployeeId} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {t("handover.date", "Handover date")}
            </label>
            <input
              type="date"
              value={handoverDate}
              onChange={(e) => setHandoverDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Package className="w-4 h-4" /> {t("handover.assets", "Assets to hand over")}
          </label>
          {assets.length === 0 ? (
            <p className="text-gray-500">{t("handover.noAssets", "No available assets")}</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 w-10"></th>
                    <th className="p-2 text-left">{t("assets.tag", "Asset tag")}</th>
                    <th className="p-2 text-left">{t("assets.name", "Name")}</th>
                    <th className="p-2 text-left">{t("assets.serial", "Serial")}</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => toggleAsset(a.id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedAssets.has(a.id)}
                          onChange={() => toggleAsset(a.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-2">{a.assetTag}</td>
                      <td className="p-2">{a.name}</td>
                      <td className="p-2">{a.serialNumber || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={loading || !selectedRequestId || selectedAssets.size === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? t("common.saving", "Saving...") : t("handover.create", "Create handover")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            {t("common.cancel", "Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
