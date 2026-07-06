const fs = require("fs");
const path = require("path");

const content = `DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="itams-secret-key-12345"
NEXTAUTH_URL="http://localhost:3000"
`;

fs.writeFileSync(".env", content);
console.log("Created .env");
console.log("Content:", fs.readFileSync(".env", "utf-8"));
