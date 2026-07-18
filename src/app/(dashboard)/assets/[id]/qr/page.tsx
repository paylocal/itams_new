import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssetQR } from "@/components/assets/asset-qr";

export default async function AssetQRPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
    include: {
      currentHolder: { select: { name: true, department: true } },
      request: {
        select: {
          requestNumber: true,
          requester: { select: { name: true } },
        },
      },
      purchaseOrder: { select: { poNumber: true, actualDate: true } },
      handoverItems: {
        include: {
          handover: {
            select: {
              handoverNumber: true,
              employee: { select: { name: true } },
              itStaff: { select: { name: true } },
              handoverDate: true,
            },
          },
        },
        orderBy: { id: "desc" },
        take: 1,
      },
    },
  });

  if (!asset) notFound();

  return <AssetQR asset={asset} />;
}
