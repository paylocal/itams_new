const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const translations = {
  common: {
    appName: "ITAMS", welcome: "Chao mung", login: "Dang nhap", logout: "Dang xuat",
    save: "Luu", cancel: "Huy", delete: "Xoa", edit: "Sua", create: "Tao",
    search: "Tim kiem", loading: "Dang tai...", total: "Tong", status: "Trang thai",
    actions: "Thao tac", back: "Quay lai",
  },
  nav: {
    dashboard: "Trang chinh", requests: "Yeu cau", createRequest: "Tao yeu cau",
    approvals: "Cho phe duyet", assets: "Kho tai san", purchaseOrders: "Don mua hang",
    categories: "Danh muc", suppliers: "Nha cung cap", users: "Nguoi dung",
    handovers: "Ban giao", reports: "Bao cao", translations: "Translations",
  },
  roles: {
    ADMIN: "Quan tri vien", MANAGER: "Quan ly", IT_STAFF: "IT",
    PURCHASING: "Mua sam", EMPLOYEE: "Nhan vien",
  },
  status: {
    DRAFT: "Nhap", PENDING_MANAGER: "Cho QL", PENDING_IT: "Cho IT",
    ORDERED: "Dat hang", COMPLETED: "Hoan thanh", REJECTED: "Tu choi",
  },
};

const enTranslations = {
  common: {
    appName: "ITAMS", welcome: "Welcome", login: "Login", logout: "Logout",
    save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", create: "Create",
    search: "Search", loading: "Loading...", total: "Total", status: "Status",
    actions: "Actions", back: "Back",
  },
  nav: {
    dashboard: "Dashboard", requests: "Requests", createRequest: "Create Request",
    approvals: "Approvals", assets: "Assets", purchaseOrders: "Purchase Orders",
    categories: "Categories", suppliers: "Suppliers", users: "Users",
    handovers: "Handovers", reports: "Reports", translations: "Translations",
  },
  roles: {
    ADMIN: "Administrator", MANAGER: "Manager", IT_STAFF: "IT",
    PURCHASING: "Purchasing", EMPLOYEE: "Employee",
  },
  status: {
    DRAFT: "Draft", PENDING_MANAGER: "Pending Mgr", PENDING_IT: "Pending IT",
    ORDERED: "Ordered", COMPLETED: "Completed", REJECTED: "Rejected",
  },
};

async function main() {
  const vi = await prisma.language.findUnique({ where: { code: "vi" } });
  const en = await prisma.language.findUnique({ where: { code: "en" } });
  if (!vi || !en) {
    console.log("Languages not found. Run seed-langs.js first");
    return;
  }
  for (const lang of [{ lang: vi, data: translations }, { lang: en, data: enTranslations }]) {
    for (const [cat, items] of Object.entries(lang.data)) {
      for (const [key, value] of Object.entries(items)) {
        await prisma.translation.upsert({
          where: { languageId_key: { languageId: lang.lang.id, key: cat + "." + key } },
          update: { value, category: cat },
          create: { languageId: lang.lang.id, key: cat + "." + key, value, category: cat },
        });
      }
    }
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());