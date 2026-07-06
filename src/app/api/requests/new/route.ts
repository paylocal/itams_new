import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";
import { buildApprovalChain, ensureGroupWorkflowTables, statusForGroupLevel } from "@/lib/group-workflow";
import { getExchangeRateState } from "@/lib/exchange-rate";

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

    await ensureGroupWorkflowTables();
    const dynamicChain = await buildApprovalChain(session.user.id, totalAmountUsd);

    const count = await prisma.assetRequest.count();
    const year = new Date().getFullYear();
    const requestNumber = `REQ-${year}-${String(count + 1).padStart(5, "0")}`;

    if (dynamicChain.length > 0) {
      const firstStep = dynamicChain[0];
      if (!firstStep.approverId) {
        return NextResponse.json({ error: "Chua co nguoi duyet hop le trong flow" }, { status: 400 });
      }
      if (dynamicChain.some((step) => !step.approverId)) {
        return NextResponse.json(
          { error: "Flow co buoc chua map duoc nguoi duyet theo quan he manager" },
          { status: 400 }
        );
      }

      const request = await prisma.assetRequest.create({
        data: {
          requestNumber,
          requesterId: session.user.id,
          title,
          reason,
          priority: priority || "NORMAL",
          totalAmount,
          status: statusForGroupLevel(firstStep.groupLevel),
          currentStep: 1,
          approvalSteps: {
            create: dynamicChain.map((step, index) => ({
              stepNumber: index + 1,
              approverId: step.approverId!,
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
        include: { items: true, requester: true },
      });

      try {
        if (firstStep.approverEmail) {
          await sendEmail({
            to: firstStep.approverEmail,
            subject: "[ITAMS] YC moi can duyet",
            html:
              "<p>YC <b>" +
              request.requestNumber +
              "</b> can duyet theo flow duoc cau hinh. Gia tri: " +
              totalAmountUsd.toFixed(2) +
              " USD (quy doi tu " +
              totalAmount +
              " VND, ty gia " +
              fx.effectiveVndPerUsd +
              " VND/USD).</p>",
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }

      return NextResponse.json(request, { status: 201 });
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

    const thresholdConfig = await prisma.sLAConfig.findUnique({
      where: { stepName: "LEAD_APPROVAL_THRESHOLD_USD" },
    });
    const leadThreshold = thresholdConfig?.hoursToApprove ?? 5000;
    const requireLeadApproval = totalAmountUsd > leadThreshold;

    const leadUser = requireLeadApproval
      ? await prisma.user.findFirst({
          where: { role: "LEAD", isActive: true },
          select: { id: true, name: true, email: true },
        })
      : null;

    if (requireLeadApproval && !leadUser) {
      return NextResponse.json(
        { error: "Don vuot nguong nhung chua cau hinh nguoi duyet LEAD" },
        { status: 400 }
      );
    }

    const legacyRequest = await prisma.assetRequest.create({
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
          create: [
            { stepNumber: 1, approverId: user.managerId },
            ...(leadUser ? [{ stepNumber: 2, approverId: leadUser.id }] : []),
          ],
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
          requestNumber: legacyRequest.requestNumber,
          title: legacyRequest.title,
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

      if (leadUser?.email) {
        await sendEmail({
          to: leadUser.email,
          subject: "[ITAMS] Co yc vuot nguong can Lead duyet",
          html:
            "<p>YC <b>" +
            legacyRequest.requestNumber +
            "</b> co tong gia tri " +
            totalAmountUsd.toFixed(2) +
            " USD (quy doi tu " +
            totalAmount +
            " VND, ty gia " +
            fx.effectiveVndPerUsd +
            " VND/USD), se can Lead duyet sau buoc Manager.</p>",
        });
      }
    } catch (e) {
      console.error("Email error:", e);
    }

    return NextResponse.json(legacyRequest, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}