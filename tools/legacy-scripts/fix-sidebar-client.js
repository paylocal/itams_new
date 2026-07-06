const fs = require("fs");
const path = require("path");

const code = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, CheckSquare, Package, ShoppingCart, Users,
} from "lucide-react";
import { useClientI18n } from "../i18n-provider";

const menuByRole: any = {
  EMPLOYEE: [
    { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/requests", key: "nav.requests", icon: FileText },
    { href: "/requests/new", key: "nav.createRequest", icon: FileText },
  ],
  MANAGER: [
    { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/approvals", key: "nav.approvals", icon: CheckSquare },
    { href: "/requests", key: "nav.requests", icon: FileText },
  ],
  IT_STAFF: [
    { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/approvals", key: "nav.approvals", icon: CheckSquare },
    { href: "/requests", key: "nav.requests", icon: FileText },
    { href: "/assets", key: "nav.assets", icon: Package },
  ],
  PURCHASING: [
    { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/purchase-orders/select-items", key: "po.create", icon: ShoppingCart },
    { href: "/purchase-orders", key: "nav.purchaseOrders", icon: ShoppingCart },
  ],
  ADMIN: [
    { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/requests", key: "nav.requests", icon: FileText },
    { href: "/approvals", key: "nav.approvals", icon: CheckSquare },
    { href: "/assets", key: "nav.assets", icon: Package },
    { href: "/purchase-orders", key: "nav.purchaseOrders", icon: ShoppingCart },
    { href: "/admin/categories", key: "nav.categories", icon: Package },
    { href: "/admin/suppliers", key: "nav.suppliers", icon: Users },
    { href: "/admin/users", key: "nav.users", icon: Users },
  ],
};

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { t, mounted } = useClientI18n();
  const menu = menuByRole[role] || menuByRole.EMPLOYEE;

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">
          {mounted ? t("common.appName") : "ITAMS"}
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item: any) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition " +
                (isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50")
              }
            >
              <Icon className="w-4 h-4" />
              {mounted ? t(item.key) : item.key.split(".").pop()}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t text-xs text-gray-500">v1.0.0</div>
    </aside>
  );
}
`;

const file = path.join(__dirname, "src", "components", "layout", "sidebar.tsx");
fs.writeFileSync(file, code);
console.log("Updated:", file);