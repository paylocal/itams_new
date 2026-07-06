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
  user: {
    findMany: (args: any) => Promise<Array<{ email?: string | null }>>;
    findFirst: (args: any) => Promise<{ email?: string | null } | null>;
    findUnique?: (args: any) => Promise<{ email?: string | null } | null>;
  };
  sLAConfig?: {
    findUnique: (args: any) => Promise<{ hoursToApprove?: number | null } | null>;
  };
};

type GroupLookup = {
  id: string;
  name: string;
  level: number;
};

type SendEmailFn = (args: { to: string; subject: string; html: string }) => Promise<unknown>;

function isDecision(value: string): value is Decision {
  return value === "APPROVED" || value === "REJECTED";
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value || 0);
}

async function getPrimaryGroupForUser(db: DbLike, userId: string): Promise<GroupLookup | null> {
  const rows = (await (db as any).$queryRaw`
    SELECT TOP 1 g.id, g.name, g.level
    FROM [dbo].[UserGroupMember] m
    INNER JOIN [dbo].[UserGroup] g ON g.id = m.groupId
    WHERE m.userId = ${userId}
    ORDER BY g.level ASC, g.createdAt DESC
  `) as GroupLookup[];
  return rows[0] || null;
}

function statusForLevel(level: number): string {
  if (level === 2) return "PENDING_LEAD";
  if (level === 3) return "PENDING_MANAGER";
  if (level === 4) return "PENDING_ADMIN";
  return "PENDING_MANAGER";
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
    const request = (await db.assetRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          include: {
            manager: { select: { id: true, name: true, email: true } },
          },
        },
        approvalSteps: {
          include: {
            approver: { select: { id: true, role: true, email: true } },
          },
          orderBy: { stepNumber: "asc" },
        },
      },
    })) as {
      id: string;
      requestNumber: string;
      currentStep: number;
      status: string;
      totalAmount?: unknown;
      requester: {
        managerId: string;
        email?: string | null;
        manager?: { email?: string | null } | null;
      };
      approvalSteps: Array<{
        id: string;
        stepNumber: number;
        approverId: string;
        approver?: { id: string; role: string; email?: string | null };
      }>;
    } | null;

    if (!request) {
      return { status: 404, body: { error: "Khong tim thay" } };
    }

    const currentStep = request.currentStep;
    const currentApproval = request.approvalSteps.find((s) => s.stepNumber === currentStep);
    const nextApproval = request.approvalSteps.find((s) => s.stepNumber === currentStep + 1);
    let canApprove = false;

    if (currentApproval?.approverId) {
      canApprove = currentApproval.approverId === currentUser.id || currentUser.role === "ADMIN";
    } else if (currentStep === 1 && currentUser.role === "MANAGER") {
      canApprove = request.requester.managerId === currentUser.id;
    } else if (request.status === "PENDING_LEAD" && currentStep === 2 && currentUser.role === "LEAD") {
      canApprove = true;
    } else if (request.status === "PENDING_IT" && currentUser.role === "IT_STAFF") {
      canApprove = true;
    } else if (currentUser.role === "ADMIN") {
      canApprove = true;
    }

    if (!canApprove) {
      return { status: 403, body: { error: "Khong co quyen" } };
    }

    if (decision === "REJECTED") {
      if (!comment || !comment.trim()) {
        return { status: 400, body: { error: "Nhap ly do tu choi" } };
      }

      const existingStep = request.approvalSteps.find(
        (s: { stepNumber: number }) => s.stepNumber === currentStep
      );

      if (existingStep) {
        await db.approvalStep.update({
          where: { id: existingStep.id },
          data: {
            approverId: currentUser.id,
            decision: "REJECTED",
            comment,
            decidedAt: new Date(),
          },
        });
      } else {
        await db.approvalStep.create({
          data: {
            requestId: request.id,
            stepNumber: currentStep,
            approverId: currentUser.id,
            decision: "REJECTED",
            comment,
            decidedAt: new Date(),
          },
        });
      }

      await db.assetRequest.update({
        where: { id: request.id },
        data: { status: "DRAFT", currentStep: 1, isLocked: false },
      });

      try {
        if (request.requester?.email) {
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
        if (request.requester?.manager?.email) {
          await sendEmail({
            to: request.requester.manager.email,
            subject: "[ITAMS] YC " + request.requestNumber + " bi tu choi",
            html:
              "<p>YC <b>" +
              request.requestNumber +
              "</b> bi tu choi boi " +
              (currentUser.name || "") +
              ".</p><p>Ly do: " +
              comment +
              "</p>",
          });
        }
      } catch (error) {
        console.error("Email error:", error);
      }

      return { status: 200, body: { success: true, status: "DRAFT" } };
    }

    const nextStep = currentStep + 1;
    let newStatus = request.status;

    if (currentApproval?.approverId) {
      if (nextApproval?.approverId) {
        const nextGroup = await getPrimaryGroupForUser(db, nextApproval.approverId);
        newStatus = nextGroup ? statusForLevel(nextGroup.level) : newStatus;
      } else if (currentStep === 1 && currentUser.role === "MANAGER") {
        newStatus = "PENDING_IT";
      } else {
        newStatus = "ORDERED";
      }
    } else if (currentStep === 1 && currentUser.role === "MANAGER") {
      newStatus = "PENDING_IT";
    } else if (request.status === "PENDING_LEAD" && currentStep === 2) {
      newStatus = "PENDING_IT";
    } else if (request.status === "PENDING_IT" && currentStep >= 2) {
      newStatus = "ORDERED";
    }

    const existingStep = request.approvalSteps.find(
      (s: { stepNumber: number }) => s.stepNumber === currentStep
    );

    if (existingStep) {
      await db.approvalStep.update({
        where: { id: existingStep.id },
        data: {
          approverId: currentUser.id,
          decision: "APPROVED",
          comment: comment || null,
          decidedAt: new Date(),
        },
      });
    } else {
      await db.approvalStep.create({
        data: {
          requestId: request.id,
          stepNumber: currentStep,
          approverId: currentUser.id,
          decision: "APPROVED",
          comment: comment || null,
          decidedAt: new Date(),
        },
      });
    }

    await db.assetRequest.update({
      where: { id: request.id },
      data: {
        status: newStatus,
        currentStep: nextStep,
        isLocked: nextStep > 1,
      },
    });

    try {
      if (newStatus === "ORDERED") {
        if (request.requester?.email) {
          await sendEmail({
            to: request.requester.email,
            subject: "[ITAMS] YC " + request.requestNumber + " hoan thanh",
            html: "<p>YC <b>" + request.requestNumber + "</b> hoan thanh.</p>",
          });
        }
        const purchasingUsers = await db.user.findMany({
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
      } else if (newStatus === "PENDING_LEAD") {
        const leadEmail = nextApproval?.approver?.email || null;
        if (leadEmail) {
          await sendEmail({
            to: leadEmail,
            subject: "[ITAMS] YC " + request.requestNumber + " can Lead duyet",
            html: "<p>YC <b>" + request.requestNumber + "</b> can Lead duyet (vuot nguong).</p>",
          });
        }
      } else if (newStatus === "PENDING_IT") {
        const itStaff = await db.user.findFirst({
          where: { role: "IT_STAFF", isActive: true },
        });
        if (itStaff?.email) {
          await sendEmail({
            to: itStaff.email,
            subject: "[ITAMS] YC " + request.requestNumber + " can IT duyet",
            html: "<p>YC <b>" + request.requestNumber + "</b> can IT duyet.</p>",
          });
        }
      } else if (newStatus === "PENDING_ADMIN") {
        const admin = await db.user.findFirst({
          where: { role: "ADMIN", isActive: true },
        });
        if (admin?.email) {
          await sendEmail({
            to: admin.email,
            subject: "[ITAMS] YC " + request.requestNumber + " can Admin duyet",
            html: "<p>YC <b>" + request.requestNumber + "</b> can Admin duyet.</p>",
          });
        }
      }
    } catch (error) {
      console.error("Email error:", error);
    }

    return { status: 200, body: { success: true, status: newStatus } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Approve error:", error);
    return {
      status: 500,
      body: { error: "Loi server: " + message },
    };
  }
}
