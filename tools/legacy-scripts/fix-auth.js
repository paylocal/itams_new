const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "lib", "auth.ts");
let content = fs.readFileSync(file, "utf-8");

// Them trustHost vao authOptions
if (!content.includes("trustHost")) {
  // Them sau secret
  content = content.replace(
    "secret: process.env.NEXTAUTH_SECRET,",
    "secret: process.env.NEXTAUTH_SECRET,\n  trustHost: true,"
  );
  fs.writeFileSync(file, content);
  console.log("Added trustHost to auth.ts");
} else {
  console.log("trustHost already exists");
}