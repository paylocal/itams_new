const fs = require("fs");
const path = require("path");

// 1. Sua translation-manager.tsx de them credentials
const file = path.join(__dirname, "src/components/admin/translation-manager.tsx");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes('credentials: "include"')) {
  content = content.replace(
    /method: "PUT",\s*\n\s*headers: \{\s*"Content-Type": "application\/json",\s*\}/g,
    'method: "PUT",\n        headers: { "Content-Type": "application/json" },\n        credentials: "include",'
  );
  content = content.replace(
    /method: "POST",\s*\n\s*headers: \{\s*"Content-Type": "application\/json",\s*\}/g,
    'method: "POST",\n        headers: { "Content-Type": "application/json" },\n        credentials: "include",'
  );
  content = content.replace(
    /method: "DELETE",/g,
    "method: \"DELETE\",\n        credentials: \"include\","
  );

  fs.writeFileSync(file, content, "utf-8");
  console.log("Updated translation-manager with credentials");
}