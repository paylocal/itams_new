import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const stats = { total: 0, pending: 0, completed: 0, myAssets: 0 };

  if (session.user.role === "EMPLOYEE") {
    stats.total = await prisma.assetRequest.count({
      where: { requesterId: session.user.id },
    });
    stats.pending = await prisma.assetRequest.count({
      where: {
        requesterId: session.user.id,
        status: { notIn: ["COMPLETED", "REJECTED"] },
      },
    });
    stats.completed = await prisma.assetRequest.count({
      where: { requesterId: session.user.id, status: "COMPLETED" },
    });
    stats.myAssets = await prisma.asset.count({
      where: { currentHolderId: session.user.id, status: "ASSIGNED" },
    });
  } else if (session.user.role === "MANAGER") {
    stats.pending = await prisma.assetRequest.count({
      where: {
        status: "PENDING_MANAGER",
        requester: { managerId: session.user.id },
      },
    });
    stats.total = await prisma.assetRequest.count({
      where: { requester: { managerId: session.user.id } },
    });
    stats.completed = await prisma.assetRequest.count({
      where: {
        requester: { managerId: session.user.id },
        status: "COMPLETED",
      },
    });
  } else if (session.user.role === "IT_STAFF") {
    stats.pending = await prisma.assetRequest.count({
      where: { status: "PENDING_IT" },
    });
    stats.total = await prisma.asset.count();
    stats.myAssets = await prisma.asset.count({
      where: { status: "ASSIGNED" },
    });
  } else if (session.user.role === "PURCHASING") {
    stats.pending = await prisma.assetRequest.count({
      where: { status: "ORDERED" },
    });
    stats.total = await prisma.purchaseOrder.count();
  } else if (session.user.role === "ADMIN") {
    stats.total = await prisma.assetRequest.count();
    stats.pending = await prisma.assetRequest.count({
      where: {
        status: { in: ["PENDING_MANAGER", "PENDING_IT", "ORDERED"] },
      },
    });
    stats.completed = await prisma.assetRequest.count({
      where: { status: "COMPLETED" },
    });
    stats.myAssets = await prisma.asset.count();
  }

  return (
    <AdminDashboard
      stats={stats}
      role={session.user.role}
    />
  );
}