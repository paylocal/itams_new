const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "tailwind.config.js");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes("darkMode")) {
  content = content.replace(
    "module.exports = {",
    "module.exports = {\n  darkMode: \"class\","
  );
  fs.writeFileSync(file, content);
  console.log("Updated tailwind");
}