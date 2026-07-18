import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SelectRequestsForPO } from "@/components/purchase-orders/select-requests-for-po";

export default async function CreatePOSelectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Chi Purchasing duoc tao PO. Admin khong tao PO.
  if (session.user.role !== "PURCHASING") {
    redirect("/purchase-orders");
  }

  // Lay cac YC da ORDERED (chua co PO)
  const allOrdered = await prisma.assetRequest.findMany({
    where: { status: "ORDERED" },
    include: {
      requester: { select: { name: true, department: true } },
      items: { include: { deviceModel: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  const existingPOs: Array<{ requestId: string }> =
    await prisma.purchaseOrderRequest.findMany({
    select: { requestId: true },
    });
  const requestIdsWithPO = new Set(existingPOs.map((p: { requestId: string }) => p.requestId));
  const availableRequests = allOrdered.filter(
    (r: { id: string }) => !requestIdsWithPO.has(r.id)
  );

  return <SelectRequestsForPO availableRequests={availableRequests as any} />;
}
