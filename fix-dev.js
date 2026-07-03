const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "package.json");
const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));

// Them -H 0.0.0.0 de cho phep truy cap tu may khac
pkg.scripts.dev = "next dev -H 0.0.0.0 -p 3000";

fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
console.log("Updated dev script");
console.log("New dev:", pkg.scripts.dev);