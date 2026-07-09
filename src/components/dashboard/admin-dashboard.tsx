"use client";

import Link from "next/link";
import { useI18n } from "../i18n-provider";
import { FileText, Clock, CheckCircle2, Package } from "lucide-react";

interface Props {
  stats: {
    total: number;
    pending: number;
    completed: number;
    myAssets: number;
  };
  role: string;
}

export function AdminDashboard({ stats, role }: Props) {
  const { t } = useI18n();

  const roleLabels: Record<string, string> = {
    ADMIN: t("roles.ADMIN", "Administrator"),
    MANAGER: t("roles.MANAGER", "Manager"),
    LEAD: t("roles.LEAD", "Lead"),
    IT_STAFF: t("roles.IT_STAFF", "IT Staff"),
    PURCHASING: t("roles.PURCHASING", "Purchasing"),
    EMPLOYEE: t("roles.EMPLOYEE", "Employee"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t("dashboard.title", "Dashboard")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("dashboard.welcome", "Welcome")}, {role === "ADMIN" ? t("dashboard.systemAdmin", "System Admin") : roleLabels[role]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label={t("dashboard.totalRequests", "Total Requests")}
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label={t("dashboard.pending", "Pending")}
          value={stats.pending}
          color="yellow"
        />
        <StatCard
          icon={CheckCircle2}
          label={t("dashboard.completed", "Completed")}
          value={stats.completed}
          color="green"
        />
        <StatCard
          icon={Package}
          label={
            role === "EMPLOYEE"
              ? t("dashboard.myAssets", "My Assets")
              : t("dashboard.assetInventory", "Asset Inventory")
          }
          value={stats.myAssets}
          color="purple"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4">
          {t("dashboard.quickActions", "Quick Actions")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {role === "EMPLOYEE" && (
            <Link
              href="/requests/new"
              className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 text-center"
            >
              <FileText className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="font-medium text-blue-700">
                {t("dashboard.createRequest", "Create Request")}
              </p>
            </Link>
          )}
          {role === "MANAGER" && (
            <Link
              href="/approvals"
              className="p-4 border-2 border-dashed border-yellow-300 rounded-lg hover:bg-yellow-50 text-center"
            >
              <Clock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
              <p className="font-medium text-yellow-700">
                {t("dashboard.approveRequests", "Approve Requests")}
              </p>
            </Link>
          )}
          {role === "LEAD" && (
            <Link
              href="/approvals"
              className="p-4 border-2 border-dashed border-amber-300 rounded-lg hover:bg-amber-50 text-center"
            >
              <Clock className="w-8 h-8 mx-auto text-amber-600 mb-2" />
              <p className="font-medium text-amber-700">
                {t("dashboard.approveHighValue", "Approve High-Value Requests")}
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div
          className={
            "w-12 h-12 rounded-full flex items-center justify-center " +
            colors[color]
          }
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
