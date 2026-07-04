const { PrismaClient } = require("@prisma/client");
const { unlink } = require("fs/promises");
const path = require("path");

const prisma = new PrismaClient();

const REQUEST_NUMBER = "REQ-1783043898302";
const PO_NUMBER = "PO-2026-00001";
const PO_FILE_PATH = path.join(
  process.cwd(),
  "public",
  "uploads",
  "po",
  "1783129209492-tmp_po.txt"
);

async function removeFileIfExists(filePath) {
  try {
    await unlink(filePath);
    console.log("Removed file:", filePath);
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function cleanupExistingSmokeData() {
  const existingPurchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { poNumber: PO_NUMBER },
    select: { id: true, poNumber: true },
  });

  if (existingPurchaseOrder) {
    await prisma.purchaseOrder.delete({
      where: { id: existingPurchaseOrder.id },
    });
    console.log("Deleted purchase order:", existingPurchaseOrder.poNumber);
  }

  const existingRequest = await prisma.assetRequest.findUnique({
    where: { requestNumber: REQUEST_NUMBER },
    select: { id: true, requestNumber: true },
  });

  if (existingRequest) {
    await prisma.assetRequest.delete({
      where: { id: existingRequest.id },
    });
    console.log("Deleted request:", existingRequest.requestNumber);
  }

  await removeFileIfExists(PO_FILE_PATH);
}

async function ensureCategory() {
  const existingCategory = await prisma.deviceCategory.findFirst({
    orderBy: { order: "asc" },
  });

  if (existingCategory) {
    return existingCategory;
  }

  return prisma.deviceCategory.create({
    data: {
      code: "SMOKE-LAPTOP",
      name: "Smoke Laptop",
      hasModel: false,
      isActive: true,
      order: 1,
    },
  });
}

async function main() {
  console.log("=== RESET AND SEED SMOKE WORKFLOW ===");

  await cleanupExistingSmokeData();

  const manager = await prisma.user.findUnique({
    where: { email: "manager@company.com" },
  });
  const requester = await prisma.user.findUnique({
    where: { email: "employee1@company.com" },
  });

  if (!manager) {
    throw new Error("Missing manager@company.com user");
  }
  if (!requester) {
    throw new Error("Missing employee1@company.com user");
  }

  if (requester.managerId !== manager.id) {
    await prisma.user.update({
      where: { id: requester.id },
      data: { managerId: manager.id },
    });
    console.log("Linked requester to manager");
  }

  const category = await ensureCategory();

  const request = await prisma.assetRequest.create({
    data: {
      requestNumber: REQUEST_NUMBER,
      requesterId: requester.id,
      title: "Test Request",
      reason: "Smoke test request for approval and purchasing flow",
      priority: "NORMAL",
      status: "PENDING_MANAGER",
      currentStep: 1,
      totalAmount: 30000000,
      approvalSteps: {
        create: {
          stepNumber: 1,
          approverId: manager.id,
        },
      },
      items: {
        create: {
          categoryId: category.id,
          customName: "Laptop test purchasing",
          quantity: 2,
          unitPrice: 15000000,
          totalPrice: 30000000,
          specs: "Auto seed item",
        },
      },
    },
    include: {
      items: true,
      approvalSteps: true,
      requester: true,
    },
  });

  console.log("Seeded request:", {
    requestNumber: request.requestNumber,
    requestId: request.id,
    requester: request.requester.email,
    itemCount: request.items.length,
    approvalStepCount: request.approvalSteps.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
