const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "prisma/schema.prisma");
let content = fs.readFileSync(file, "utf-8");

// Tim pattern trong PurchaseOrder de them supplierId
const old = `  supplierPhone   String?
  orderDate       DateTime`;

if (content.includes(old) && !content.includes("supplierId")) {
  content = content.replace(
    old,
    `  supplierPhone   String?
  supplierId      String?
  supplier        Supplier?    @relation(fields: [supplierId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  orderDate       DateTime`
  );
  fs.writeFileSync(file, content, "utf-8");
  console.log("Added supplierId to PurchaseOrder");
} else if (content.includes("supplierId")) {
  console.log("supplierId already exists");
} else {
  console.log("Pattern not found, please add manually");
}