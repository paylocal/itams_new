"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle, ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

export function CreatePOForm({ request }: { request: any }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    supplierName: "",
    supplierContact: "",
    supplierPhone: "",
    expectedDate: "",
    notes: "",
  });
  const [poFile, setPoFile] = useState<File | null>(null);

  const totalAmount = request.items.reduce(
    (sum: number, item: any) => sum + (item.totalPrice || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

        if (!poFile) {
      setError(t("po.errorFileRequired", "Please upload PO file"));
      return;
    }
    if (!form.expectedDate) {
      setError(t("po.errorExpectedDate", "Please enter expected delivery date"));
      return;
    }
    if (!form.supplierName) {
      setError(t("po.errorSupplier", "Please enter supplier name"));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("requestId", request.id);
      formData.append("supplierName", form.supplierName);
      formData.append("supplierContact", form.supplierContact);
      formData.append("supplierPhone", form.supplierPhone);
      formData.append("expectedDate", form.expectedDate);
      formData.append("totalAmount", totalAmount.toString());
      formData.append("notes", form.notes);
      formData.append("poFile", poFile);

      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
                alert(t("po.createSuccess", "PO created successfully"));
        router.push("/approvals");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
            <button onClick={() => router.back()} className="text-sm text-gray-600 hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> {t("common.back", "Back")}
      </button>

      <h1 className="text-2xl font-bold">{t("po.createTitle", "Create Purchase Order")}</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">{t("po.request", "Request")}: <strong>{request.requestNumber}</strong></p>
        <p className="text-sm">{request.title}</p>
        <p className="text-xs text-gray-600 mt-1">
          {t("po.requester", "Requester")}: {request.requester.name}
        </p>
        <p className="text-lg font-bold text-blue-700 mt-2">
          {t("po.total", "Total")}: {formatCurrency(totalAmount)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("po.supplierName", "Supplier name")} *</label>
            <input
              type="text"
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              placeholder={t("po.supplierNamePlaceholder", "e.g. FPT Shop")}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("po.contactPerson", "Contact person")}</label>
            <input
              type="text"
              value={form.supplierContact}
              onChange={(e) => setForm({ ...form, supplierContact: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("po.phone", "Phone")}</label>
            <input
              type="tel"
              value={form.supplierPhone}
              onChange={(e) => setForm({ ...form, supplierPhone: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("po.expectedDate", "Expected delivery date")} *</label>
            <input
              type="date"
              value={form.expectedDate}
              onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("po.poFile", "PO file")} *</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => setPoFile(e.target.files?.[0] || null)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
            {poFile && (
              <p className="text-xs text-green-700 mt-1">
                {t("common.selected", "Selected")}: {poFile.name}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("common.notes", "Notes")}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex gap-3">
                    <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {loading ? t("common.processing", "Processing...") : t("po.create", "Create PO")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-6 py-2 rounded-md"
          >
            {t("common.cancel", "Cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}