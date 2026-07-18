const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "language-manager.tsx"
);
let content = fs.readFileSync(file, "utf-8");

// Xoa header vi no duoc render boi tabs
content = content.replace(
  /<div>\s*<h1 className="text-2xl font-bold">Quan ly Ngon ngu<\/h1>[\s\S]*?<\/div>\s*/,
  ""
);
content = content.replace(
  /<div>\s*<p className="text-gray-500 mt-1">Them, sua, xoa ngon ngu<\/p>[\s\S]*?<\/div>\s*/,
  ""
);

fs.writeFileSync(file, code);
console.log("Updated");