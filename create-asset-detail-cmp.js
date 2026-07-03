const fs = require("fs");
const path = require("path");

const code = `"use client";

import Link from "next/link";
import { ArrowLeft, QrCode, User, MapPin, Calendar, Package } from "lucide-react";
import { useI18n } from "../i18n-provider";

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
  IN_MAINTENANCE: { vi: "Bao tri", en: "Maintenance" },
  RECOVERED: { vi: "Da thu hoi", en: "Recovered" },
  DISPOSED: { vi: "Da thanh ly", en: "Disposed" },
};

export function AssetDetail({ asset }: { asset: any }) {
  const { locale } = useI18n();

  const getStatusLabel = (status: string) => {
    const labels = statusLabels[status];
    if (!labels) return status;
    return locale === "vi" ? labels.vi : labels.en;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link href="/assets" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> {locale === "vi" ? "Quay lai" : "Back"}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{asset.name}</h1>
          <p className="text-gray-500 font-mono text-sm mt-1">{asset.assetTag}</p>
        </div>
        <span
          className={
            "px-3 py-1 rounded text-sm " +
            (statusColors[asset.status] || "bg-gray-100 text-gray-700")
          }
        >
          {getStatusLabel(asset.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow space-y-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            {locale === "vi" ? "Thong tin" : "Information"}
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label={locale === "vi" ? "Hang" : "Brand"} value={asset.brand || "-"} />
            <Row label={locale === "vi" ? "Model" : "Model"} value={asset.model || "-"} />
            <Row label={locale === "vi" ? "Serial" : "Serial"} value={asset.serialNumber || "-"} />
            <Row label={locale === "vi" ? "Vi tri" : "Location"} value={asset.location || "-"} />
            <Row
              label={locale === "vi" ? "Ngay mua" : "Purchase Date"}
              value={asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "-"}
            />
            <Row
              label={locale === "vi" ? "Bao hanh den" : "Warranty Until"}
              value={asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "-"}
            />
          </dl>

          <h2 className="font-bold text-lg flex items-center gap-2 pt-4 border-t">
            <User className="w-5 h-5" />
            {locale === "vi" ? "Nguoi su dung" : "Current Holder"}
          </h2>
          {asset.currentHolder ? (
            <div className="p-3 bg-blue-50 rounded">
              <p className="font-medium">{asset.currentHolder.name}</p>
              <p className="text-sm text-gray-600">{asset.currentHolder.department}</p>
              <p className="text-xs text-gray-500">{asset.currentHolder.email}</p>
              {asset.assignedDate && (
                <p className="text-xs text-gray-500 mt-1">
                  {locale === "vi" ? "Cap phat tu" : "Assigned from"}: {new Date(asset.assignedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {locale === "vi" ? "Chua cap phat cho ai" : "Not assigned"}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="font-bold mb-3 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              {locale === "vi" ? "Ma QR" : "QR Code"}
            </h3>
            <div className="bg-white border-2 border-dashed rounded p-4 inline-block">
              <img
                src={\`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(asset.qrCode)}\`}
                alt="QR"
                className="w-48 h-48"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 font-mono">{asset.qrCode}</p>
            <button
              onClick={() => window.print()}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm w-full"
            >
              {locale === "vi" ? "In ma QR" : "Print QR"}
            </button>
          </div>
        </div>
      </div>

      {/* Lich su */}
      {asset.assetHistory && asset.assetHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-3">
            {locale === "vi" ? "Lich su" : "History"}
          </h2>
          <div className="space-y-2">
            {asset.assetHistory.map((h: any) => (
              <div key={h.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{h.action}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(h.createdAt).toLocaleString()}
                  </span>
                </div>
                {h.notes && <p className="text-xs text-gray-600 mt-1">{h.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="col-span-2 font-medium">{value}</dd>
    </div>
  );
}
`;

const file = path.join(__dirname, "src", "components", "assets", "asset-detail.tsx");
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);