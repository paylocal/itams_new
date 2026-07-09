"use client";

import Link from "next/link";
import { FileSignature } from "lucide-react";
import { useI18n } from "../i18n-provider";

type HandoverListItem = {
  id: string;
  handoverNumber: string;
  status: string;
  handoverDate: Date | string;
  employeeId: string;
  employee: { name: string; department?: string | null };
  itStaff: { name: string };
  items: Array<unknown>;
};

const statusMap: Record<string, { vi: string; en: string; color: string }> = {
  PENDING_EMPLOYEE_SIGN: {
    vi: "Chờ NV ký",
    en: "Pending Employee",
    color: "bg-yellow-100 text-yellow-700",
  },
  PENDING_IT_SIGN: {
    vi: "Chờ IT ký",
    en: "Pending IT",
    color: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    vi: "Hoàn thành",
    en: "Completed",
    color: "bg-green-100 text-green-700",
  },
};

export function HandoverList({
  handovers,
  userRole,
}: {
  handovers: HandoverListItem[];
  userRole: string;
}) {
  const { locale, t } = useI18n();

  const getStatus = (status: string) => {
    const s = statusMap[status];
    if (!s) return { label: status, color: "bg-gray-100" };
    return {
      label: locale === "vi" ? s.vi : s.en,
      color: s.color,
    };
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("handover.title", "Handovers")}</h1>
        <p className="text-gray-500 mt-1">
          {handovers.length} {t("handover.count", "handovers")}
        </p>
      </div>

      {handovers.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t("handover.empty", "No handovers yet")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {handovers.map((h) => {
            const status = getStatus(h.status);
            const canSign =
              (h.status === "PENDING_EMPLOYEE_SIGN" &&
                h.employeeId === userRole) ||
              (h.status === "PENDING_IT_SIGN" && userRole === "IT_STAFF");
            return (
              <div
                key={h.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-mono text-xs text-gray-500">{h.handoverNumber}</p>
                    <p className="font-medium mt-1">{h.employee.name}</p>
                    <p className="text-xs text-gray-500">{h.employee.department}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${status.color}`}>{status.label}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mt-3">
                  <p>📦 {h.items.length} {t("common.items", "items")}</p>
                  <p>📅 {new Date(h.handoverDate).toLocaleDateString()}</p>
                  <p>👤 IT: {h.itStaff.name}</p>
                </div>

                <Link
                  href={`/handovers/${h.id}`}
                  className={
                    "mt-4 block text-center py-2 rounded text-sm " +
                    (canSign
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                  }
                >
                  {canSign
                    ? t("handover.signNow", "Sign Now")
                    : t("common.view", "View")}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
