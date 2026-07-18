"use client";
import Link from "next/link";
import { Globe, Users, Tags, Building2, BarChart3, CheckSquare, Mail, KeyRound } from "lucide-react";
import { useI18n } from "../i18n-provider";

export function AdminSettings() {
  const { t } = useI18n();

  const items = [
    {
      key: "users",
      href: "/admin/users",
      icon: Users,
      label: t("nav.users", "Users"),
      desc: t("admin.usersDesc", "Manage users and roles"),
    },
    {
      key: "groups",
      href: "/admin/groups",
      icon: Users,
      label: t("nav.userGroups", "User Groups"),
      desc: t("admin.groupsDesc", "Manage user groups"),
    },
    {
      key: "categories",
      href: "/admin/categories",
      icon: Tags,
      label: t("nav.categories", "Categories"),
      desc: t("admin.categoriesDesc", "Manage device categories"),
    },
    {
      key: "suppliers",
      href: "/admin/suppliers",
      icon: Building2,
      label: t("nav.suppliers", "Suppliers"),
      desc: t("admin.suppliersDesc", "Manage suppliers"),
    },
    {
      key: "languages",
      href: "/admin/languages",
      icon: Globe,
      label: t("nav.languages", "Languages"),
      desc: t("admin.languagesDesc", "Manage languages and translations"),
    },
    {
      key: "password",
      href: "/admin/password",
      icon: KeyRound,
      label: t("nav.passwordPolicy", "Password Policy"),
      desc: t("admin.passwordDesc", "Configure password complexity and expiry"),
    },
    {
      key: "email",
      href: "/admin/email",
      icon: Mail,
      label: t("nav.emailConfig", "Email Config"),
      desc: t("admin.emailDesc", "Configure SMTP and email notifications"),
    },
    {
      key: "workflow",
      href: "/admin/workflow",
      icon: CheckSquare,
      label: t("nav.workflow", "Workflow Config"),
      desc: t("admin.workflowDesc", "Configure approval thresholds and exchange rate"),
    },
    {
      key: "reports",
      href: "/reports",
      icon: BarChart3,
      label: t("nav.reports", "Reports"),
      desc: t("admin.reportsDesc", "Reports and analytics"),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.title", "Admin")}</h1>
        <p className="text-gray-500 mt-1">
          {t("admin.subtitle", "System management")}
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
