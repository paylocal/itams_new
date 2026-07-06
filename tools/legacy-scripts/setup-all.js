const fs = require("fs");
const path = require("path");

// ============ 1. CẬP NHẬT .env ============
const envFile = path.join(__dirname, ".env");
const envContent = `DATABASE_URL="sqlserver://IP_SERVER:1433;database=itams;user=sa;password=YourStrongPassword;encrypt=true;trustServerCertificate=true"
NEXTAUTH_SECRET="itams-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://IP_SERVER:3000"
`;

fs.writeFileSync(envFile, envContent, "utf-8");
console.log("Created .env - Replace IP_SERVER and password!");