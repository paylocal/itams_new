const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== DATABASE CHECK ===");
  const langs = await prisma.language.findMany({
    include: { _count: { select: { translations: true } } },
  });
  console.log("Languages:", langs.length);
  for (const l of langs) {
    console.log("  " + l.code + " (" + l.name + ") - " + l._count.translations + " translations");
  }
  console.log("");

  console.log("=== TRANSLATIONS SAMPLE (vi) ===");
  const sampleTrans = await prisma.translation.findMany({
    where: { language: { code: "vi" } },
    take: 10,
  });
  for (const t of sampleTrans) {
    console.log("  " + t.key + " = " + t.value);
  }
  console.log("");

  console.log("=== TEST API CALLS ===");
  const fetch = (await import("node-fetch")).default;

  const langsRes = await fetch("http://localhost:3000/api/languages");
  console.log("GET /api/languages status:", langsRes.status);
  const langsData = await langsRes.json();
  console.log("Languages count:", langsData.length);

  const transRes = await fetch("http://localhost:3000/api/translations/vi");
  console.log("GET /api/translations/vi status:", transRes.status);
  const transData = await transRes.json();
  console.log("Translations count:", Object.keys(transData).length);
  console.log("First 5 keys:", Object.keys(transData).slice(0, 5));
}

main().catch(console.error).finally(() => prisma.$disconnect());
