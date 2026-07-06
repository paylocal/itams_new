const fs = require("fs");
const path = require("path");

const code = `"use client";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Body khong hop le" }, { status: 400 });
  }

  const { decision, comment } = body;

  if (!decision || (decision !== "APPROVED" && decision !== "REJECTED")) {
    return NextResponse.json({ error: "Decision khong hop le" }, { status: 400 });
  }

  try {
    // Lay request voi day du thong tin
    const request = await prisma.assetRequest.findUnique({
      where: { id: params.id },
      include: {
        requester: {
          include: {
            manager: { select: { id: true, name: true, email: true } },
          },
        },
        approvalSteps: { orderBy: { stepNumber: "asc" } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });
    }

    const currentUserId = session.user.id;
    const currentUserRole = session.user.role;
    const currentStep = request.currentStep;

    // Check quyen
    let canApprove = false;
    if (currentStep === 1 && currentUserRole === "MANAGER") {
      if (request.requester.managerId === currentUserId) canApprove = true;
    } else if (currentStep === 2 && currentUserRole === "IT_STAFF") {
      canApprove = true;
    } else if (currentUserRole === "ADMIN") {
      canApprove = true;
    }

    if (!canApprove) {
      return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
    }

    // ============================================
    // Ham helper: update hoac tao step moi (KHONG bao loi)
    // ============================================
    async function upsertStep(stepNum: number, data: any) {
      const existing = request.approvalSteps.find(
        (s) => s.stepNumber === stepNum
      );
      if (existing) {
        return prisma.approvalStep.update({
          where: { id: existing.id },
          data,
        });
      } else {
        return prisma.approvalStep.create({
          data: {
            requestId: request.id,
            stepNumber: stepNum,
            ...data,
          },
        });
      }
    }

    // ============================================
    // REJECTED
    // ============================================
    if (decision === "REJECTED") {
      if (!comment || !comment.trim()) {
        return NextResponse.json(
          { error: "Nhap ly do tu choi" },
          { status: 400 }
        );
      }

      // Update step hien tai
      await upsertStep(currentStep, {
        approverId: currentUserId,
        decision: "REJECTED",
        comment: comment,
        decidedAt: new Date(),
      });

      // Update request ve DRAFT
      await prisma.assetRequest.update({
        where: { id: request.id },
        data: { status: "DRAFT", currentStep: 1, isLocked: false },
      });

      // GUI EMAIL: NV + MANAGER
      try {
        if (request.requester && request.requester.email) {
          const t1 = emailTemplates.requestRejected({
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
            subject: t1.subject,
            html: t1.html,
          });
        }

        if (
          request.requester &&
          request.requester.manager &&
          request.requester.manager.email
        ) {
          const t2 = emailTemplates.requestRejected({
            requestNumber: request.requestNumber,
            title: request.title,
            requesterName: request.requester.manager.name,
            reason: comment,
            url:
              (process.env.NEXTAUTH_URL || "http://localhost:3000") +
              "/requests/" + params.id,
          });
          await sendEmail({
            to: request.requester.manager.email,
            subject: "[ITAMS] YC " + request.requestNumber + " bi tu choi",
            html: t2.html,
          });
        }
      } catch (emailErr) {
        console.error("Email error:", emailErr);
      }

      return NextResponse.json({ success: true, status: "DRAFT" });
    }

    // ============================================
    // APPROVED
    // ============================================
    const nextStep = currentStep + 1;
    let newStatus = request.status;

    if (nextStep === 2) {
      newStatus = "PENDING_IT";
    } else if (nextStep === 3) {
      newStatus = "ORDERED";
    }

    // Update step hien tai
    await upsertStep(currentStep, {
      approverId: currentUserId,
      decision: "APPROVED",
      comment: comment || null,
      decidedAt: new Date(),
    });

    await prisma.assetRequest.update({
      where: { id: request.id },
      data: {
        status: newStatus,
        currentStep: nextStep,
        isLocked: nextStep > 1,
      },
    });

    // GUI EMAIL
    try {
      if (newStatus === "ORDERED") {
        if (request.requester && request.requester.email) {
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
              subject: "[ITAMS] YC " + request.requestNumber + " can mua hang",
              html: t2.html,
            });
          }
        }
      } else if (newStatus === "PENDING_IT") {
        const itStaff = await prisma.user.findFirst({
          where: { role: "IT_STAFF", isActive: true },
        });
        if (itStaff && itStaff.email) {
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
            subject: "[ITAMS] YC " + request.requestNumber + " can IT duyet",
            html: t.html,
          });
        }
      }
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json(
      {
        error:
          "Loi server: " +
          (error && error.message ? error.message : "Unknown"),
      },
      { status: 500 }
    );
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
console.log("Updated with safe upsertStep");