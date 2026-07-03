const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const vi = await prisma.translation.findFirst({
    where: { language: { code: "vi" } },
  });
  console.log("Sample translation (vi):", vi);

  // Test cap nhat truc tiep
  await prisma.translation.update({
    where: {
      languageId_key: { languageId: vi.languageId, key: vi.key },
    },
    data: { value: "Test updated value " + Date.now() },
  });
  console.log("Updated");

  const updated = await prisma.translation.findFirst({
    where: { languageId: vi.languageId, key: vi.key },
  });
  console.log("After update:", updated);
}

main().catch(console.error).finally(() => prisma.$disconnect());