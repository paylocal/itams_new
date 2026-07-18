const fs = require("fs");
const path = require("path");

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandoverList } from "@/components/handover/handover-list";

export default async function HandoversPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let where: any = {};
  if (session.user.role === "EMPLOYEE") {
    where.employeeId = session.user.id;
  } else if (session.user.role === "IT_STAFF") {
    where.OR = [
      { itStaffId: session.user.id },
      { status: "PENDING_IT_SIGN" },
    ];
  }

  const handovers = await prisma.handover.findMany({
    where,
    include: {
      employee: { select: { id: true, name: true, department: true } },
      itStaff: { select: { name: true } },
      items: { include: { asset: { select: { assetTag: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <HandoverList handovers={handovers as any} userRole={session.user.role} />;
}
`;

const file = path.join(
  __dirname,
  "src",
  "app",
  "(dashboard)",
  "handovers",
  "page.tsx"
);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);