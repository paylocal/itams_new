import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET() {
  const langs = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { code: true, name: true, flag: true, isDefault: true },
  });
  return NextResponse.json(langs);
}
