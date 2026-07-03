"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, QrCode, Eye, Search } from "lucide-react";
import { useI18n } from "../i18n-provider";

interface Asset {
  id: string;
  assetTag: string;
  qrCode: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: string;
  location: string | null;
  currentHolder: { id: string; name: string; department: string | null } | null;
}

const statusColors: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700",
  IN_STOCK: "bg-green-100 text-green-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_MAINTENANCE: "bg-yellow-100 text-yellow-700",
  RECOVERED: "bg-purple-100 text-purple-700",
  DISPOSED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, { vi: string; en: string }> = {
  NEW: { vi: "Moi", en: "New" },
  IN_STOCK: { vi: "Trong kho", en: "In Stock" },
  ASSIGNED: { vi: "Da cap phat", en: "Assigned" },
  IN_MAINTENANCE: { vi: "Bao tri", en: "In Maintenance" },
  RECOVERED: { vi: "Da thu hoi", en: "Recovered" },
  DISPOSED: { vi: "Da thanh ly", en: "Disposed" },
};

const categoryLabels: Record<string, { vi: string; en: string }> = {
  LAPTOP: { vi: "Laptop", en: "Laptop" },
  DESKTOP: { vi: "May ban", en: "Desktop" },
  MONITOR: { vi: "Man hinh", en: "Monitor" },
  PHONE: { vi: "Dien thoai", en: "Phone" },
  KEYBOARD: { vi: "Ban phim", en: "Keyboard" },
  MOUSE: { vi: "Chuot", en: "Mouse" },
  HEADPHONE: { vi: "Tai nghe", en: "Headphone" },
  PRINTER: { vi: "May in", en: "Printer" },
  OTHER: { vi: "Khac", en: "Other" },
};

export function AssetsList({ assets: initial }: { assets: Asset[] }) {
  const { locale, t } = useI18n();
  const [assets] = useState(initial);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const getStatusLabel = (status: string) => {
    const labels = statusLabels[status];
    if (!labels) return status;
    return locale === "vi" ? labels.vi : labels.en;
  };

  const getCategoryLabel = (cat: string) => {
    const labels = categoryLabels[cat];
    if (!labels) return cat;
    return locale === "vi" ? labels.vi : labels.en;
  };

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      searchTerm === "" ||
      a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.serialNumber &&
        a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.currentHolder &&
        a.currentHolder.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Thong ke
  const stats = {
    total: assets.length,
    inStock: assets.filter((a) => a.status === "IN_STOCK").length,
    assigned: assets.filter((a) => a.status === "ASSIGNED").length,
    maintenance: assets.filter((a) => a.status === "IN_MAINTENANCE").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {locale === "vi" ? "Kho Tài sản" : "Asset Inventory"}
          </h1>
          <p className="text-gray-500 mt-1">{filteredAssets.length} / {assets.length} {locale === "vi" ? "tài sản" : "assets"}</p>
        </div>
      </div>

      {/* Thong ke */}
      <div className="grid grid-cols-4 gap-3">
        <StatBox
          label={locale === "vi" ? "Tổng cộng" : "Total"}
          value={stats.total}
          color="blue"
        />
        <StatBox
          label={locale === "vi" ? "Trong kho" : "In Stock"}
          value={stats.inStock}
          color="green"
        />
        <StatBox
          label={locale === "vi" ? "Đã cấp phát" : "Assigned"}
          value={stats.assigned}
          color="purple"
        />
        <StatBox
          label={locale === "vi" ? "Bảo trì" : "Maintenance"}
          value={stats.maintenance}
          color="yellow"
        />
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-3 gap-3">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={locale === "vi" ? "Tìm theo mã, tên, serial, người sử dụng..." : "Search by tag, name, serial, holder..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="ALL">{locale === "vi" ? "Tất cả trạng thái" : "All status"}</option>
            <option value="NEW">{locale === "vi" ? "Mới" : "New"}</option>
            <option value="IN_STOCK">{locale === "vi" ? "Trong kho" : "In Stock"}</option>
            <option value="ASSIGNED">{locale === "vi" ? "Đã cấp phát" : "Assigned"}</option>
            <option value="IN_MAINTENANCE">{locale === "vi" ? "Bảo trì" : "Maintenance"}</option>
          </select>
        </div>
      </div>

      {/* Bang tai san */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{locale === "vi" ? "Không có tài sản" : "No assets found"}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">{locale === "vi" ? "Mã TS" : "Asset Tag"}</th>
                <th className="text-left p-3">{locale === "vi" ? "Tên" : "Name"}</th>
                <th className="text-left p-3">{locale === "vi" ? "Danh mục" : "Category"}</th>
                <th className="text-left p-3">{locale === "vi" ? "Trạng thái" : "Status"}</th>
                <th className="text-left p-3">{locale === "vi" ? "Người sử dụng" : "Holder"}</th>
                <th className="text-left p-3">{locale === "vi" ? "Vị trí" : "Location"}</th>
                <th className="text-right p-3">QR</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {asset.assetTag}
                    </Link>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{asset.name}</p>
                    {asset.brand && (
                      <p className="text-xs text-gray-500">
                        {asset.brand} {asset.model}
                      </p>
                    )}
                    {asset.serialNumber && (
                      <p className="text-xs text-gray-400">SN: {asset.serialNumber}</p>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">
                    {getCategoryLabel(asset.category)}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        "inline-block px-2 py-1 rounded text-xs " +
                        (statusColors[asset.status] || "bg-gray-100 text-gray-700")
                      }
                    >
                      {getStatusLabel(asset.status)}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {asset.currentHolder ? (
                      <div>
                        <p className="text-sm">{asset.currentHolder.name}</p>
                        <p className="text-xs text-gray-500">
                          {asset.currentHolder.department}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600 text-xs">
                    {asset.location || "-"}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/assets/${asset.id}/qr`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                      title="Xem QR"
                    >
                      <QrCode className="w-3 h-3" />
                      QR
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };
  return (
    <div className={"p-3 rounded-lg " + (colors[color] || "bg-gray-50")}>
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
