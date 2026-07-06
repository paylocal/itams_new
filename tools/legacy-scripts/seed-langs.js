const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding languages...");

  const vi = await prisma.language.upsert({
    where: { code: "vi" },
    update: {},
    create: { code: "vi", name: "Tieng Viet", flag: "VN", isDefault: true, order: 1 },
  });
  console.log("Created VI:", vi.name);

  const en = await prisma.language.upsert({
    where: { code: "en" },
    update: {},
    create: { code: "en", name: "English", flag: "US", order: 2 },
  });
  console.log("Created EN:", en.name);

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());