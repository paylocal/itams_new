const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Tao tai san mau...");

  // Lay 1 IT Staff va 1 Employee
  const itStaff = await prisma.user.findFirst({ where: { role: "IT_STAFF" } });
  const employee = await prisma.user.findFirst({ where: { email: "employee1@company.com" } });

  const assets = [
    {
      assetTag: "TS-2026-0001",
      qrCode: "QR-TS-2026-0001",
      name: "MacBook Pro 14 M3",
      category: "LAPTOP",
      brand: "Apple",
      model: "MacBook Pro 14 inch M3",
      serialNumber: "C02ABC123XYZ",
      status: "IN_STOCK",
      location: "Kho IT - Tang 3",
    },
    {
      assetTag: "TS-2026-0002",
      qrCode: "QR-TS-2026-0002",
      name: 'Dell UltraSharp 27"',
      category: "MONITOR",
      brand: "Dell",
      model: "U2723QE",
      serialNumber: "MON987654321",
      status: "ASSIGNED",
      currentHolderId: employee?.id,
      assignedDate: new Date(),
      location: "Engineering",
    },
    {
      assetTag: "TS-2026-0003",
      qrCode: "QR-TS-2026-0003",
      name: "iPhone 15 Pro",
      category: "PHONE",
      brand: "Apple",
      model: "iPhone 15 Pro",
      serialNumber: "IP15PRO123456",
      status: "ASSIGNED",
      currentHolderId: employee?.id,
      assignedDate: new Date(),
      location: "Engineering",
    },
    {
      assetTag: "TS-2026-0004",
      qrCode: "QR-TS-2026-0004",
      name: "Logitech MX Keys",
      category: "KEYBOARD",
      brand: "Logitech",
      model: "MX Keys",
      status: "IN_STOCK",
      location: "Kho IT",
    },
    {
      assetTag: "TS-2026-0005",
      qrCode: "QR-TS-2026-0005",
      name: "MacBook Air M2",
      category: "LAPTOP",
      brand: "Apple",
      model: "MacBook Air M2",
      serialNumber: "C02DEF456",
      status: "IN_MAINTENANCE",
      location: "Kho IT - Sua chua",
    },
  ];

  for (const a of assets) {
    await prisma.asset.upsert({
      where: { assetTag: a.assetTag },
      update: {},
      create: a,
    });
    console.log("Da tao:", a.assetTag);
  }

  console.log("\nXong! Da tao " + assets.length + " tai san");
}

main().catch(console.error).finally(() => prisma.$disconnect());