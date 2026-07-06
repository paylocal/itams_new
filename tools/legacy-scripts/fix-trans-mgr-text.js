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

// Thay text cu the bang t()
content = content.replace(
  /<h2 className="text-xl font-bold">Translations<\/h2>/g,
  '<h2 className="text-xl font-bold">{t("nav.translations")}</h2>'
);
content = content.replace(
  /Sua noi dung dich cho tung ngon ngu<\/p>/g,
  '{t("admin.translationsSubtitle")}</p>'
);
content = content.replace(
  /<Globe className="w-3 h-3" \/>/g,
  '<Globe className="w-3 h-3" />'
);
content = content.replace(
  /\(default\)<\/span>/g,
  '{t("admin.default")}</span>'
);
content = content.replace(
  /Tim kiem key\.\.\./g,
  '{t("common.search")}...'
);
content = content.replace(
  /Tat ca<\/option>/g,
  '{t("admin.all")}</option>'
);
content = content.replace(
  /Co thay doi chua luu\. Click "Luu tat ca" de luu\./g,
  '{t("admin.unsavedChanges")}'
);
content = content.replace(
  /\+ Them translation moi<\/p>/g,
  '{t("admin.addNewTranslation")}</p>'
);
content = content.replace(
  /category\.key \(vd: common\.hello\)/g,
  '{t("admin.categoryKey")}'
);
content = content.replace(
  /Gia tri<\/option>/g,
  '{t("admin.value")}</option>'
);
content = content.replace(
  /common<\/option>/g,
  'common</option>'
);
content = content.replace(
  /Co thay doi chua luu\./g,
  '{t("admin.unsavedHint")}'
);
content = content.replace(
  /Co keys<\/div>/g,
  '{t("admin.noKeys")}</div>'
);
content = content.replace(
  /Dang tai\.\.\.<\/div>/g,
  '{t("common.loading")}...</div>'
);
content = content.replace(
  /Luu tat ca<\/button>/g,
  '{t("common.save")} ({t("admin.all")})</button>'
);

// Them import useI18n neu chua co
if (!content.includes("useI18n")) {
  content = content.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect } from "react";\nimport { useI18n } from "../i18n-provider";'
  );
  content = content.replace(
    "export function TranslationManager() {",
    "export function TranslationManager() {\n  const { t } = useI18n();"
  );
}

fs.writeFileSync(file, content, "utf-8");
console.log("Updated");