const fs = require("fs");
const path = require("path");

const files = [
  "src/app/api/languages/route.ts",
  "src/app/api/translations/[locale]/route.ts",
  "src/app/api/admin/languages/route.ts",
  "src/app/api/admin/languages/[id]/route.ts",
  "src/app/api/admin/translations/route.ts",
  "src/components/admin/language-manager.tsx",
  "src/components/admin/translation-manager.tsx",
  "src/components/admin/admin-language-tabs.tsx",
  "src/app/(dashboard)/admin/languages/page.tsx",
  "src/components/i18n-provider.tsx",
  "src/components/theme-provider.tsx",
  "src/components/providers.tsx",
];

files.forEach((f) => {
  const full = path.join(__dirname, f);
  const exists = fs.existsSync(full);
  console.log((exists ? "OK   " : "MISS ") + f);
});