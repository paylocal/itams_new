const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const langs = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  console.log("Languages trong DB:");
  langs.forEach((l) => {
    console.log(`  ${l.code} - ${l.name} ${l.flag || ""} ${l.isDefault ? "(default)" : ""}`);
  });
}

main().finally(() => prisma.$disconnect());