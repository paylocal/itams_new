import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  getActivePasswordPolicy,
  validatePasswordStrength,
  isPasswordReused,
  recordPasswordChange,
} from "@/lib/password-policy";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { currentPassword, newPassword, confirmPassword } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ errors: ["Mat khau hien tai khong dung"] }, { status: 400 });

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ errors: ["Mat khau moi khong khop"] }, { status: 400 });
    }

    const policy = await getActivePasswordPolicy();
    const strength = validatePasswordStrength(newPassword, policy);
    if (!strength.valid) {
      return NextResponse.json({ errors: strength.errors }, { status: 400 });
    }

    const reused = await isPasswordReused(user.id, newPassword, policy);
    if (reused) {
      return NextResponse.json(
        { errors: [`Mat khau moi khong duoc trung voi ${policy.preventReuseCount} mat khau gan nhat`] },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await recordPasswordChange(user.id, hash);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
