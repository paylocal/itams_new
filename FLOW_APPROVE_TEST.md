# ✅ Flow Approve Test Result

Ngày test: 2026-07-09
Môi trường: http://localhost:3000
Kết quả: **THÀNH CÔNG**

## Các tài khoản test

| Role | Email | Password |
|---|---|---|
| Employee | employee1@company.com | password123 |
| Manager | manager@company.com | password123 |
| IT Staff | it1@company.com | password123 |
| Purchasing | purchase@company.com | password123 |

## Flow chi tiết

### 1. Employee tạo yêu cầu

**Request:**
```bash
curl -b cookies_emp.txt -X POST http://localhost:3000/api/requests/new \
  -H "Content-Type: application/json" \
  -d '{"title":"Laptop cho Nhan Vien A","reason":"Lam viec tu xa","priority":"NORMAL","items":[{"categoryId":"cmr38dav90006pq0log2vncar","deviceModelId":"cmr38db6x000gpq0leua25mkr","quantity":1,"unitPrice":28000000,"totalPrice":28000000}]}'
```

**Kết quả:**
- ID: `cmrdtyvlx005uyfauxnwc8md6`
- Số: `REQ-2026-00009`
- Trạng thái: `PENDING_MANAGER`
- Bước hiện tại: `1`

### 2. Manager phê duyệt

**Request:**
```bash
curl -b cookies_mgr.txt -X POST http://localhost:3000/api/requests/cmrdtyvlx005uyfauxnwc8md6/approve \
  -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED","comment":"ok"}'
```

**Kết quả:**
```json
{"success":true,"status":"PENDING_IT"}
```

### 3. IT Staff phê duyệt

**Request:**
```bash
curl -b cookies_it.txt -X POST http://localhost:3000/api/requests/cmrdtyvlx005uyfauxnwc8md6/approve \
  -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED","comment":"IT duyet"}'
```

**Kết quả:**
```json
{"success":true,"status":"ORDERED"}
```

### 4. Purchasing tạo đơn mua hàng (PO)

**RequestItem ID:** `cmrdtyvlx005yyfaunlsf3iej`

**Request:**
```bash
curl -b cookies_purchase.txt -X POST http://localhost:3000/api/purchase-orders \
  -F "supplierName=Nha cung cap ABC" \
  -F "supplierContact=Mr. A" \
  -F "supplierPhone=0909123456" \
  -F "expectedDate=2026-08-01" \
  -F "notes=Giao gap" \
  -F "itemIds=cmrdtyvlx005yyfaunlsf3iej"
```

**Kết quả:**
- PO ID: `cmrdu1izc0061yfauw1viar5n`
- Số PO: `PO-2026-00003`
- Trạng thái: `SENT`

### 5. Hệ thống tự động hoàn thành yêu cầu

Sau khi tất cả các items trong yêu cầu đều có PO, hệ thống tự động chuyển trạng thái yêu cầu sang `COMPLETED`.

**Trạng thái cuối cùng của request:**
```json
{
  "status": "COMPLETED",
  "currentStep": 3,
  "completedAt": "2026-07-09T18:20:53.363Z"
}
```

## Kết luận

Flow approve từ Employee → Manager → IT → Purchasing hoạt động đúng:
- Employee tạo request: `PENDING_MANAGER`
- Manager duyệt: `PENDING_MANAGER` → `PENDING_IT`
- IT duyệt: `PENDING_IT` → `ORDERED`
- Purchasing tạo PO: `ORDERED` → `COMPLETED` (auto)

Không phát hiện lỗi trong flow cơ bản này. ✅
