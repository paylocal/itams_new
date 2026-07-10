"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle, Package } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  hasModel: boolean;
  models: { id: string; brand: string; name: string; avgPrice: number | null }[];
}

interface Item {
  id: string;
  categoryId: string;
  deviceModelId: string;
  customName: string;
  quantity: number;
  unitPrice: number;
  specs: string;
}

export function NewRequestForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("NORMAL");

  const [items, setItems] = useState<Item[]>([
    { id: "1", categoryId: "", deviceModelId: "", customName: "", quantity: 1, unitPrice: 0, specs: "" },
  ]);

  useEffect(() => {
    fetch("/api/device-categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), categoryId: "", deviceModelId: "", customName: "", quantity: 1, unitPrice: 0, specs: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        if (field === "categoryId") {
          updated.deviceModelId = "";
          updated.customName = "";
        }
        return updated;
      })
    );
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/requests/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          reason,
          priority,
          items: items.map((i) => ({
            categoryId: i.categoryId,
            deviceModelId: i.deviceModelId || undefined,
            customName: i.customName || undefined,
            quantity: i.quantity,
            unitPrice: i.unitPrice || 0,
            specs: i.specs,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        router.push(`/requests/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t("request.createTitle", "Create Purchase Request")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("request.titlePlaceholder", "Title (e.g. Laptop for team)")}
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("request.reasonPlaceholder", "Reason *")}
            rows={2}
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="LOW">{t("priority.LOW", "Low")}</option>
            <option value="NORMAL">{t("priority.NORMAL", "Normal")}</option>
            <option value="HIGH">{t("priority.HIGH", "High")}</option>
            <option value="URGENT">{t("priority.URGENT", "Urgent")}</option>
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t("request.itemsTitle", "Items")} ({items.length})
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> {t("request.addItem", "Add item")}
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{t("request.itemNumber", "Item #{{n}}", { n: idx + 1 })}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateItem(item.id, "categoryId", e.target.value)}
                      className="col-span-4 border rounded px-2 py-1.5 text-sm"
                      required
                    >
                      <option value="">-- {t("request.category", "Category")} --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    <div className="col-span-5">
                      {cat?.hasModel ? (
                        <select
                          value={item.deviceModelId}
                          onChange={(e) => {
                            const m = cat.models.find((x) => x.id === e.target.value);
                            updateItem(item.id, "deviceModelId", e.target.value);
                            if (m?.avgPrice) updateItem(item.id, "unitPrice", Number(m.avgPrice));
                          }}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                          required
                        >
                          <option value="">-- {t("request.product", "Product")} --</option>
                          {cat.models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.brand} {m.name} ({formatCurrency(Number(m.avgPrice) || 0)})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={item.customName}
                          onChange={(e) => updateItem(item.id, "customName", e.target.value)}
                          placeholder={t("request.customNamePlaceholder", "Enter product name")}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                          required
                        />
                      )}
                    </div>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                      className="col-span-1 border rounded px-2 py-1.5 text-sm"
                    />

                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      placeholder={t("request.unitPrice", "Unit price")}
                      className="col-span-2 border rounded px-2 py-1.5 text-sm"
                    />
                  </div>

                  <input
                    type="text"
                    value={item.specs}
                    onChange={(e) => updateItem(item.id, "specs", e.target.value)}
                    placeholder={t("request.specsPlaceholder", "Specs / Notes")}
                    className="w-full mt-2 border rounded px-2 py-1.5 text-sm"
                  />

                  <div className="text-right text-xs text-blue-600 mt-1">
                    {t("request.lineTotal", "Subtotal")}: <strong>{formatCurrency(item.quantity * item.unitPrice)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t flex justify-between items-center">
            <span className="text-sm font-medium">{t("request.total", "Total")}:</span>
            <span className="text-xl font-bold text-blue-700">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t("request.sending", "Sending...") : t("request.submit", "Submit request")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-6 py-2 rounded"
          >
            {t("common.cancel", "Cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
