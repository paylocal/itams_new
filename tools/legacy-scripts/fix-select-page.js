const fs = require("fs");
const path = require("path");

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SelectItemsForPO } from "@/components/purchase-orders/select-items-for-po";

export default async function SelectItemsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role !== "PURCHASING" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Lay YC da ORDERED chua hoan thanh
  const allOrdered = await prisma.assetRequest.findMany({
    where: {
      OR: [
        { status: "ORDERED" },
        { status: "COMPLETED" }, // YC hoan thanh nhung co the co them item moi
      ],
    },
    include: {
      requester: { select: { name: true, department: true } },
      items: {
        include: {
          deviceModel: { select: { brand: true, name: true } },
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  // Lay cac items da co PO
  const poItems = await prisma.pOItem.findMany({
    where: { requestItemId: { not: null } },
    select: { requestItemId: true },
  });
  const itemIdsInPO = new Set(poItems.map((p) => p.requestItemId));

  // Loc YC con items chua mua
  const availableRequests = allOrdered
    .filter((req) => req.items.some((item) => !itemIdsInPO.has(item.id)))
    .map((req) => ({
      id: req.id,
      requestNumber: req.requestNumber,
      title: req.title,
      requester: req.requester,
      items: req.items.map((item) => ({
        ...item,
        hasPO: itemIdsInPO.has(item.id),
      })),
    }));

  return <SelectItemsForPO availableRequests={availableRequests as any} />;
}
`;

const file = path.join(__dirname, "src", "app", "(dashboard)", "purchase-orders", "select-items", "page.tsx");
fs.writeFileSync(file, code);
console.log("Created:", file);