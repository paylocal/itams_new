const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "components", "layout", "header.tsx");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes("ThemeToggle")) {
  // Them import
  if (content.includes('import { LogOut, Globe')) {
    content = content.replace(
      'import { LogOut, Globe',
      'import { LogOut, Globe, Moon'
    );
  } else if (content.includes('from "lucide-react"')) {
    content = content.replace(
      'from "lucide-react";',
      'from "lucide-react";\nimport { ThemeToggle } from "../theme-toggle";'
    );
  }

  // Them component truoc language switcher
  content = content.replace(
    "{/* Language Switcher */}",
    "{/* Theme Toggle */}\n        <ThemeToggle />\n\n        {/* Language Switcher */}"
  );

  fs.writeFileSync(file, content);
  console.log("Updated header");
}