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

// Them useI18n
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

// Thay the text cu the bang t()
content = content.replace(
  '>Quan ly Ngon ngu &amp; Translations<',
  '>{t("admin.title")}<'
);
content = content.replace(
  '>Quan ly Ngon ngu & Translations<',
  '>{t("admin.title")}<'
);
content = content.replace(
  '>Them, sua, xoa ngon ngu va noi dung dich<',
  '>{t("admin.subtitle")}<'
);
content = content.replace(
  '>Ngon ngu<',
  '>{t("nav.languages")}<'
);
content = content.replace(
  '>Translations<',
  '>{t("nav.translations")}<'
);

fs.writeFileSync(file, content, "utf-8");
console.log("Updated");