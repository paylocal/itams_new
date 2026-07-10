import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateHandover } from "@/components/handover/create-handover";

export default async function NewHandoverPage({
  searchParams,
}: {
  searchParams: { requestId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isIT = await prisma.userGroupMember.findFirst({
    where: { userId: session.user.id, group: { code: "IT" } },
  });
  if (!isIT && session.user.role !== "IT_STAFF" && session.user.role !== "ADMIN") {
    redirect("/handovers");
  }

  const request = searchParams.requestId
    ? await prisma.assetRequest.findUnique({
        where: { id: searchParams.requestId },
        include: {
          requester: { select: { id: true, name: true, department: true } },
          items: { include: { category: true, deviceModel: true } },
        },
      })
    : null;

  const availableAssets = request
    ? await prisma.asset.findMany({
        where: {
          requestId: request.id,
          status: { in: ["IN_STOCK", "NEW"] },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return <CreateHandover request={request as any} availableAssets={availableAssets as any} />;
}
