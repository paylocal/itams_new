import { prisma } from "./prisma";

export type WorkflowStep = {
  level: number;
  name: string;
  groupCode: string;
  minAmountUsd: number;
};

export async function getRequiredApprovalSteps(amountUsd: number): Promise<WorkflowStep[]> {
  const rules = await prisma.workflowRule.findMany({
    where: { isActive: true, conditionType: "AMOUNT" },
    orderBy: { order: "asc" },
    include: { group: true },
  });

  const steps: WorkflowStep[] = [];
  for (const rule of rules) {
    const threshold = Number(rule.value);
    const passes = rule.operator === ">=" ? amountUsd >= threshold : amountUsd <= threshold;
    if (passes && rule.group) {
      steps.push({
        level: rule.requiredLevel,
        name: rule.name,
        groupCode: rule.group.code,
        minAmountUsd: threshold,
      });
    }
  }
  // De-duplicate by level
  const seen = new Set<number>();
  return steps.filter((s) => {
    if (seen.has(s.level)) return false;
    seen.add(s.level);
    return true;
  });
}

export function determineNextStatusAfterApproval(
  currentStatus: string,
  amountUsd: number,
  steps: WorkflowStep[]
): string {
  // Map status to step index
  const statusOrder = ["PENDING_LEADER", "PENDING_MANAGER", "PENDING_BOD", "PENDING_IT", "ORDERED", "DELIVERED", "COMPLETED"];
  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex < 0) return currentStatus;

  // Find next required status after current
  for (let i = currentIndex + 1; i < statusOrder.length; i++) {
    const nextStatus = statusOrder[i];
    if (nextStatus === "PENDING_LEADER") continue; // already passed
    if (nextStatus === "PENDING_MANAGER") {
      if (steps.some((s) => s.groupCode === "MANAGER")) return nextStatus;
      continue;
    }
    if (nextStatus === "PENDING_BOD") {
      if (steps.some((s) => s.groupCode === "BOD")) return nextStatus;
      continue;
    }
    if (nextStatus === "PENDING_IT") return nextStatus;
    if (nextStatus === "ORDERED") continue; // IT decides stock
    if (nextStatus === "DELIVERED") continue; // after PO delivered
    if (nextStatus === "COMPLETED") continue;
  }
  return "PENDING_IT";
}

export function determineInitialStatus(amountUsd: number, steps: WorkflowStep[]): string {
  if (steps.some((s) => s.groupCode === "LEADER")) return "PENDING_LEADER";
  if (steps.some((s) => s.groupCode === "MANAGER")) return "PENDING_MANAGER";
  if (steps.some((s) => s.groupCode === "BOD")) return "PENDING_BOD";
  return "PENDING_IT";
}

export async function findApproversInGroup(groupCode: string): Promise<Array<{ id: string; name: string; email: string }>> {
  const members = await prisma.userGroupMember.findMany({
    where: {
      group: { code: groupCode },
      user: { isActive: true },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return members.map((m) => m.user);
}
