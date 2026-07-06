const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Translation keys can thiet
const keys = {
  vi: {
    "admin.title": "Quản lý Ngôn ngữ & Bản dịch",
    "admin.subtitle": "Them, sua, xoa ngon ngu va noi dung dich",
    "admin.tabLanguages": "Ngôn ngữ",
    "admin.tabTranslations": "Bản dịch",
    "admin.addLanguage": "Thêm ngôn ngữ",
    "admin.codeRequired": "Code va name khong duoc trong",
    "admin.default": "mac dinh",
    "admin.search": "Tim kiem key...",
    "admin.saveAll": "Lưu tat ca",
    "admin.delete": "Xoa",
    "admin.edit": "Sua",
    "admin.cancel": "Huy",
    "admin.addTranslation": "Them translation moi",
    "admin.categoryKey": "category.key (vd: common.hello)",
    "admin.value": "Gia tri",
    "admin.emptyTranslations": "Chua co keys",
    "admin.translations": "Translations",
    "admin.languages": "Ngôn ngữ",
    "admin.code": "Code",
    "admin.name": "Ten",
    "admin.flag": "Co",
    "admin.no": "Khong",
    "admin.translationsCount": "So translations",
    "admin.yesDelete": "Xoa",
    "admin.empty": "(empty)",
    "admin.loading": "Dang tai...",
    "admin.add": "Them",
    "admin.untitledTranslation": "Them moi",
    "admin.refresh": "Lam moi",
    "admin.deleteConfirm": "Xoa?",
    "admin.addSuccess": "Them thanh cong!",
    "admin.updateSuccess": "Cap nhat thanh cong!",
    "admin.deleteSuccess": "Xoa thanh cong!",
    "admin.error": "Co loi xay ra",
  },
  en: {
    "admin.title": "Language & Translation Management",
    "admin.subtitle": "Add, edit, delete languages and translations",
    "admin.tabLanguages": "Languages",
    "admin.tabTranslations": "Translations",
    "admin.addLanguage": "Add Language",
    "admin.codeRequired": "Code and name are required",
    "admin.default": "default",
    "admin.search": "Search key...",
    "admin.saveAll": "Save All",
    "admin.delete": "Delete",
    "admin.edit": "Edit",
    "admin.cancel": "Cancel",
    "admin.addTranslation": "Add New Translation",
    "admin.categoryKey": "category.key (e.g: common.hello)",
    "admin.value": "Value",
    "admin.emptyTranslations": "No keys",
    "admin.translations": "Translations",
    "admin.languages": "Languages",
    "admin.code": "Code",
    "admin.name": "Name",
    "admin.flag": "Yes",
    "admin.no": "No",
    "admin.translationsCount": "Translations",
    "admin.yesDelete": "Yes, delete",
    "admin.empty": "(empty)",
    "admin.loading": "Loading...",
    "admin.add": "Add",
    "admin.untitledTranslation": "Add New",
    "admin.refresh": "Refresh",
    "admin.deleteConfirm": "Delete?",
    "admin.addSuccess": "Added successfully!",
    "admin.updateSuccess": "Updated successfully!",
    "admin.deleteSuccess": "Deleted successfully!",
    "admin.error": "An error occurred",
  },
};

async function main() {
  for (const [code, items] of Object.entries(keys)) {
    const lang = await prisma.language.findUnique({ where: { code } });
    if (!lang) {
      console.log("Language not found:", code);
      continue;
    }
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: lang.id, key } },
        update: { value, category: "admin" },
        create: { languageId: lang.id, key, value, category: "admin" },
      });
    }
    console.log("Updated", code);
  }
}

main()
  .then(() => console.log("Done"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());