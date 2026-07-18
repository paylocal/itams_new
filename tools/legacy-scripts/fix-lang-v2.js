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

// Them BOM UTF-8 de luu file voi encoding dung
const final = "\uFEFF" + content;

// Dam bao response tu API duoc parse voi UTF-8
content = content.replace(
  /\.json\(\)/g,
  ".json()"
);

// Them log de debug
content = content.replace(
  /async function loadLanguages\(\) \{/,
  `async function loadLanguages() {
    console.log("Loading languages...");`
);

fs.writeFileSync(file, final, { encoding: "utf8" });
console.log("Updated with UTF-8 BOM");