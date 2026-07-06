const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@company.com' } });
  if (!user) {
    console.log('NO_USER');
    return;
  }
  console.log(JSON.stringify({ id: user.id, email: user.email, isActive: user.isActive, role: user.role }, null, 2));
  const valid = await bcrypt.compare('password123', user.passwordHash);
  console.log('valid=' + valid);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
