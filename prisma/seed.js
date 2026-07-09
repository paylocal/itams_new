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
  const employee1 = await prisma.user.upsert({
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

  // Setup default user groups and workflow flow for out-of-the-box dynamic approval
  await prisma.$executeRawUnsafe(`
IF OBJECT_ID(N'[dbo].[UserGroup]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[UserGroup] (
    [id] NVARCHAR(191) NOT NULL PRIMARY KEY,
    [code] NVARCHAR(191) NOT NULL UNIQUE,
    [name] NVARCHAR(191) NOT NULL,
    [level] INT NOT NULL DEFAULT 1,
    [managesLevel] INT NULL,
    [description] NVARCHAR(MAX) NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  )
END

IF COL_LENGTH(N'dbo.UserGroup', N'managesLevel') IS NULL
BEGIN
  ALTER TABLE [dbo].[UserGroup] ADD [managesLevel] INT NULL
END

IF OBJECT_ID(N'[dbo].[UserGroupMember]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[UserGroupMember] (
    [id] NVARCHAR(191) NOT NULL PRIMARY KEY,
    [groupId] NVARCHAR(191) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [joinedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [UQ_UserGroupMember_group_user] UNIQUE ([groupId], [userId]),
    CONSTRAINT [FK_UserGroupMember_group] FOREIGN KEY ([groupId]) REFERENCES [dbo].[UserGroup]([id]) ON DELETE CASCADE
  )
END

IF OBJECT_ID(N'[dbo].[UserGroupFlow]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[UserGroupFlow] (
    [id] NVARCHAR(191) NOT NULL PRIMARY KEY,
    [fromGroupId] NVARCHAR(191) NOT NULL,
    [toGroupId] NVARCHAR(191) NOT NULL,
    [minAmountUsd] DECIMAL(18, 2) NOT NULL DEFAULT 0,
    [description] NVARCHAR(MAX) NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [UQ_UserGroupFlow_from_to] UNIQUE ([fromGroupId], [toGroupId]),
    CONSTRAINT [FK_UserGroupFlow_from] FOREIGN KEY ([fromGroupId]) REFERENCES [dbo].[UserGroup]([id]),
    CONSTRAINT [FK_UserGroupFlow_to] FOREIGN KEY ([toGroupId]) REFERENCES [dbo].[UserGroup]([id])
  )
END
  `);

  const admin = await prisma.user.findUnique({ where: { email: "admin@company.com" }, select: { id: true } });

  // Upsert groups
  const groupIds = {};
  for (const g of [
    { code: "EMPLOYEE_GROUP_1", name: "Nhom Nhan vien 1", level: 1, managesLevel: null, description: "Nhom nhan vien mac dinh" },
    { code: "MANAGER_GROUP_CORE", name: "Nhom Manager 1", level: 3, managesLevel: 1, description: "Manager quan ly nhom nhan vien" },
    { code: "USER_GROUP_CORE", name: "Nhom User 1", level: 4, managesLevel: 3, description: "User/Admin quan ly nhom manager" },
  ]) {
    const existing = await prisma.$queryRaw`SELECT [id] FROM [dbo].[UserGroup] WHERE [code] = ${g.code}`;
    if (existing.length > 0) {
      groupIds[g.code] = existing[0].id;
      await prisma.$executeRaw`
        UPDATE [dbo].[UserGroup]
        SET [name] = ${g.name}, [level] = ${g.level}, [managesLevel] = ${g.managesLevel}, [description] = ${g.description}
        WHERE [id] = ${groupIds[g.code]}
      `;
    } else {
      const id = require("crypto").randomUUID();
      groupIds[g.code] = id;
      await prisma.$executeRaw`
        INSERT INTO [dbo].[UserGroup] ([id], [code], [name], [level], [managesLevel], [description])
        VALUES (${id}, ${g.code}, ${g.name}, ${g.level}, ${g.managesLevel}, ${g.description})
      `;
    }
  }

  // Clear and re-add members
  for (const code of Object.keys(groupIds)) {
    await prisma.$executeRaw`DELETE FROM [dbo].[UserGroupMember] WHERE [groupId] = ${groupIds[code]}`;
  }

  const memberLinks = [
    { groupCode: "EMPLOYEE_GROUP_1", userId: employee1.id },
    { groupCode: "MANAGER_GROUP_CORE", userId: manager.id },
    { groupCode: "USER_GROUP_CORE", userId: admin.id },
  ];
  for (const link of memberLinks) {
    const groupId = groupIds[link.groupCode];
    if (groupId && link.userId) {
      await prisma.$executeRaw`
        INSERT INTO [dbo].[UserGroupMember] ([id], [groupId], [userId])
        VALUES (${require("crypto").randomUUID()}, ${groupId}, ${link.userId})
      `;
    }
  }

  // Upsert flows
  const flows = [
    { from: "EMPLOYEE_GROUP_1", to: "MANAGER_GROUP_CORE", minAmountUsd: 0, description: "Nhan vien -> Manager" },
    { from: "MANAGER_GROUP_CORE", to: "USER_GROUP_CORE", minAmountUsd: 0, description: "Manager -> Admin" },
  ];
  for (const flow of flows) {
    const fromId = groupIds[flow.from];
    const toId = groupIds[flow.to];
    if (!fromId || !toId) continue;
    const existing = await prisma.$queryRaw`
      SELECT [id] FROM [dbo].[UserGroupFlow]
      WHERE [fromGroupId] = ${fromId} AND [toGroupId] = ${toId}
    `;
    if (existing.length > 0) {
      await prisma.$executeRaw`
        UPDATE [dbo].[UserGroupFlow]
        SET [minAmountUsd] = ${flow.minAmountUsd}, [description] = ${flow.description}
        WHERE [id] = ${existing[0].id}
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO [dbo].[UserGroupFlow] ([id], [fromGroupId], [toGroupId], [minAmountUsd], [description])
        VALUES (${require("crypto").randomUUID()}, ${fromId}, ${toId}, ${flow.minAmountUsd}, ${flow.description})
      `;
    }
  }

  console.log("Done!");
}

main().finally(() => prisma.$disconnect());
