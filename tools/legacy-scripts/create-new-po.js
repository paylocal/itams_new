const fs = require("fs");
const path = require("path");

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatePOFormMulti } from "@/components/purchase-orders/create-po-form-multi";

export default async function NewPOPage({
  searchParams,
}: {
  searchParams: { requestIds?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role !== "PURCHASING" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

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

  let preselected: any[] = [];
  if (searchParams.requestIds) {
    const ids = searchParams.requestIds.split(",");
    preselected = await prisma.assetRequest.findMany({
      where: { id: { in: ids } },
      include: {
        requester: { select: { name: true } },
        items: { include: { deviceModel: true } },
      },
    });
  }

  return (
    <CreatePOFormMulti
      availableRequests={availableRequests as any}
      preselected={preselected as any}
    />
  );
}
`;

const dir = path.join(__dirname, "src", "app", "(dashboard)", "purchase-orders", "new");
const file = path.join(dir, "page.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);
