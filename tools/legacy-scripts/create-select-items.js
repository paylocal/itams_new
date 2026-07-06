const fs = require("fs");
const path = require("path");

const code = `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ShoppingCart, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Item {
  id: string;
  categoryId: string;
  deviceModelId: string | null;
  customName: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  specs: string | null;
  deviceModel: { brand: string; name: string } | null;
  category: { name: string };
}

interface Request {
  id: string;
  requestNumber: string;
  title: string;
  requester: { name: string; department: string | null };
  items: Item[];
}

interface Props {
  availableRequests: Request[];
}

export function SelectItemsForPO({ availableRequests }: Props) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({});

  const toggleItem = (requestId: string, itemId: string) => {
    setSelectedItems((prev) => {
      const current = new Set(prev[requestId] || []);
      if (current.has(itemId)) {
        current.delete(itemId);
      } else {
        current.add(itemId);
      }
      return { ...prev, [requestId]: current };
    });
  };

  const toggleAllInRequest = (requestId: string, itemIds: string[]) => {
    setSelectedItems((prev) => {
      const current = prev[requestId] || new Set();
      const allSelected = itemIds.every((id) => current.has(id));
      const newSet = new Set(allSelected ? [] : itemIds);
      return { ...prev, [requestId]: newSet };
    });
  };

  const getItemName = (item: Item): string => {
    if (item.deviceModel) {
      return item.deviceModel.brand + " " + item.deviceModel.name;
    }
    return item.customName || "San pham";
  };

  const getTotalSelected = (): number => {
    let total = 0;
    availableRequests.forEach((req) => {
      const selectedIds = selectedItems[req.id] || new Set();
      req.items.forEach((item) => {
        if (selectedIds.has(item.id)) {
          total += item.totalPrice || 0;
        }
      });
    });
    return total;
  };

  const getTotalSelectedCount = (): number => {
    let count = 0;
    Object.values(selectedItems).forEach((s) => (count += s.size));
    return count;
  };

  const getSelectedRequestCount = (): number => {
    return Object.values(selectedItems).filter((s) => s.size > 0).length;
  };

  const handleCreatePO = () => {
    const data = Object.entries(selectedItems)
      .filter(([_, ids]) => ids.size > 0)
      .map(([requestId, ids]) => requestId + "=" + Array.from(ids).join(","));

    if (data.length === 0) {
      alert("Vui long chon it nhat 1 mat hang");
      return;
    }

    const query = encodeURIComponent(data.join("&"));
    router.push("/purchase-orders/new?items=" + query);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lai
      </button>

      <div>
        <h1 className="text-2xl font-bold">Chon mat hang de tao PO</h1>
        <p className="text-gray-500 mt-1">
          {availableRequests.length} yeu cau co the mua
        </p>
      </div>

      {availableRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Khong co yeu cau nao can mua</p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableRequests.map((req) => {
            const selectedIds = selectedItems[req.id] || new Set();
            const allSelected = req.items.every((i) => selectedIds.has(i.id));
            const someSelected = req.items.some((i) => selectedIds.has(i.id));

            return (
              <div key={req.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{req.requestNumber}</h3>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                        Cho mua
                      </span>
                    </div>
                    <p className="text-sm">{req.title}</p>
                    <p className="text-xs text-gray-500">
                      Nguoi yeu cau: {req.requester.name}
                      {req.requester.department && " (" + req.requester.department + ")"}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={() => toggleAllInRequest(req.id, req.items.map((i) => i.id))}
                      className="w-4 h-4"
                    />
                    Chon tat ca
                  </label>
                </div>

                <div className="space-y-2">
                  {req.items.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(req.id, item.id)}
                        className={
                          "border rounded-lg p-3 cursor-pointer transition " +
                          (isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-400")
                        }
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">
                                  {getItemName(item)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.category.name}
                                  {item.specs && " - " + item.specs}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">
                                  SL: <strong>{item.quantity}</strong>
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(item.unitPrice || 0)}/cai
                                </p>
                                <p className="text-sm font-bold text-blue-700">
                                  {formatCurrency(item.totalPrice || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="bg-white p-4 rounded-lg shadow sticky bottom-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Da chon:{" "}
                  <strong className="text-blue-700">
                    {getTotalSelectedCount()} mat hang
                  </strong>{" "}
                  tu {getSelectedRequestCount()} yeu cau
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  Tong: {formatCurrency(getTotalSelected())}
                </p>
              </div>
              <button
                onClick={handleCreatePO}
                disabled={getTotalSelectedCount() === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Tao PO ({getTotalSelectedCount()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

const dir = path.join(__dirname, "src", "components", "purchase-orders");
const file = path.join(dir, "select-items-for-po.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);