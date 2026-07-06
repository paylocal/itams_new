const fs = require("fs");
const path = require("path");

const files = [
  "src/components/admin/language-manager.tsx",
  "src/components/admin/translation-manager.tsx",
  "src/components/admin/admin-language-tabs.tsx",
  "src/components/i18n-provider.tsx",
  "src/components/providers.tsx",
];

files.forEach((f) => {
  const full = path.join(__dirname, f);
  if (fs.existsSync(full)) {
    const stat = fs.statSync(full);
    const mod = stat.mtime.toISOString().split("T")[0];
    console.log(mod + " " + f);
  } else {
    console.log("MISS " + f);
  }
});