const fs = require("fs");
const path = require("path");

// Xoa cac file cu
const filesToDelete = [
  "src/app/api/admin/languages/route.ts",
  "src/app/api/admin/languages/[id]/route.ts",
  "src/app/api/admin/translations/route.ts",
  "src/app/api/languages/route.ts",
  "src/app/api/translations/[locale]/route.ts",
  "src/components/admin/language-manager.tsx",
  "src/components/admin/translation-manager.tsx",
  "src/components/admin/admin-language-tabs.tsx",
  "src/app/(dashboard)/admin/languages/page.tsx",
  "src/components/i18n-provider.tsx",
  "src/components/theme-provider.tsx",
];

filesToDelete.forEach((f) => {
  const full = path.join(__dirname, f);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log("Deleted:", f);
  }
});

// Xoa cac thu muc
const dirsToDelete = [
  "src/app/api/admin/languages",
  "src/app/api/admin/translations",
  "src/app/api/languages",
  "src/app/api/translations",
  "src/app/(dashboard)/admin/languages",
];

dirsToDelete.forEach((d) => {
  const full = path.join(__dirname, d);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log("Deleted dir:", d);
  }
});

console.log("Done cleanup");