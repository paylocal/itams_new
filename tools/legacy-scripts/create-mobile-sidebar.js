const fs = require("fs");
const path = require("path");

const code = `"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, CheckSquare, Package, ShoppingCart, Users, FileSignature, BarChart3, Menu, X,
} from "lucide-react";
import { useI18n } from "../i18n-provider";

const menuByRole: any = {
  EMPLOYEE: [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/requests", labelKey: "nav.requests", icon: FileText },
    { href: "/requests/new", labelKey: "nav.createRequest", icon: FileText },
    { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature, fallback: "Ban giao" },
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
    { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature, fallback: "Ban giao" },
  ],
  PURCHASING: [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/purchase-orders/select-items", labelKey: "po.create", icon: ShoppingCart, fallback: "Tao PO" },
    { href: "/purchase-orders", labelKey: "nav.purchaseOrders", icon: ShoppingCart },
  ],
  ADMIN: [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: "/requests", labelKey: "nav.requests", icon: FileText },
    { href: "/approvals", labelKey: "nav.approvals", icon: CheckSquare },
    { href: "/assets", labelKey: "nav.assets", icon: Package },
    { href: "/purchase-orders", labelKey: "nav.purchaseOrders", icon: ShoppingCart },
    { href: "/admin/categories", labelKey: "nav.categories", icon: Package },
    { href: "/admin/suppliers", labelKey: "nav.suppliers", icon: Users },
    { href: "/admin/users", labelKey: "nav.users", icon: Users },
    { href: "/handovers", labelKey: "nav.handovers", icon: FileSignature, fallback: "Ban giao" },
    { href: "/reports", labelKey: "nav.reports", icon: BarChart3, fallback: "Bao cao" },
  ],
};

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menu = menuByRole[role] || menuByRole.EMPLOYEE;

  const SidebarContent = (
    <>
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">ITAMS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item: any, idx: number) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          let label = t(item.labelKey);
          if (label === item.labelKey && item.fallback) label = item.fallback;
          return (
            <Link
              key={idx}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition " +
                (isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t text-xs text-gray-500 dark:text-gray-400">v1.0.0</div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-64 bg-white dark:bg-gray-800 h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 min-h-screen flex-col">
        {SidebarContent}
      </aside>
    </>
  );
}
`;

const file = path.join(__dirname, "src", "components", "layout", "sidebar.tsx");
fs.writeFileSync(file, code);
console.log("Updated sidebar with mobile support");