type Decision = "APPROVED" | "REJECTED";

type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
};

type ApprovePayload = {
  requestId: string;
  decision: string;
  comment?: string;
  currentUser: SessionUser;
};

type ApproveResult = {
  status: number;
  body: Record<string, unknown>;
};

type DbLike = {
  assetRequest: {
    findUnique: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
  };
  approvalStep: {
    update: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
  };
  userGroupMember: {
    findFirst: (args: any) => Promise<any>;
  };
};

type SendEmailFn = (args: { to: string; subject: string; html: string }) => Promise<unknown>;

function isDecision(value: string): value is Decision {
  return value === "APPROVED" || value === "REJECTED";
}

function statusForGroupCode(code: string): string {
  switch (code) {
    case "LEADER":
      return "PENDING_LEADER";
    case "MANAGER":
      return "PENDING_MANAGER";
    case "BOD":
      return "PENDING_BOD";
    case "IT":
      return "PENDING_STOCK_CHECK";
    default:
      return "PENDING_MANAGER";
  }
}

export async function approveRequest(
  payload: ApprovePayload,
  deps: { db: DbLike; sendEmail: SendEmailFn }
): Promise<ApproveResult> {
  const { requestId, decision, comment, currentUser } = payload;
  const { db, sendEmail } = deps;

  if (!isDecision(decision)) {
    return { status: 400, body: { error: "Decision khong hop le" } };
  }

  try {
    const request = await db.assetRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: { select: { id: true, email: true, name: true } },
        approvalSteps: {
          include: { approver: { select: { id: true, email: true } } },
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    if (!request) {
      return { status: 404, body: { error: "Khong tim thay" } };
    }

    const currentStep = request.approvalSteps.find(
      (s: any) => s.stepNumber === request.currentStep
    );
    if (!currentStep) {
      return { status: 400, body: { error: "Buoc duyet khong hop le" } };
    }

    const canApprove =
      currentStep.approverId === currentUser.id || currentUser.role === "ADMIN";

    if (!canApprove) {
      return { status: 403, body: { error: "Khong co quyen" } };
    }

    if (decision === "REJECTED") {
      if (!comment || !comment.trim()) {
        return { status: 400, body: { error: "Nhap ly do tu choi" } };
      }
      await db.approvalStep.update({
        where: { id: currentStep.id },
        data: {
          approverId: currentUser.id,
          decision: "REJECTED",
          comment,
          decidedAt: new Date(),
        },
      });
      await db.assetRequest.update({
        where: { id: request.id },
        data: { status: "DRAFT", currentStep: 1 },
      });
      try {
        if (request.requester?.email) {
          await sendEmail({
            to: request.requester.email,
            subject: `[Quản lý yêu cầu và tài sản] YC ${request.requestNumber} bi tu choi`,
            html: `<p>YC <b>${request.requestNumber}</b> bi tu choi.</p>
                   <p>Ly do: ${comment}</p>`,
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }
      return { status: 200, body: { success: true, status: "DRAFT" } };
    }

    // APPROVED
    await db.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        approverId: currentUser.id,
        decision: "APPROVED",
        comment: comment || null,
        decidedAt: new Date(),
      },
    });

    const nextStep = request.approvalSteps.find(
      (s: any) => s.stepNumber === request.currentStep + 1
    );

    let newStatus: string;
    let newStep: number;

    if (nextStep) {
      // Determine next status by looking up approver's group
      const membership = await db.userGroupMember.findFirst({
        where: { userId: nextStep.approverId },
        include: { group: true },
      });
      newStatus = statusForGroupCode(membership?.group?.code || "MANAGER");
      newStep = nextStep.stepNumber;
    } else {
      newStatus = "PENDING_STOCK_CHECK";
      newStep = request.currentStep + 1;
    }

    await db.assetRequest.update({
      where: { id: request.id },
      data: { status: newStatus, currentStep: newStep },
    });

    // Notify next approver or requester
    try {
      if (nextStep?.approver?.email) {
        await sendEmail({
          to: nextStep.approver.email,
          subject: `[Quản lý yêu cầu và tài sản] YC ${request.requestNumber} can duyet`,
          html: `<p>YC <b>${request.requestNumber}</b> da duoc duyet va chuyen den ban.</p>`,
        });
      } else if (newStatus === "PENDING_STOCK_CHECK") {
        // Notify IT (already the last approver, but notify requester too)
        if (request.requester?.email) {
          await sendEmail({
            to: request.requester.email,
            subject: `[Quản lý yêu cầu và tài sản] YC ${request.requestNumber} dang cho IT kiem tra kho`,
            html: `<p>YC <b>${request.requestNumber}</b> dang cho IT kiem tra hang ton kho.</p>`,
          });
        }
      }
    } catch (e) {
      console.error("Email error:", e);
    }

    return { status: 200, body: { success: true, status: newStatus } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Approve error:", error);
    return { status: 500, body: { error: "Loi server: " + message } };
  }
}
