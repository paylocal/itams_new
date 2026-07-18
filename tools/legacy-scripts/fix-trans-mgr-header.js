const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "translation-manager.tsx"
);
let content = fs.readFileSync(file, "utf-8");

// Xoa header vi no duoc render boi tabs
content = content.replace(
  /<div className="flex justify-between items-center">\s*<div>\s*<h2 className="text-xl font-bold">Translations<\/h2>[\s\S]*?<\/div>\s*<\/div>\s*/,
  ""
);

fs.writeFileSync(file, code);
console.log("Updated");