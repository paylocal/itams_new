const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, ".env");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes("NEXTAUTH_URL")) {
  // Them vao cuoi
  const ip = "192.168.10.13";
  content = content + `\nNEXTAUTH_URL="http://${ip}:3000"\n`;
  fs.writeFileSync(file, content);
  console.log("Added NEXTAUTH_URL");
} else {
  console.log("NEXTAUTH_URL exists");
}