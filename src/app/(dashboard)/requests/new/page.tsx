"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle, Package } from "lucide-react";

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

export default function NewRequestPage() {
  const router = useRouter();
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
      <h1 className="text-2xl font-bold">Tao yeu cau mua sam</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thong tin chung */}
        <div className="bg-white p-6 rounded-lg shadow space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tieu de (VD: Cap laptop cho team)"
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ly do yeu cau *"
            rows={2}
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="LOW">Thap</option>
            <option value="NORMAL">Binh thuong</option>
            <option value="HIGH">Cao</option>
            <option value="URGENT">Khan cap</option>
          </select>
        </div>

        {/* Danh sach hang hoa */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Danh sach hang hoa ({items.length})
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Them hang
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">Hang #{idx + 1}</span>
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
                      <option value="">-- Danh muc --</option>
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
                            if (m?.avgPrice) updateItem(item.id, "unitPrice", m.avgPrice);
                          }}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                          required
                        >
                          <option value="">-- San pham --</option>
                          {cat.models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.brand} {m.name} ({m.avgPrice?.toLocaleString("vi-VN")} d)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={item.customName}
                          onChange={(e) => updateItem(item.id, "customName", e.target.value)}
                          placeholder="Nhap ten san pham"
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
                      placeholder="Don gia"
                      className="col-span-2 border rounded px-2 py-1.5 text-sm"
                    />
                  </div>

                  <input
                    type="text"
                    value={item.specs}
                    onChange={(e) => updateItem(item.id, "specs", e.target.value)}
                    placeholder="Cau hinh / Ghi chu"
                    className="w-full mt-2 border rounded px-2 py-1.5 text-sm"
                  />

                  <div className="text-right text-xs text-blue-600 mt-1">
                    Thanh tien: <strong>{(item.quantity * item.unitPrice).toLocaleString("vi-VN")} d</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t flex justify-between items-center">
            <span className="text-sm font-medium">Tong cong:</span>
            <span className="text-xl font-bold text-blue-700">
              {totalAmount.toLocaleString("vi-VN")} d
            </span>
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
            {loading ? "Dang gui..." : "Gui yeu cau"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-6 py-2 rounded"
          >
            Huy
          </button>
        </div>
      </form>
    </div>
  );
}