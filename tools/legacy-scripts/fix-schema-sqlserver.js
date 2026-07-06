const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "prisma", "schema.prisma");
let content = fs.readFileSync(file, "utf-8");

// Doi Float -> Decimal
content = content.replace(/totalAmount\s+Float(\?)?/g, "totalAmount    Decimal$1 @db.Decimal(18, 2)");
content = content.replace(/unitPrice\s+Float(\?)?/g, "unitPrice      Decimal$1 @db.Decimal(18, 2)");
content = content.replace(/totalPrice\s+Float(\?)?/g, "totalPrice     Decimal$1 @db.Decimal(18, 2)");

// Them onDelete, onUpdate cho self-relation (User)
// User.manager (self-relation)
content = content.replace(
  "manager       User?    @relation(\"ManagerEmployee\", fields: [managerId], references: [id])",
  "manager       User?    @relation(\"ManagerEmployee\", fields: [managerId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// User.subordinates (self-relation - khong can sua vi no chi la mang)
content = content.replace(
  "subordinates  User[]   @relation(\"ManagerEmployee\")",
  "subordinates  User[]   @relation(\"ManagerEmployee\", onDelete: NoAction, onUpdate: NoAction)"
);

// AssetRequest.requester (User)
content = content.replace(
  "requester     User       @relation(\"Requester\", fields: [requesterId], references: [id])",
  "requester     User       @relation(\"Requester\", fields: [requesterId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// AssetRequest.approvalSteps (ApprovalStep) - co cascade san, them NoAction
content = content.replace(
  "approvalSteps  ApprovalStep[]",
  "approvalSteps  ApprovalStep[]  @relation(onDelete: NoAction, onUpdate: NoAction)"
);

// RequestItem.request
content = content.replace(
  "request       AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)",
  "request       AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade, onUpdate: NoAction)"
);

// RequestItem.category
content = content.replace(
  "category      DeviceCategory @relation(fields: [categoryId], references: [id])",
  "category      DeviceCategory @relation(fields: [categoryId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// RequestItem.deviceModel
content = content.replace(
  "deviceModel   DeviceModel?  @relation(fields: [deviceModelId], references: [id])",
  "deviceModel   DeviceModel?  @relation(fields: [deviceModelId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// RequestItem.poItems (POItem)
content = content.replace(
  "poItems POItem[]",
  "poItems POItem[]  @relation(onDelete: NoAction, onUpdate: NoAction)"
);

// ApprovalStep.request
content = content.replace(
  "request    AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)",
  "request    AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade, onUpdate: NoAction)"
);

// ApprovalStep.approver (User)
content = content.replace(
  "approver   User         @relation(fields: [approverId], references: [id])",
  "approver   User         @relation(fields: [approverId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// PurchaseOrder.requests (PurchaseOrderRequest)
content = content.replace(
  "requests PurchaseOrderRequest[]",
  "requests PurchaseOrderRequest[]  @relation(onDelete: Cascade, onUpdate: NoAction)"
);

// PurchaseOrderRequest.request (AssetRequest)
content = content.replace(
  "request         AssetRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade)",
  "request         AssetRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade, onUpdate: NoAction)"
);

// POItem.requestItem
content = content.replace(
  "requestItem   RequestItem?  @relation(fields: [requestItemId], references: [id])",
  "requestItem   RequestItem?  @relation(fields: [requestItemId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// Asset.request (AssetRequest)
content = content.replace(
  "request         AssetRequest? @relation(fields: [requestId], references: [id])",
  "request         AssetRequest? @relation(fields: [requestId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// Asset.currentHolder (User)
content = content.replace(
  "currentHolder   User?         @relation(\"CurrentHolder\", fields: [currentHolderId], references: [id])",
  "currentHolder   User?         @relation(\"CurrentHolder\", fields: [currentHolderId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// AssetHistory.asset
content = content.replace(
  "asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)",
  "asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade, onUpdate: NoAction)"
);

// Handover.employee (User)
content = content.replace(
  "employee          User         @relation(\"EmployeeHandover\", fields: [employeeId], references: [id])",
  "employee          User         @relation(\"EmployeeHandover\", fields: [employeeId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// Handover.itStaff (User)
content = content.replace(
  "itStaff           User         @relation(\"ITHandover\", fields: [itStaffId], references: [id])",
  "itStaff           User         @relation(\"ITHandover\", fields: [itStaffId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// HandoverItem.handover
content = content.replace(
  "handover   Handover @relation(fields: [handoverId], references: [id], onDelete: Cascade)",
  "handover   Handover @relation(fields: [handoverId], references: [id], onDelete: Cascade, onUpdate: NoAction)"
);

// HandoverItem.asset
content = content.replace(
  "asset      Asset    @relation(fields: [assetId], references: [id])",
  "asset      Asset    @relation(fields: [assetId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// DeviceCategory.models (DeviceModel) - da co cascade
content = content.replace(
  "models       DeviceModel[]",
  "models       DeviceModel[]  @relation(onDelete: Cascade, onUpdate: NoAction)"
);

// DeviceModel.category
content = content.replace(
  "category   DeviceCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)",
  "category   DeviceCategory @relation(fields: [categoryId], references: [id], onDelete: NoAction, onUpdate: NoAction)"
);

// DeviceModel.requestItems (RequestItem)
content = content.replace(
  "requestItems RequestItem[]",
  "requestItems RequestItem[]  @relation(onDelete: NoAction, onUpdate: NoAction)"
);

// DeviceCategory.requestItems
content = content.replace(
  "requestItems RequestItem[]",
  "requestItems RequestItem[]  @relation(onDelete: NoAction, onUpdate: NoAction)"
);

fs.writeFileSync(file, content);
console.log("Schema updated for SQL Server");