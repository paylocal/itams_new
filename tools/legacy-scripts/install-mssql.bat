const fs = require("fs");
const path = require("path");

const content = `@echo off
REM ============================================
REM CAI DAT SQL SERVER CHO ITAMS
REM Chay voi quyen Administrator
REM ============================================

echo Buoc 1: Kiem tra SQL Server da cai chua...
sc query "MSSQLSERVER" >nul 2>&1
if %errorlevel%==0 (
    echo SQL Server da duoc cai dat.
    goto :create_db
) else (
    echo Chua co SQL Server. Vui long tai tu:
    echo https://www.microsoft.com/en-us/sql-server/sql-server-downloads
    echo Chon Express (mien phi)
    pause
    exit /b 1
)

:create_db
echo.
echo Buoc 2: Tao database 'itams'...
sqlcmd -S localhost -U sa -P "YourStrongPassword" -Q "CREATE DATABASE itams"
if %errorlevel%==0 (
    echo Database da duoc tao!
) else (
    echo Loi khi tao database. Kiem tra password cua sa.
    pause
    exit /b 1
)

echo.
echo Buoc 3: Mo port 1433 (SQL Server)...
netsh advfirewall firewall add rule name="SQL Server 1433" dir=in action=allow protocol=TCP localport=1433

echo.
echo ============================================
echo BUOC TIEP THEO:
echo 1. Sua file .env - thay IP_SERVER thanh IP may nay
echo 2. Sua password trong .env
echo 3. Chay: npm install && npx prisma migrate dev && npx prisma generate
echo 4. Chay: node prisma/seed.js
echo 5. Chay: npm run dev
echo ============================================
pause
`;

fs.writeFileSync("install-mssql.bat", content, "utf-8");
console.log("Created install-mssql.bat");