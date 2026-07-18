"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useI18n } from "../i18n-provider";

type User = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

export function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const { locale } = useI18n();

  return (
    <div key={locale} className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role || "EMPLOYEE"} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

