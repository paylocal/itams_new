import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssetsList } from "@/components/assets/assets-list";

export default async function AssetsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const assets = await prisma.asset.findMany({
    where: { status: { not: "DISPOSED" } },
    include: {
      currentHolder: { select: { id: true, name: true, department: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AssetsList assets={assets} />;
}
