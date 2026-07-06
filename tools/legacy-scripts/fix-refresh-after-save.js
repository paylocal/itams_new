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

// Thay router.refresh() bang window.location.reload()
// De tranh loi router
content = content.replace(
  /await loadLanguages\(\);\s*resetForm\(\);\s*router\.refresh\(\);/g,
  "await loadLanguages(); resetForm(); window.location.reload();"
);

content = content.replace(
  /await loadLanguages\(\);\s*router\.refresh\(\);/g,
  "await loadLanguages(); window.location.reload();"
);

fs.writeFileSync(file, content, "utf-8");
console.log("Updated");