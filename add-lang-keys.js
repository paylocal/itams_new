const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const keys = {
  vi: { "nav.languages": "Ngôn ngữ" },
  en: { "nav.languages": "Languages" },
};

async function main() {
  for (const [code, items] of Object.entries(keys)) {
    const lang = await prisma.language.findUnique({ where: { code } });
    if (!lang) continue;
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: lang.id, key } },
        update: { value },
        create: { languageId: lang.id, key, value, category: "nav" },
      });
    }
  }
  console.log("Added nav.languages for all langs");
}

main().catch(console.error).finally(() => prisma.$disconnect());