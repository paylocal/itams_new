import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const models = await prisma.deviceModel.findMany({
    include: { category: { select: { name: true, code: true } } },
    orderBy: [{ categoryId: "asc" }, { brand: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(models);
}

export async function POST(req: NextRequest) {
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
