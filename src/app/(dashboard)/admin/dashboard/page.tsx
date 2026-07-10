"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { Globe, Tag, Building2, FileText, Users, BarChart3, Package, Lock, Mail, CheckSquare } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { t } = useI18n();
  const [stats, setStats] = useState({
    requests: 0,
    assets: 0,
    pos: 0,
    users: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const cards = [
    {
      key: "requests",
      title: t("admin.requestsCard", "Requests"),
      value: stats.requests,
      href: "/requests",
      icon: FileText,
      color: "blue",
    },
    {
      key: "pending",
      title: t("admin.pendingCard", "Pending"),
      value: stats.pending,
      href: "/requests?status=PENDING",
      icon: FileText,
      color: "yellow",
    },
    {
      key: "completed",
      title: t("admin.completedCard", "Completed"),
      value: stats.completed,
      href: "/requests?status=COMPLETED",
      icon: FileText,
      color: "green",
    },
    {
      key: "assets",
      title: t("admin.assetsCard", "Assets"),
      value: stats.assets,
      href: "/assets",
      icon: Package,
      color: "purple",
    },
    {
      key: "users",
      title: t("nav.users", "Users"),
      value: stats.users,
      href: "/admin/users",
      icon: Users,
      color: "indigo",
    },
  ];

  const settings = [
    { href: "/admin/users", icon: Users, label: t("nav.users", "Users") },
    { href: "/admin/groups", icon: Users, label: t("nav.userGroups", "User Groups") },
    { href: "/admin/categories", icon: Tag, label: t("nav.categories", "Categories") },
    { href: "/admin/suppliers", icon: Building2, label: t("nav.suppliers", "Suppliers") },
    { href: "/admin/workflow", icon: CheckSquare, label: t("nav.workflow", "Workflow") },
    { href: "/admin/password", icon: Lock, label: t("nav.passwordPolicy", "Password") },
    { href: "/admin/email", icon: Mail, label: t("nav.emailConfig", "Email") },
    { href: "/admin/languages", icon: Globe, label: t("nav.languages", "Languages") },
  ];

  const reports = [
    { href: "/requests", icon: FileText, label: t("nav.requests", "All requests") },
    { href: "/assets", icon: Package, label: t("nav.assets", "Assets") },
    { href: "/purchase-orders", icon: BarChart3, label: t("nav.purchaseOrders", "Purchase orders") },
    { href: "/reports", icon: BarChart3, label: t("nav.reports", "Reports") },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.dashboardTitle", "Admin Dashboard")}</h1>
        <p className="text-gray-500 mt-1">{t("admin.dashboardSubtitle", "System overview")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.key}
              href={card.href}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${card.color}-100 text-${card.color}-700`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-2">{t("admin.systemSettings", "System settings")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {settings.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.href}
                  href={s.href}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-2">{t("admin.viewReports", "View reports")}</h2>
          <div className="space-y-2">
            {reports.map((r) => {
              const Icon = r.icon;
              return (
                <a
                  key={r.href}
                  href={r.href}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                >
                  <Icon className="w-4 h-4" />
                  {r.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
