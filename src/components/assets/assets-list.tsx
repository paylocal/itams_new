"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, QrCode, Search } from "lucide-react";
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

export function AssetsList({ assets: initial }: { assets: Asset[] }) {
  const { t } = useI18n();
  const [assets] = useState(initial);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { key: string; fallback: string }> = {
      NEW: { key: "status.NEW", fallback: "New" },
      IN_STOCK: { key: "status.IN_STOCK", fallback: "In Stock" },
      ASSIGNED: { key: "status.ASSIGNED", fallback: "Assigned" },
      IN_MAINTENANCE: { key: "status.IN_MAINTENANCE", fallback: "Maintenance" },
      RECOVERED: { key: "status.RECOVERED", fallback: "Recovered" },
      DISPOSED: { key: "status.DISPOSED", fallback: "Disposed" },
    };
    const label = labels[status];
    return label ? t(label.key, label.fallback) : status;
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, { key: string; fallback: string }> = {
      LAPTOP: { key: "categories.LAPTOP", fallback: "Laptop" },
      DESKTOP: { key: "categories.DESKTOP", fallback: "Desktop" },
      MONITOR: { key: "categories.MONITOR", fallback: "Monitor" },
      PHONE: { key: "categories.PHONE", fallback: "Phone" },
      KEYBOARD: { key: "categories.KEYBOARD", fallback: "Keyboard" },
      MOUSE: { key: "categories.MOUSE", fallback: "Mouse" },
      HEADPHONE: { key: "categories.HEADPHONE", fallback: "Headphone" },
      PRINTER: { key: "categories.PRINTER", fallback: "Printer" },
      OTHER: { key: "categories.OTHER", fallback: "Other" },
    };
    const label = labels[cat];
    return label ? t(label.key, label.fallback) : cat;
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
          <h1 className="text-2xl font-bold">{t("assets.title", "Asset Inventory")}</h1>
          <p className="text-gray-500 mt-1">
            {filteredAssets.length} / {assets.length} {t("assets.count", "assets")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatBox label={t("assets.total", "Total")} value={stats.total} color="blue" />
        <StatBox label={t("assets.inStock", "In Stock")} value={stats.inStock} color="green" />
        <StatBox label={t("assets.assigned", "Assigned")} value={stats.assigned} color="purple" />
        <StatBox label={t("assets.maintenance", "Maintenance")} value={stats.maintenance} color="yellow" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-3 gap-3">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("assets.searchPlaceholder", "Search by tag, name, serial, holder...")}
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
            <option value="ALL">{t("assets.allStatuses", "All status")}</option>
            <option value="NEW">{getStatusLabel("NEW")}</option>
            <option value="IN_STOCK">{getStatusLabel("IN_STOCK")}</option>
            <option value="ASSIGNED">{getStatusLabel("ASSIGNED")}</option>
            <option value="IN_MAINTENANCE">{getStatusLabel("IN_MAINTENANCE")}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t("assets.noAssets", "No assets found")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">{t("assets.tag", "Asset Tag")}</th>
                <th className="text-left p-3">{t("assets.name", "Name")}</th>
                <th className="text-left p-3">{t("assets.category", "Category")}</th>
                <th className="text-left p-3">{t("assets.status", "Status")}</th>
                <th className="text-left p-3">{t("assets.holder", "Holder")}</th>
                <th className="text-left p-3">{t("assets.location", "Location")}</th>
                <th className="text-right p-3">QR</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/assets/${asset.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {asset.assetTag}
                    </Link>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{asset.name}</p>
                    {asset.brand && <p className="text-xs text-gray-500">{asset.brand} {asset.model}</p>}
                    {asset.serialNumber && <p className="text-xs text-gray-400">SN: {asset.serialNumber}</p>}
                  </td>
                  <td className="p-3 text-gray-600">{getCategoryLabel(asset.category)}</td>
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
                        <p className="text-xs text-gray-500">{asset.currentHolder.department}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600 text-xs">{asset.location || "-"}</td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/assets/${asset.id}/qr`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                      title="QR"
                    >
                      <QrCode className="w-3 h-3" /> QR
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
