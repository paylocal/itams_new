# ITAMS - IT Asset Management System

Hệ thống quản lý yêu cầu cấp phát tài sản CNTT với phê duyệt nhiều cấp, mua sắm, bàn giao, báo cáo và cấu hình workflow động.

## 1. Tổng quan tính năng hiện tại

### 1.1 Yêu cầu tài sản
- Nhân viên tạo yêu cầu theo danh mục/model hoặc tên tùy chỉnh.
- Một yêu cầu hỗ trợ nhiều item.
- Theo dõi trạng thái xử lý theo từng bước duyệt.

### 1.2 Workflow duyệt động theo nhóm
- Admin cấu hình flow giữa các nhóm tại tab Workflow Approvals.
- Mỗi flow có ngưỡng tiền USD (`minAmountUsd`).
- Hệ thống duyệt theo chuỗi flow phù hợp với số tiền đã quy đổi.

### 1.3 Duyệt theo 1 người cụ thể (manager-chain)
- Không duyệt kiểu "đại diện bất kỳ" trong nhóm.
- Người duyệt bước kế tiếp là manager trực tiếp của người ở bước trước, đồng thời thuộc nhóm đích của flow.
- Ví dụ:
  - Nhân viên nhóm NV1 tạo đơn -> Lead01 duyệt (nếu Lead01 là manager của nhân viên và thuộc nhóm Lead).
  - Lead01 tạo đơn -> Manager01 duyệt (nếu Manager01 là manager của Lead01 và thuộc nhóm Manager).
- Nếu không map được người duyệt theo chuỗi quản lý ở bất kỳ bước nào, hệ thống chặn tạo đơn và báo lỗi.

### 1.4 Quy đổi tiền VND -> USD
- Hỗ trợ 2 chế độ tỷ giá:
  - Manual: Admin nhập tay tỷ giá VND/USD.
  - Auto: hệ thống tự lấy tỷ giá USD/VND online.
- Mọi so sánh ngưỡng flow đều dùng tổng tiền USD sau quy đổi.

### 1.5 Email thông báo theo luồng
- Khi tạo yêu cầu: gửi email cho người duyệt bước đầu tiên.
- Khi duyệt qua bước tiếp theo: gửi email cho cấp tiếp theo (Lead, IT, Admin theo trạng thái).
- Khi hoàn tất: gửi email thông báo hoàn thành và thông báo cho Purchasing.

### 1.6 Quản trị Admin
- Quản lý users và phân quyền.
- Quản lý nhóm user (thành viên nhóm, loại nhóm, cấp quản lý).
- Quản lý flow duyệt + cấu hình tỷ giá tại Workflow Approvals.
- Quản lý categories, suppliers, languages, translations.

### 1.7 Module nghiệp vụ khác
- PO/Mua sắm.
- Kho tài sản + QR.
- Bàn giao (handover) + chữ ký.
- Báo cáo.
- Audit log.

## 2. Vai trò

- EMPLOYEE: tạo yêu cầu, xem yêu cầu cá nhân, ký bàn giao.
- MANAGER: duyệt yêu cầu theo luồng được giao.
- LEAD: duyệt các bước lead trong flow.
- IT_STAFF: duyệt bước IT, theo dõi cấp phát/bàn giao.
- PURCHASING: xử lý mua sắm/PO.
- ADMIN: quản trị toàn bộ hệ thống và cấu hình workflow.

## 3. Luồng duyệt thực tế

### 3.1 Luồng động ưu tiên
1. Tạo yêu cầu.
2. Tính tổng tiền và quy đổi sang USD.
3. Từ nhóm nguồn của requester, tìm chuỗi flow thỏa ngưỡng USD.
4. Mỗi bước chọn đúng approver theo manager-chain.
5. Tạo approval steps và gửi email bước đầu.

### 3.2 Nhánh fallback legacy
- Vẫn tồn tại để tương thích dữ liệu cũ khi chưa có flow động phù hợp.
- Có sử dụng ngưỡng cấu hình lead cũ trong SLAConfig.

## 4. Các màn hình Admin

- Admin Dashboard
- Users
- Groups (chỉ quản lý nhóm và thành viên)
- Workflow Approvals (quản lý flow + tỷ giá quy đổi)
- Categories
- Suppliers
- Languages
- Translations

## 5. Công nghệ

- Next.js 14 (App Router)
- React 18 + TypeScript
- Prisma + SQL Server
- NextAuth
- Tailwind CSS
- Vitest + Testing Library

## 6. Cài đặt nhanh

### 6.1 Yêu cầu
- Node.js 18+
- SQL Server

### 6.2 Cài dependencies

```bash
npm install
```

### 6.3 Cấu hình môi trường

```env
DATABASE_URL="sqlserver://<HOST>:1433;database=<DB_NAME>;user=<USER>;password=<PASSWORD>;encrypt=true;trustServerCertificate=true"
NEXTAUTH_SECRET="<YOUR_SECRET>"
NEXTAUTH_URL="http://localhost:3000"
```

Ghi chú:
- Không commit thông tin thật trong .env.
- Xem thêm README_SQLSERVER.md nếu cần cấu hình SQL Server chi tiết.

## 7. Chạy ứng dụng

### 7.1 Dev local

```bash
npm run dev
```

Script dev đang chạy với host 0.0.0.0, port 3000.

### 7.2 Truy cập LAN
- Lấy IP LAN máy host (ví dụ: 192.168.2.48).
- Truy cập từ máy khác trong cùng mạng: http://192.168.2.48:3000
- Nếu không truy cập được, kiểm tra firewall Windows và isolation trên router/AP.

### 7.3 Build và chạy production

```bash
npm run build
npm run start
```

## 8. Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:ui
npm run test:coverage
```

## 9. Trạng thái nghiệp vụ

- DRAFT
- PENDING_MANAGER
- PENDING_LEAD
- PENDING_IT
- PENDING_ADMIN
- PENDING_PURCHASING
- ORDERED
- DELIVERED
- COMPLETED
- REJECTED

## 10. Tài khoản test mặc định

- admin@company.com / password123
- manager@company.com / password123
- it1@company.com / password123
- purchase@company.com / password123
- employee1@company.com / password123

## 11. Chất lượng hiện tại

- npm run build: pass
- npm run test: pass

## 12. Lưu ý triển khai

- Flow động dùng bảng UserGroup và UserGroupFlow (SQL Server raw query).
- Duyệt theo manager-chain yêu cầu dữ liệu managerId phải được gán đúng cho users.
- Khi chỉnh flow nhóm, cần kiểm tra tương thích giữa sơ đồ flow và cây quản lý thực tế.
