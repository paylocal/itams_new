# AI-WORKFLOW.md

Hướng dẫn sử dụng AI Coding cho project ITAMS.

## 1. Môi trường

- **Extension duy nhất**: Continue
- **AI Router**: Continue (Kimi Cloud + Qwen Local + Copilot)
- **MCP servers**:
  - `filesystem`: đọc/ghi file
  - `shell`: chạy terminal commands

## 2. Models

| Model | Dùng khi |
|---|---|
| ☁️ Kimi K2.7 Code (Cloud) | Đọc project, phân tích, refactor lớn |
| 🤖 Qwen 2.5-Coder 3b (Local) | Sửa code, fix bug, tạo file |
| ⚡ Copilot GPT-4o | Inline completion |
| 🔤 qwen2.5-coder:1.5b-base | Autocomplete (Ctrl + I) |

## 3. Phím tắt

| Phím | Chức năng |
|---|---|
| `Ctrl + L` | Mở Continue Chat |
| `Ctrl + I` | Continue Edit (sửa code chọn) |
| `Ctrl + Shift + P` → "Continue: Reload" | Reload Continue |

## 4. Quy trình làm việc

### Bước 1: Đọc hiểu project
- Mở Continue (Ctrl + L)
- Chọn Kimi Cloud
- Hỏi: "Đọc cấu trúc project và mô tả"

### Bước 2: Lập kế hoạch
- Tiếp tục chat với Kimi Cloud
- Yêu cầu: "Đề xuất plan chi tiết để [yêu cầu]"
- Xác nhận plan trước khi sửa

### Bước 3: Sửa code
- Chuyển sang Qwen Local (3b)
- Dùng Edit mode (Ctrl + I) hoặc Agent mode trong chat
- Có thể dùng: "Sửa file X, thay đổi Y thành Z"

### Bước 4: Build & Test
- Trong Continue chat: "Chạy lệnh: npm run build"
- Sau đó: "Chạy lệnh: npm run test"
- Xem kết quả, nếu lỗi → quay lại bước 3

### Bước 5: Commit
- Trong Continue chat: "Chạy lệnh: git add . && git commit -m 'mô tả'"

### Bước 6: Public local (test)
- "Chạy lệnh: npm run dev"
- Mở browser: http://localhost:3000

## 5. Commands thường dùng

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy dev server (port 3000) |
| `npm run build` | Build production |
| `npm start` | Chạy production server |
| `npm run test` | Chạy test (Vitest) |
| `npm run lint` | Lint code |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Migrate database |
| `git status` | Xem trạng thái git |
| `git log --oneline -10` | Xem 10 commit gần nhất |

## 6. Theo dõi status

- Mở PowerShell, chạy: `D:\tools\ai-status.bat`
- Hoặc: `powershell -ExecutionPolicy Bypass -File D:\tools\ai-token-monitor.ps1`

## 7. Quy tắc làm việc với AI

1. **LUÔN đọc file trước** khi yêu cầu AI sửa
2. **KHÔNG xóa file** mà không xác nhận
3. **Sửa Prisma schema** → phải chạy `npx prisma generate` + `npx prisma migrate dev`
4. **Sau khi sửa code** → luôn build + test
5. **Commit thường xuyên** với message rõ ràng
6. **Nếu lỗi** → đọc lỗi → báo lại cho AI → AI fix

## 8. Test accounts

- admin@company.com / password123
- manager@company.com / password123
- it1@company.com / password123
- purchase@company.com / password123
- employee1@company.com / password123