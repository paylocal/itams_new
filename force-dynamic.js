const fs = require("fs");
const path = require("path");

const files = [
  "src/app/api/languages/route.ts",
  "src/app/api/translations/[locale]/route.ts",
  "src/app/api/admin/translations/route.ts",
  "src/app/api/admin/languages/route.ts",
  "src/app/api/admin/languages/[id]/route.ts",
];

files.forEach((f) => {
  const file = path.join(__dirname, f);
  if (!fs.existsSync(file)) {
    console.log("MISS:", f);
    return;
  }
  let content = fs.readFileSync(file, "utf-8");
  
  // Them dynamic vao cuoi file (sau tat ca import)
  if (!content.includes("export const dynamic")) {
    // Tim sau cac imports
    const importEndIdx = content.lastIndexOf("import ");
    if (importEndIdx !== -1) {
      const endOfLine = content.indexOf("\n", importEndIdx);
      const insertPos = content.indexOf("\n\n", endOfLine) + 2;
      if (insertPos > 1) {
        content = content.slice(0, insertPos) + "\nexport const dynamic = \"force-dynamic\";\nexport const revalidate = 0;\n" + content.slice(insertPos);
        fs.writeFileSync(file, content);
        console.log("Updated:", f);
      }
    }
  } else {
    console.log("Has dynamic:", f);
  }
});