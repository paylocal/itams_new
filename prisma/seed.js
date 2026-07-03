const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "Admin System",
      passwordHash,
      role: "ADMIN",
      department: "IT",
      position: "System Administrator",
    },
  });

  // Manager
  const manager = await prisma.user.upsert({
    where: { email: "manager@company.com" },
    update: {},
    create: {
      email: "manager@company.com",
      name: "Nguyen Van Manager",
      passwordHash,
      role: "MANAGER",
      department: "Engineering",
      position: "Engineering Manager",
    },
  });

  // IT
  await prisma.user.upsert({
    where: { email: "it1@company.com" },
    update: {},
    create: {
      email: "it1@company.com",
      name: "Tran IT Staff",
      passwordHash,
      role: "IT_STAFF",
      department: "IT",
      position: "IT Engineer",
    },
  });

  // Purchasing
  await prisma.user.upsert({
    where: { email: "purchase@company.com" },
    update: {},
    create: {
      email: "purchase@company.com",
      name: "Le Purchasing",
      passwordHash,
      role: "PURCHASING",
      department: "Procurement",
      position: "Purchasing Officer",
    },
  });

  // Employees
  await prisma.user.upsert({
    where: { email: "employee1@company.com" },
    update: {},
    create: {
      email: "employee1@company.com",
      name: "Pham Nhan Vien A",
      passwordHash,
      role: "EMPLOYEE",
      department: "Engineering",
      position: "Senior Developer",
      managerId: manager.id,
    },
  });

  // Categories
  const cats = [
    { code: "LAPTOP", name: "Laptop", hasModel: true, order: 1 },
    { code: "DESKTOP", name: "May ban", hasModel: true, order: 2 },
    { code: "MONITOR", name: "Man hinh", hasModel: true, order: 3 },
    { code: "PHONE", name: "Dien thoai", hasModel: true, order: 4 },
    { code: "KEYBOARD", name: "Ban phim", hasModel: true, order: 5 },
    { code: "MOUSE", name: "Chuot", hasModel: true, order: 6 },
    { code: "HEADPHONE", name: "Tai nghe", hasModel: true, order: 7 },
    { code: "PRINTER", name: "May in", hasModel: true, order: 8 },
    { code: "OTHER", name: "Khac (tu nhap)", hasModel: false, order: 99 },
  ];
  for (const c of cats) {
    await prisma.deviceCategory.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  // Laptop models
  const laptop = await prisma.deviceCategory.findUnique({ where: { code: "LAPTOP" } });
  if (laptop) {
    const models = [
      { brand: "Apple", name: "MacBook Air M2", avgPrice: 28000000 },
      { brand: "Apple", name: "MacBook Pro 14 M3", avgPrice: 45000000 },
      { brand: "Dell", name: "XPS 13", avgPrice: 30000000 },
      { brand: "Dell", name: "XPS 15", avgPrice: 40000000 },
      { brand: "HP", name: "EliteBook 840", avgPrice: 28000000 },
      { brand: "Lenovo", name: "ThinkPad X1", avgPrice: 35000000 },
    ];
    for (const m of models) {
      await prisma.deviceModel.upsert({
        where: { id: "temp" }, // dummy
        update: {},
        create: { ...m, categoryId: laptop.id },
      }).catch(() => {});
    }
  }

  // Suppliers
  const sups = [
    { name: "FPT Shop", contactName: "Nguyen Van A", phone: "0901234567" },
    { name: "Nguyen Kim", contactName: "Tran Thi B", phone: "0912345678" },
    { name: "Phong Vu", contactName: "Pham Van D", phone: "0934567890" },
  ];
  for (let i = 0; i < sups.length; i++) {
    await prisma.supplier.upsert({
      where: { code: `NCC${String(i + 1).padStart(4, "0")}` },
      update: {},
      create: { ...sups[i], code: `NCC${String(i + 1).padStart(4, "0")}` },
    });
  }

  console.log("Done!");
}

main().finally(() => prisma.$disconnect());