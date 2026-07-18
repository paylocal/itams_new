import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";

// PUT - Cap nhat thong tin user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, role, department, password, managerId } = await req.json();
    const old = await prisma.user.findUnique({ where: { id: params.id } });
    if (!old) {
      return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (department !== undefined) data.department = department || null;
    if (managerId !== undefined) data.managerId = managerId || null;
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name || "",
      action: "UPDATE",
      entity: "User",
      entityId: params.id,
      oldData: { name: old.name, role: old.role, department: old.department, managerId: old.managerId },
      newData: data,
      description: "Cap nhat nguoi dung: " + user.name,
      req,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Toggle active
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { isActive } = await req.json();
    const old = await prisma.user.findUnique({ where: { id: params.id } });
    if (!old) {
      return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isActive },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name || "",
      action: "UPDATE",
      entity: "User",
      entityId: params.id,
      oldData: { isActive: old.isActive },
      newData: { isActive },
      description: (isActive ? "Kich hoat" : "Vo hieu hoa") + " user: " + user.name,
      req,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
