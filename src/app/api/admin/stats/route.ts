import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [requests, assets, pos, users, pending, completed] = await Promise.all([
      prisma.assetRequest.count(),
      prisma.asset.count(),
      prisma.purchaseOrder.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.assetRequest.count({
        where: {
          status: {
            in: ["PENDING_MANAGER", "PENDING_LEAD", "PENDING_IT", "PENDING_PURCHASING"],
          },
        },
      }),
      prisma.assetRequest.count({ where: { status: "COMPLETED" } }),
    ]);
    return NextResponse.json({ requests, assets, pos, users, pending, completed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
