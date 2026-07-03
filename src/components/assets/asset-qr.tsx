"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useI18n } from "../i18n-provider";

export function AssetQR({ asset }: { asset: any }) {
  const router = useRouter();
  const { locale } = useI18n();

  // Su dung API qrserver de tao QR (mien phi, khong can can install them)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(asset.qrCode)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="ml-1">{locale === "vi" ? "Quay lại" : "Back"}</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{locale === "vi" ? "In mã QR" : "Print QR"}</span>
          </button>

          <a
            href={qrUrl}
            download={`${asset.assetTag}-qr.png`}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{locale === "vi" ? "Tải PNG" : "Download"}</span>
          </a>
        </div>
      </div>

      <div className="print-area bg-white p-4 border-2 rounded text-center">
        <div className="mb-3">
          {asset.brand && (
            <p className="text-sm text-gray-600">
              {asset.brand} {asset.model}
            </p>
          )}
          {asset.serialNumber && (
            <p className="text-xs text-gray-500 mt-1">SN: {asset.serialNumber}</p>
          )}
        </div>

        <img src={qrUrl} alt="QR Code" className="w-64 h-64 mx-auto" />

        <p className="text-xs text-gray-400 font-mono break-all mt-2">{asset.qrCode}</p>

        {asset.currentHolder && (
          <p className="text-sm text-gray-600 mt-2">
            {locale === "vi" ? "Người sử dụng" : "Holder"}: {asset.currentHolder.name}
          </p>
        )}

        <div className="text-xs text-gray-400 pt-4 border-t mt-4">
          ITAMS - {locale === "vi" ? "Quản lý Tài sản CNTT" : "IT Asset Management"}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  );
}
