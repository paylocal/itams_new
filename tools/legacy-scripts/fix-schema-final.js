const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "prisma", "schema.prisma");
let content = fs.readFileSync(file, "utf-8");

// LOI 1: POItem.requestItem thieu relation nguoc trong RequestItem
// Them "poItems POItem[]" trong RequestItem
content = content.replace(
  "specs         String?",
  "specs         String?\n  poItems       POItem[]"
);

// LOI 2: Supplier.purchaseOrders da co, nhung PurchaseOrder chua co supplierId
// Kiem tra PurchaseOrder co supplier chua
if (!content.includes("supplier        Supplier?")) {
  content = content.replace(
    "supplierName    String",
    "supplierId      String?\n  supplier        Supplier?    @relation(fields: [supplierId], references: [id])\n  supplierName    String"
  );
}

fs.writeFileSync(file, content);
console.log("Schema fixed");