import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function cleanDB() {
  // Xoa theo thu tu de tranh loi foreign key
  const tables = [
    "HandoverItem",
    "Handover",
    "AssetHistory",
    "Asset",
    "POItem",
    "PurchaseOrderRequest",
    "PurchaseOrder",
    "ApprovalStep",
    "RequestItem",
    "AssetRequest",
    "AuditLog",
    "Notification",
    "SLAConfig",
    "User",
  ];
  for (const t of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${t}"`);
    } catch (e) {}
  }
}

export async function createTestUser(data: any = {}) {
  const passwordHash = await bcrypt.hash("password123", 10);
  return prisma.user.create({
    data: {
      email: data.email || `test-${Date.now()}@test.com`,
      name: data.name || "Test User",
      passwordHash,
      role: data.role || "EMPLOYEE",
      department: data.department || "IT",
      managerId: data.managerId,
    },
  });
}

export async function createTestRequest(data: any = {}) {
  return prisma.assetRequest.create({
    data: {
      requestNumber:
        data.requestNumber || `REQ-${Date.now()}`,
      requesterId: data.requesterId,
      title: data.title || "Test Request",
      reason: data.reason || "Test reason here",
      priority: data.priority || "NORMAL",
      status: data.status || "DRAFT",
      currentStep: data.currentStep || 1,
    },
  });
}

export { prisma };