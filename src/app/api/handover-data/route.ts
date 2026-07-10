import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Chi IT staff duoc tao handover
  if (session.user.role !== "IT_STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const requests = await prisma.assetRequest.findMany({
      where: { status: "COMPLETED" },
      include: { requester: { select: { id: true, name: true, department: true } } },
      orderBy: { createdAt: "desc" },
    });

    const assets = await prisma.asset.findMany({
      where: { status: { in: ["NEW", "IN_STOCK"] } },
      select: {
        id: true,
        assetTag: true,
        name: true,
        category: true,
        brand: true,
        model: true,
        serialNumber: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests, assets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
