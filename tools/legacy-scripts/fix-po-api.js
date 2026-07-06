const fs = require("fs");
const path = require("path");

const code = `import { NextRequest, NextResponse } from "next/server";
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
    const supplierName = formData.get("supplierName") as string;
    const supplierContact = formData.get("supplierContact") as string;
    const supplierPhone = formData.get("supplierPhone") as string;
    const expectedDate = formData.get("expectedDate") as string;
    const notes = formData.get("notes") as string;
    const poFile = formData.get("poFile") as File | null;
    // Nhan mang cac itemId can mua
    const itemIds = formData.getAll("itemIds") as string[];

    if (!supplierName || !expectedDate || itemIds.length === 0) {
      return NextResponse.json(
        { error: "Thieu thong tin (NCC, ngay giao, hoac items)" },
        { status: 400 }
      );
    }

    // Lay thong tin cac items
    const items = await prisma.requestItem.findMany({
      where: { id: { in: itemIds } },
      include: { deviceModel: true, request: true },
    });

    if (items.length === 0) {
      return NextResponse.json({ error: "Khong tim thay items" }, { status: 400 });
    }

    // Kiem tra cac items chua co PO
    const existingPOItems = await prisma.pOItem.findMany({
      where: { requestItemId: { in: itemIds } },
    });

    if (existingPOItems.length > 0) {
      return NextResponse.json(
        { error: "Mot so items da co PO: " + existingPOItems.map(i => i.requestItemId).join(", ") },
        { status: 400 }
      );
    }

    // Tinh tong tien
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    // Upload file PO
    let poDocument: string | null = null;
    if (poFile && poFile.size > 0) {
      const bytes = await poFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads", "po");
      await mkdir(uploadDir, { recursive: true });
      const safeName = poFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const filename = Date.now() + "-" + safeName;
      await writeFile(path.join(uploadDir, filename), buffer);
      poDocument = "/uploads/po/" + filename;
    }

    // Sinh ma PO
    const count = await prisma.purchaseOrder.count();
    const year = new Date().getFullYear();
    const poNumber = "PO-" + year + "-" + String(count + 1).padStart(5, "0");

    // Lay danh sach requestId tu items
    const requestIds = [...new Set(items.map((i) => i.requestId))];

    // Tao PO
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
        // N-N voi request
        requests: {
          create: requestIds.map((requestId) => ({ requestId })),
        },
        // POItem - moi item 1 dong
        items: {
          create: items.map((item) => ({
            requestItemId: item.id,
            productName: item.deviceModel
              ? item.deviceModel.brand + " " + item.deviceModel.name
              : item.customName || "San pham",
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
          })),
        },
      },
      include: {
        items: true,
        requests: { include: { request: true } },
      },
    });

    // Check xem cac YC da hoan thanh chua
    await checkRequestsCompletion(requestIds);

    return NextResponse.json(po, { status: 201 });
  } catch (error: any) {
    console.error("Create PO error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Ham kiem tra YC da hoan thanh chua (tat ca items co PO)
async function checkRequestsCompletion(requestIds: string[]) {
  for (const requestId of requestIds) {
    const request = await prisma.assetRequest.findUnique({
      where: { id: requestId },
      include: { items: true },
    });

    if (!request) continue;

    // Lay cac item da co PO
    const poItems = await prisma.pOItem.findMany({
      where: { requestItemId: { in: request.items.map((i) => i.id) } },
    });

    const poItemIds = new Set(poItems.map((p) => p.requestItemId));
    const allItemsHavePO = request.items.every((item) => poItemIds.has(item.id));

    // Neu tat ca items co PO va YC dang o ORDERED -> chuyen sang COMPLETED
    if (allItemsHavePO && request.status === "ORDERED") {
      await prisma.assetRequest.update({
        where: { id: requestId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      console.log("YC " + request.requestNumber + " da hoan thanh!");
    }
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      requests: {
        include: { request: { include: { requester: true } } },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(purchaseOrders);
}
`;

const file = path.join(__dirname, "src", "app", "api", "purchase-orders", "route.ts");
fs.writeFileSync(file, code);
console.log("Created:", file);
