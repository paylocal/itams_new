const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src/app/api/translations/[locale]/route.ts"
);

let content = fs.readFileSync(file, "utf-8");

// Fix: Su dung Promise.all va prisma findMany voi cache
if (content.includes("findUnique")) {
  content = content.replace(
    /language\.translations\.forEach\(\(t\) => \{\s*dict\[t\.key\]\s*=\s*t\.value;\s*\}\);/,
    "language.translations.forEach((t) => { dict[t.key] = t.value; });"
  );
}

fs.writeFileSync(file, content);
console.log("Updated");
