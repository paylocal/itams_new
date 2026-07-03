const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/i18n-provider.tsx");
let content = fs.readFileSync(file, "utf-8");

// Kiem tra co khong - them neu thieu
const check = `if (typeof window === "undefined") return null;`;
if (!content.includes(check)) {
  // Them doan safe localStorage neu chua co
  const safeLocal = `
function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSetLocalStorage(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  } catch {}
}
`;

  // Chen vao truoc I18nProvider
  content = content.replace(
    /export function I18nProvider/,
    safeLocal + "\\nexport function I18nProvider"
  );

  // Thay the localStorage go
  content = content.replace(
    /localStorage\.getItem\("locale"\)/g,
    "safeGetLocalStorage(\"locale\")"
  );
  content = content.replace(
    /localStorage\.setItem\("locale", l\)/g,
    "safeSetLocalStorage(\"locale\", l)"
  );
}

// Dam bao fetch /api/languages
content = content.replace(
  /fetch\("\/api\/languages"\)/g,
  'fetch("/api/languages", { cache: "no-store" })'
);

fs.writeFileSync(file, content, "utf-8");
console.log("Updated i18n-provider");