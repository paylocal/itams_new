import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateHandoverNumber(year: number, index: number) {
  return `BBBG-${year}-${String(index + 1).padStart(5, "0")}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isIT = await prisma.userGroupMember.findFirst({
    where: { userId: session.user.id, group: { code: "IT" } },
  });
  if (!isIT && session.user.role !== "IT_STAFF" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { requestId, employeeId, handoverDate, assetIds } = body || {};

    if (!requestId || !employeeId || !handoverDate || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }

    const request = await prisma.assetRequest.findUnique({
      where: { id: requestId },
      include: { items: true, requester: true },
    });
    if (!request) return NextResponse.json({ error: "Khong tim thay yeu cau" }, { status: 404 });

    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
    });
    if (assets.length !== assetIds.length) {
      return NextResponse.json({ error: "Mot so tai san khong ton tai" }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const count = await prisma.handover.count({
      where: { handoverNumber: { startsWith: `BBBG-${year}-` } },
    });
    const handoverNumber = generateHandoverNumber(year, count);

    const handover = await prisma.handover.create({
      data: {
        handoverNumber,
        requestId,
        employeeId,
        itStaffId: session.user.id,
        handoverDate: new Date(handoverDate),
        status: "PENDING_EMPLOYEE_SIGN",
        items: {
          create: assetIds.map((assetId: string) => ({ assetId })),
        },
      },
      include: {
        employee: { select: { id: true, name: true, department: true } },
        itStaff: { select: { id: true, name: true } },
        items: { include: { asset: { select: { id: true, assetTag: true, name: true } } } },
      },
    });

    return NextResponse.json(handover, { status: 201 });
  } catch (error: any) {
    console.error("Create handover error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const handovers = await prisma.handover.findMany({
      where: session.user.role === "EMPLOYEE" ? { employeeId: session.user.id } : {},
      include: {
        employee: { select: { id: true, name: true, department: true } },
        itStaff: { select: { name: true } },
        items: { include: { asset: { select: { assetTag: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(handovers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
