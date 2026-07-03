import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApprovalList } from "@/components/approvals/approval-list";
import { Prisma } from "@prisma/client";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let where: Prisma.AssetRequestWhereInput = {};

  if (session.user.role === "MANAGER") {
    where = {
      status: "PENDING_MANAGER",
      requester: { managerId: session.user.id },
    };
  } else if (session.user.role === "IT_STAFF") {
    where = { status: "PENDING_IT" };
  } else if (session.user.role === "ADMIN") {
    where = { status: { in: ["PENDING_MANAGER", "PENDING_IT", "PENDING_PURCHASING"] } };
  } else {
    redirect("/dashboard");
  }

  const requests = await prisma.assetRequest.findMany({
    where,
    include: { requester: { select: { id: true, name: true, department: true } } },
    orderBy: { createdAt: "asc" },
  });

  return <ApprovalList requests={requests} userRole={session.user.role} />;
}