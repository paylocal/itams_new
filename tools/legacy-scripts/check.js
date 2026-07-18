const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const langs = await prisma.language.findMany();
  console.log("Languages trong DB:", langs.length);
  langs.forEach((l) => console.log("  " + l.code + " - " + l.name));

  const translations = await prisma.translation.count();
  console.log("Translations:", translations);
}

main().finally(() => prisma.$disconnect());