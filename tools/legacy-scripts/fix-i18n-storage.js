const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/i18n-provider.tsx");
let content = fs.readFileSync(file, "utf-8");

// Wrap localStorage trong try-catch
content = content.replace(
  /localStorage\.getItem\("locale"\)/g,
  `try { return localStorage.getItem("locale"); } catch { return null; }`
);

content = content.replace(
  /localStorage\.setItem\("locale", l\)/g,
  `try { localStorage.setItem("locale", l); } catch {}`
);

fs.writeFileSync(file, content, "utf-8");
console.log("Updated i18n-provider with safe localStorage");