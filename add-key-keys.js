const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const viKeys = {
  "nav.dashboard": "Trang chinh",
  "nav.users": "Nguoi dung",
  "nav.categories": "Danh muc",
  "nav.suppliers": "Nha cung cap",
  "nav.requests": "Yeu cau",
  "nav.approvals": "Cho phe duyet",
  "nav.assets": "Kho tai san",
  "nav.handovers": "Ban giao",
  "nav.purchaseOrders": "Don mua hang",
  "nav.reports": "Bao cao",
  "nav.languages": "Ngon ngu",
  "admin.title": "Quan ly Ngon ngu & Ban dich",
  "admin.subtitle": "Them, sua, xoa ngon ngu va noi dung dich",
  "admin.tabLanguages": "Ngon ngu",
  "admin.tabTranslations": "Ban dich",
  "admin.translations": "Ban dich",
  "admin.addTranslation": "Them ban dich moi",
  "admin.saveAll": "Luu tat ca",
  "admin.search": "Tim kiem key...",
  "admin.emptyTranslations": "Chua co keys",
  "admin.edit": "Sua",
  "admin.delete": "Xoa",
  "admin.add": "Them",
  "admin.cancel": "Huy",
  "admin.categoryKey": "category.key (vd: common.hello)",
  "admin.value": "Gia tri",
  "admin.empty": "(empty)",
  "admin.saveSuccess": "Luu thanh cong!",
  "admin.loading": "Dang tai...",
  "admin.translationsCount": "So ban dich",
  "admin.default": "mac dinh",
  "admin.codeRequired": "Code va name khong duoc trong",
  "admin.addLanguage": "Them ngon ngu",
  "admin.code": "Code",
  "admin.name": "Ten",
  "admin.flag": "Co",
  "admin.yesDelete": "Xoa?",
  "admin.success": "Thanh cong!",
  "admin.error": "Co loi",
};

const enKeys = {
  "nav.dashboard": "Dashboard",
  "nav.users": "Users",
  "nav.categories": "Categories",
  "nav.suppliers": "Suppliers",
  "nav.requests": "Requests",
  "nav.approvals": "Approvals",
  "nav.assets": "Assets",
  "nav.handovers": "Handovers",
  "nav.purchaseOrders": "Purchase Orders",
  "nav.reports": "Reports",
  "nav.languages": "Languages",
  "admin.title": "Language & Translation Management",
  "admin.subtitle": "Add, edit, delete languages and translations",
  "admin.tabLanguages": "Languages",
  "admin.tabTranslations": "Translations",
  "admin.translations": "Translations",
  "admin.addTranslation": "Add New Translation",
  "admin.saveAll": "Save All",
  "admin.search": "Search key...",
  "admin.emptyTranslations": "No keys",
  "admin.edit": "Edit",
  "admin.delete": "Delete",
  "admin.add": "Add",
  "admin.cancel": "Cancel",
  "admin.categoryKey": "category.key (e.g: common.hello)",
  "admin.value": "Value",
  "admin.empty": "(empty)",
  "admin.saveSuccess": "Saved successfully!",
  "admin.loading": "Loading...",
  "admin.translationsCount": "Translations",
  "admin.default": "default",
  "admin.codeRequired": "Code and name required",
  "admin.addLanguage": "Add Language",
  "admin.code": "Code",
  "admin.name": "Name",
  "admin.flag": "Yes",
  "admin.yesDelete": "Delete?",
  "admin.success": "Success!",
  "admin.error": "Error",
};

async function main() {
  for (const [code, keys] of Object.entries({ vi: viKeys, en: enKeys })) {
    const lang = await prisma.language.findUnique({ where: { code } });
    if (!lang) continue;
    for (const [key, value] of Object.entries(keys)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: lang.id, key } },
        update: { value, category: key.split(".")[0] },
        create: { languageId: lang.id, key, value, category: key.split(".")[0] },
      });
    }
    console.log("Updated", code, Object.keys(keys).length, "keys");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());