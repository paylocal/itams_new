const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, ".env");
let content = fs.readFileSync(envFile, "utf-8");

// Thay the DATABASE_URL neu can
const ipSQL = "118.69.11.20";  // IP may SQL Server
const password = "Nguyen@3012";  // Password sa

content = `DATABASE_URL="sqlserver://${ipSQL}:1433;database=itams;user=sa;password=${password};encrypt=true;trustServerCertificate=true"\nNEXTAUTH_SECRET="itams-secret-key-2024"\nNEXTAUTH_URL="http://192.168.10.13:3000"\n`;

fs.writeFileSync(envFile, content);
console.log("Updated .env");