const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, ".env");
const ipSQL = "118.69.11.20";        // IP may SQL Server
const itamsIP = "192.168.10.13";      // IP may ITAMS (thay neu khac)
const password = "Nguyen@3012";  // Password sa (thay neu khac)

const content = `DATABASE_URL="sqlserver://${ipSQL}:1433;database=itams;user=sa;password=${password};encrypt=true;trustServerCertificate=true"
NEXTAUTH_SECRET="itams-secret-key-2024-production"
NEXTAUTH_URL="http://${itamsIP}:3000"
`;

fs.writeFileSync(envFile, content);
console.log("Created .env");
console.log("Database:", ipSQL + ":1433");
console.log("App URL:", "http://" + itamsIP + ":3000");