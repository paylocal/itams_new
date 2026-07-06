const fs = require("fs");
const path = require("path");

const code = `"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, AlertCircle, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Request {
  id: string;
  requestNumber: string;
  title: string;
  totalAmount: number | null;
  requester: { name: string; department: string | null };
  items: any[];
}

interface Props {
  availableRequests: Request[];
  preselected: Request[];
}

export function CreatePOFormMulti({ availableRequests, preselected }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [poFile, setPoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    supplierName: "",
    supplierContact: "",
    supplierPhone: "",
    expectedDate: "",
    notes: "",
  });

  useEffect(() => {
    if (preselected.length > 0) {
      setSelectedIds(preselected.map((r) => r.id));
    }
  }, []);

  const toggleRequest = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allRequests = [
    ...preselected,
    ...availableRequests.filter((r) => !preselected.find((p) => p.id === r.id)),
  ];

  const selectedRequests = allRequests.filter((r) => selectedIds.includes(r.id));
  const totalAmount = selectedRequests.reduce(
    (sum, r) => sum + (r.totalAmount || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedIds.length === 0) {
      setError("Vui long chon it nhat 1 yeu cau");
      return;
    }
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
    setError("");

    try {
      const formData = new FormData();
      selectedIds.forEach((id) => formData.append("requestIds", id));
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
        setError(data.error || "Loi");
      } else {
        alert("Tao PO thanh cong!");
        router.push("/purchase-orders");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <button onClick={() => router.back()} className="text-sm text-gray-600 hover:underline">
        Quay lai
      </button>
      <h1 className="text-2xl font-bold">Tao PO</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold mb-3">Chon yeu cau ({selectedIds.length})</h2>

          {allRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Khong co yeu cau nao
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allRequests.map((req) => {
                const isSelected = selectedIds.includes(req.id);
                return (
                  <div
                    key={req.id}
                    onClick={() => toggleRequest(req.id)}
                    className={
                      "border rounded-lg p-3 cursor-pointer " +
                      (isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={isSelected} onChange={() => {}} className="mt-1" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{req.requestNumber}</p>
                        <p className="text-sm">{req.title}</p>
                        <p className="text-xs text-gray-500">
                          {req.requester.name} | {req.items.length} mat hang | {formatCurrency(req.totalAmount || 0)}
                        </p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-3 h-fit">
          <h2 className="font-bold">Thong tin PO</h2>

          {selectedRequests.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-blue-700">
                Da chon: {selectedIds.length} YC
              </p>
              <p className="text-lg font-bold text-blue-700 mt-1">
                Tong: {formatCurrency(totalAmount)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">Nha cung cap *</label>
            <input
              type="text"
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              className="w-full border rounded px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Nguoi lien he</label>
            <input
              type="text"
              value={form.supplierContact}
              onChange={(e) => setForm({ ...form, supplierContact: e.target.value })}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">SDT</label>
            <input
              type="tel"
              value={form.supplierPhone}
              onChange={(e) => setForm({ ...form, supplierPhone: e.target.value })}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ngay giao du kien *</label>
            <input
              type="date"
              value={form.expectedDate}
              onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
              className="w-full border rounded px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">File PO *</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => setPoFile(e.target.files?.[0] || null)}
              className="w-full text-xs"
              required
            />
            {poFile && <p className="text-xs text-green-700 mt-1">{poFile.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ghi chu</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || selectedIds.length === 0}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Dang tao..." : "Tao PO"}
          </button>
        </form>
      </div>
    </div>
  );
}
`;

const dir = path.join(__dirname, "src", "components", "purchase-orders");
const file = path.join(dir, "create-po-form-multi.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);
