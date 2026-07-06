const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.assetRequest.findMany({
    where: { status: { in: ["PENDING_IT", "PENDING_MANAGER"] } },
    include: {
      requester: { select: { name: true } },
      approvalSteps: { orderBy: { stepNumber: "asc" } },
    },
    take: 5,
  });

  for (const r of requests) {
    console.log(`\n=== ${r.requestNumber} ===`);
    console.log(`Status: ${r.status}, CurrentStep: ${r.currentStep}`);
    console.log(`Requester: ${r.requester.name}`);
    console.log(`Steps:`);
    r.approvalSteps.forEach((s) => {
      console.log(`  - Step ${s.stepNumber}: approverId=${s.approverId.substring(0, 12)}..., decision=${s.decision || "PENDING"}`);
    });
  }
}

main().finally(() => prisma.$disconnect());