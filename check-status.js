const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.assetRequest.findMany({
    where: {
      status: { in: ["PENDING_PURCHASING", "ORDERED"] },
    },
    include: { requester: true },
    orderBy: { createdAt: "desc" },
  });

  console.log("=== YEU CAU PENDING/ORDERED ===");
  requests.forEach((r) => {
    console.log(`${r.requestNumber}: status=${r.status} | nguoi yeu cau: ${r.requester.name}`);
  });

  const purchasing = await prisma.user.findUnique({
    where: { email: "purchase@company.com" },
  });
  console.log("\nPurchasing user role:", purchasing?.role);
}

main().finally(() => prisma.$disconnect());