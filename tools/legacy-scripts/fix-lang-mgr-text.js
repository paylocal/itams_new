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

// Thay text cu the bang t()
content = content.replace(
  /Quan ly Ngon ngu<\/h2>/g,
  '{t("nav.languages")}</h2>'
);
content = content.replace(
  /Them, sua, xoa ngon ngu<\/p>/g,
  '{t("admin.languagesSubtitle")}</p>'
);
content = content.replace(
  /Code va name khong duoc trong/g,
  '{t("admin.codeNameRequired")}'
);
content = content.replace(
  /Sua ngon ngu<\/h3>/g,
  '{t("common.edit")}</h3>'
);
content = content.replace(
  /Them moi<\/h3>/g,
  '{t("common.add")}</h3>'
);
content = content.replace(
  /<Trash2 className="w-4 h-4" \/>/g,
  '<Trash2 className="w-4 h-4" />'
);

// Them import useI18n neu chua co
if (!content.includes("useI18n")) {
  content = content.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect } from "react";\nimport { useI18n } from "../i18n-provider";'
  );
  content = content.replace(
    "export function LanguageManager() {",
    "export function LanguageManager() {\n  const { t } = useI18n();"
  );
}

fs.writeFileSync(file, content, "utf-8");
console.log("Updated");