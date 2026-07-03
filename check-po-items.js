const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== CHECK PO ITEMS STATUS ===\n");

  // Lay cac YC da ORDERED
  const requests = await prisma.assetRequest.findMany({
    where: { status: "ORDERED" },
    include: {
      requester: { select: { name: true } },
      items: true,
    },
  });

  // Lay cac items da co PO
  const poItems = await prisma.pOItem.findMany({
    where: { requestItemId: { not: null } },
    select: { requestItemId: true, poId: true },
  });

  const itemIdsInPO = new Set(poItems.map(p => p.requestItemId));

  for (const req of requests) {
    console.log(`\n[${req.requestNumber}] ${req.title}`);
    console.log(`  Nguoi yeu cau: ${req.requester.name}`);
    console.log(`  Items:`);
    
    for (const item of req.items) {
      const inPO = itemIdsInPO.has(item.id);
      console.log(`    ${inPO ? '[X]' : '[ ]'} ${item.id.substring(0, 8)}... - ${item.customName || 'Model'} - SL: ${item.quantity} - ${item.totalPrice || 0}d`);
    }
  }
}

main().finally(() => prisma.$disconnect());
