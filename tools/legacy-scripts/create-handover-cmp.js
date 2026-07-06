const fs = require("fs");
const path = require("path");

const code = `"use client";

import Link from "next/link";
import { FileSignature, Plus, Calendar } from "lucide-react";
import { useI18n } from "../i18n-provider";

const statusMap: Record<string, { vi: string; en: string; color: string }> = {
  PENDING_EMPLOYEE_SIGN: {
    vi: "Cho NV ky",
    en: "Pending Employee",
    color: "bg-yellow-100 text-yellow-700",
  },
  PENDING_IT_SIGN: {
    vi: "Cho IT ky",
    en: "Pending IT",
    color: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    vi: "Hoan thanh",
    en: "Completed",
    color: "bg-green-100 text-green-700",
  },
};

export function HandoverList({ handovers, userRole }: { handovers: any[]; userRole: string }) {
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
        <h1 className="text-2xl font-bold">
          {locale === "vi" ? "Bien ban Ban giao" : "Handovers"}
        </h1>
        <p className="text-gray-500 mt-1">
          {handovers.length} {locale === "vi" ? "ban giao" : "handovers"}
        </p>
      </div>

      {handovers.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{locale === "vi" ? "Chua co ban giao nao" : "No handovers yet"}</p>
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
                    <p className="font-mono text-xs text-gray-500">
                      {h.handoverNumber}
                    </p>
                    <p className="font-medium mt-1">{h.employee.name}</p>
                    <p className="text-xs text-gray-500">
                      {h.employee.department}
                    </p>
                  </div>
                  <span
                    className={\`text-xs px-2 py-1 rounded \${status.color}\`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mt-3">
                  <p>📦 {h.items.length} {locale === "vi" ? "thiet bi" : "items"}</p>
                  <p>📅 {new Date(h.handoverDate).toLocaleDateString()}</p>
                  <p>👤 IT: {h.itStaff.name}</p>
                </div>

                <Link
                  href={\`/handovers/\${h.id}\`}
                  className={
                    "mt-4 block text-center py-2 rounded text-sm " +
                    (canSign
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                  }
                >
                  {canSign
                    ? locale === "vi"
                      ? "Ky ngay"
                      : "Sign Now"
                    : h.status === "COMPLETED"
                    ? locale === "vi"
                      ? "Xem"
                      : "View"
                    : locale === "vi"
                    ? "Xem"
                    : "View"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
`;

const dir = path.join(__dirname, "src", "components", "handover");
const file = path.join(dir, "handover-list.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);