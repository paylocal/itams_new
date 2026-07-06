const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src/app/api/admin/translations/route.ts"
);
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, "utf-8");
  if (!content.includes("getServerSession")) {
    console.log("MISSING auth check in translations route!");
  } else {
    console.log("OK has auth check");
  }
}

const file2 = path.join(
  __dirname,
  "src/app/api/admin/languages/route.ts"
);
if (fs.existsSync(file2)) {
  let content = fs.readFileSync(file2, "utf-8");
  if (!content.includes("getServerSession")) {
    console.log("MISSING auth check in languages route!");
  } else {
    console.log("OK has auth check");
  }
}