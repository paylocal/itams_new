const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "package.json");
const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));

console.log("Current scripts:");
console.log(JSON.stringify(pkg.scripts, null, 2));
console.log("\nFull package.json:");
console.log(JSON.stringify(pkg, null, 2));