import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const policy = await prisma.passwordPolicy.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!policy) {
    const defaultPolicy = await prisma.passwordPolicy.create({
      data: {
        id: "default",
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
        passwordExpiryDays: 90,
        preventReuseCount: 3,
        lockoutAfterFailedAttempts: 5,
      },
    });
    return NextResponse.json(defaultPolicy);
  }
  return NextResponse.json(policy);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const policy = await prisma.passwordPolicy.upsert({
      where: { id: body.id || "default" },
      update: {
        minLength: body.minLength,
        requireUppercase: body.requireUppercase,
        requireLowercase: body.requireLowercase,
        requireNumber: body.requireNumber,
        requireSpecial: body.requireSpecial,
        passwordExpiryDays: body.passwordExpiryDays,
        preventReuseCount: body.preventReuseCount,
        lockoutAfterFailedAttempts: body.lockoutAfterFailedAttempts,
        isActive: true,
      },
      create: {
        id: "default",
        minLength: body.minLength,
        requireUppercase: body.requireUppercase,
        requireLowercase: body.requireLowercase,
        requireNumber: body.requireNumber,
        requireSpecial: body.requireSpecial,
        passwordExpiryDays: body.passwordExpiryDays,
        preventReuseCount: body.preventReuseCount,
        lockoutAfterFailedAttempts: body.lockoutAfterFailedAttempts,
        isActive: true,
      },
    });
    return NextResponse.json(policy);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
