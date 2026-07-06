"use client";
import Link from "next/link";
import { Globe, Users, Tags, Building2, BarChart3, CheckSquare } from "lucide-react";
import { useI18n } from "../i18n-provider";

export function AdminSettings() {
  const { t } = useI18n();

  const items = [
    {
      key: "users",
      href: "/admin/users",
      icon: Users,
      label: t("nav.users"),
      desc: "Quan ly nguoi dung, phan quyen",
    },
    {
      key: "groups",
      href: "/admin/groups",
      icon: Users,
      label: t("nav.userGroups"),
      desc: "Quan ly nhom user: nhom 1, nhom manager, nhom leader...",
    },
    {
      key: "categories",
      href: "/admin/categories",
      icon: Tags,
      label: t("nav.categories"),
      desc: "Quan ly danh muc thiet bi",
    },
    {
      key: "suppliers",
      href: "/admin/suppliers",
      icon: Building2,
      label: t("nav.suppliers"),
      desc: "Quan ly nha cung cap",
    },
    {
      key: "languages",
      href: "/admin/languages",
      icon: Globe,
      label: t("nav.languages"),
      desc: "Quan ly ngon ngu va ban dich",
    },
    {
      key: "workflow",
      href: "/admin/workflow",
      icon: CheckSquare,
      label: "Workflow Config",
      desc: "Cau hinh nguong duyet Lead theo gia tri don",
    },
    {
      key: "reports",
      href: "/reports",
      icon: BarChart3,
      label: t("nav.reports"),
      desc: "Bao cao va thong ke",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-gray-500 mt-1">
          Quan ly he thong - Admin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition border"
            >
              <Icon className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-lg">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
