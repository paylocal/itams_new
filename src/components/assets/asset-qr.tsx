"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useI18n } from "../i18n-provider";

export function AssetQR({ asset }: { asset: any }) {
  const router = useRouter();
  const { t } = useI18n();

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(asset.qrCode)}`;

  const handlePrint = () => {
    window.print();
  };

  const lastHandover = asset.handoverItems?.[0]?.handover;

  const infoRows = [
    { label: t("asset.tag", "Asset Tag"), value: asset.assetTag },
    { label: t("asset.name", "Name"), value: asset.name },
    { label: t("asset.category", "Category"), value: asset.category },
    asset.brand && { label: t("asset.brand", "Brand"), value: asset.brand },
    asset.model && { label: t("asset.model", "Model"), value: asset.model },
    asset.serialNumber && { label: t("asset.serial", "Serial"), value: asset.serialNumber },
    asset.receivedDate && {
      label: t("asset.receivedDate", "Received date"),
      value: new Date(asset.receivedDate).toLocaleDateString(),
    },
    asset.currentHolder && {
      label: t("asset.holder", "Holder"),
      value: `${asset.currentHolder.name}${asset.currentHolder.department ? ` (${asset.currentHolder.department})` : ""}`,
    },
    asset.request && {
      label: t("asset.request", "Request"),
      value: asset.request.requestNumber,
    },
    asset.request?.requester && {
      label: t("asset.requester", "Requester"),
      value: asset.request.requester.name,
    },
    asset.purchaseOrder && {
      label: t("asset.purchaseOrder", "PO"),
      value: asset.purchaseOrder.poNumber,
    },
    lastHandover && {
      label: t("asset.handover", "Handover"),
      value: lastHandover.handoverNumber,
    },
    lastHandover?.handoverDate && {
      label: t("asset.handoverDate", "Handover date"),
      value: new Date(lastHandover.handoverDate).toLocaleDateString(),
    },
    { label: t("asset.status", "Status"), value: asset.status },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="ml-1">{t("common.back", "Back")}</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{t("asset.printQR", "Print QR")}</span>
          </button>

          <a
            href={qrUrl}
            download={`${asset.assetTag}-qr.png`}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{t("common.download", "Download")}</span>
          </a>
        </div>
      </div>

      <div className="print-area bg-white p-6 border-2 rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">{asset.assetTag}</h2>
          <p className="text-sm text-gray-500">{asset.name}</p>
        </div>

        <div className="flex justify-center mb-4">
          <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
        </div>

        <div className="space-y-2 text-sm">
          {infoRows.map((row, i) => (
            <div key={i} className="flex justify-between border-b pb-1 last:border-0">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-400 text-center pt-4 border-t mt-4">
          Quản lý yêu cầu và tài sản - {t("common.appSubtitle", "IT Asset Management")}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
