const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "prisma/schema.prisma");
let content = fs.readFileSync(file, "utf-8");

// Doi provider
content = content.replace(/provider\s*=\s*"sqlite"/, 'provider = "sqlserver"');

// Doi Float -> Decimal cho SQL Server
content = content.replace(/totalAmount\s+Float(\?)?/g, "totalAmount    Decimal$1 @db.Decimal(18, 2)");
content = content.replace(/unitPrice\s+Float(\?)?/g, "unitPrice      Decimal$1 @db.Decimal(18, 2)");
content = content.replace(/totalPrice\s+Float(\?)?/g, "totalPrice     Decimal$1 @db.Decimal(18, 2)");

// Them relations cho SQL Server
const relationsToFix = [
  {
    from: 'manager       User?    @relation("ManagerEmployee", fields: [managerId], references: [id])',
    to: 'manager       User?    @relation("ManagerEmployee", fields: [managerId], references: [id], onDelete: NoAction, onUpdate: NoAction)',
  },
  {
    from: "subordinates  User[]   @relation(\"ManagerEmployee\")",
    to: "subordinates  User[]   @relation(\"ManagerEmployee\", onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: 'requester     User       @relation("Requester", fields: [requesterId], references: [id])',
    to: 'requester     User       @relation("Requester", fields: [requesterId], references: [id], onDelete: NoAction, onUpdate: NoAction)',
  },
  {
    from: "approvalSteps  ApprovalStep[]",
    to: "approvalSteps  ApprovalStep[]  @relation(onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "request       AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)",
    to: "request       AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade, onUpdate: NoAction)",
  },
  {
    from: "category      DeviceCategory @relation(fields: [categoryId], references: [id])",
    to: "category      DeviceCategory @relation(fields: [categoryId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "deviceModel   DeviceModel?  @relation(fields: [deviceModelId], references: [id])",
    to: "deviceModel   DeviceModel?  @relation(fields: [deviceModelId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "poItems POItem[]",
    to: "poItems POItem[]  @relation(onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "request    AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)",
    to: "request    AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade, onUpdate: NoAction)",
  },
  {
    from: "approver   User         @relation(fields: [approverId], references: [id])",
    to: "approver   User         @relation(fields: [approverId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "requests PurchaseOrderRequest[]",
    to: "requests PurchaseOrderRequest[]  @relation(onDelete: Cascade, onUpdate: NoAction)",
  },
  {
    from: "request         AssetRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade)",
    to: "request         AssetRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade, onUpdate: NoAction)",
  },
  {
    from: "requestItem   RequestItem?  @relation(fields: [requestItemId], references: [id])",
    to: "requestItem   RequestItem?  @relation(fields: [requestItemId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "request         AssetRequest? @relation(fields: [requestId], references: [id])",
    to: "request         AssetRequest? @relation(fields: [requestId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "currentHolder   User?         @relation(\"CurrentHolder\", fields: [currentHolderId], references: [id])",
    to: "currentHolder   User?         @relation(\"CurrentHolder\", fields: [currentHolderId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)",
    to: "asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade, onUpdate: NoAction)",
  },
  {
    from: "employee          User         @relation(\"EmployeeHandover\", fields: [employeeId], references: [id])",
    to: "employee          User         @relation(\"EmployeeHandover\", fields: [employeeId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "itStaff           User         @relation(\"ITHandover\", fields: [itStaffId], references: [id])",
    to: "itStaff           User         @relation(\"ITHandover\", fields: [itStaffId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "handover   Handover @relation(fields: [handoverId], references: [id], onDelete: Cascade)",
    to: "handover   Handover @relation(fields: [handoverId], references: [id], onDelete: Cascade, onUpdate: NoAction)",
  },
  {
    from: "asset      Asset    @relation(fields: [assetId], references: [id])",
    to: "asset      Asset    @relation(fields: [assetId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "models       DeviceModel[]",
    to: "models       DeviceModel[]  @relation(onDelete: Cascade, onUpdate: NoAction)",
  },
  {
    from: "category   DeviceCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)",
    to: "category   DeviceCategory @relation(fields: [categoryId], references: [id], onDelete: NoAction, onUpdate: NoAction)",
  },
  {
    from: "requestItems RequestItem[]",
    to: "requestItems RequestItem[]  @relation(onDelete: NoAction, onUpdate: NoAction)",
  },
];

relationsToFix.forEach(({ from, to }) => {
  if (content.includes(from)) {
    content = content.replace(from, to);
    console.log("Fixed:", from.substring(0, 50) + "...");
  }
});

fs.writeFileSync(file, content, "utf-8");
console.log("\nSchema updated for SQL Server");