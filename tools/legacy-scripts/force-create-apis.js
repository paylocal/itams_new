const fs = require("fs");
const path = require("path");

const dirs = [
  "src/app/api/device-categories/[id]",
  "src/app/api/suppliers/[id]"
];

dirs.forEach(d => {
  const p = path.join(__dirname, d);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log("Dir:", p);
  }
});

const f1 = path.join(__dirname, "src/app/api/device-categories/[id]/route.ts");
const c1 = 'import { NextRequest, NextResponse } from "next/server";\n' +
  'import { getServerSession } from "next-auth";\n' +
  'import { authOptions } from "@/lib/auth";\n' +
  'import { prisma } from "@/lib/prisma";\n\n' +
  'export async function PUT(req, { params }) {\n' +
  "  const session = await getServerSession(authOptions);\n" +
  '  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });\n' +
  "  try {\n" +
  "    const data = await req.json();\n" +
  "    const cat = await prisma.deviceCategory.update({ where: { id: params.id }, data });\n" +
  "    return NextResponse.json(cat);\n" +
  "  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }\n" +
  "}\n\n" +
  'export async function DELETE(req, { params }) {\n' +
  "  const session = await getServerSession(authOptions);\n" +
  '  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });\n' +
  "  try {\n" +
  "    await prisma.deviceCategory.delete({ where: { id: params.id } });\n" +
  "    return NextResponse.json({ success: true });\n" +
  "  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }\n" +
  "}";

fs.writeFileSync(f1, c1);
console.log("OK:", f1);

const f2 = path.join(__dirname, "src/app/api/suppliers/[id]/route.ts");
const c2 = 'import { NextRequest, NextResponse } from "next/server";\n' +
  'import { getServerSession } from "next-auth";\n' +
  'import { authOptions } from "@/lib/auth";\n' +
  'import { prisma } from "@/lib/prisma";\n\n' +
  'export async function PUT(req, { params }) {\n' +
  "  const session = await getServerSession(authOptions);\n" +
  '  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });\n' +
  "  try {\n" +
  "    const data = await req.json();\n" +
  "    const supplier = await prisma.supplier.update({ where: { id: params.id }, data });\n" +
  "    return NextResponse.json(supplier);\n" +
  "  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }\n" +
  "}\n\n" +
  'export async function DELETE(req, { params }) {\n' +
  "  const session = await getServerSession(authOptions);\n" +
  '  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });\n' +
  "  try {\n" +
  "    await prisma.supplier.delete({ where: { id: params.id } });\n" +
  "    return NextResponse.json({ success: true });\n" +
  "  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }\n" +
  "}";

fs.writeFileSync(f2, c2);
console.log("OK:", f2);
