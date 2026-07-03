import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, reason, priority, items } = body;

    if (!title || !reason) {
      return NextResponse.json({ error: "Thieu tieu de hoac ly do" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Phai co it nhat 1 hang" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        managerId: true,
        manager: { select: { name: true, email: true } },
      },
    });

    if (!user?.managerId) {
      return NextResponse.json({ error: "Chua co quan ly" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) =>
        sum + (item.quantity || 1) * (item.unitPrice || 0),
      0
    );

    const count = await prisma.assetRequest.count();
    const year = new Date().getFullYear();
    const requestNumber = `REQ-${year}-${String(count + 1).padStart(5, "0")}`;

    const request = await prisma.assetRequest.create({
      data: {
        requestNumber,
        requesterId: session.user.id,
        title,
        reason,
        priority: priority || "NORMAL",
        totalAmount,
        status: "PENDING_MANAGER",
        currentStep: 1,
        approvalSteps: {
          create: { stepNumber: 1, approverId: user.managerId },
        },
        items: {
          create: items.map((item: any) => ({
            categoryId: item.categoryId,
            deviceModelId: item.deviceModelId || null,
            customName: item.customName || null,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || null,
            totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
            specs: item.specs || null,
          })),
        },
      },
      include: { items: true, requester: true },
    });

    // Gui email cho manager
    try {
      if (user.manager?.email) {
        const template = emailTemplates.requestCreated({
          requestNumber: request.requestNumber,
          title: request.title,
          requesterName: session.user.name || "",
          managerName: user.manager.name,
          url:
            (process.env.NEXTAUTH_URL || "http://localhost:3000") +
            "/approvals",
        });
        await sendEmail({
          to: user.manager.email,
          subject: template.subject,
          html: template.html,
        });
      }
    } catch (e) {
      console.error("Email error:", e);
    }

    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}