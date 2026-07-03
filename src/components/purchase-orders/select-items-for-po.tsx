"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ShoppingCart, Package, CheckCircle2 } from "lucide-react";
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
  items: (Item & { hasPO: boolean })[];
}

interface Props {
  availableRequests: Request[];
}

export function SelectItemsForPO({ availableRequests }: Props) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleAllInRequest = (requestId: string, itemIds: string[]) => {
    const availableIds = itemIds.filter((id) => {
      const item = availableRequests
        .find((r) => r.id === requestId)
        ?.items.find((i) => i.id === id);
      return item && !item.hasPO;
    });
    setSelectedItems((prev) => {
      const allSelected = availableIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        availableIds.forEach((id) => next.delete(id));
      } else {
        availableIds.forEach((id) => next.add(id));
      }
      return next;
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
      req.items.forEach((item) => {
        if (selectedItems.has(item.id) && !item.hasPO) {
          total += item.totalPrice || 0;
        }
      });
    });
    return total;
  };

  const getTotalSelectedCount = (): number => {
    return selectedItems.size;
  };

  // Tinh so YC se hoan thanh neu tao PO nay
  const getWillCompleteRequests = (): string[] => {
    const result: string[] = [];
    availableRequests.forEach((req) => {
      const allItems = req.items;
      const itemsNeedPO = allItems.filter((i) => !i.hasPO);
      const allSelected = itemsNeedPO.every((i) => selectedItems.has(i.id));
      if (allSelected && itemsNeedPO.length > 0) {
        result.push(req.requestNumber);
      }
    });
    return result;
  };

  const willComplete = getWillCompleteRequests();

  const handleCreatePO = () => {
    if (selectedItems.size === 0) {
      alert("Vui long chon it nhat 1 mat hang");
      return;
    }
    // Encode: itemId1,itemId2,itemId3
    const query = Array.from(selectedItems).join(",");
    router.push("/purchase-orders/new?itemIds=" + encodeURIComponent(query));
  };

  // Chi hien thi items chua co PO
  const visibleRequests = availableRequests
    .map((req) => ({
      ...req,
      items: req.items.filter((i) => !i.hasPO),
    }))
    .filter((req) => req.items.length > 0);

  if (visibleRequests.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <button onClick={() => router.back()} className="text-sm text-gray-600 hover:underline">
          Quay lai
        </button>
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p className="font-medium">Tat ca yeu cau da hoan thanh!</p>
          <p className="text-xs mt-2">Khong con mat hang nao can mua</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <button onClick={() => router.back()} className="text-sm text-gray-600 hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Quay lai
      </button>

      <div>
        <h1 className="text-2xl font-bold">Chon mat hang de tao PO</h1>
        <p className="text-gray-500 mt-1">
          {visibleRequests.length} yeu cau con hang can mua
        </p>
      </div>

      <div className="space-y-4">
        {visibleRequests.map((req) => {
          const allSelected = req.items.every((i) => selectedItems.has(i.id));

          return (
            <div key={req.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{req.requestNumber}</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                      Con {req.items.length} hang
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
                    onChange={() =>
                      toggleAllInRequest(
                        req.id,
                        req.items.map((i) => i.id)
                      )
                    }
                    className="w-4 h-4"
                  />
                  Chon tat ca
                </label>
              </div>

              <div className="space-y-2">
                {req.items.map((item) => {
                  const isSelected = selectedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
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
                              <p className="font-medium text-sm">{getItemName(item)}</p>
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
                </strong>
              </p>
              <p className="text-2xl font-bold text-blue-700">
                Tong: {formatCurrency(getTotalSelected())}
              </p>
              {willComplete.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Se hoan thanh: {willComplete.join(", ")}
                </p>
              )}
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
    </div>
  );
}
