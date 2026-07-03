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

// Them router.refresh() sau khi save
content = content.replace(
  /setNewKey\(\{ key: "", value: "", category: "common" \}\);\s*\}\s*catch/,
  `setNewKey({ key: "", value: "", category: "common" });
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } catch`
);

// Them router import
if (!content.includes("useRouter")) {
  content = content.replace(
    "import { useState } from \"react\";",
    "import { useState } from \"react\";\nimport { useRouter } from \"next/navigation\";"
  );
  content = content.replace(
    "export function LanguageManager() {",
    "export function LanguageManager() {\n  const router = useRouter();"
  );
}

fs.writeFileSync(file, content);
console.log("Updated with refresh");