const fs = require("fs");
const path = require("path");

const code = `import { notFound, redirect } from "next/navigation";
import Link from "next/link";
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
`;

const dir = path.join(__dirname, "src", "app", "(dashboard)", "assets", "[id]");
const file = path.join(dir, "page.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);