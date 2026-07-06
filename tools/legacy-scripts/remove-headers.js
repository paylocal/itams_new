const fs = require("fs");
const path = require("path");

// Xoa header trong language-manager
const file1 = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "language-manager.tsx"
);
let content1 = fs.readFileSync(file1, "utf-8");

// Xoa dong <h1>Quan ly Ngon ngu</h1>
content1 = content1.replace(
  /<div>\s*<h1 className="text-2xl font-bold">Quan ly Ngon ngu<\/h1>\s*<\/div>\s*/,
  ""
);
content1 = content1.replace(
  /<p className="text-gray-500 mt-1">Them, sua, xoa ngon ngu<\/p>\s*/,
  ""
);

fs.writeFileSync(file1, content1);
console.log("Updated language-manager");

// Xoa header trong translation-manager
const file2 = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "translation-manager.tsx"
);
let content2 = fs.readFileSync(file2, "utf-8");

// Xoa dong <h2>Translations</h2>
content2 = content2.replace(
  /<div className="flex justify-between items-center">\s*<div>\s*<h2 className="text-xl font-bold">Translations<\/h2>[\s\S]*?<\/div>\s*<\/div>\s*/,
  ""
);
content2 = content2.replace(
  /<p className="text-sm text-gray-500">\s*Sua noi dung dich cho tung ngon ngu\s*<\/p>\s*/,
  ""
);

fs.writeFileSync(file2, content2);
console.log("Updated translation-manager");