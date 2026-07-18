import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type TFn = (key: string, fallback?: string) => string;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | { toNumber?: () => number } | string) {
  const value = typeof amount === "number"
    ? amount
    : typeof amount === "string"
    ? Number(amount)
    : typeof amount.toNumber === "function"
    ? amount.toNumber()
    : Number(amount);

  return new Intl.NumberFormat("vi-VN").format(value) + " d";
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_MANAGER: "bg-yellow-100 text-yellow-700",
    PENDING_LEAD: "bg-amber-100 text-amber-700",
    PENDING_BOD: "bg-rose-100 text-rose-700",
    PENDING_STOCK_CHECK: "bg-blue-100 text-blue-700",
    PENDING_IT: "bg-blue-100 text-blue-700",
    PENDING_PURCHASING: "bg-purple-100 text-purple-700",
    PENDING_ADMIN: "bg-rose-100 text-rose-700",
    PURCHASING_CREATED_PO: "bg-orange-100 text-orange-700",
    ORDERED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-cyan-100 text-cyan-700",
    COMPLETED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    IN_STOCK: "bg-green-100 text-green-700",
    ASSIGNED: "bg-blue-100 text-blue-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}

export function getStatusLabel(status: string, t?: TFn) {
  const map: Record<string, { key: string; fallback: string }> = {
    DRAFT: { key: "status.DRAFT", fallback: "Nhap" },
    PENDING_MANAGER: { key: "status.PENDING_MANAGER", fallback: "Cho Quan ly" },
    PENDING_LEAD: { key: "status.PENDING_LEAD", fallback: "Cho Lead" },
    PENDING_BOD: { key: "status.PENDING_BOD", fallback: "Cho BOD" },
    PENDING_STOCK_CHECK: { key: "status.PENDING_STOCK_CHECK", fallback: "Cho IT kiem tra kho" },
    PENDING_IT: { key: "status.PENDING_IT", fallback: "Cho IT" },
    PENDING_PURCHASING: { key: "status.PENDING_PURCHASING", fallback: "Cho Mua sam" },
    PENDING_ADMIN: { key: "status.PENDING_ADMIN", fallback: "Cho Admin" },
    PURCHASING_CREATED_PO: { key: "status.PURCHASING_CREATED_PO", fallback: "Da tao PO" },
    ORDERED: { key: "status.ORDERED", fallback: "Da dat hang" },
    DELIVERED: { key: "status.DELIVERED", fallback: "Da nhan hang" },
    COMPLETED: { key: "status.COMPLETED", fallback: "Hoan thanh" },
    REJECTED: { key: "status.REJECTED", fallback: "Bi tu choi" },
    IN_STOCK: { key: "status.IN_STOCK", fallback: "Trong kho" },
    ASSIGNED: { key: "status.ASSIGNED", fallback: "Da cap phat" },
  };
  const item = map[status];
  if (!item) return status;
  return t ? t(item.key, item.fallback) : item.fallback;
}

export function getCategoryLabel(category: string, t?: TFn) {
  const map: Record<string, { key: string; fallback: string }> = {
    LAPTOP: { key: "category.LAPTOP", fallback: "Laptop" },
    MONITOR: { key: "category.MONITOR", fallback: "Man hinh" },
    PHONE: { key: "category.PHONE", fallback: "Dien thoai" },
    DESKTOP: { key: "category.DESKTOP", fallback: "May ban" },
    PRINTER: { key: "category.PRINTER", fallback: "May in" },
    ACCESSORY: { key: "category.ACCESSORY", fallback: "Phu kien" },
    KEYBOARD: { key: "category.KEYBOARD", fallback: "Ban phim" },
    MOUSE: { key: "category.MOUSE", fallback: "Chuot" },
    HEADPHONE: { key: "category.HEADPHONE", fallback: "Tai nghe" },
    OTHER: { key: "category.OTHER", fallback: "Khac" },
  };
  const item = map[category];
  if (!item) return category;
  return t ? t(item.key, item.fallback) : item.fallback;
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
