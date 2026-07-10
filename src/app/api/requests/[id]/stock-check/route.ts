import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.assetRequest.findUnique({
    where: { id: params.id },
    include: { requester: { select: { email: true, name: true } }, items: true },
  });

  if (!request) return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });

  // Only IT group members or admin can do stock check
  const isIT = await prisma.userGroupMember.findFirst({
    where: { userId: session.user.id, group: { code: "IT" } },
  });
  if (!isIT && session.user.role !== "ADMIN" && session.user.role !== "IT_STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (request.status !== "PENDING_STOCK_CHECK") {
    return NextResponse.json({ error: "Trang thai khong hop le" }, { status: 400 });
  }

  try {
    const { hasStock, comment } = await req.json();

    if (hasStock) {
      await prisma.assetRequest.update({
        where: { id: params.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      try {
        if (request.requester?.email) {
          await sendEmail({
            to: request.requester.email,
            subject: `[ITAMS] YC ${request.requestNumber} co the nhan hang`,
            html: `<p>YC <b>${request.requestNumber}</b> da co hang trong kho. Vui long lien he IT de nhan va ky bien ban ban giao.</p>`,
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }
      return NextResponse.json({ success: true, status: "COMPLETED" });
    } else {
      await prisma.assetRequest.update({
        where: { id: params.id },
        data: { status: "ORDERED" },
      });

      // Notify purchasing group
      const purchasing = await prisma.userGroupMember.findMany({
        where: { group: { code: "PURCHASING" } },
        include: { user: { select: { email: true } } },
      });
      for (const p of purchasing) {
        if (p.user.email) {
          try {
            await sendEmail({
              to: p.user.email,
              subject: `[ITAMS] YC ${request.requestNumber} can mua hang`,
              html: `<p>YC <b>${request.requestNumber}</b> khong du hang ton kho. Can tao PO de mua.</p>
                     <p>Ly do IT: ${comment || "Khong co"}</p>`,
            });
          } catch (e) {
            console.error("Email error:", e);
          }
        }
      }
      return NextResponse.json({ success: true, status: "ORDERED" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
