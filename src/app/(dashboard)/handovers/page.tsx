import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandoverList } from "@/components/handover/handover-list";
import { Prisma } from "@prisma/client";
import { Plus } from "lucide-react";
import { getServerT } from "@/lib/i18n-server";

export default async function HandoversPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const { t } = await getServerT();

  const where: Prisma.HandoverWhereInput = {};
  if (session.user.role === "EMPLOYEE") {
    where.employeeId = session.user.id;
  } else if (session.user.role === "IT_STAFF") {
    where.OR = [
      { itStaffId: session.user.id },
      { status: "PENDING_IT_SIGN" },
    ];
  }
  // ADMIN xem tat ca

  const handovers = await prisma.handover.findMany({
    where,
    include: {
      employee: { select: { id: true, name: true, department: true } },
      itStaff: { select: { name: true } },
      items: { include: { asset: { select: { assetTag: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const canCreate = session.user.role === "IT_STAFF";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("handover.title", "Handovers")}</h1>
          <p className="text-gray-500 mt-1">{handovers.length} {t("handover.count", "handovers")}</p>
        </div>
        {canCreate && (
          <Link
            href="/handovers/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t("handover.create", "Create handover")}
          </Link>
        )}
      </div>
      <HandoverList handovers={handovers} userRole={session.user.role} />
    </div>
  );
}
