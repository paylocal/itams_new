const fs = require("fs");
const path = require("path");

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SelectRequestsForPO } from "@/components/purchase-orders/select-requests-for-po";

export default async function CreatePOSelectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role !== "PURCHASING" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
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

  const existingPOs = await prisma.purchaseOrderRequest.findMany({
    select: { requestId: true },
  });
  const requestIdsWithPO = new Set(existingPOs.map((p) => p.requestId));
  const availableRequests = allOrdered.filter(
    (r) => !requestIdsWithPO.has(r.id)
  );

  return <SelectRequestsForPO availableRequests={availableRequests as any} />;
}
`;

const dir = path.join(__dirname, "src", "app", "(dashboard)", "purchase-orders", "create");
const file = path.join(dir, "page.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);