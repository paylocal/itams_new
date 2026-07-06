const fs = require("fs");
const path = require("path");

const code = `import { NextRequest, NextResponse } from "next/server";
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

  try {
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

    if (decision === "REJECTED") {
      if (!comment || !comment.trim()) {
        return NextResponse.json(
          { error: "Nhap ly do tu choi" },
          { status: 400 }
        );
      }

      const existingStep = request.approvalSteps.find(
        (s) => s.stepNumber === currentStep
      );

      if (existingStep) {
        await prisma.approvalStep.update({
          where: { id: existingStep.id },
          data: {
            approverId: currentUserId,
            decision: "REJECTED",
            comment: comment,
            decidedAt: new Date(),
          },
        });
      } else {
        await prisma.approvalStep.create({
          data: {
            requestId: request.id,
            stepNumber: currentStep,
            approverId: currentUserId,
            decision: "REJECTED",
            comment: comment,
            decidedAt: new Date(),
          },
        });
      }

      await prisma.assetRequest.update({
        where: { id: request.id },
        data: { status: "DRAFT", currentStep: 1, isLocked: false },
      });

      try {
        if (request.requester && request.requester.email) {
          await sendEmail({
            to: request.requester.email,
            subject: "[ITAMS] YC " + request.requestNumber + " bi tu choi",
            html:
              "<p>YC <b>" +
              request.requestNumber +
              "</b> bi tu choi.</p><p>Ly do: " +
              comment +
              "</p>",
          });
        }
        if (
          request.requester &&
          request.requester.manager &&
          request.requester.manager.email
        ) {
          await sendEmail({
            to: request.requester.manager.email,
            subject: "[ITAMS] YC " + request.requestNumber + " bi tu choi",
            html:
              "<p>YC <b>" +
              request.requestNumber +
              "</b> bi tu choi boi " +
              (session.user.name || "") +
              ".</p><p>Ly do: " +
              comment +
              "</p>",
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }

      return NextResponse.json({ success: true, status: "DRAFT" });
    }

    if (decision === "APPROVED") {
      const nextStep = currentStep + 1;
      let newStatus = request.status;
      if (nextStep === 2) newStatus = "PENDING_IT";
      else if (nextStep === 3) newStatus = "ORDERED";

      const existingStep = request.approvalSteps.find(
        (s) => s.stepNumber === currentStep
      );

      if (existingStep) {
        await prisma.approvalStep.update({
          where: { id: existingStep.id },
          data: {
            approverId: currentUserId,
            decision: "APPROVED",
            comment: comment || null,
            decidedAt: new Date(),
          },
        });
      } else {
        await prisma.approvalStep.create({
          data: {
            requestId: request.id,
            stepNumber: currentStep,
            approverId: currentUserId,
            decision: "APPROVED",
            comment: comment || null,
            decidedAt: new Date(),
          },
        });
      }

      await prisma.assetRequest.update({
        where: { id: request.id },
        data: {
          status: newStatus,
          currentStep: nextStep,
          isLocked: nextStep > 1,
        },
      });

      try {
        if (newStatus === "ORDERED") {
          if (request.requester && request.requester.email) {
            await sendEmail({
              to: request.requester.email,
              subject: "[ITAMS] YC " + request.requestNumber + " hoan thanh",
              html: "<p>YC <b>" + request.requestNumber + "</b> hoan thanh.</p>",
            });
          }
          const purchasingUsers = await prisma.user.findMany({
            where: { role: "PURCHASING", isActive: true },
          });
          for (const p of purchasingUsers) {
            if (p.email) {
              await sendEmail({
                to: p.email,
                subject: "[ITAMS] YC " + request.requestNumber + " can mua",
                html: "<p>YC <b>" + request.requestNumber + "</b> can mua hang.</p>",
              });
            }
          }
        } else if (newStatus === "PENDING_IT") {
          const itStaff = await prisma.user.findFirst({
            where: { role: "IT_STAFF", isActive: true },
          });
          if (itStaff && itStaff.email) {
            await sendEmail({
              to: itStaff.email,
              subject: "[ITAMS] YC " + request.requestNumber + " can IT duyet",
              html: "<p>YC <b>" + request.requestNumber + "</b> can IT duyet.</p>",
            });
          }
        }
      } catch (e) {
        console.error("Email error:", e);
      }

      return NextResponse.json({ success: true, status: newStatus });
    }

    return NextResponse.json({ error: "Decision khong hop le" }, { status: 400 });
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

const dir = path.join(__dirname, "src", "app", "api", "requests", "[id]", "approve");
const file = path.join(dir, "route.ts");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("Created dir:", dir);
}

fs.writeFileSync(file, code);
console.log("Created file:", file);
console.log("Size:", fs.statSync(file).size, "bytes");