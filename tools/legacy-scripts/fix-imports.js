const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "components",
  "admin",
  "language-manager.tsx"
);
let content = fs.readFileSync(file, "utf-8");

// Them useEffect vao import tu react
if (!content.includes("useEffect")) {
  content = content.replace(
    'import { useState } from "react";',
    'import { useState, useEffect } from "react";'
  );
  console.log("Added useEffect import");
} else {
  console.log("useEffect already imported");
}

fs.writeFileSync(file, content);
console.log("Done");