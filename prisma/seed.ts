import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Seed default languages
  const defaultLanguages = [
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳", isActive: true, isDefault: true },
    { code: "en", name: "English", flag: "🇬🇧", isActive: true, isDefault: false },
  ];
  for (const lang of defaultLanguages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name, flag: lang.flag, isActive: lang.isActive },
      create: lang,
    });
  }

  // 2. Seed default password policy
  await prisma.passwordPolicy.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
      passwordExpiryDays: 90,
      preventReuseCount: 3,
      lockoutAfterFailedAttempts: 5,
      isActive: true,
    },
  });

  // 3. Seed default user groups
  const groups = [
    { code: "EMPLOYEE", name: "Nhan vien", level: 1, managesLevel: null },
    { code: "LEADER", name: "Nhom Leader", level: 2, managesLevel: 1 },
    { code: "MANAGER", name: "Nhom Manager", level: 3, managesLevel: 2 },
    { code: "BOD", name: "Nhom BOD", level: 4, managesLevel: 3 },
    { code: "IT", name: "Nhom IT", level: 5, managesLevel: null },
    { code: "PURCHASING", name: "Nhom Mua hang", level: 6, managesLevel: null },
  ];

  const groupMap: Record<string, string> = {};
  for (const g of groups) {
    const upserted = await prisma.userGroup.upsert({
      where: { code: g.code },
      update: {},
      create: g,
    });
    groupMap[g.code] = upserted.id;
  }

  // 4. Seed workflow rules based on amount thresholds in USD
  const workflowRules = [
    { name: "Leader approval", value: 0, requiredLevel: 2, groupCode: "LEADER", order: 1 },
    { name: "Manager approval", value: 1000, requiredLevel: 3, groupCode: "MANAGER", order: 2 },
    { name: "BOD approval", value: 5000, requiredLevel: 4, groupCode: "BOD", order: 3 },
  ];

  for (const r of workflowRules) {
    await prisma.workflowRule.upsert({
      where: { id: `rule-${r.order}` },
      update: {
        name: r.name,
        requiredGroupId: groupMap[r.groupCode],
        groupId: groupMap[r.groupCode],
      },
      create: {
        id: `rule-${r.order}`,
        name: r.name,
        description: `Auto approval rule: ${r.name}`,
        conditionType: "AMOUNT",
        operator: ">=",
        value: r.value,
        requiredLevel: r.requiredLevel,
        requiredGroupId: groupMap[r.groupCode],
        groupId: groupMap[r.groupCode],
        priority: "MEDIUM",
        isActive: true,
        order: r.order,
      },
    });
  }

  // 4. Seed demo users with groups
  const defaultPassword = "Password123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const demoUsers = [
    { email: "admin@ql-yc-ts.local", name: "Administrator", role: "ADMIN", groups: ["IT"] },
    { email: "leader@ql-yc-ts.local", name: "Leader User", role: "LEAD", groups: ["LEADER"] },
    { email: "manager@ql-yc-ts.local", name: "Manager User", role: "MANAGER", groups: ["MANAGER"] },
    { email: "bod@ql-yc-ts.local", name: "BOD User", role: "ADMIN", groups: ["BOD"] },
    { email: "it@ql-yc-ts.local", name: "IT Staff", role: "IT_STAFF", groups: ["IT"] },
    { email: "purchase@ql-yc-ts.local", name: "Purchasing Staff", role: "PURCHASING", groups: ["PURCHASING"] },
    { email: "employee@ql-yc-ts.local", name: "Employee One", role: "EMPLOYEE", groups: ["EMPLOYEE"] },
  ];

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash,
        role: u.role,
        isActive: true,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        isActive: true,
      },
    });

    for (const code of u.groups) {
      const groupId = groupMap[code];
      if (groupId) {
        await prisma.userGroupMember.upsert({
          where: { groupId_userId: { groupId, userId: user.id } },
          update: {},
          create: { groupId, userId: user.id },
        });
      }
    }
  }

  // 5. Seed device categories and demo models
  const categories = [
    {
      code: "LAPTOP",
      name: "Laptop",
      hasModel: true,
      models: [
        { brand: "Dell", name: "Latitude 7430", avgPrice: 1200 },
        { brand: "HP", name: "EliteBook 840", avgPrice: 1100 },
        { brand: "Lenovo", name: "ThinkPad X1 Carbon", avgPrice: 1400 },
        { brand: "Apple", name: "MacBook Air M2", avgPrice: 1500 },
        { brand: "ASUS", name: "ZenBook 14", avgPrice: 1000 },
      ],
    },
    {
      code: "DESKTOP",
      name: "Desktop",
      hasModel: true,
      models: [
        { brand: "Dell", name: "OptiPlex 7090", avgPrice: 900 },
        { brand: "HP", name: "EliteDesk 800", avgPrice: 850 },
      ],
    },
    {
      code: "MONITOR",
      name: "Monitor",
      hasModel: true,
      models: [
        { brand: "Dell", name: "P2419H", avgPrice: 250 },
        { brand: "LG", name: "24MK600M", avgPrice: 200 },
      ],
    },
    {
      code: "PHONE",
      name: "Phone",
      hasModel: true,
      models: [
        { brand: "Apple", name: "iPhone 15", avgPrice: 900 },
        { brand: "Samsung", name: "Galaxy S24", avgPrice: 850 },
      ],
    },
    { code: "KEYBOARD", name: "Keyboard", hasModel: false, models: [] },
    { code: "MOUSE", name: "Mouse", hasModel: false, models: [] },
    { code: "HEADPHONE", name: "Headphone", hasModel: false, models: [] },
    { code: "PRINTER", name: "Printer", hasModel: true, models: [{ brand: "HP", name: "LaserJet Pro", avgPrice: 400 }] },
  ];

  for (const cat of categories) {
    const { models, ...catData } = cat;
    const upserted = await prisma.deviceCategory.upsert({
      where: { code: catData.code },
      update: {},
      create: { ...catData, order: 0 },
    });
    for (const m of models) {
      await prisma.deviceModel.upsert({
        where: { id: `${upserted.id}-${m.brand}-${m.name}` },
        update: {},
        create: {
          id: `${upserted.id}-${m.brand}-${m.name}`,
          categoryId: upserted.id,
          brand: m.brand,
          name: m.name,
          avgPrice: m.avgPrice,
        },
      });
    }
  }

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
