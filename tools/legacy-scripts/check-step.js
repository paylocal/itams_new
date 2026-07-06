const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.assetRequest.findMany({
    where: { status: { in: ["PENDING_IT", "ORDERED"] } },
    include: {
      approvalSteps: { orderBy: { stepNumber: "asc" } },
      requester: { select: { name: true } },
    },
  });

  console.log("=== YEU CAU DANG CHO ===");
  requests.forEach((r) => {
    console.log(`\n[${r.requestNumber}] status=${r.status}`);
    console.log(`  Nguoi yeu cau: ${r.requester.name}`);
    console.log(`  currentStep: ${r.currentStep}`);
    console.log(`  Steps:`);
    r.approvalSteps.forEach((s) => {
      console.log(`    - Step ${s.stepNumber}: approver=${s.approverId.substring(0, 8)}... decision=${s.decision || "PENDING"}`);
    });
  });
}

main().finally(() => prisma.$disconnect());