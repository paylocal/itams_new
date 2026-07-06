const fs = require("fs");
const path = require("path");

// Tao thu muc bang Node
const dirs = [
  "src/app/api/device-categories/[id]",
  "src/app/api/suppliers/[id]",
];

dirs.forEach((d) => {
  const fullPath = path.join(__dirname, d);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log("Created dir:", fullPath);
  }
});

// Tao API device-categories [id]
const file1 = path.join(
  __dirname,
  "src/app/api/device-categories/[id]/route.ts"
);
const code1 = `import { NextRequest, NextResponse } from "next/server";
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
    const cat = await prisma.deviceCategory.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(cat);
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
    await prisma.deviceCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`;
fs.writeFileSync(file1, code1, "utf-8");
console.log("Created:", file1);

// Tao API suppliers [id]
const file2 = path.join(
  __dirname,
  "src/app/api/suppliers/[id]/route.ts"
);
const code2 = `import { NextRequest, NextResponse } from "next/server";
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
    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(supplier);
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
    await prisma.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`;
fs.writeFileSync(file2, code2, "utf-8");
console.log("Created:", file2);

console.log("\nDone! Size:");
console.log("File 1:", fs.statSync(file1).size, "bytes");
console.log("File 2:", fs.statSync(file2).size, "bytes");