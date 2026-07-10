"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Package,
  ShoppingCart,
  Users,
  FileSignature,
  BarChart3,
  Globe,
  Tag,
  Mail,
  User,
  Lock,
  Settings,
  Shield,
} from "lucide-react";
import { useI18n } from "../i18n-provider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MenuItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
};

type MenuGroup = {
  titleKey: string;
  items: MenuItem[];
};

const menuByRole: Record<string, MenuGroup[]> = {
  EMPLOYEE: [
    {
      titleKey: "nav.main",
      items: [
        { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
        { href: "/requests/new", labelKey: "nav.createRequest", icon: FileText },
        { href: "/requests", labelKey: "nav.requests", icon: FileText },
        { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature },
      ],
    },
    {
      titleKey: "nav.account",
      items: [{ href: "/profile", labelKey: "nav.profile", icon: User }],
    },
  ],
  MANAGER: [
    {
      titleKey: "nav.main",
      items: [
        { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
        { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare },
        { href: "/requests", labelKey: "nav.requests", icon: FileText },
      ],
    },
    {
      titleKey: "nav.account",
      items: [{ href: "/profile", labelKey: "nav.profile", icon: User }],
    },
  ],
  LEAD: [
    {
      titleKey: "nav.main",
      items: [
        { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
        { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare },
        { href: "/requests", labelKey: "nav.requests", icon: FileText },
      ],
    },
    {
      titleKey: "nav.account",
      items: [{ href: "/profile", labelKey: "nav.profile", icon: User }],
    },
  ],
  IT_STAFF: [
    {
      titleKey: "nav.main",
      items: [
        { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
        { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare },
        { href: "/requests", labelKey: "nav.requests", icon: FileText },
      ],
    },
    {
      titleKey: "nav.assetManagement",
      items: [
        { href: "/assets", labelKey: "nav.assets", icon: Package },
        { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature },
      ],
    },
    {
      titleKey: "nav.account",
      items: [{ href: "/profile", labelKey: "nav.profile", icon: User }],
    },
  ],
  PURCHASING: [
    {
      titleKey: "nav.main",
      items: [
        { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
        { href: "/purchase-orders/select-items", labelKey: "po.create", icon: ShoppingCart },
        { href: "/purchase-orders", labelKey: "nav.purchaseOrders", icon: ShoppingCart },
      ],
    },
    {
      titleKey: "nav.account",
      items: [{ href: "/profile", labelKey: "nav.profile", icon: User }],
    },
  ],
  ADMIN: [
    {
      titleKey: "nav.main",
      items: [
        { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
        { href: "/requests", labelKey: "nav.requests", icon: FileText },
        { href: "/assets", labelKey: "nav.assets", icon: Package },
        { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature },
        { href: "/purchase-orders", labelKey: "nav.purchaseOrders", icon: ShoppingCart },
        { href: "/reports", labelKey: "nav.reports", icon: BarChart3 },
      ],
    },
    {
      titleKey: "nav.administration",
      items: [
        { href: "/admin/dashboard", labelKey: "nav.adminDashboard", icon: BarChart3 },
        { href: "/admin/users", labelKey: "nav.users", icon: Users },
        { href: "/admin/groups", labelKey: "nav.userGroups", icon: Shield },
        { href: "/admin/categories", labelKey: "nav.categories", icon: Tag },
        { href: "/admin/suppliers", labelKey: "nav.suppliers", icon: Users },
      ],
    },
    {
      titleKey: "nav.configuration",
      items: [
        { href: "/admin/workflow", labelKey: "nav.workflow", icon: CheckSquare },
        { href: "/admin/password", labelKey: "nav.passwordPolicy", icon: Lock },
        { href: "/admin/email", labelKey: "nav.emailConfig", icon: Mail },
        { href: "/admin/languages", labelKey: "nav.languages", icon: Globe },
      ],
    },
    {
      titleKey: "nav.account",
      items: [{ href: "/profile", labelKey: "nav.profile", icon: User }],
    },
  ],
};

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const groups = menuByRole[role] || menuByRole.EMPLOYEE;

  return (
    <aside key={locale} className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">{t("common.appName", "ITAMS")}</h1>
      </div>

      <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
        {groups.map((group, gIdx) => (
          <div key={gIdx}>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {t(group.titleKey, group.titleKey)}
            </p>
            <div className="space-y-1">
              {group.items.map((item, idx: number) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const label = t(item.labelKey, item.labelKey);
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition " +
                      (isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50")
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t text-xs text-gray-500">ITAMS v1.0.0</div>
    </aside>
  );
}
