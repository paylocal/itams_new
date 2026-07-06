const fs = require("fs");
const path = require("path");

const content = `# Hướng dẫn cài đặt ITAMS với SQL Server

## Bước 1: Cài SQL Server
- Tải SQL Server Express: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- Chọn **Basic** install
- Đặt password cho **sa** (ghi nhớ password này)

## Bước 2: Tạo database
Mở **SQL Server Management Studio** hoặc chạy CMD:
\`\`\`cmd
sqlcmd -S localhost -U sa -P "YourPassword" -Q "CREATE DATABASE itams"
\`\`\`

## Bước 3: Sửa file .env
Thay đổi:
- \`IP_SERVER\` → IP máy chạy SQL Server (ví dụ: 192.168.10.13)
- \`YourStrongPassword\` → Password của user sa

Ví dụ:
\`\`\`
DATABASE_URL="sqlserver://192.168.10.13:1433;database=itams;user=sa;password=MyPass123;encrypt=true;trustServerCertificate=true"
NEXTAUTH_URL="http://192.168.10.13:3000"
\`\`\`

## Bước 4: Chạy migration + seed
\`\`\`bash
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
node seed-langs.js
\`\`\`

## Bước 5: Mở firewall (Admin PowerShell)
\`\`\`powershell
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow
\`\`\`

## Bước 6: Chạy server
\`\`\`bash
npm run dev
\`\`\`

## Bước 7: Truy cập
- Từ máy chủ: \`http://localhost:3000\`
- Từ máy khác: \`http://IP_SERVER:3000\`

## Tài khoản test:
- admin@company.com / password123
- manager@company.com / password123
- it1@company.com / password123
- purchase@company.com / password123
- employee1@company.com / password123
`;

fs.writeFileSync("README_SQLSERVER.md", content, "utf-8");
console.log("Created README_SQLSERVER.md");