const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== BAT DAU TAO HANDOVER ===");

  const employee = await prisma.user.findUnique({
    where: { email: "employee1@company.com" },
    include: { manager: true },
  });

  if (!employee) {
    console.log("Khong tim thay employee1@company.com");
    return;
  }
  if (!employee.manager) {
    console.log("NV chua co quan ly - cap nhat...");
    const manager = await prisma.user.findFirst({ where: { role: "MANAGER" } });
    if (manager) {
      await prisma.user.update({
        where: { id: employee.id },
        data: { managerId: manager.id },
      });
      employee.managerId = manager.id;
    }
  }

  const itStaff = await prisma.user.findFirst({ where: { role: "IT_STAFF" } });
  if (!itStaff) {
    console.log("Khong tim thay IT_STAFF");
    return;
  }

  // Xoa handover cu (neu co) de test
  await prisma.handover.deleteMany({
    where: { employeeId: employee.id, status: "PENDING_EMPLOYEE_SIGN" },
  });
  console.log("Da xoa handover cu");

  // Lay 2 asset IN_STOCK
  const assets = await prisma.asset.findMany({
    where: { status: "IN_STOCK" },
    take: 2,
  });

  if (assets.length === 0) {
    console.log("Khong co asset IN_STOCK. Tao moi...");
    const newAssets = [
      {
        assetTag: "TS-2026-T001",
        qrCode: "QR-TS-2026-T001",
        name: "Laptop Test Ban Giao",
        category: "LAPTOP",
        brand: "Test",
        model: "T001",
        status: "IN_STOCK",
        location: "Kho IT",
      },
      {
        assetTag: "TS-2026-T002",
        qrCode: "QR-TS-2026-T002",
        name: "Man hinh Test Ban Giao",
        category: "MONITOR",
        brand: "Test",
        model: "T002",
        status: "IN_STOCK",
        location: "Kho IT",
      },
    ];
    for (const a of newAssets) {
      await prisma.asset.upsert({
        where: { assetTag: a.assetTag },
        update: {},
        create: a,
      });
    }
    const newList = await prisma.asset.findMany({
      where: { status: "IN_STOCK" },
      take: 2,
    });
    assets.push(...newList);
  }

  // Tao request moi
  const reqCount = await prisma.assetRequest.count();
  const requestNumber =
    "REQ-" + new Date().getFullYear() + "-" + String(reqCount + 1).padStart(5, "0");

  const request = await prisma.assetRequest.create({
    data: {
      requestNumber,
      requesterId: employee.id,
      title: "Ban giao thiet bi cho NV",
      reason: "Test ban giao ky so - " + new Date().toISOString(),
      priority: "NORMAL",
      status: "ORDERED",
      currentStep: 3,
      approvalSteps: {
        create: {
          stepNumber: 1,
          approverId: employee.managerId,
          decision: "APPROVED",
          decidedAt: new Date(),
        },
      },
    },
  });
  console.log("Da tao request:", request.requestNumber);

  // Tao handover
  const hoCount = await prisma.handover.count();
  const handoverNumber =
    "HO-" + new Date().getFullYear() + "-" + String(hoCount + 1).padStart(5, "0");

  const handover = await prisma.handover.create({
    data: {
      handoverNumber,
      requestId: request.id,
      employeeId: employee.id,
      itStaffId: itStaff.id,
      handoverDate: new Date(),
      status: "PENDING_EMPLOYEE_SIGN",
      items: {
        create: assets.slice(0, 2).map((a) => ({
          assetId: a.id,
          condition: "Moi 100%",
        })),
      },
    },
    include: {
      items: { include: { asset: true } },
    },
  });

  console.log("\n=== TAO HANDOVER THANH CONG ===");
  console.log("Ma:", handover.handoverNumber);
  console.log("Nhan vien:", employee.name, "(" + employee.email + ")");
  console.log("IT:", itStaff.name);
  console.log("Trang thai: PENDING_EMPLOYEE_SIGN");
  console.log("Tai san:");
  handover.items.forEach((item) => {
    console.log("  - " + item.asset.assetTag + ": " + item.asset.name);
  });
  console.log("\n>>> NV DANG NHAP DE KY <<<");
}

main().catch(console.error).finally(() => prisma.$disconnect());