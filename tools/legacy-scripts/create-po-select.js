const fs = require("fs");
const path = require("path");

const code = `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ShoppingCart, FileText } from "lucide-react";
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
}

export function SelectRequestsForPO({ availableRequests }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"single" | "multiple">("multiple");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleRequest = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === availableRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableRequests.map((r) => r.id));
    }
  };

  const filteredRequests = availableRequests.filter(
    (r) =>
      searchTerm === "" ||
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requester.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRequests = availableRequests.filter((r) =>
    selectedIds.includes(r.id)
  );
  const totalAmount = selectedRequests.reduce(
    (sum, r) => sum + (r.totalAmount || 0),
    0
  );

  const handleCreatePO = () => {
    if (selectedIds.length === 0) {
      alert("Vui long chon it nhat 1 yeu cau");
      return;
    }

    // Chuyen sang trang tao PO voi danh sach ID
    const query = selectedIds.join(",");
    router.push("/purchase-orders/new?requestIds=" + query);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lai
      </button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chon yeu cau de tao PO</h1>
          <p className="text-gray-500 mt-1">
            {availableRequests.length} yeu cau dang cho mua hang
          </p>
        </div>
      </div>

      {availableRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Khong co yeu cau nao can tao PO</p>
          <p className="text-xs mt-2">
            YC se xuat hien o day sau khi IT duyet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* DANH SACH YC */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Tim kiem theo ma, tieu de, nguoi yeu cau..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-3 py-1.5 text-sm flex-1 mr-2"
              />
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:underline whitespace-nowrap"
              >
                {selectedIds.length === filteredRequests.length
                  ? "Bo chon tat ca"
                  : "Chon tat ca"}
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-3">
              Da chon: {selectedIds.length} / {filteredRequests.length}
            </p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredRequests.map((req) => {
                const isSelected = selectedIds.includes(req.id);
                return (
                  <div
                    key={req.id}
                    onClick={() => toggleRequest(req.id)}
                    className={
                      "border rounded-lg p-3 cursor-pointer transition " +
                      (isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-400")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">
                            {req.requestNumber}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                            Cho mua
                          </span>
                        </div>
                        <p className="text-sm">{req.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {req.requester.name}
                          {req.requester.department && " (" + req.requester.department + ")"}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {req.items.length} mat hang
                          </span>
                          <span className="text-sm font-medium text-blue-700">
                            {formatCurrency(req.totalAmount || 0)}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PANEL BEN PHAI - CHON CACH TAO PO */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4 h-fit sticky top-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Tao PO
            </h2>

            {selectedIds.length > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Da chon {selectedIds.length} yeu cau
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedRequests.map((r) => (
                    <div
                      key={r.id}
                      className="flex justify-between text-xs bg-white rounded px-2 py-1"
                    >
                      <span>{r.requestNumber}</span>
                      <span className="font-medium">
                        {formatCurrency(r.totalAmount || 0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-blue-300 flex justify-between font-bold">
                  <span>Tong:</span>
                  <span className="text-blue-700">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed rounded p-4 text-center text-gray-500 text-sm">
                Chon it nhat 1 yeu cau de tao PO
              </div>
            )}

            <button
              onClick={handleCreatePO}
              disabled={selectedIds.length === 0}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Tiep tuc tao PO ({selectedIds.length})
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 text-sm"
              >
                Bo chon tat ca
              </button>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
              💡 Ban co the tao 1 PO chua nhieu yeu cau, hoac moi yeu cau tao 1 PO rieng.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

const dir = path.join(__dirname, "src", "components", "purchase-orders");
const file = path.join(dir, "select-requests-for-po.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);