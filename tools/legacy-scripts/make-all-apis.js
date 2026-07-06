const fs = require("fs");
const path = require("path");

// 1. Public languages
const dir1 = path.join(__dirname, "src", "app", "api", "languages");
fs.mkdirSync(dir1, { recursive: true });
fs.writeFileSync(
  path.join(dir1, "route.ts"),
  `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const languages = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { code: true, name: true, flag: true, isDefault: true },
  });
  return NextResponse.json(languages);
}
`
);

// 2. Translations
const dir2 = path.join(__dirname, "src", "app", "api", "translations", "[locale]");
fs.mkdirSync(dir2, { recursive: true });
fs.writeFileSync(
  path.join(dir2, "route.ts"),
  `import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { locale: string } }) {
  const language = await prisma.language.findUnique({
    where: { code: params.locale },
    include: { translations: true },
  });
  if (!language) return NextResponse.json({});
  const dict = {};
  language.translations.forEach((t) => { dict[t.key] = t.value; });
  return NextResponse.json(dict);
}
`
);

// 3. Admin languages
const dir3 = path.join(__dirname, "src", "app", "api", "admin", "languages");
fs.mkdirSync(dir3, { recursive: true });
fs.writeFileSync(
  path.join(dir3, "route.ts"),
  `import { NextRequest, NextResponse } from "next/server";
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
    const { code, name, flag } = await req.json();
    if (!code || !name) {
      return NextResponse.json({ error: "Thieu code/name" }, { status: 400 });
    }
    const lang = await prisma.language.create({ data: { code, name, flag } });
    return NextResponse.json(lang, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`
);

// 4. Admin language by id
const dir4 = path.join(__dirname, "src", "app", "api", "admin", "languages", "[id]");
fs.mkdirSync(dir4, { recursive: true });
fs.writeFileSync(
  path.join(dir4, "route.ts"),
  `import { NextRequest, NextResponse } from "next/server";
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
    const lang = await prisma.language.update({ where: { id: params.id }, data });
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
`
);

console.log("All APIs created");