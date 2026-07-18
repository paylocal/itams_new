import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandoverDetail } from "@/components/handover/handover-detail";

export default async function HandoverDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const handover = await prisma.handover.findUnique({
    where: { id: params.id },
    include: {
      employee: { select: { id: true, name: true, department: true } },
      itStaff: { select: { id: true, name: true } },
      items: {
        include: {
          asset: { select: { id: true, assetTag: true, name: true, serialNumber: true } },
        },
      },
    },
  });

  if (!handover) notFound();

  return (
    <HandoverDetail
      handover={handover}
      currentUserId={session.user.id}
      currentUserRole={session.user.role}
    />
  );
}
