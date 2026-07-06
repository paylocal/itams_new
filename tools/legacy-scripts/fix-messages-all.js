const fs = require("fs");
const path = require("path");

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
    categories: "Danh muc",
    suppliers: "Nha cung cap",
    users: "Nguoi dung",
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
  dashboard: {
    title: "Trang chinh",
    welcome: "Xin chao",
    totalRequests: "Tong yeu cau",
    pending: "Dang xu ly",
    completed: "Hoan thanh",
    myAssets: "Tai san cua toi",
  },
  po: {
    create: "Tao PO tu YC",
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
    categories: "Categories",
    suppliers: "Suppliers",
    users: "Users",
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
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome",
    totalRequests: "Total Requests",
    pending: "Pending",
    completed: "Completed",
    myAssets: "My Assets",
  },
  po: {
    create: "Create PO from Requests",
  },
};

const viPath = path.join(__dirname, "src", "messages", "vi", "common.json");
const enPath = path.join(__dirname, "src", "messages", "en", "common.json");

fs.writeFileSync(viPath, JSON.stringify(viMessages, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enMessages, null, 2));

console.log("Updated vi/common.json");
console.log("Updated en/common.json");