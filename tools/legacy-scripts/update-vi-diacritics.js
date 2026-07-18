const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const viCorrect = {
  common: {
    appName: "ITAMS",
    welcome: "Chào mừng",
    login: "Đăng nhập",
    logout: "Đăng xuất",
    save: "Lưu",
    cancel: "Hủy",
    delete: "Xóa",
    edit: "Sửa",
    create: "Tạo",
    search: "Tìm kiếm",
    loading: "Đang tải...",
    total: "Tổng",
    status: "Trạng thái",
    actions: "Thao tác",
    back: "Quay lại",
  },
  nav: {
    dashboard: "Trang chính",
    requests: "Yêu cầu",
    createRequest: "Tạo yêu cầu",
    approvals: "Chờ phê duyệt",
    assets: "Kho tài sản",
    purchaseOrders: "Đơn mua hàng",
    categories: "Danh mục",
    suppliers: "Nhà cung cấp",
    users: "Người dùng",
    handovers: "Bàn giao",
    reports: "Báo cáo",
    translations: "Bản dịch",
    languages: "Ngôn ngữ",
  },
  roles: {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý",
    IT_STAFF: "IT",
    PURCHASING: "Mua sắm",
    EMPLOYEE: "Nhân viên",
  },
  status: {
    DRAFT: "Nháp",
    PENDING_MANAGER: "Chờ QL",
    PENDING_IT: "Chờ IT",
    ORDERED: "Đã đặt hàng",
    COMPLETED: "Hoàn thành",
    REJECTED: "Bị từ chối",
  },
};

const enCorrect = {
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
    translations: "Translations",
    languages: "Languages",
  },
  roles: {
    ADMIN: "Administrator",
    MANAGER: "Manager",
    IT_STAFF: "IT Staff",
    PURCHASING: "Purchasing",
    EMPLOYEE: "Employee",
  },
  status: {
    DRAFT: "Draft",
    PENDING_MANAGER: "Pending Manager",
    PENDING_IT: "Pending IT",
    ORDERED: "Ordered",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
  },
};

const frCorrect = {
  common: {
    appName: "ITAMS",
    welcome: "Bienvenue",
    login: "Connexion",
    logout: "Déconnexion",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    search: "Rechercher",
    loading: "Chargement...",
    total: "Total",
    status: "Statut",
    actions: "Actions",
    back: "Retour",
  },
  nav: {
    dashboard: "Tableau de bord",
    requests: "Demandes",
    createRequest: "Créer une demande",
    approvals: "En attente",
    assets: "Biens",
    purchaseOrders: "Bons de commande",
    categories: "Catégories",
    suppliers: "Fournisseurs",
    users: "Utilisateurs",
    handovers: "Transferts",
    reports: "Rapports",
    translations: "Traductions",
    languages: "Langues",
  },
  roles: {
    ADMIN: "Administrateur",
    MANAGER: "Manager",
    IT_STAFF: "IT",
    PURCHASING: "Achats",
    EMPLOYEE: "Employé",
  },
  status: {
    DRAFT: "Brouillon",
    PENDING_MANAGER: "En attente manager",
    PENDING_IT: "En attente IT",
    ORDERED: "Commandé",
    COMPLETED: "Terminé",
    REJECTED: "Rejeté",
  },
};

async function main() {
  console.log("Updating translations with diacritics...");

  const languages = await prisma.language.findMany();
  const langMap = {
    vi: languages.find((l) => l.code === "vi"),
    en: languages.find((l) => l.code === "en"),
    fr: languages.find((l) => l.code === "fr"),
  };

  if (!langMap.vi || !langMap.en) {
    console.log("Languages not found. Run seed-langs.js first");
    return;
  }

  // Update VI
  for (const [cat, items] of Object.entries(viCorrect)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: langMap.vi.id, key: cat + "." + key } },
        update: { value, category: cat },
        create: { languageId: langMap.vi.id, key: cat + "." + key, value, category: cat },
      });
    }
  }
  console.log("Updated VI with diacritics");

  // Update EN
  for (const [cat, items] of Object.entries(enCorrect)) {
    for (const [key, value] of Object.entries(items)) {
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: langMap.en.id, key: cat + "." + key } },
        update: { value, category: cat },
        create: { languageId: langMap.en.id, key: cat + "." + key, value, category: cat },
      });
    }
  }
  console.log("Updated EN");

  // Update FR neu co
  if (langMap.fr) {
    for (const [cat, items] of Object.entries(frCorrect)) {
      for (const [key, value] of Object.entries(items)) {
        await prisma.translation.upsert({
          where: { languageId_key: { languageId: langMap.fr.id, key: cat + "." + key } },
          update: { value, category: cat },
          create: { languageId: langMap.fr.id, key: cat + "." + key, value, category: cat },
        });
      }
    }
    console.log("Updated FR");
  }

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());