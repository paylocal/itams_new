const fs = require("fs");
const path = require("path");

// Tao o src/messages/ (cung cap voi components)
const baseDir = path.join(__dirname, "src", "messages");
const viDir = path.join(baseDir, "vi");
const enDir = path.join(baseDir, "en");

[baseDir, viDir, enDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  console.log("Dir:", d);
});

const viMessages = {
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
    PENDING_MANAGER: "Cho quan ly",
    PENDING_IT: "Cho IT",
    ORDERED: "Da dat hang",
    COMPLETED: "Hoan thanh",
    REJECTED: "Bi tu choi",
  },
};

const enMessages = {
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

fs.writeFileSync(path.join(viDir, "common.json"), JSON.stringify(viMessages, null, 2));
fs.writeFileSync(path.join(enDir, "common.json"), JSON.stringify(enMessages, null, 2));
console.log("Created vi/common.json");
console.log("Created en/common.json");