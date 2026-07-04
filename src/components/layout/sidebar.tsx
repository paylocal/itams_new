"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, CheckSquare, Package, ShoppingCart, Users, FileSignature, BarChart3, Globe, Tag,
} from "lucide-react";
import { useI18n } from "../i18n-provider";

export const dynamic = "force-dynamic";
export const revalidate = 0;
type MenuItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menuByRole: Record<string, MenuItem[]> = {
  EMPLOYEE: [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/requests", labelKey: "nav.requests", icon: FileText },
    { href: "/requests/new", labelKey: "nav.createRequest", icon: FileText },
    { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature },
  ],
  MANAGER: [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare },
    { href: "/requests", labelKey: "nav.requests", icon: FileText },
  ],
  IT_STAFF: [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare },
    { href: "/requests", labelKey: "nav.requests", icon: FileText },
    { href: "/assets", labelKey: "nav.assets", icon: Package },
    { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature },
  ],
  PURCHASING: [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/purchase-orders/select-items", labelKey: "po.create", icon: ShoppingCart },
    { href: "/purchase-orders", labelKey: "nav.purchaseOrders", icon: ShoppingCart },
  ],
  ADMIN: [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/admin/languages", labelKey: "nav.languages", icon: Globe },
    { href: "/admin/users", labelKey: "nav.users", icon: Users },
    { href: "/admin/categories", labelKey: "nav.categories", icon: Tag },
    { href: "/admin/suppliers", labelKey: "nav.suppliers", icon: Users },
    { href: "/requests", labelKey: "nav.requests", icon: FileText },
    { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare },
    { href: "/assets", labelKey: "nav.assets", icon: Package },
    { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature },
    { href: "/purchase-orders", labelKey: "nav.purchaseOrders", icon: ShoppingCart },
    { href: "/reports", labelKey: "nav.reports", icon: BarChart3 },
  ],
};

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const menu = menuByRole[role] || menuByRole.EMPLOYEE;

  return (
    <aside key={locale} className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">ITAMS</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item, idx: number) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const label = t(item.labelKey);
          return (
            <Link
              key={idx}
              href={item.href}
              className={
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition " +
                (isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50")
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t text-xs text-gray-500">v1.0.0</div>
    </aside>
  );
}
