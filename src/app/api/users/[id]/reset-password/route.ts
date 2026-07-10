import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getActivePasswordPolicy, validatePasswordStrength, recordPasswordChange } from "@/lib/password-policy";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { newPassword } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const password = newPassword || "Password123!";
    const policy = await getActivePasswordPolicy();
    const strength = validatePasswordStrength(password, policy);
    if (!strength.valid) {
      return NextResponse.json({ errors: strength.errors }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    await recordPasswordChange(user.id, hash);

    // Force user to change password on next login if default used
    await prisma.user.update({
      where: { id: user.id },
      data: { mustChangePassword: !newPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
