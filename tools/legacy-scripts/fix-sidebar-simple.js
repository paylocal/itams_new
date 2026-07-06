const fs = require("fs");
const path = require("path");

const code = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, CheckSquare, Package, ShoppingCart, Users,
} from "lucide-react";
import { useI18n } from "../i18n-provider";

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { t, locale } = useI18n();

  // Label truc tiep theo locale
  const getLabel = (vi: string, en: string) => (locale === "vi" ? vi : en);

  const menuByRole: any = {
    EMPLOYEE: [
      { href: "/dashboard", label: getLabel("Trang chinh", "Dashboard"), icon: LayoutDashboard },
      { href: "/requests", label: getLabel("Yeu cau", "Requests"), icon: FileText },
      { href: "/requests/new", label: getLabel("Tao yeu cau", "Create Request"), icon: FileText },
    ],
    MANAGER: [
      { href: "/dashboard", label: getLabel("Trang chinh", "Dashboard"), icon: LayoutDashboard },
      { href: "/approvals", label: getLabel("Cho phe duyet", "Approvals"), icon: CheckSquare },
      { href: "/requests", label: getLabel("Yeu cau", "Requests"), icon: FileText },
    ],
    IT_STAFF: [
      { href: "/dashboard", label: getLabel("Trang chinh", "Dashboard"), icon: LayoutDashboard },
      { href: "/approvals", label: getLabel("Cho phe duyet", "Approvals"), icon: CheckSquare },
      { href: "/requests", label: getLabel("Yeu cau", "Requests"), icon: FileText },
      { href: "/assets", label: getLabel("Kho tai san", "Assets"), icon: Package },
    ],
    PURCHASING: [
      { href: "/dashboard", label: getLabel("Trang chinh", "Dashboard"), icon: LayoutDashboard },
      { href: "/purchase-orders/select-items", label: getLabel("Tao PO tu YC", "Create PO"), icon: ShoppingCart },
      { href: "/purchase-orders", label: getLabel("Don mua hang", "PO List"), icon: ShoppingCart },
    ],
    ADMIN: [
      { href: "/dashboard", label: getLabel("Trang chinh", "Dashboard"), icon: LayoutDashboard },
      { href: "/requests", label: getLabel("Yeu cau", "Requests"), icon: FileText },
      { href: "/approvals", label: getLabel("Cho phe duyet", "Approvals"), icon: CheckSquare },
      { href: "/assets", label: getLabel("Kho tai san", "Assets"), icon: Package },
      { href: "/purchase-orders", label: getLabel("Don mua hang", "PO List"), icon: ShoppingCart },
      { href: "/admin/categories", label: getLabel("Danh muc", "Categories"), icon: Package },
      { href: "/admin/suppliers", label: getLabel("Nha cung cap", "Suppliers"), icon: Users },
      { href: "/admin/users", label: getLabel("Nguoi dung", "Users"), icon: Users },
    ],
  };

  const menu = menuByRole[role] || menuByRole.EMPLOYEE;

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">ITAMS</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item: any, idx: number) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
              {item.label}
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
console.log("Updated sidebar");