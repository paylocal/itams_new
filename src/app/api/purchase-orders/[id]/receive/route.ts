import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAssetTag, generateQRCode } from "@/lib/asset-helpers";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isIT = await prisma.userGroupMember.findFirst({
    where: { userId: session.user.id, group: { code: "IT" } },
  });
  if (!isIT && session.user.role !== "IT_STAFF" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { actualDate, note } = body || {};

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            requestItem: {
              include: { category: true, deviceModel: true, request: true },
            },
          },
        },
        requests: { include: { request: { include: { items: true } } } },
      },
    });
    if (!po) return NextResponse.json({ error: "Khong tim thay PO" }, { status: 404 });
    if (po.status === "DELIVERED") {
      return NextResponse.json({ error: "PO da duoc nhan" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrder.update({
        where: { id: params.id },
        data: {
          status: "DELIVERED",
          actualDate: actualDate ? new Date(actualDate) : new Date(),
          notes: note || po.notes,
        },
      });

      // Tao assets tu PO items
      for (const poItem of po.items) {
        const ri = poItem.requestItem;
        const qty = poItem.quantity;
        for (let i = 0; i < qty; i++) {
          const assetTag = await generateAssetTag(ri?.category?.code || "AST");
          const qrCode = generateQRCode(assetTag);
          const name = ri?.deviceModel
            ? `${ri.deviceModel.brand} ${ri.deviceModel.name}`
            : ri?.customName || poItem.productName;
          await tx.asset.create({
            data: {
              assetTag,
              qrCode,
              name,
              category: ri?.category?.code || "OTHER",
              brand: ri?.deviceModel?.brand || null,
              model: ri?.deviceModel?.name || null,
              status: "IN_STOCK",
              requestId: ri?.requestId || poItem.requestId,
              purchaseOrderId: po.id,
              receivedDate: actualDate ? new Date(actualDate) : new Date(),
            },
          });
        }
      }

      // Cap nhat trang thai cac YC lien quan
      for (const pr of po.requests) {
        const requestItems = pr.request.items;
        // Count da nhan (assets) cho moi requestItem
        const assetCounts = new Map<string, number>();
        const poItemsForRequest = po.items.filter(
          (p) => p.requestItem?.requestId === pr.requestId || p.requestId === pr.requestId
        );
        for (const p of poItemsForRequest) {
          if (p.requestItemId) {
            assetCounts.set(p.requestItemId, (assetCounts.get(p.requestItemId) || 0) + p.quantity);
          }
        }

        // Tinh toan tong da nhan cho tung requestItem (across all POs)
        const deliveredCounts = new Map<string, number>();
        const allPoItems = await tx.pOItem.findMany({
          where: { requestItemId: { in: requestItems.map((i) => i.id) } },
        });
        for (const p of allPoItems) {
          const poRecord = await tx.purchaseOrder.findUnique({ where: { id: p.poId } });
          if (poRecord?.status === "DELIVERED" && p.requestItemId) {
            deliveredCounts.set(
              p.requestItemId,
              (deliveredCounts.get(p.requestItemId) || 0) + p.quantity
            );
          }
        }

        const allDelivered = requestItems.every(
          (item) => (deliveredCounts.get(item.id) || 0) >= item.quantity
        );

        if (allDelivered && pr.request.status !== "COMPLETED" && pr.request.status !== "DELIVERED") {
          await tx.assetRequest.update({
            where: { id: pr.requestId },
            data: { status: "DELIVERED" },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
