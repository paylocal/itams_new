const fs = require("fs");
const path = require("path");

const code = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { signature, role } = await req.json();

    if (!signature) {
      return NextResponse.json({ error: "Thieu chu ky" }, { status: 400 });
    }

    const handover = await prisma.handover.findUnique({
      where: { id: params.id },
      include: {
        employee: true,
        items: { include: { asset: true } },
      },
    });

    if (!handover) {
      return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });
    }

    if (role === "EMPLOYEE") {
      if (handover.employeeId !== session.user.id) {
        return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
      }
      if (handover.status !== "PENDING_EMPLOYEE_SIGN") {
        return NextResponse.json({ error: "Trang thai khong hop le" }, { status: 400 });
      }

      await prisma.handover.update({
        where: { id: params.id },
        data: {
          employeeSignature: signature,
          employeeSignedAt: new Date(),
          status: "PENDING_IT_SIGN",
        },
      });

      await logAudit({
        userId: session.user.id,
        userName: session.user.name || "",
        action: "SIGN",
        entity: "Handover",
        entityId: params.id,
        description: "Nhan vien ky ban giao " + handover.handoverNumber,
        req,
      });
    } else if (role === "IT") {
      if (session.user.role !== "IT_STAFF" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
      }
      if (handover.status !== "PENDING_IT_SIGN") {
        return NextResponse.json({ error: "NV phai ky truoc" }, { status: 400 });
      }

      // Cap nhat asset va request
      await prisma.$transaction(async (tx) => {
        await tx.handover.update({
          where: { id: params.id },
          data: {
            itSignature: signature,
            itSignedAt: new Date(),
            status: "COMPLETED",
          },
        });

        // Gan asset cho NV
        for (const item of handover.items) {
          await tx.asset.update({
            where: { id: item.assetId },
            data: {
              currentHolderId: handover.employeeId,
              status: "ASSIGNED",
              assignedDate: new Date(),
              location: handover.employee.department,
            },
          });
          await tx.assetHistory.create({
            data: {
              assetId: item.assetId,
              action: "ASSIGNED",
              toUserId: handover.employeeId,
              performedBy: session.user.id,
              notes: "Ban giao qua " + handover.handoverNumber,
            },
          });
        }

        // Cap nhat request
        await tx.assetRequest.update({
          where: { id: handover.requestId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      });

      await logAudit({
        userId: session.user.id,
        userName: session.user.name || "",
        action: "SIGN",
        entity: "Handover",
        entityId: params.id,
        description: "IT ky hoan tat ban giao " + handover.handoverNumber,
        req,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Sign error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

const dir = path.join(__dirname, "src", "app", "api", "handover", "[id]", "sign");
const file = path.join(dir, "route.ts");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);