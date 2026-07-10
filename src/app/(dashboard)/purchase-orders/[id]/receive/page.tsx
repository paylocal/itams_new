import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReceivePOForm } from "@/components/purchase-orders/receive-po-form";

export default async function ReceivePOPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "IT_STAFF") redirect("/purchase-orders");

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      requests: {
        include: {
          request: {
            select: { id: true, requestNumber: true, title: true },
          },
        },
      },
    },
  });

  if (!po) notFound();

  return <ReceivePOForm po={po} />;
}
