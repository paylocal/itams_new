const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const langs = await prisma.language.findMany({ include: { translations: true }, orderBy: { order: 'asc' } });
  console.log(JSON.stringify(langs.map(l => ({ code: l.code, name: l.name, flag: l.flag, isDefault: l.isDefault, translations: l.translations.length })), null, 2));
  const en = langs.find(l => l.code === 'en');
  if (en) {
    console.log('EN sample:', en.translations.slice(0, 10).map(t => ({ key: t.key, value: t.value })));
  }
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
