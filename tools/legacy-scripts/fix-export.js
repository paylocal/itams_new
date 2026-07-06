const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/i18n-provider.tsx");
let content = fs.readFileSync(file, "utf-8");

// Sua ten function export
content = content.replace(
  "export function I18nI18n() {",
  "export function useI18n() {"
);
content = content.replace(
  "export const useI18n = useContext;",
  ""
);

fs.writeFileSync(file, content, "utf-8");
console.log("Fixed exports");