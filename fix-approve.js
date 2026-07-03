const fs = require("fs");
const path = require("path");

const code = `import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      include: { requester: true, approvalSteps: true },
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

    if (decision === "REJECTED") {
      if (!comment || !comment.trim()) {
        return NextResponse.json({ error: "Nhap ly do tu choi" }, { status: 400 });
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

      return NextResponse.json({ success: true, status: "DRAFT" });
    }

    // APPROVED - Bo buoc Purchasing
    const nextStep = currentStep + 1;
    let newStatus = request.status;

    if (nextStep === 2) {
      newStatus = "PENDING_IT";
    } else if (nextStep === 3) {
      newStatus = "ORDERED";
    }

    // Tim hoac tao step hien tai
    const currentStepRecord = request.approvalSteps.find(
      (s) => s.stepNumber === currentStep
    );

    const operations = [];

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

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
`;

const file = path.join(__dirname, "src", "app", "api", "requests", "[id]", "approve", "route.ts");
fs.writeFileSync(file, code);
console.log("Created:", file);
console.log("Size:", fs.statSync(file).size, "bytes");