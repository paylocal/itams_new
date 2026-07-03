const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/lib/auth.ts");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes("req?.headers?.host")) {
  content = content.replace(
    /async session\(\{ session, token \}\) \{/,
    `async session({ session, token, req }) {`
  );
}
fs.writeFileSync(file, content, "utf-8");
console.log("Updated session signature");