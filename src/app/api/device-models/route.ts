import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const models = await prisma.deviceModel.findMany({
    include: { category: { select: { name: true, code: true } } },
    orderBy: [{ categoryId: "asc" }, { brand: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(models);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { categoryId, brand, name, avgPrice } = await req.json();
    if (!categoryId || !brand || !name) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }
    const model = await prisma.deviceModel.create({
      data: { categoryId, brand, name, avgPrice },
    });
    return NextResponse.json(model, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
