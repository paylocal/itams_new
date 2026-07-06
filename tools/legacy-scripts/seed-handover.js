const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.user.findUnique({
    where: { email: "employee1@company.com" },
  });
  const itStaff = await prisma.user.findFirst({ where: { role: "IT_STAFF" } });

  if (!employee || !itStaff) {
    console.log("Khong tim thay user");
    return;
  }

  // Lay 1 request COMPLETED de tao handover
  const requests = await prisma.assetRequest.findMany({
    where: { status: "COMPLETED" },
    take: 1,
  });

  for (const req of requests) {
    const count = await prisma.handover.count();
    const handoverNumber =
      "HO-" + new Date().getFullYear() + "-" + String(count + 1).padStart(5, "0");

    const assets = await prisma.asset.findMany({
      where: { requestId: req.id },
      select: { id: true },
      take: 50,
    });

    const handover = await prisma.handover.create({
      data: {
        handoverNumber,
        requestId: req.id,
        employeeId: employee.id,
        itStaffId: itStaff.id,
        handoverDate: new Date(),
        status: "PENDING_EMPLOYEE_SIGN",
        items: {
          create: assets.map((asset) => ({
            assetId: asset.id,
            condition: "Moi 100%",
          })),
        },
      },
    });

    console.log("Da tao handover:", handover.handoverNumber);
  }

  console.log("Xong!");
}

main().catch(console.error).finally(() => prisma.$disconnect());