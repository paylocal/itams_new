const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/layout/sidebar.tsx");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes("/admin/languages")) {
  // Them menu Languages vao phan ADMIN
  content = content.replace(
    '    { href: "/admin/users", labelKey: "nav.users"',
    '    { href: "/admin/languages", labelKey: "nav.languages", icon: Globe, fallback: "Languages" },\n    { href: "/admin/users", labelKey: "nav.users"'
  );

  // Them Globe neu chua co import
  if (content.includes("Tag,")) {
    content = content.replace(
      "Tag,",
      "Tag, Globe,"
    );
  } else if (content.includes("FileSignature,")) {
    content = content.replace(
      "FileSignature,",
      "FileSignature, Globe,"
    );
  }

  fs.writeFileSync(file, content, "utf-8");
  console.log("Added Languages menu");
} else {
  console.log("Languages menu exists");
}