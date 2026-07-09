# AI Fix Plan - ITAMS Security & Workflow Issues

## Status: ✅ All issues fixed and verified

## Context
Dự án: `D:/Project/itams-new-clean` (ITAMS - IT Asset Management System)
Tech stack: Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind.

Đã chạy test smoke thành công:
- `npm run build` ✅
- `npm run lint` ✅ (warnings only)
- `npm run test` ✅ (17/17 tests pass)

Các tính năng hoạt động: auth đa role, tạo request, duyệt (approve/reject), tạo PO, admin CRUD (users, suppliers, languages, translations, groups, workflow config), i18n.

---

## ✅ Issues Fixed

### Issue 1: `/api/device-models` POST missing auth check 🔴 HIGH — DONE
**File:** `src/app/api/device-models/route.ts`
**Fix:** Thêm `getServerSession` và chỉ cho phép `ADMIN` tạo device model.
**Verification:**
- Employee POST → `{"error":"Forbidden"}` ✅
- Admin POST → tạo thành công ✅

---

### Issue 2: `/api/admin/stats` GET missing role check 🔴 HIGH — DONE
**File:** `src/app/api/admin/stats/route.ts`
**Fix:** Thêm `getServerSession` và chỉ cho phép `ADMIN` xem stats.
**Verification:**
- Employee GET → `{"error":"Forbidden"}` ✅
- Admin GET → trả về số liệu hệ thống ✅

---

### Issue 3: Dynamic workflow fallback when approver chain is broken 🟡 MEDIUM — DONE
**File:** `src/app/api/requests/new/route.ts`
**Fix:** Khi `buildApprovalChain()` trả về step thiếu `approverId`, nếu requester có direct manager thì fallback về legacy manager-chain flow thay vì báo lỗi.
**Verification:**
- Employee1 tạo request với dynamic flow hợp lệ → `PENDING_MANAGER` ✅
- Xóa manager khỏi `MANAGER_GROUP_CORE` để dynamic chain bị lỗi, tạo request vẫn thành công qua legacy → `PENDING_MANAGER` ✅

---

### Issue 4: Improve default group/manager setup for out-of-the-box dynamic flow 🟡 MEDIUM — DONE
**Files:**
- `src/app/api/admin/user-groups/setup/route.ts`
- `prisma/seed.js`

**Fix:**
- `MANAGER_GROUP_CORE` được cấu hình `managesLevel = 1` (quản lý nhân viên) thay vì `2`.
- Flow mặc định chỉ còn:
  - `EMPLOYEE_GROUP_1 → MANAGER_GROUP_CORE` (`minAmountUsd = 0`)
  - `MANAGER_GROUP_CORE → USER_GROUP_CORE` (`minAmountUsd = 0`)
- `prisma/seed.js` tự động tạo groups, members và flows khi seed DB fresh.

**Verification:**
- Gọi `POST /api/admin/user-groups/setup` → trả về groups/flows đúng cấu hình ✅
- Trên DB hiện tại, `employee1@company.com` tạo request thành công ngay ✅

---

### Issue 5: Remove broken orphan file 🟢 LOW — DONE
**File:** `@frontend/src/server/api/device-models/post.ts`
**Fix:** Xóa file lỗi import `prisma` default export và `authOptions` không tồn tại. File này làm build thất bại.
**Verification:** `npm run build` pass ✅

---

## Development Workflow for AI

Before editing:
1. Read the target file completely.
2. Check imports at top of file.
3. Preserve existing formatting and conventions.

After editing:
1. Run `npm run lint` in project root.
2. Run `npm run test`.
3. Run `npm run build`.
4. If all three pass, summarize changes.

Do not modify `.env` or commit credentials.
Do not run `npx prisma migrate dev` unless explicitly instructed to change schema.
