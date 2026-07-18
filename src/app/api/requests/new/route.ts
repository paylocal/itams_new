import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getExchangeRateState } from "@/lib/exchange-rate";
import {
  getRequiredApprovalSteps,
  determineInitialStatus,
  findApproversInGroup,
} from "@/lib/workflow";

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

    const totalAmount = items.reduce(
      (sum: number, item: any) =>
        sum + (item.quantity || 1) * (item.unitPrice || 0),
      0
    );

    const fx = await getExchangeRateState({ refreshIfAuto: true });
    const totalAmountUsd = fx.effectiveVndPerUsd > 0 ? totalAmount / fx.effectiveVndPerUsd : totalAmount;

    const steps = await getRequiredApprovalSteps(totalAmountUsd);

    // Build approval chain by mapping each required step to an approver in the group
    const approvalChain: Array<{
      stepNumber: number;
      groupCode: string;
      approverId: string;
      approverEmail: string | null;
    }> = [];
    let stepNumber = 1;
    for (const step of steps) {
      const approvers = await findApproversInGroup(step.groupCode);
      if (approvers.length === 0) {
        return NextResponse.json(
          { error: `Nhom ${step.groupCode} chua co thanh vien de duyet` },
          { status: 400 }
        );
      }
      const approver = approvers[0];
      approvalChain.push({
        stepNumber,
        groupCode: step.groupCode,
        approverId: approver.id,
        approverEmail: approver.email,
      });
      stepNumber++;
    }

    // IT step is always last before stock check
    const itApprovers = await findApproversInGroup("IT");
    if (itApprovers.length === 0) {
      return NextResponse.json(
        { error: "Nhom IT chua co thanh vien" },
        { status: 400 }
      );
    }
    const itApprover = itApprovers[0];
    approvalChain.push({
      stepNumber,
      groupCode: "IT",
      approverId: itApprover.id,
      approverEmail: itApprover.email,
    });

    const initialStatus = determineInitialStatus(totalAmountUsd, steps);

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
        totalAmountUsd,
        status: initialStatus,
        currentStep: 1,
        approvalSteps: {
          create: approvalChain.map((step) => ({
            stepNumber: step.stepNumber,
            approverId: step.approverId,
          })),
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
      include: { items: true, requester: true, approvalSteps: { include: { approver: true } } },
    });

    // Send email to first approver
    const firstStep = approvalChain[0];
    try {
      if (firstStep.approverEmail) {
        await sendEmail({
          to: firstStep.approverEmail,
          subject: "[Quản lý yêu cầu và tài sản] YC moi can duyet",
          html: `
            <p>YC <b>${request.requestNumber}</b> can duyet.</p>
            <p>Gia tri: ${totalAmountUsd.toFixed(2)} USD (quy doi tu ${totalAmount} VND, ty gia ${fx.effectiveVndPerUsd} VND/USD).</p>
            <p><a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/approvals">Xem danh sach duyet</a></p>
          `,
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
