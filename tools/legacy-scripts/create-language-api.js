const fs = require("fs");
const path = require("path");

// API GET/POST /api/admin/languages
const listCode = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const languages = await prisma.language.findMany({
    where: { isActive: true },
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
    const { code, name, flag } = await req.json();
    if (!code || !name) {
      return NextResponse.json({ error: "Thieu code hoac name" }, { status: 400 });
    }
    const lang = await prisma.language.create({
      data: { code, name, flag },
    });
    return NextResponse.json(lang, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`;

const file1 = path.join(__dirname, "src", "app", "api", "admin", "languages", "route.ts");
require("fs").mkdirSync(path.dirname(file1), { recursive: true });
require("fs").writeFileSync(file1, listCode);

// API GET/PUT/DELETE /api/admin/languages/[id]
const itemCode = `import { NextRequest, NextResponse } from "next/server";
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

const file2 = path.join(__dirname, "src", "app", "api", "admin", "languages", "[id]", "route.ts");
require("fs").mkdirSync(path.dirname(file2), { recursive: true });
require("fs").writeFileSync(file2, itemCode);

// API GET/PUT /api/admin/translations
const transCode = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all translations (grouped by language)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const languages = await prisma.language.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(languages);
}

// POST - cap nhat 1 translation key cho 1 language
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { languageId, key, value, category } = await req.json();
    if (!languageId || !key || value === undefined) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }
    const trans = await prisma.translation.upsert({
      where: { languageId_key: { languageId, key } },
      update: { value, category },
      create: { languageId, key, value, category },
    });
    return NextResponse.json(trans);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST batch update - import nhieu translation cung luc
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
    const results = await Promise.all(
      translations.map((t: any) =>
        prisma.translation.upsert({
          where: { languageId_key: { languageId: t.languageId, key: t.key } },
          update: { value: t.value, category: t.category },
          create: t,
        })
      )
    );
    return NextResponse.json({ count: results.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`;

const file3 = path.join(__dirname, "src", "app", "api", "admin", "translations", "route.ts");
require("fs").mkdirSync(path.dirname(file3), { recursive: true });
require("fs").writeFileSync(file3, transCode);

console.log("Created all language API routes");