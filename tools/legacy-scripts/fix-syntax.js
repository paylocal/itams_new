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

// Sua cac dong alert/bi loi nhay kep
content = content.replace(
  /alert\("\{t\("admin\.codeNameRequired"\)\}"\);/g,
  'alert("Code va name khong duoc trong");'
);
content = content.replace(
  /alert\("Xoa " \+ lang\.name \+ "\?"\);/g,
  'alert("Xoa " + lang.name + "? Tat ca translations se bi xoa!");'
);

fs.writeFileSync(file, content, "utf-8");
console.log("Fixed syntax");