const fs = require("fs");
const path = require("path");

const code = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, name, role, department, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email da ton tai" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const count = await prisma.user.count();
    // Khong can ma user, ID se auto generate

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || "EMPLOYEE",
        department: department || null,
        passwordHash,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name || "",
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      newData: { email, name, role, department },
      description: "Tao nguoi dung: " + name,
      req,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

const file = path.join(
  __dirname,
  "src",
  "app",
  "api",
  "users",
  "route.ts"
);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);