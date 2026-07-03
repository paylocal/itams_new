"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useI18n } from "../i18n-provider";
import { FileText, Package, ShoppingCart, CheckCircle2 } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const statusLabels: Record<string, { vi: string; en: string }> = {
  DRAFT: { vi: "Nhap", en: "Draft" },
  PENDING_MANAGER: { vi: "Cho QL", en: "Pending Mgr" },
  PENDING_IT: { vi: "Cho IT", en: "Pending IT" },
  ORDERED: { vi: "Dat hang", en: "Ordered" },
  COMPLETED: { vi: "Hoan thanh", en: "Completed" },
  REJECTED: { vi: "Tu choi", en: "Rejected" },
};

const assetStatusLabels: Record<string, { vi: string; en: string }> = {
  NEW: { vi: "Moi", en: "New" },
  IN_STOCK: { vi: "Trong kho", en: "In Stock" },
  ASSIGNED: { vi: "Cap phat", en: "Assigned" },
  IN_MAINTENANCE: { vi: "Bao tri", en: "Maintenance" },
  RECOVERED: { vi: "Thu hoi", en: "Recovered" },
  DISPOSED: { vi: "Thanh ly", en: "Disposed" },
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

interface Props {
  stats: {
    totalRequests: number;
    completedRequests: number;
    totalAssets: number;
    assignedAssets: number;
    totalPOs: number;
    totalSpent: number;
  };
  statusGroups: { status: string; _count: number }[];
  deptData: { name: string; value: number }[];
  assetsByStatus: { status: string; _count: number }[];
  monthlyData: { month: string; count: number }[];
  costData: { month: string; amount: number }[];
  assetsByCategory: { category: string; _count: number }[];
}

const formatVND = (n: number) => {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n.toString();
};

export function ReportsDashboard(props: Props) {
  const { locale, t } = useI18n();
  const {
    stats, statusGroups, deptData, assetsByStatus,
    monthlyData, costData, assetsByCategory,
  } = props;

  const getStatusName = (s: string) => {
    const labels = statusLabels[s] || assetStatusLabels[s];
    if (!labels) return s;
    return locale === "vi" ? labels.vi : labels.en;
  };

  const getCategoryName = (c: string) => {
    const labels = categoryLabels[c];
    if (!labels) return c;
    return locale === "vi" ? labels.vi : labels.en;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {locale === "vi" ? "Báo cáo & Thống kê" : "Reports & Analytics"}
        </h1>
        <p className="text-gray-500 mt-1">
          {locale === "vi" ? "Tổng quan hệ thống" : "System overview"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={FileText}
          label={locale === "vi" ? "Tổng yêu cầu" : "Total Requests"}
          value={stats.totalRequests}
          sub={locale === "vi" ? `${stats.completedRequests} hoan thanh` : `${stats.completedRequests} done`}
          color="blue"
        />
        <KpiCard
          icon={Package}
          label={locale === "vi" ? "Tổng tài sản" : "Total Assets"}
          value={stats.totalAssets}
          sub={locale === "vi" ? `${stats.assignedAssets} dang dung` : `${stats.assignedAssets} in use`}
          color="green"
        />
        <KpiCard
          icon={ShoppingCart}
          label={locale === "vi" ? "Tổng PO" : "Total POs"}
          value={stats.totalPOs}
          color="purple"
        />
        <KpiCard
          icon={CheckCircle2}
          label={locale === "vi" ? "Tổng chi phí" : "Total Spent"}
          value={formatVND(stats.totalSpent) + " d"}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bieu do tron: trang thai yeu cau */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">
            {locale === "vi" ? "Yêu cầu theo trạng thái" : "Requests by Status"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusGroups.map((s) => ({
                  name: getStatusName(s.status),
                  value: s._count,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {statusGroups.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bieu do tron: tai san theo trang thai */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">
            {locale === "vi" ? "Tài sản theo trạng thái" : "Assets by Status"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={assetsByStatus.map((s) => ({
                  name: getStatusName(s.status),
                  value: s._count,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {assetsByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bieu do cot: nguoi dung theo phong ban */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">
            {locale === "vi" ? "Người dùng theo phòng ban" : "Users by Department"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bieu do cot: tai san theo danh muc */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">
            {locale === "vi" ? "Tài sản theo danh mục" : "Assets by Category"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={assetsByCategory.map((c) => ({
              name: getCategoryName(c.category),
              value: c._count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bieu do duong: yeu cau theo thang */}
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="font-bold mb-3">
            {locale === "vi" ? "Yêu cầu 6 tháng gần đây" : "Requests Last 6 Months"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name={locale === "vi" ? "Số yêu cầu" : "Requests"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bieu do cot: chi phi theo thang */}
        {costData.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
            <h3 className="font-bold mb-3">
              {locale === "vi" ? "Chi phí mua sắm 6 tháng" : "Spending Last 6 Months"}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costData.map((c) => ({
                month: c.month,
                amount: c.amount / 1000000,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => typeof value === "number" ? value.toFixed(1) + "M d" : ""} />
                <Bar dataKey="amount" fill="#f59e0b" name={locale === "vi" ? "Triệu đồng" : "Million VND"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={"w-10 h-10 rounded-full flex items-center justify-center " + (colors[color] || "bg-gray-100")}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
