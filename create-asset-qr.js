const fs = require("fs");
const path = require("path");

const code = `import { notFound, redirect } from "next/navigation";
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
      currentHolder: { select: { name: true } },
    },
  });

  if (!asset) notFound();

  return <AssetQR asset={asset} />;
}
`;

const dir = path.join(__dirname, "src", "app", "(dashboard)", "assets", "[id]", "qr");
const file = path.join(dir, "page.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);