const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Lay vi
  const vi = await prisma.language.findUnique({ where: { code: "vi" } });
  if (!vi) {
    console.log("Khong co vi");
    return;
  }
  
  // Test update truc tiep trong DB
  const testKey = "test.direct";
  await prisma.translation.upsert({
    where: { languageId_key: { languageId: vi.id, key: testKey } },
    update: { value: "Updated at " + Date.now() },
    create: { languageId: vi.id, key: testKey, value: "Test create", category: "test" },
  });
  
  const result = await prisma.translation.findUnique({
    where: { languageId_key: { languageId: vi.id, key: testKey } },
  });
  console.log("DB result:", result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
