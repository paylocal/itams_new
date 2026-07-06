const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const viKeys = {
  admin: {
    title: "Quản lý Ngôn ngữ & Bản dịch",
    subtitle: "Them, sua, xoa ngon ngu va noi dung dich",
    addNew: "Them moi",
    add: "Them",
    addCategory: "Them danh muc",
    addSupplier: "Them nha cung cap",
    addUser: "Them nguoi dung",
    addLanguage: "Them ngon ngu",
    all: "Tat ca",
    default: "mac dinh",
    codeNameRequired: "Code va name khong duoc trong",
    unsavedChanges: "Co thay doi chua luu. Click \"Luu tat ca\" de luu.",
    unsavedHint: "Co thay doi chua luu.",
    addNewTranslation: "Them translation moi",
    categoryKey: "category.key (vd: common.hello)",
    value: "Gia tri",
    noKeys: "Khong co keys",
    translationsSubtitle: "Sua noi dung dich cho tung ngon ngu",
    languagesSubtitle: "Them, sua, xoa ngon ngu",
  },
};

const enKeys = {
  admin: {
    title: "Language & Translation Management",
    subtitle: "Add, edit, delete languages and translations",
    addNew: "Add new",
    add: "Add",
    addCategory: "Add category",
    addSupplier: "Add supplier",
    addUser: "Add user",
    addLanguage: "Add language",
    all: "All",
    default: "default",
    codeNameRequired: "Code and name cannot be empty",
    unsavedChanges: 'Unsaved changes. Click "Save all" to save.',
    unsavedHint: "There are unsaved changes.",
    addNewTranslation: "Add new translation",
    categoryKey: "category.key (e.g: common.hello)",
    value: "Value",
    noKeys: "No keys",
    translationsSubtitle: "Edit translations for each language",
    languagesSubtitle: "Add, edit, delete languages",
  },
};

async function main() {
  const vi = await prisma.language.findUnique({ where: { code: "vi" } });
  const en = await prisma.language.findUnique({ where: { code: "en" } });
  if (!vi || !en) return;

  for (const [cat, items] of Object.entries(viKeys)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: vi.id, key: cat + "." + key } },
        update: { value, category: cat },
        create: { languageId: vi.id, key: cat + "." + key, value, category: cat },
      });
    }
  }
  console.log("Updated VI");

  for (const [cat, items] of Object.entries(enKeys)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: en.id, key: cat + "." + key } },
        update: { value, category: cat },
        create: { languageId: en.id, key: cat + "." + key, value, category: cat },
      });
    }
  }
  console.log("Updated EN");
}

main().catch(console.error).finally(() => prisma.$disconnect());