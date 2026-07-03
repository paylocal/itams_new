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

// Refresh sau khi add new
content = content.replace(
  /setNewKey\(\{ key: "", value: "", category: "common" \}\);\s*\}\s*catch/,
  `setNewKey({ key: "", value: "", category: "common" });
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } catch`
);

fs.writeFileSync(file, content);
console.log("Updated");