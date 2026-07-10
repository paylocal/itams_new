import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  getActivePasswordPolicy,
  validatePasswordStrength,
  generatePassword,
  recordPasswordChange,
} from "@/lib/password-policy";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { newPassword, mustChangePassword = true } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const policy = await getActivePasswordPolicy();
    const password = newPassword || generatePassword(policy);

    const strength = validatePasswordStrength(password, policy);
    if (!strength.valid) {
      return NextResponse.json({ errors: strength.errors }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    await recordPasswordChange(user.id, hash);

    await prisma.user.update({
      where: { id: user.id },
      data: { mustChangePassword },
    });

    const loginUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`;
    const emailResult = await sendEmail({
      to: user.email,
      ...emailTemplates.passwordReset({
        name: user.name,
        email: user.email,
        password,
        url: loginUrl,
        locale: "vi",
        mustChangePassword,
      }),
    });

    return NextResponse.json({
      success: true,
      passwordSent: emailResult.success,
      mustChangePassword,
      devMode: (emailResult as any).dev || false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
