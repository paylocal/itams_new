"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Package, Check, AlertCircle, FileText, ArrowLeft } from "lucide-react";
import { useI18n } from "../i18n-provider";

interface Props {
  po: {
    id: string;
    poNumber: string;
    supplierName: string;
    status: string;
    actualDate: Date | string | null;
    requests: Array<{
      request: {
        id: string;
        requestNumber: string;
        title: string;
      };
    }>;
  };
}

export function ReceivePOForm({ po }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [actualDate, setActualDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualDate, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("common.error", "Error"));
      } else {
        router.push("/purchase-orders");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> {t("common.back", "Back")}
      </button>

      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-green-600" />
          {t("po.receiveTitle", "Confirm receipt")}
        </h1>
        <p className="text-gray-500 mt-1">
          {po.poNumber} - {po.supplierName}
        </p>
      </div>

      <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("po.relatedRequests", "Related requests")}
          </label>
          <div className="space-y-1">
            {po.requests.map((pr) => (
              <div key={pr.request.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-3 py-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-mono">{pr.request.requestNumber}</span>
                <span className="text-gray-500">- {pr.request.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {t("po.actualDate", "Received date")} *
          </label>
          <input
            type="date"
            value={actualDate}
            onChange={(e) => setActualDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("common.note", "Note")}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {loading ? t("common.processing", "Processing...") : t("po.confirmReceive", "Confirm receipt")}
        </button>
      </form>
    </div>
  );
}
