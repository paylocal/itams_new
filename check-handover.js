const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const handovers = await prisma.handover.findMany({
    include: {
      employee: { select: { name: true, email: true } },
      items: { include: { asset: { select: { name: true } } } },
    },
  });
  console.log("=== HANDOVERS ===");
  handovers.forEach((h) => {
    console.log(`\n${h.handoverNumber}: status=${h.status}`);
    console.log(`  Nhan vien: ${h.employee.name} (${h.employee.email})`);
    console.log(`  Items: ${h.items.length}`);
  });

  // Kiem tra user employee
  const emp = await prisma.user.findUnique({
    where: { email: "employee1@company.com" },
  });
  console.log("\n=== EMPLOYEE1 ===");
  console.log("ID:", emp?.id);
  console.log("Role:", emp?.role);
}

main().finally(() => prisma.$disconnect());