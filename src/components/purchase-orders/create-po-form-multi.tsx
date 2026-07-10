"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "../i18n-provider";

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
  preselected: Request[];
  preselectedItems?: { requestId: string; itemIds: string[] }[];
}

export function CreatePOFormMulti({ availableRequests, preselected, preselectedItems }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
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
    if (preselectedItems && preselectedItems.length > 0) {
      const ids = new Set<string>();
      preselectedItems.forEach((p) => {
        p.itemIds.forEach((id) => ids.add(id));
      });
      setSelectedItemIds(ids);
    } else if (preselected.length > 0) {
      const ids = new Set<string>();
      preselected.forEach((req) => {
        req.items.forEach((item) => ids.add(item.id));
      });
      setSelectedItemIds(ids);
    }
  }, []);

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const allRequests = preselected.length > 0 ? preselected : availableRequests;

  const getSelectedItems = (): Item[] => {
    const result: Item[] = [];
    allRequests.forEach((req) => {
      req.items.forEach((item) => {
        if (selectedItemIds.has(item.id)) {
          result.push(item);
        }
      });
    });
    return result;
  };

  const selectedItems = getSelectedItems();
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );

  const getItemName = (item: Item): string => {
    if (item.deviceModel) {
      return item.deviceModel.brand + " " + item.deviceModel.name;
    }
    return item.customName || t("request.product", "Product");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItemIds.size === 0) {
      setError(t("po.selectAtLeastOne", "Please select at least one item"));
      return;
    }
    if (!poFile) {
      setError(t("po.uploadFileRequired", "Please upload PO file"));
      return;
    }
    if (!form.expectedDate) {
      setError(t("po.expectedDateRequired", "Please enter expected delivery date"));
      return;
    }
    if (!form.supplierName) {
      setError(t("po.supplierNameRequired", "Please enter supplier name"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      selectedItemIds.forEach((id) => {
        formData.append("itemIds", id);
      });
      formData.append("supplierName", form.supplierName);
      formData.append("supplierContact", form.supplierContact);
      formData.append("supplierPhone", form.supplierPhone);
      formData.append("expectedDate", form.expectedDate);
      formData.append("notes", form.notes);
      formData.append("poFile", poFile);

      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("common.error", "Error"));
      } else {
        alert(t("po.createSuccess", "PO created with {{n}} items", { n: selectedItemIds.size }));
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
        ← {t("common.back", "Back")}
      </button>
      <h1 className="text-2xl font-bold">{t("po.create", "Create PO")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* DANH SACH ITEMS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold mb-3">
            {t("po.itemsTitle", "Items")} ({selectedItemIds.size} {t("po.selectedCount", "selected")})
          </h2>

          {allRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t("po.noItems", "No items")}
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {allRequests.map((req) => (
                <div key={req.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm">{req.requestNumber}</span>
                    <span className="text-xs text-gray-500">- {req.requester.name}</span>
                  </div>
                  <div className="space-y-1">
                    {req.items.map((item) => {
                      const isSelected = selectedItemIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={
                            "flex items-center gap-3 p-2 border rounded cursor-pointer " +
                            (isSelected
                              ? "border-blue-500 bg-blue-100"
                              : "border-gray-200 bg-white")
                          }
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{getItemName(item)}</p>
                            <p className="text-xs text-gray-500">
                              {item.category.name}
                              {item.specs ? " - " + item.specs : ""}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p>{t("common.quantity", "Qty")}: {item.quantity}</p>
                            <p className="font-medium text-blue-700">
                              {formatCurrency(item.totalPrice || 0)}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FORM THONG TIN PO */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-3 h-fit sticky top-4">
          <h2 className="font-bold">{t("po.poInfo", "PO Information")}</h2>

          {selectedItemIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-blue-700">
                {t("po.selectedNItems", "{{n}} items selected", { n: selectedItemIds.size })}
              </p>
              <p className="text-xl font-bold text-blue-700 mt-1">
                {t("common.total", "Total")}: {formatCurrency(totalAmount)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">{t("supplier.title", "Supplier")} *</label>
            <input
              type="text"
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              className="w-full border rounded px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("supplier.contact", "Contact")}</label>
            <input
              type="text"
              value={form.supplierContact}
              onChange={(e) => setForm({ ...form, supplierContact: e.target.value })}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("common.phone", "Phone")}</label>
            <input
              type="tel"
              value={form.supplierPhone}
              onChange={(e) => setForm({ ...form, supplierPhone: e.target.value })}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("po.expectedDate", "Expected delivery")} *</label>
            <input
              type="date"
              value={form.expectedDate}
              onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
              className="w-full border rounded px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("po.poFile", "PO File")} *</label>
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
            <label className="block text-xs font-medium mb-1">{t("common.note", "Note")}</label>
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
            disabled={loading || selectedItemIds.size === 0}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t("common.creating", "Creating...") : t("po.create", "Create PO")}
          </button>
        </form>
      </div>
    </div>
  );
}
