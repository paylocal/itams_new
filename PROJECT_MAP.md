# Quản lý yêu cầu và tài sản - Feature & File Map

Muc dich: ghi lai chuc nang -> file can sua, de khong phai tim toan bo khi maintenance.

## Kien truc

- UI: Next.js 14 App Router (`src/app/(dashboard)`), server components + client components (`src/components`)
- Auth: NextAuth v4 credentials (`src/lib/auth.ts`)
- DB: Prisma + SQL Server (`prisma/schema.prisma`)
- i18n: `src/components/i18n-provider.tsx` (client), `src/lib/default-translations.ts` (fallback), DB translations override
- Email: `src/lib/email.ts`
- Workflow: `src/lib/workflow.ts` + `src/lib/approve-service.ts`

## Cac module chinh

### 1. Auth / Login

- `src/app/login/page.tsx` — trang dang nhap, language selector, demo accounts (chi hien khi `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=true`)
- `src/lib/auth.ts` — NextAuth credentials, role, passwordExpired
- `src/types/next-auth.d.ts` — extend Session/JWT types

### 2. User / Profile

- `src/app/(dashboard)/profile/page.tsx` — ho so ca nhan
- `src/components/profile/change-password-form.tsx` — doi mat khau theo policy
- `src/components/profile/profile-info.tsx` — thong tin hien thi
- API:
  - `src/app/api/user/profile/route.ts` — GET/PUT profile
  - `src/app/api/user/change-password/route.ts` — doi mat khau

### 3. Admin System

- `src/components/admin/admin-settings.tsx` — gom cac card vao Admin
- `src/components/layout/sidebar.tsx` — menu sidebar theo role, co nhom (Main, Administration, Configuration, Account)
- `src/app/(dashboard)/admin/dashboard/page.tsx` — dashboard admin
- `src/app/(dashboard)/admin/password/page.tsx` — cau hinh password policy
- `src/components/admin/password-policy-manager.tsx` — UI password policy
- `src/app/api/admin/password-policy/route.ts` — API password policy
- `src/lib/password-policy.ts` — logic kiem tra policy va lich su mat khau

### 4. Admin Users

- `src/app/(dashboard)/admin/users/page.tsx` — server page
- `src/components/admin/users-manager.tsx` — danh sach, them/sua/xoa, import Excel, reset password
- API:
  - `src/app/api/users/route.ts` — CRUD users
  - `src/app/api/users/[id]/route.ts` — update/delete single user
  - `src/app/api/users/[id]/reset-password/route.ts` — admin reset password
  - `src/app/api/users/import/route.ts` — import Excel

### 5. Admin Groups / Workflow

- `src/app/(dashboard)/admin/groups/page.tsx` — quan ly nhom
- `src/components/admin/user-groups-manager.tsx` — UI nhom
- `src/app/(dashboard)/admin/workflow/page.tsx` — quy trinh duyet
- `src/components/admin/flow-manager.tsx` — cau hinh workflow rule
- API:
  - `src/app/api/admin/user-groups/route.ts`
  - `src/app/api/admin/user-groups/setup/route.ts`
  - `src/app/api/admin/workflow-rules/route.ts`
  - `src/app/api/admin/workflow-rules/[id]/route.ts`
- Logic:
  - `src/lib/workflow.ts` — tinh cac buoc duyet theo amount
  - `src/lib/approve-service.ts` — xu ly approve/reject/stock-check

### 6. Requests

- `src/app/(dashboard)/requests/page.tsx` — danh sach yeu cau
- `src/app/(dashboard)/requests/[id]/page.tsx` — chi tiet yeu cau
- `src/app/(dashboard)/requests/new/page.tsx` — tao yeu cau
- `src/components/requests/request-form.tsx` — form tao/sua yeu cau
- API:
  - `src/app/api/requests/new/route.ts`
  - `src/app/api/requests/[id]/approve/route.ts`
  - `src/app/api/requests/[id]/stock-check/route.ts`

### 7. Approvals

- `src/app/(dashboard)/approvals/page.tsx` — danh sach cho duyet theo role/group
- `src/components/approvals/approval-list.tsx` — UI duyet/tu choi
- `src/components/approvals/stock-check-panel.tsx` — IT stock check

### 8. Purchase Orders

- `src/app/(dashboard)/purchase-orders/page.tsx` — danh sach PO
- `src/app/(dashboard)/purchase-orders/new/pending/page.tsx` — YC can tao PO
- `src/app/(dashboard)/purchase-orders/[id]/receive/page.tsx` — IT nhap kho
- `src/components/purchase-orders/create-po-form.tsx` — form tao PO
- `src/components/purchase-orders/po-receive-form.tsx` — form nhap kho
- API:
  - `src/app/api/purchase-orders/route.ts`
  - `src/app/api/purchase-orders/[id]/receive/route.ts`

### 9. Assets

- `src/app/(dashboard)/assets/page.tsx` — danh sach tai san
- `src/app/(dashboard)/assets/[id]/page.tsx` — chi tiet tai san
- `src/app/(dashboard)/assets/[id]/qr/page.tsx` — in QR
- `src/components/assets/asset-qr.tsx` — component QR day du thong tin

### 10. Handovers

- `src/app/(dashboard)/handovers/page.tsx` — danh sach
- `src/app/(dashboard)/handovers/new/page.tsx` — tao BBBG
- `src/app/(dashboard)/handovers/[id]/page.tsx` — chi tiet
- `src/components/handover/create-handover.tsx` — form tao BBBG
- `src/components/handover/handover-list.tsx` / `handover-detail.tsx`
- API:
  - `src/app/api/handover/route.ts`
  - `src/app/api/handover-data/route.ts`
  - `src/app/api/handover/[id]/sign/route.ts`

### 11. Email

- `src/lib/email.ts` — sendEmail, templates, load config
- `src/app/(dashboard)/admin/email/page.tsx`
- `src/components/admin/email-config.tsx` — cau hinh SMTP, Reply-To, test email
- API:
  - `src/app/api/admin/email-config/route.ts`
  - `src/app/api/admin/email-config/test/route.ts`

### 12. Categories / Suppliers / Languages

- `src/app/(dashboard)/admin/categories/page.tsx`
- `src/app/(dashboard)/admin/suppliers/page.tsx`
- `src/app/(dashboard)/admin/languages/page.tsx`
- `src/components/admin/translation-manager.tsx`
- API: `src/app/api/device-categories/*`, `src/app/api/device-models/*`, `src/app/api/suppliers/*`, `src/app/api/admin/languages/*`, `src/app/api/admin/translations/*`

### 13. Reports

- `src/app/(dashboard)/reports/page.tsx` — server fetch data
- `src/components/reports/reports-dashboard.tsx` — bieu do

### 14. i18n / Translations

- `src/components/i18n-provider.tsx` — context + load DB translations
- `src/lib/default-translations.ts` — fallback vi/en
- `src/lib/i18n-server.ts` — helper cho server components
- API:
  - `src/app/api/languages/route.ts`
  - `src/app/api/translations/[locale]/route.ts`

## Seed / Migration

- `prisma/seed.ts` — tao du lieu demo (users, groups, workflow rules, categories, models, password policy)
- `prisma/migration_manual.sql` — script SQL manual khi Prisma migrate kho chay (SQL Server constraints)

## Environment Variables

- `DATABASE_URL` — SQL Server connection
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=true` — hien demo accounts tren login
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_REPLY_TO`, `SMTP_SECURE`, `EMAIL_ENABLED` — email override DB config
