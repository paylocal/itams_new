const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "prisma/schema.prisma");
let content = fs.readFileSync(file, "utf-8");

// Doi provider tu sqlite sang sqlserver
content = content.replace(
  /provider\s*=\s*"sqlite"/,
  'provider = "sqlserver"'
);

fs.writeFileSync(file, content, "utf-8");
console.log("Updated schema.prisma to sqlserver");