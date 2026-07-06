const fs = require("fs");
const path = require("path");

// 1. Tao API GET/POST cho /api/admin/translations
const transApiCode = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const languages = await prisma.language.findMany({
    include: { translations: { orderBy: { key: "asc" } } },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(languages);
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
    const lang = await prisma.language.findUnique({
      where: { code: languageCode },
    });
    if (!lang) {
      return NextResponse.json({ error: "Khong tim thay ngon ngu" }, { status: 404 });
    }
    const trans = await prisma.translation.upsert({
      where: { languageId_key: { languageId: lang.id, key } },
      update: { value, category: category || key.split(".")[0] },
      create: {
        languageId: lang.id,
        key,
        value,
        category: category || key.split(".")[0],
      },
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
      return NextResponse.json({ error: "translations phai la array" }, { status: 400 });
    }
    let count = 0;
    for (const t of translations) {
      if (!t.languageCode || !t.key || t.value === undefined) continue;
      const lang = await prisma.language.findUnique({
        where: { code: t.languageCode },
      });
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
    const lang = await prisma.language.findUnique({
      where: { code: languageCode },
    });
    if (!lang) return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });
    await prisma.translation.delete({
      where: { languageId_key: { languageId: lang.id, key } },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`;

const transDir = path.join(__dirname, "src/app/api/admin/translations");
fs.mkdirSync(transDir, { recursive: true });
fs.writeFileSync(path.join(transDir, "route.ts"), transApiCode);
console.log("Created admin translations API");

// 2. Tao API GET/PUT cho /api/admin/languages
const langsApiCode = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const languages = await prisma.language.findMany({
    include: { _count: { select: { translations: true } } },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(languages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { code, name, flag, isDefault } = await req.json();
    if (!code || !name) {
      return NextResponse.json({ error: "Thieu code/name" }, { status: 400 });
    }
    if (isDefault) {
      await prisma.language.updateMany({
        where: { id: { not: undefined } },
        data: { isDefault: false },
      });
    }
    const lang = await prisma.language.create({
      data: { code, name, flag, isDefault: !!isDefault },
    });
    return NextResponse.json(lang, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`;

const langsDir = path.join(__dirname, "src/app/api/admin/languages");
fs.mkdirSync(langsDir, { recursive: true });
fs.writeFileSync(path.join(langsDir, "route.ts"), langsApiCode);
console.log("Created admin languages API");

// 3. Tao API PUT/DELETE cho /api/admin/languages/[id]
const langItemCode = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = await req.json();
    const lang = await prisma.language.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(lang);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await prisma.language.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`;

const langItemDir = path.join(__dirname, "src/app/api/admin/languages/[id]");
fs.mkdirSync(langItemDir, { recursive: true });
fs.writeFileSync(path.join(langItemDir, "route.ts"), langItemCode);
console.log("Created admin languages [id] API");

console.log("\nAll admin APIs created");