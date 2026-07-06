const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "package.json");
const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));

// Them scripts test
pkg.scripts = {
  ...pkg.scripts,
  test: "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage",
};

fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
console.log("Updated package.json");
console.log("\nNew scripts:");
console.log(JSON.stringify(pkg.scripts, null, 2));