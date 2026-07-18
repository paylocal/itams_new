import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "PURCHASING" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const requestId = formData.get("requestId") as string;
    const supplierName = formData.get("supplierName") as string;
    const supplierContact = formData.get("supplierContact") as string;
    const supplierPhone = formData.get("supplierPhone") as string;
    const expectedDate = formData.get("expectedDate") as string;
    const totalAmount = parseFloat(formData.get("totalAmount") as string);
    const notes = formData.get("notes") as string;
    const poFile = formData.get("poFile") as File | null;

    if (!requestId || !supplierName || !expectedDate || !totalAmount) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }

    // Upload file
    let poDocument: string | null = null;
    if (poFile && poFile.size > 0) {
      const bytes = await poFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads", "po");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${poFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      poDocument = `/uploads/po/${filename}`;
    }

    // Sinh ma PO
    const count = await prisma.purchaseOrder.count();
    const year = new Date().getFullYear();
    const poNumber = `PO-${year}-${String(count + 1).padStart(5, "0")}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierName,
        supplierContact: supplierContact || null,
        supplierPhone: supplierPhone || null,
        expectedDate: new Date(expectedDate),
        totalAmount,
        poDocument,
        notes: notes || null,
        status: "SENT",
        requests: {
          create: [{ requestId }],
        },
      },
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error: any) {
    console.error("Create PO error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}