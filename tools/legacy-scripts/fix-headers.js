const fs = require("fs");
const path = require("path");

const filesToFix = [
  "src/components/layout/sidebar.tsx",
  "src/components/admin/admin-language-tabs.tsx",
  "src/components/admin/language-manager.tsx",
  "src/components/admin/translation-manager.tsx",
];

filesToFix.forEach((f) => {
  const file = path.join(__dirname, f);
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, "utf-8");
  let changed = false;

  // Them dynamic vao neu chua co
  if (!content.includes("export const dynamic")) {
    // Them sau cac imports
    const lines = content.split("\n");
    let lastImport = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ") || lines[i].startsWith('import "') || lines[i].startsWith("import {")) {
        lastImport = i;
      }
    }
    lines.splice(lastImport + 2, 0, "export const dynamic = \"force-dynamic\";", "export const revalidate = 0;");
    content = lines.join("\n");
    changed = true;
  }

  fs.writeFileSync(file, content);
  if (changed) console.log("Updated:", f);
});