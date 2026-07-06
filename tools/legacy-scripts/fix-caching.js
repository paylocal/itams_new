const fs = require("fs");
const path = require("path");

const files = [
  "src/app/api/admin/translations/route.ts",
  "src/app/api/admin/languages/route.ts",
  "src/app/api/languages/route.ts",
  "src/app/api/translations/[locale]/route.ts",
];

files.forEach((f) => {
  const file = path.join(__dirname, f);
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, "utf-8");

  // Them dynamic vao ngay sau imports
  if (!content.includes("export const dynamic")) {
    // Tim dong import cuoi cung
    const lines = content.split("\n");
    let lastImport = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) {
        lastImport = i;
      }
    }
    lines.splice(lastImport + 1, 0, "", "export const dynamic = \"force-dynamic\";", "export const revalidate = 0;", "");
    fs.writeFileSync(file, lines.join("\n"));
    console.log("Added dynamic to:", f);
  } else {
    console.log("Already has dynamic:", f);
  }
});
