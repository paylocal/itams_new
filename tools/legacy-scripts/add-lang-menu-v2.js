const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "components", "layout", "sidebar.tsx");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes("/admin/languages")) {
  // Them vao phan ADMIN - sau dashboard
  content = content.replace(
    /(ADMIN:\s*\[\s*\{ href: "\/dashboard",\s*labelKey: "nav\.dashboard",\s*icon: LayoutDashboard \},?\s*)/,
    '$1\n  { href: "/admin/languages", labelKey: "nav.languages", icon: Globe, fallback: "Languages" },'
  );

  // Them import Globe neu chua co
  if (content.includes("Globe, ChevronDown")) {
    content = content.replace(
      "Globe, ChevronDown",
      "Globe, ChevronDown, Languages"
    );
  } else {
    // Them import moi
    content = content.replace(
      /import \{([^}]+)\} from "lucide-react";/,
      (match, imports) => {
        if (!imports.includes("Globe")) {
          return match.replace(imports, imports + ", Globe, Languages");
        }
        return match;
      }
    );
  }

  fs.writeFileSync(file, content);
  console.log("Updated sidebar");
} else {
  console.log("Already exists");
}