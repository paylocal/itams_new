const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/lib/auth.ts");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes("trustHost: true")) {
  content = content.replace(
    "secret: process.env.NEXTAUTH_SECRET",
    "trustHost: true,\n  secret: process.env.NEXTAUTH_SECRET"
  );
  fs.writeFileSync(file, content, "utf-8");
  console.log("Added trustHost");
}