const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const viTranslations = {
  common: {
    appName: "ITAMS", welcome: "Chào mừng", login: "Đăng nhập", logout: "Đăng xuất",
    save: "Lưu", cancel: "Hủy", delete: "Xóa", edit: "Sửa", create: "Tạo",
    search: "Tìm kiếm", loading: "Đang tải...", total: "Tổng", status: "Trạng thái",
    actions: "Thao tác", back: "Quay lại",
  },
  nav: {
    dashboard: "Trang chính", requests: "Yêu cầu", createRequest: "Tạo yêu cầu",
    approvals: "Chờ phê duyệt", assets: "Kho tài sản", purchaseOrders: "Đơn mua hàng",
    categories: "Danh mục", suppliers: "Nhà cung cấp", users: "Người dùng",
    handovers: "Bàn giao", reports: "Báo cáo", translations: "Translations",
  },
  roles: {
    ADMIN: "Quản trị viên", MANAGER: "Quản lý", IT_STAFF: "IT",
    PURCHASING: "Mua sắm", EMPLOYEE: "Nhân viên",
  },
  status: {
    DRAFT: "Nháp", PENDING_MANAGER: "Chờ QL", PENDING_IT: "Chờ IT",
    ORDERED: "Đã đặt hàng", COMPLETED: "Hoàn thành", REJECTED: "Bị từ chối",
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
    console.log("Languages not found");
    return;
  }

  // Update VI voi tieng viet co dau
  for (const [cat, items] of Object.entries(viTranslations)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: vi.id, key: cat + "." + key } },
        update: { value, category: cat },
        create: { languageId: vi.id, key: cat + "." + key, value, category: cat },
      });
    }
  }
  console.log("Updated VI");

  // Update EN
  for (const [cat, items] of Object.entries(enTranslations)) {
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