const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Default translations cho cac key pho bien
const defaultTranslations = {
  common: {
    appName: "ITAMS",
    welcome: "Chao mung",
    login: "Dang nhap",
    logout: "Dang xuat",
    save: "Luu",
    cancel: "Huy",
    delete: "Xoa",
    edit: "Sua",
    create: "Tao",
    search: "Tim kiem",
    loading: "Dang tai...",
    total: "Tong",
    status: "Trang thai",
    actions: "Thao tac",
    back: "Quay lai",
  },
  nav: {
    dashboard: "Trang chinh",
    requests: "Yeu cau",
    createRequest: "Tao yeu cau",
    approvals: "Cho phe duyet",
    assets: "Kho tai san",
    purchaseOrders: "Don mua hang",
    categories: "Danh muc",
    suppliers: "Nha cung cap",
    users: "Nguoi dung",
    handovers: "Ban giao",
    reports: "Bao cao",
  },
  roles: {
    ADMIN: "Quan tri vien",
    MANAGER: "Quan ly",
    IT_STAFF: "IT",
    PURCHASING: "Mua sam",
    EMPLOYEE: "Nhan vien",
  },
  status: {
    DRAFT: "Nhap",
    PENDING_MANAGER: "Cho QL",
    PENDING_IT: "Cho IT",
    ORDERED: "Dat hang",
    COMPLETED: "Hoan thanh",
    REJECTED: "Tu choi",
  },
};

const enTranslations = {
  common: {
    appName: "ITAMS",
    welcome: "Welcome",
    login: "Login",
    logout: "Logout",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    loading: "Loading...",
    total: "Total",
    status: "Status",
    actions: "Actions",
    back: "Back",
  },
  nav: {
    dashboard: "Dashboard",
    requests: "Requests",
    createRequest: "Create Request",
    approvals: "Approvals",
    assets: "Assets",
    purchaseOrders: "Purchase Orders",
    categories: "Categories",
    suppliers: "Suppliers",
    users: "Users",
    handovers: "Handovers",
    reports: "Reports",
  },
  roles: {
    ADMIN: "Administrator",
    MANAGER: "Manager",
    IT_STAFF: "IT",
    PURCHASING: "Purchasing",
    EMPLOYEE: "Employee",
  },
  status: {
    DRAFT: "Draft",
    PENDING_MANAGER: "Pending Mgr",
    PENDING_IT: "Pending IT",
    ORDERED: "Ordered",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
  },
};

async function main() {
  console.log("Seeding languages...");

  // Vietnamese
  const vi = await prisma.language.upsert({
    where: { code: "vi" },
    update: {},
    create: { code: "vi", name: "Tieng Viet", flag: "VN", isDefault: true, order: 1 },
  });
  console.log("Created VI:", vi.name);

  // English
  const en = await prisma.language.upsert({
    where: { code: "en" },
    update: {},
    create: { code: "en", name: "English", flag: "US", order: 2 },
  });
  console.log("Created EN:", en.name);

  // Seed translations cho VI
  for (const [category, items] of Object.entries(defaultTranslations)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: vi.id, key: `${category}.${key}` } },
        update: { value, category },
        create: { languageId: vi.id, key: `${category}.${key}`, value, category },
      });
    }
  }
  console.log("Seeded VI translations");

  // Seed translations cho EN
  for (const [category, items] of Object.entries(enTranslations)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: en.id, key: `${category}.${key}` } },
        update: { value, category },
        create: { languageId: en.id, key: `${category}.${key}`, value, category },
      });
    }
  }
  console.log("Seeded EN translations");

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());