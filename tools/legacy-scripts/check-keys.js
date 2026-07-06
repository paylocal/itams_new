const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const langs = await prisma.language.findMany();
  for (const l of langs) {
    const count = await prisma.translation.count({
      where: { languageId: l.id },
    });
    console.log(`${l.code} (${l.name}): ${count} translations`);
  }
  
  // Lay tat ca categories
  const allTrans = await prisma.translation.findMany({
    where: { language: { code: "vi" } },
    select: { key: true, value: true, category: true },
  });
  const categories = new Set(allTrans.map(t => t.category));
  console.log("\nCategories trong VI:", [...categories]);
}

main().catch(console.error).finally(() => prisma.$disconnect());
