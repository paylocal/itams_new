const fs = require("fs");
const path = require("path");

const sqlServerIP = "118.69.11.20";
const password = "Nguyen@3012";
const itamsIP = "192.168.10.13";

// File .env
const envContent = `DATABASE_URL="sqlserver://${sqlServerIP}:1433;database=itams;user=sa;password=${password};encrypt=true;trustServerCertificate=true"
NEXTAUTH_SECRET="itams-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://${itamsIP}:3000"
`;

fs.writeFileSync(".env", envContent, "utf-8");
console.log("Created .env");
console.log("Update IP if needed");