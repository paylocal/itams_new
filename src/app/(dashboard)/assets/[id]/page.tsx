import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssetDetail } from "@/components/assets/asset-detail";

export default async function AssetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
    include: {
      currentHolder: { select: { id: true, name: true, department: true, email: true } },
      assetHistory: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!asset) notFound();

  return <AssetDetail asset={asset} />;
}
