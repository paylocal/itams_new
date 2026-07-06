const fs = require("fs");
const path = require("path");

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  // Thong ke tong quan
  const totalRequests = await prisma.assetRequest.count();
  const completedRequests = await prisma.assetRequest.count({
    where: { status: "COMPLETED" },
  });
  const totalAssets = await prisma.asset.count();
  const assignedAssets = await prisma.asset.count({
    where: { status: "ASSIGNED" },
  });
  const totalPOs = await prisma.purchaseOrder.count();
  const totalSpent = await prisma.purchaseOrder.aggregate({
    _sum: { totalAmount: true },
  });

  // Trang thai yeu cau (cho pie chart)
  const statusGroups = await prisma.assetRequest.groupBy({
    by: ["status"],
    _count: true,
  });

  // Phong ban
  const users = await prisma.user.findMany({
    select: { department: true, role: true },
  });
  const deptCount: Record<string, number> = {};
  users.forEach((u) => {
    if (u.department) {
      deptCount[u.department] = (deptCount[u.department] || 0) + 1;
    }
  });
  const deptData = Object.entries(deptCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Tai san theo trang thai
  const assetsByStatus = await prisma.asset.groupBy({
    by: ["status"],
    _count: true,
  });

  // Yeu cau 6 thang gan day
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentRequests = await prisma.assetRequest.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  // Group theo thang
  const monthlyCount: Record<string, number> = {};
  recentRequests.forEach((r) => {
    const month = r.createdAt.toISOString().slice(0, 7);
    monthlyCount[month] = (monthlyCount[month] || 0) + 1;
  });
  const monthlyData = Object.entries(monthlyCount)
    .sort()
    .map(([month, count]) => ({ month, count }));

  // Chi phi theo thang
  const recentPOs = await prisma.purchaseOrder.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, totalAmount: true },
  });
  const monthlyCost: Record<string, number> = {};
  recentPOs.forEach((p) => {
    const month = p.createdAt.toISOString().slice(0, 7);
    monthlyCost[month] = (monthlyCost[month] || 0) + p.totalAmount;
  });
  const costData = Object.entries(monthlyCost)
    .sort()
    .map(([month, amount]) => ({ month, amount }));

  // Tai san theo danh muc
  const assetsByCategory = await prisma.asset.groupBy({
    by: ["category"],
    _count: true,
  });

  return (
    <ReportsDashboard
      stats={{
        totalRequests,
        completedRequests,
        totalAssets,
        assignedAssets,
        totalPOs,
        totalSpent: totalSpent._sum.totalAmount || 0,
      }}
      statusGroups={statusGroups as any}
      deptData={deptData}
      assetsByStatus={assetsByStatus as any}
      monthlyData={monthlyData}
      costData={costData}
      assetsByCategory={assetsByCategory as any}
    />
  );
}
`;

const file = path.join(
  __dirname,
  "src",
  "app",
  "(dashboard)",
  "reports",
  "page.tsx"
);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);