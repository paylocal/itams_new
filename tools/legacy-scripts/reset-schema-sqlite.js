const fs = require("fs");
const path = require("path");

const code = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  passwordHash  String
  role          String   @default("EMPLOYEE")
  department    String?
  position      String?
  managerId     String?
  manager       User?    @relation("ManagerEmployee", fields: [managerId], references: [id])
  subordinates  User[]   @relation("ManagerEmployee")
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  requestsCreated    AssetRequest[] @relation("Requester")
  approvalsGiven     ApprovalStep[]
  assetsAssigned     Asset[]        @relation("CurrentHolder")
  handoverAsEmployee Handover[]     @relation("EmployeeHandover")
  handoverAsIT       Handover[]     @relation("ITHandover")
}

model AssetRequest {
  id            String     @id @default(cuid())
  requestNumber String     @unique
  requesterId   String
  requester     User       @relation("Requester", fields: [requesterId], references: [id])
  title         String
  reason        String
  priority      String     @default("NORMAL")
  status        String     @default("DRAFT")
  currentStep   Int        @default(1)
  isLocked      Boolean    @default(false)
  totalAmount   Float?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  completedAt   DateTime?

  approvalSteps  ApprovalStep[]
  items          RequestItem[]
  purchaseOrders PurchaseOrderRequest[]
  assets         Asset[]
}

model RequestItem {
  id            String   @id @default(cuid())
  requestId     String
  request       AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  categoryId    String
  category      DeviceCategory @relation(fields: [categoryId], references: [id])
  deviceModelId String?
  deviceModel   DeviceModel?  @relation(fields: [deviceModelId], references: [id])
  customName    String?
  quantity      Int      @default(1)
  unitPrice     Float?
  totalPrice    Float?
  specs         String?
}

model ApprovalStep {
  id         String       @id @default(cuid())
  requestId  String
  request    AssetRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  stepNumber Int
  approverId String
  approver   User         @relation(fields: [approverId], references: [id])
  decision   String?
  comment    String?
  decidedAt  DateTime?
  createdAt  DateTime     @default(now())

  @@unique([requestId, stepNumber])
}

model PurchaseOrder {
  id              String       @id @default(cuid())
  poNumber        String       @unique
  supplierName    String
  supplierContact String?
  supplierPhone   String?
  orderDate       DateTime     @default(now())
  expectedDate    DateTime?
  actualDate      DateTime?
  totalAmount     Float
  poDocument      String?
  invoiceDocument String?
  notes           String?
  status          String       @default("DRAFT")
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  items    POItem[]
  requests PurchaseOrderRequest[]
  assets   Asset[]
}

model PurchaseOrderRequest {
  id              String        @id @default(cuid())
  purchaseOrderId String
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  requestId       String
  request         AssetRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade)
  createdAt       DateTime      @default(now())

  @@unique([purchaseOrderId, requestId])
}

model POItem {
  id            String   @id @default(cuid())
  poId          String
  po            PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)
  requestItemId String?
  requestItem   RequestItem?  @relation(fields: [requestItemId], references: [id])
  productName   String
  quantity      Int      @default(1)
  unitPrice     Float
  totalPrice    Float
}

model Asset {
  id              String        @id @default(cuid())
  assetTag        String        @unique
  qrCode          String        @unique
  name            String
  category        String
  brand           String?
  model           String?
  serialNumber    String?
  status          String        @default("NEW")
  requestId       String?
  request         AssetRequest? @relation(fields: [requestId], references: [id])
  purchaseOrderId String?
  purchaseOrder   PurchaseOrder? @relation(fields: [purchaseOrderId], references: [id])
  currentHolderId String?
  currentHolder   User?         @relation("CurrentHolder", fields: [currentHolderId], references: [id])
  assignedDate    DateTime?
  location        String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  handoverItems HandoverItem[]
  assetHistory  AssetHistory[]
}

model AssetHistory {
  id          String   @id @default(cuid())
  assetId     String
  asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  action      String
  toUserId    String?
  performedBy String
  notes       String?
  createdAt   DateTime @default(now())
}

model Handover {
  id                String       @id @default(cuid())
  handoverNumber    String       @unique
  requestId         String
  employeeId        String
  employee          User         @relation("EmployeeHandover", fields: [employeeId], references: [id])
  itStaffId         String
  itStaff           User         @relation("ITHandover", fields: [itStaffId], references: [id])
  employeeSignature String?
  employeeSignedAt  DateTime?
  itSignature       String?
  itSignedAt        DateTime?
  status            String       @default("PENDING_EMPLOYEE_SIGN")
  handoverDate      DateTime
  pdfUrl            String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  items HandoverItem[]
}

model HandoverItem {
  id         String   @id @default(cuid())
  handoverId String
  handover   Handover @relation(fields: [handoverId], references: [id], onDelete: Cascade)
  assetId    String
  asset      Asset    @relation(fields: [assetId], references: [id])
  condition  String?
}

model DeviceCategory {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  hasModel  Boolean  @default(false)
  isActive  Boolean  @default(true)
  order     Int      @default(0)
  createdAt DateTime @default(now())

  models       DeviceModel[]
  requestItems RequestItem[]
}

model DeviceModel {
  id         String   @id @default(cuid())
  categoryId String
  category   DeviceCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  brand      String
  name       String
  avgPrice   Float?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())

  requestItems RequestItem[]
}

model Supplier {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  contactName String?
  phone       String?
  email       String?
  address     String?
  taxCode     String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  purchaseOrders PurchaseOrder[]
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  userName    String
  action      String
  entity      String
  entityId    String
  oldData     String?
  newData     String?
  description String?
  createdAt   DateTime @default(now())
}

model SLAConfig {
  id              String   @id @default(cuid())
  stepName        String   @unique
  hoursToApprove  Int
  updatedAt       DateTime @updatedAt
}
`;

const file = path.join(__dirname, "prisma", "schema.prisma");
fs.writeFileSync(file, code);
console.log("Schema reset to SQLite");