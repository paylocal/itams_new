"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle, ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export function CreatePOForm({ request }: { request: any }) {
  const router = useRouter();
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
      setError("Vui long upload file PO");
      return;
    }
    if (!form.expectedDate) {
      setError("Vui long nhap ngay giao hang du kien");
      return;
    }
    if (!form.supplierName) {
      setError("Vui long nhap ten nha cung cap");
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
        alert("Tao PO thanh cong!");
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
        <ArrowLeft className="w-4 h-4" /> Quay lai
      </button>

      <h1 className="text-2xl font-bold">Tao don mua hang (PO)</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">Yeu cau: <strong>{request.requestNumber}</strong></p>
        <p className="text-sm">{request.title}</p>
        <p className="text-xs text-gray-600 mt-1">
          Nguoi yeu cau: {request.requester.name}
        </p>
        <p className="text-lg font-bold text-blue-700 mt-2">
          Tong tien: {formatCurrency(totalAmount)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Ten nha cung cap *</label>
            <input
              type="text"
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              placeholder="VD: FPT Shop"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nguoi lien he</label>
            <input
              type="text"
              value={form.supplierContact}
              onChange={(e) => setForm({ ...form, supplierContact: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">So dien thoai</label>
            <input
              type="tel"
              value={form.supplierPhone}
              onChange={(e) => setForm({ ...form, supplierPhone: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Ngay giao hang DU KIEN *</label>
            <input
              type="date"
              value={form.expectedDate}
              onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">File PO *</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => setPoFile(e.target.files?.[0] || null)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
            {poFile && (
              <p className="text-xs text-green-700 mt-1">
                Da chon: {poFile.name}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Ghi chu</label>
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
            {loading ? "Dang tao..." : "Tao PO"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-6 py-2 rounded-md"
          >
            Huy
          </button>
        </div>
      </form>
    </div>
  );
}