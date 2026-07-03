const fs = require("fs");
const path = require("path");

const code = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";
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
    const { decision, comment } = await req.json();

    const request = await prisma.assetRequest.findUnique({
      where: { id: params.id },
      include: {
        requester: true,
        approvalSteps: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const currentStep = request.currentStep;
    let canApprove = false;

    if (currentStep === 1 && session.user.role === "MANAGER") {
      if (request.requester.managerId === session.user.id) canApprove = true;
    } else if (currentStep === 2 && session.user.role === "IT_STAFF") {
      canApprove = true;
    } else if (session.user.role === "ADMIN") {
      canApprove = true;
    }

    if (!canApprove) {
      return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
    }

    // ============================================
    // XU LY REJECTED
    // ============================================
    if (decision === "REJECTED") {
      if (!comment || !comment.trim()) {
        return NextResponse.json(
          { error: "Nhap ly do tu choi" },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.approvalStep.update({
          where: {
            requestId_stepNumber: {
              requestId: params.id,
              stepNumber: currentStep,
            },
          },
          data: {
            approverId: session.user.id,
            decision: "REJECTED",
            comment,
            decidedAt: new Date(),
          },
        }),
        prisma.assetRequest.update({
          where: { id: params.id },
          data: { status: "DRAFT", currentStep: 1, isLocked: false },
        }),
      ]);

      // GUI EMAIL CHO NV
      try {
        if (request.requester.email) {
          const t = emailTemplates.requestRejected({
            requestNumber: request.requestNumber,
            title: request.title,
            requesterName: request.requester.name,
            reason: comment,
            url:
              (process.env.NEXTAUTH_URL || "http://localhost:3000") +
              "/requests/" + params.id,
          });
          await sendEmail({
            to: request.requester.email,
            subject: t.subject,
            html: t.html,
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }

      return NextResponse.json({ success: true, status: "DRAFT" });
    }

    // ============================================
    // XU LY APPROVED
    // ============================================
    const nextStep = currentStep + 1;
    let newStatus = request.status;

    if (nextStep === 2) {
      newStatus = "PENDING_IT";
    } else if (nextStep === 3) {
      newStatus = "ORDERED";
    }

    // Cap nhat step hien tai
    const currentStepRecord = request.approvalSteps.find(
      (s) => s.stepNumber === currentStep
    );

    const operations: any[] = [];

    if (currentStepRecord) {
      operations.push(
        prisma.approvalStep.update({
          where: { id: currentStepRecord.id },
          data: {
            approverId: session.user.id,
            decision: "APPROVED",
            comment: comment || null,
            decidedAt: new Date(),
          },
        })
      );
    } else {
      operations.push(
        prisma.approvalStep.create({
          data: {
            requestId: params.id,
            stepNumber: currentStep,
            approverId: session.user.id,
            decision: "APPROVED",
            comment: comment || null,
            decidedAt: new Date(),
          },
        })
      );
    }

    operations.push(
      prisma.assetRequest.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          currentStep: nextStep,
          isLocked: nextStep > 1,
        },
      })
    );

    await prisma.$transaction(operations);

    // ============================================
    // GUI EMAIL SAU KHI APPROVE
    // ============================================
    try {
      if (newStatus === "ORDERED") {
        // Gui cho NV - YC hoan thanh
        if (request.requester.email) {
          const t1 = emailTemplates.requestCompleted({
            requestNumber: request.requestNumber,
            title: request.title,
            requesterName: request.requester.name,
            url:
              (process.env.NEXTAUTH_URL || "http://localhost:3000") +
              "/requests/" + params.id,
          });
          await sendEmail({
            to: request.requester.email,
            subject: t1.subject,
            html: t1.html,
          });
        }

        // GUI CHO PHONG MUA HANG - co YC can mua
        const purchasingUsers = await prisma.user.findMany({
          where: { role: "PURCHASING", isActive: true },
        });
        for (const pUser of purchasingUsers) {
          if (pUser.email) {
            const t2 = emailTemplates.requestApproved({
              requestNumber: request.requestNumber,
              title: request.title,
              nextApproverName: pUser.name,
              role: "Purchasing",
              url:
                (process.env.NEXTAUTH_URL || "http://localhost:3000") +
                "/purchase-orders/select-items",
            });
            await sendEmail({
              to: pUser.email,
              subject: \`[ITAMS] YC \${request.requestNumber} can mua hang\`,
              html: t2.html,
            });
          }
        }
      } else if (newStatus === "PENDING_IT") {
        // Gui cho IT
        const itStaff = await prisma.user.findFirst({
          where: { role: "IT_STAFF", isActive: true },
        });
        if (itStaff?.email) {
          const t = emailTemplates.requestApproved({
            requestNumber: request.requestNumber,
            title: request.title,
            nextApproverName: itStaff.name,
            role: "IT",
            url:
              (process.env.NEXTAUTH_URL || "http://localhost:3000") +
              "/approvals",
          });
          await sendEmail({
            to: itStaff.email,
            subject: \`[ITAMS] YC \${request.requestNumber} can IT duyet\`,
            html: t.html,
          });
        }
      }
    } catch (e) {
      console.error("Email error:", e);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
`;

const file = path.join(
  __dirname,
  "src",
  "app",
  "api",
  "requests",
  "[id]",
  "approve",
  "route.ts"
);
fs.writeFileSync(file, code);
console.log("Updated");