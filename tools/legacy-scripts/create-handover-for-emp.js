const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.user.findUnique({
    where: { email: "employee1@company.com" },
    include: { manager: true },
  });

  if (!employee || !employee.manager) {
    console.log("NV chua co quan ly");
    return;
  }

  // Tim 1-2 asset chua duoc gan cho ai (IN_STOCK)
  const assets = await prisma.asset.findMany({
    where: { status: "IN_STOCK" },
    take: 2,
  });

  if (assets.length === 0) {
    console.log("Khong co asset IN_STOCK de ban giao");
    return;
  }

  const itStaff = await prisma.user.findFirst({
    where: { role: "IT_STAFF" },
  });

  // Tao request
  const count = await prisma.assetRequest.count();
  const requestNumber =
    "REQ-" +
    new Date().getFullYear() +
    "-" +
    String(count + 1).padStart(5, "0");

  const request = await prisma.assetRequest.create({
    data: {
      requestNumber,
      requesterId: employee.id,
      title: "Ban giao thiet bi cho NV",
      reason: "Test ban giao ky so",
      priority: "NORMAL",
      status: "ORDERED",
      currentStep: 3,
      approvalSteps: {
        create: {
          stepNumber: 1,
          approverId: employee.manager.id,
          decision: "APPROVED",
          decidedAt: new Date(),
        },
      },
    },
  });

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
        create: assets.map((a) => ({
          assetId: a.id,
          condition: "Moi 100%",
        })),
      },
    },
  });

  console.log("Da tao handover:", handover.handoverNumber);
  console.log("Cho NV:", employee.email);
  console.log("Items:", assets.length);
  console.log("Trang thai: PENDING_EMPLOYEE_SIGN (NV can ky)");
}

main().catch(console.error).finally(() => prisma.$disconnect());