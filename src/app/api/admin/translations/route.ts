import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const languages = await prisma.language.findMany({
      include: { translations: { orderBy: { key: "asc" } } },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(languages);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { languageCode, key, value, category } = await req.json();
    if (!languageCode || !key || value === undefined) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }
    const lang = await prisma.language.findUnique({ where: { code: languageCode } });
    if (!lang) {
      return NextResponse.json({ error: "Khong tim thay ngon ngu" }, { status: 404 });
    }
    const trans = await prisma.translation.upsert({
      where: { languageId_key: { languageId: lang.id, key } },
      update: { value, category: category || key.split(".")[0] },
      create: { languageId: lang.id, key, value, category: category || key.split(".")[0] },
    });
    return NextResponse.json(trans);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { translations } = await req.json();
    if (!Array.isArray(translations)) {
      return NextResponse.json({ error: "Phai la array" }, { status: 400 });
    }
    let count = 0;
    for (const t of translations) {
      if (!t.languageCode || !t.key || t.value === undefined) continue;
      const lang = await prisma.language.findUnique({ where: { code: t.languageCode } });
      if (!lang) continue;
      await prisma.translation.upsert({
        where: { languageId_key: { languageId: lang.id, key: t.key } },
        update: { value: t.value, category: t.category || t.key.split(".")[0] },
        create: {
          languageId: lang.id,
          key: t.key,
          value: t.value,
          category: t.category || t.key.split(".")[0],
        },
      });
      count++;
    }
    return NextResponse.json({ count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get("languageCode");
    const key = searchParams.get("key");
    if (!languageCode || !key) {
      return NextResponse.json({ error: "Thieu params" }, { status: 400 });
    }
    const lang = await prisma.language.findUnique({ where: { code: languageCode } });
    if (!lang) return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });
    await prisma.translation.delete({
      where: { languageId_key: { languageId: lang.id, key } },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}