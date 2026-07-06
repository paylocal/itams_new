const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "prisma/schema.prisma");
let content = fs.readFileSync(file, "utf-8");

// Xoa onDelete/onUpdate o phia khong hop le (phia nhieu - list)
const replacements = [
  // User.subordinates (list) - xoa onDelete
  [
    'subordinates  User[]   @relation("ManagerEmployee", onDelete: NoAction, onUpdate: NoAction)',
    'subordinates  User[]   @relation("ManagerEmployee")',
  ],
  // AssetRequest.approvalSteps (list)
  [
    "approvalSteps  ApprovalStep[]  @relation(onDelete: NoAction, onUpdate: NoAction)",
    "approvalSteps  ApprovalStep[]",
  ],
  // PurchaseOrder.requests (list)
  [
    "requests PurchaseOrderRequest[]  @relation(onDelete: Cascade, onUpdate: NoAction)",
    "requests PurchaseOrderRequest[]",
  ],
  // DeviceModel.requestItems (list)
  [
    "requestItems RequestItem[]  @relation(onDelete: NoAction, onUpdate: NoAction)",
    "requestItems RequestItem[]",
  ],
  // DeviceCategory.requestItems (list)
  [
    "requestItems RequestItem[]  @relation(onDelete: NoAction, onUpdate: NoAction)",
    "requestItems RequestItem[]",
  ],
  // DeviceCategory.models (list)
  [
    "models       DeviceModel[]  @relation(onDelete: Cascade, onUpdate: NoAction)",
    "models       DeviceModel[]",
  ],
  // POItem - khong can sua (single -> single)
  // Asset.handoverItems (list)
  [
    "handoverItems HandoverItem[]",
    "handoverItems HandoverItem[]",
  ],
  // HandoverItem (single)
  // AssetHistory (single)
  // Handover.items (list)
];

replacements.forEach(([from, to]) => {
  if (content.includes(from)) {
    content = content.replace(from, to);
    console.log("Fixed:", from.substring(0, 60) + "...");
  }
});

fs.writeFileSync(file, content, "utf-8");
console.log("Done");