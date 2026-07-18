const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/theme-provider.tsx");
let content = fs.readFileSync(file, "utf-8");

if (content.includes("localStorage")) {
  content = content.replace(
    /const saved = localStorage\.getItem\("theme"\) as/,
    'let saved: any = null; try { saved = localStorage.getItem("theme") as'
  );
  content = content.replace(
    /;\s*if \(saved\) setTheme\(saved\);/,
    '; } catch {} if (saved) setTheme(saved);'
  );
  content = content.replace(
    /localStorage\.setItem\("theme", theme\);/g,
    'try { localStorage.setItem("theme", theme); } catch {}'
  );

  fs.writeFileSync(file, content, "utf-8");
  console.log("Updated theme-provider with safe localStorage");
}