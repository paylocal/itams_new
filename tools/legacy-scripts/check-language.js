const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const langs = await prisma.language.findMany({
      orderBy: { order: "asc" },
    });
    console.log("Languages trong DB:");
    langs.forEach((l) => {
      console.log(`  ${l.code} - ${l.name} ${l.flag || ""}`);
    });
    console.log("Total:", langs.length);
  } catch (e) {
    console.log("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();