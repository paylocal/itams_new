const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/layout/header.tsx");
let content = fs.readFileSync(file, "utf-8");

// Wrap tat ca localStorage trong try-catch
content = content.replace(
  /const saved = localStorage\.getItem\("theme"\) as/,
  'let saved = null; try { saved = localStorage.getItem("theme") as'
);
content = content.replace(
  /;\s*if \(saved\) setTheme\(saved\);/,
  '; } catch {} if (saved) setTheme(saved);'
);

content = content.replace(
  /localStorage\.setItem\("theme", theme\);/g,
  'try { localStorage.setItem("theme", theme); } catch {}'
);

content = content.replace(
  /const saved = typeof window !== "undefined" \? localStorage\.getItem\("locale"\) : null;/,
  'let saved: string | null = null; try { if (typeof window !== "undefined") saved = localStorage.getItem("locale"); } catch {}'
);

content = content.replace(
  /localStorage\.setItem\("locale", l\);/g,
  'try { localStorage.setItem("locale", l); } catch {}'
);

fs.writeFileSync(file, content, "utf-8");
console.log("Updated header with safe localStorage");