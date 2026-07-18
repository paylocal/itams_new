import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApprovalList } from "@/components/approvals/approval-list";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Find groups of current user
  const memberships = await prisma.userGroupMember.findMany({
    where: { userId: session.user.id },
    include: { group: { select: { code: true } } },
  });
  const groupCodes = memberships.map((m) => m.group?.code);

  const statusMap: Record<string, string> = {
    LEADER: "PENDING_LEADER",
    MANAGER: "PENDING_MANAGER",
    BOD: "PENDING_BOD",
    IT: "PENDING_STOCK_CHECK",
  };

  const pendingStatuses = groupCodes
    .map((code) => statusMap[code || ""])
    .filter(Boolean);

  // IT_STAFF legacy role also sees PENDING_STOCK_CHECK
  if (session.user.role === "IT_STAFF" && !pendingStatuses.includes("PENDING_STOCK_CHECK")) {
    pendingStatuses.push("PENDING_STOCK_CHECK");
  }

  const isAdmin = session.user.role === "ADMIN";

  const requests = await prisma.assetRequest.findMany({
    where: isAdmin
      ? {}
      : { status: { in: pendingStatuses } },
    include: {
      requester: { select: { id: true, name: true, department: true } },
      approvalSteps: {
        where: { decision: null },
        include: { approver: { select: { id: true, name: true } } },
        orderBy: { stepNumber: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Filter to ensure only requests where current user is next approver (except admin)
  const visibleRequests = isAdmin
    ? requests
    : requests.filter((r) =>
        r.approvalSteps.some((s) => s.approverId === session.user.id)
      );

  return <ApprovalList requests={visibleRequests} userRole={session.user.role} readOnly={isAdmin} />;
}
