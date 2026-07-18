import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rules = await prisma.workflowRule.findMany({
    include: { group: { select: { code: true, name: true } } },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const rule = await prisma.workflowRule.create({
      data: {
        name: body.name,
        description: body.description,
        conditionType: body.conditionType || "AMOUNT",
        operator: body.operator || ">=",
        value: body.value,
        requiredLevel: body.requiredLevel,
        groupId: body.groupId,
        priority: body.priority || "MEDIUM",
        order: body.order || 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(rule, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const rule = await prisma.workflowRule.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        value: data.value,
        requiredLevel: data.requiredLevel,
        groupId: data.groupId,
        isActive: data.isActive,
        order: data.order,
      },
    });
    return NextResponse.json(rule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
