const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "admin-language-tabs.tsx"
);
let content = fs.readFileSync(file, "utf-8");

// Thay cac text cu the bang t() de load tu DB
content = content.replace(
  /Quan ly Ngon ngu & Translations/g,
  '{t("admin.title")}'
);
content = content.replace(
  /Them, sua, xoa ngon ngu va noi dung dich/g,
  '{t("admin.subtitle")}'
);
content = content.replace(
  /<Globe className="w-4 h-4" \/>\s*Ngon ngu/g,
  '<Globe className="w-4 h-4" />{t("nav.languages")}'
);
content = content.replace(
  /<Type className="w-4 h-4" \/>\s*Translations/g,
  '<Type className="w-4 h-4" />{t("nav.translations")}'
);

// Them import useI18n neu chua co
if (!content.includes("useI18n")) {
  content = content.replace(
    'import { LanguageManager } from "./language-manager";',
    'import { useI18n } from "../i18n-provider";\nimport { LanguageManager } from "./language-manager";'
  );
  content = content.replace(
    "export function AdminLanguageTabs() {",
    "export function AdminLanguageTabs() {\n  const { t } = useI18n();"
  );
}

fs.writeFileSync(file, content, "utf-8");
console.log("Updated");