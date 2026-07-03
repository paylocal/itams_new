# Hướng dẫn cài SQL Server cho ITAMS

## Trên máy SQL Server (cần IP: 192.168.XX.YY)

### 1. Cài SQL Server
- Tải SQL Server Express: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- Chọn **Basic** install
- Đặt password cho user **sa** (GHI NHỚ!)

### 2. Cấu hình SQL Server

#### 2.1. Cho phép TCP/IP
- Mở **SQL Server Configuration Manager**
- SQL Server Network Configuration → Protocol for MSSQLSERVER
- Click phải **TCP/IP** → **Enable**
- Click phải **TCP/IP** → **Properties** → **IP Addresses**
- IPAll → **TCP Port**: `1433`
- Restart SQL Server

#### 2.2. Cho phép Mixed Mode
- Mở **SQL Server Management Studio (SSMS)**
- Click phải Server → Properties → Security
- Chọn **SQL Server and Windows Authentication mode**
- Restart SQL Server

#### 2.3. Tạo database
- Trong SSMS, click phải Databases → New Database
- Database name: `itams`
- Click OK

#### 2.4. Đặt password cho sa
- Security → Logins → sa
- Click phải → Properties → General
- Đặt password mạnh (ví dụ: YourStrong!Pass123)
- Status: Grant + Enabled
- Click OK

### 3. Mở Firewall (PowerShell Admin)
```powershell
New-NetFirewallRule -DisplayName "SQL Server 1433" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow
```

### 4. Test SQL Server
```cmd
netstat -an | findstr :1433
```
Phải thấy: `0.0.0.0:1433` hoặc `[::]:1433`

---

## Trên máy ITAMS (cần IP: 192.168.10.13)

### 1. Sửa file .env
```
DATABASE_URL="sqlserver://192.168.XX.YY:1433;database=itams;user=sa;password=YourStrong!Pass123;encrypt=true;trustServerCertificate=true"
NEXTAUTH_URL="http://192.168.10.13:3000"
NEXTAUTH_SECRET="itams-secret-key-change-in-production-2024"
```

### 2. Test kết nối
```bash
Test-NetConnection -ComputerName 192.168.XX.YY -Port 1433
npm install mssql
node test-connection.js
```

### 3. Migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
node seed-langs.js
```

### 4. Mở firewall
```powershell
New-NetFirewallRule -DisplayName "Node.js 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 5. Chạy
```bash
npm run dev
```

### 6. Truy cập
- Từ máy chủ: http://localhost:3000
- Từ máy khác: http://192.168.10.13:3000
