"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { Globe, Tag, Building2, FileText, Users, BarChart3, Package } from "lucide-react";

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
      title: t("nav.requests") || "Yeu cau",
      value: stats.requests,
      href: "/requests",
      icon: FileText,
      color: "blue",
    },
    {
      key: "pending",
      title: "Cho duyet",
      value: stats.pending,
      href: "/requests?status=PENDING",
      icon: FileText,
      color: "yellow",
    },
    {
      key: "completed",
      title: "Hoan thanh",
      value: stats.completed,
      href: "/requests?status=COMPLETED",
      icon: FileText,
      color: "green",
    },
    {
      key: "assets",
      title: t("nav.assets") || "Kho tai san",
      value: stats.assets,
      href: "/assets",
      icon: Package,
      color: "purple",
    },
    {
      key: "users",
      title: t("nav.users") || "Nguoi dung",
      value: stats.users,
      href: "/admin/users",
      icon: Users,
      color: "indigo",
    },
    {
      key: "categories",
      title: t("nav.categories") || "Danh muc",
      value: "-",
      href: "/admin/categories",
      icon: Tag,
      color: "pink",
    },
    {
      key: "suppliers",
      title: t("nav.suppliers") || "Nha cung cap",
      value: "-",
      href: "/admin/suppliers",
      icon: Building2,
      color: "cyan",
    },
    {
      key: "languages",
      title: t("nav.languages") || "Ngon ngu",
      value: "-",
      href: "/admin/languages",
      icon: Globe,
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Tong quan he thong
        </p>
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
          <h2 className="font-bold mb-2">Cai dat he thong</h2>
          <div className="space-y-2">
            <a
              href="/admin/languages"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <Globe className="w-4 h-4" />
              Quan ly ngon ngu
            </a>
            <a
              href="/admin/categories"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <Tag className="w-4 h-4" />
              Quan ly danh muc
            </a>
            <a
              href="/admin/suppliers"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <Building2 className="w-4 h-4" />
              Quan ly nha cung cap
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <Users className="w-4 h-4" />
              Quan ly nguoi dung
            </a>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-2">Xem bao cao</h2>
          <div className="space-y-2">
            <a
              href="/requests"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <FileText className="w-4 h-4" />
              Tat ca yeu cau
            </a>
            <a
              href="/assets"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <Package className="w-4 h-4" />
              Kho tai san
            </a>
            <a
              href="/reports"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <BarChart3 className="w-4 h-4" />
              Bao cao & thong ke
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
