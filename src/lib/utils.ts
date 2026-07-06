import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: "Nhap",
    PENDING_MANAGER: "Cho Quan ly",
    PENDING_LEAD: "Cho Lead",
    PENDING_IT: "Cho IT",
    PENDING_PURCHASING: "Cho Mua sam",
    PENDING_ADMIN: "Cho Admin",
    PURCHASING_CREATED_PO: "Da tao PO",
    ORDERED: "Da dat hang",
    DELIVERED: "Da nhan hang",
    COMPLETED: "Hoan thanh",
    REJECTED: "Bi tu choi",
    IN_STOCK: "Trong kho",
    ASSIGNED: "Da cap phat",
  };
  return map[status] || status;
}

export function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    LAPTOP: "Laptop",
    MONITOR: "Man hinh",
    PHONE: "Dien thoai",
    DESKTOP: "May ban",
    PRINTER: "May in",
    ACCESSORY: "Phu kien",
    KEYBOARD: "Ban phim",
    MOUSE: "Chuot",
    HEADPHONE: "Tai nghe",
    OTHER: "Khac",
  };
  return map[category] || category;
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}