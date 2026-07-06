const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const adminKeys = {
  admin: {
    title: "Quản lý Ngôn ngữ & Translations",
    subtitle: "Them, sua, xoa ngon ngu va noi dung dich",
    languagesSubtitle: "Them, sua, xoa ngon ngu",
    codeNameRequired: "Code va name khong duoc trong",
    default: "mac dinh",
    all: "Tat ca",
    unsavedChanges: "Co thay doi chua luu. Click \"Luu tat ca\" de luu.",
    unsavedHint: "Co thay doi chua luu.",
    addNewTranslation: "+ Them translation moi",
    addNewLanguage: "+ Them ngon ngu",
    categoryKey: "category.key (vd: common.hello)",
    value: "Gia tri",
    noKeys: "Khong co keys",
    translationsSubtitle: "Sua noi dung dich cho tung ngon ngu",
  },
};

const enKeys = {
  admin: {
    title: "Language & Translation Management",
    subtitle: "Add, edit, delete languages and translations",
    languagesSubtitle: "Add, edit, delete languages",
    codeNameRequired: "Code and name cannot be empty",
    default: "default",
    all: "All",
    unsavedChanges: 'Unsaved changes. Click "Save all" to save.',
    unsavedHint: "There are unsaved changes.",
    addNewTranslation: "+ Add new translation",
    addNewLanguage: "+ Add language",
    categoryKey: "category.key (e.g: common.hello)",
    value: "Value",
    noKeys: "No keys",
    translationsSubtitle: "Edit translations for each language",
  },
};

async function main() {
  const vi = await prisma.language.findUnique({ where: { code: "vi" } });
  const en = await prisma.language.findUnique({ where: { code: "en" } });
  if (!vi || !en) return;

  for (const [cat, items] of Object.entries(adminKeys)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: vi.id, key: cat + "." + key } },
        update: { value, category: cat },
        create: { languageId: vi.id, key: cat + "." + key, value, category: cat },
      });
    }
  }
  console.log("Updated VI admin keys");

  for (const [cat, items] of Object.entries(enKeys)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: en.id, key: cat + "." + key } },
        update: { value, category: cat },
        create: { languageId: en.id, key: cat + "." + key, value, category: cat },
      });
    }
  }
  console.log("Updated EN admin keys");
}

main().catch(console.error).finally(() => prisma.$disconnect());