import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";
import { getActivePasswordPolicy, generatePassword, validatePasswordStrength } from "@/lib/password-policy";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, name, role, department, password, managerId, mustChangePassword = true } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email da ton tai" }, { status: 400 });
    }

    const policy = await getActivePasswordPolicy();
    const generatedPassword = password || generatePassword(policy);

    const strength = validatePasswordStrength(generatedPassword, policy);
    if (!strength.valid) {
      return NextResponse.json({ errors: strength.errors }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || "EMPLOYEE",
        department: department || null,
        managerId: managerId || null,
        passwordHash,
        mustChangePassword,
      },
    });

    await prisma.passwordHistory.create({
      data: { userId: user.id, passwordHash },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name || "",
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      newData: { email, name, role, department, managerId: managerId || null, mustChangePassword },
      description: "Tao nguoi dung: " + name,
      req,
    });

    const loginUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`;
    const emailResult = await sendEmail({
      to: user.email,
      ...emailTemplates.passwordReset({
        name: user.name,
        email: user.email,
        password: generatedPassword,
        url: loginUrl,
        locale: "vi",
        mustChangePassword,
      }),
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      ...userWithoutPassword,
      passwordSent: emailResult.success,
      mustChangePassword,
      devMode: (emailResult as any).dev || false,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
