const fs = require("fs");
const path = require("path");

// 1. API device-categories [id]
const dir1 = path.join(__dirname, "src", "app", "api", "device-categories", "[id]");
fs.mkdirSync(dir1, { recursive: true });
fs.writeFileSync(
  path.join(dir1, "route.ts"),
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
`
);

// 2. API suppliers (list + create)
const dir2 = path.join(__dirname, "src", "app", "api", "suppliers");
fs.mkdirSync(dir2, { recursive: true });
fs.writeFileSync(
  path.join(dir2, "route.ts"),
  `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(suppliers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ error: "Thieu ten" }, { status: 400 });
    }
    const count = await prisma.supplier.count();
    const code = "NCC" + String(count + 1).padStart(4, "0");
    const supplier = await prisma.supplier.create({
      data: {
        code,
        name: data.name,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        taxCode: data.taxCode,
      },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
`
);

// 3. API suppliers [id]
const dir3 = path.join(__dirname, "src", "app", "api", "suppliers", "[id]");
fs.mkdirSync(dir3, { recursive: true });
fs.writeFileSync(
  path.join(dir3, "route.ts"),
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
`
);

console.log("All missing API files created");