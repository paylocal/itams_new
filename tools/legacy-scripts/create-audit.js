const fs = require("fs");
const path = require("path");

const code = `import { prisma } from "./prisma";

interface AuditParams {
  userId: string;
  userName: string;
  action:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "APPROVE"
    | "REJECT"
    | "SIGN"
    | "RECEIVE"
    | "STATUS_CHANGE";
  entity: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  description?: string;
  req?: Request;
}

export async function logAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldData: params.oldData ? JSON.stringify(params.oldData) : null,
        newData: params.newData ? JSON.stringify(params.newData) : null,
        description: params.description,
        ipAddress: params.req?.headers.get("x-forwarded-for") || undefined,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
`;

const file = path.join(__dirname, "src", "lib", "audit.ts");
fs.writeFileSync(file, code);
console.log("Created:", file);