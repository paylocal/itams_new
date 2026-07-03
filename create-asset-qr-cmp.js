const fs = require("fs");
const path = require("path");

const code = `"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useI18n } from "../i18n-provider";

export function AssetQR({ asset }: { asset: any }) {
  const router = useRouter();
  const { locale } = useI18n();

  // Su dung API qrserver de tao QR (mien phi, khong can can install them)
  const qrUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=\${encodeURIComponent(asset.qrCode)}\`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:underline flex items-center gap-1 mb-4 print:hidden"
      >
        <ArrowLeft className="w-4 h-4" /> {locale === "vi" ? "Quay lai" : "Back"}
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-dashed print:shadow-none print:border-solid print:border-gray-300">
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-2xl font-bold font-mono">{asset.assetTag}</h2>
            <p className="text-lg mt-2">{asset.name}</p>
            {asset.brand && (
              <p className="text-sm text-gray-600">
                {asset.brand} {asset.model}
              </p>
            )}
            {asset.serialNumber && (
              <p className="text-xs text-gray-500 mt-1">SN: {asset.serialNumber}</p>
            )}
          </div>

          <div className="inline-block bg-white p-4 border-2 rounded">
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-64 h-64 mx-auto"
            />
          </div>

          <p className="text-xs text-gray-400 font-mono break-all">
            {asset.qrCode}
          </p>

          {asset.currentHolder && (
            <p className="text-sm text-gray-600">
              {locale === "vi" ? "Nguoi su dung" : "Holder"}: {asset.currentHolder.name}
            </p>
          )}

          <div className="text-xs text-gray-400 pt-4 border-t">
            ITAMS - {locale === "vi" ? "Quan ly Tai san CNTT" : "IT Asset Management"}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          {locale === "vi" ? "In ma QR" : "Print QR"}
        </button>
        <a
          href={qrUrl}
          download={\`\${asset.assetTag}-qr.png\`}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {locale === "vi" ? "Tai PNG" : "Download"}
        </a>
      </div>

      <style>{\`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; }
        }
      \`}</style>
    </div>
  );
}
`;

const file = path.join(__dirname, "src", "components", "assets", "asset-qr.tsx");
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);