# AI-GUIDE cho ITAMS

## Quick Commands
- Chạy dev: `npm run dev` (port 3000, host 0.0.0.0)
- Build: `npm run build`
- Start production: `npm start`
- Test: `npm run test` (Vitest)
- Lint: `npm run lint`
- Prisma generate: `npx prisma generate`
- Prisma migrate: `npx prisma migrate dev`
- Seed data: `node prisma/seed.js` + `node seed-langs.js`

## Database (SQL Server)
- DATABASE_URL trong file `.env`
- Migration: `npx prisma migrate dev`
- Schema: `prisma/schema.prisma`
- Raw queries trong code dùng cho bảng UserGroup, UserGroupFlow

## Important Paths
- Pages: `src/app/` (App Router)
- Components: `src/components/`
- Business logic: `src/lib/`
- API routes: `src/app/api/`
- Prisma schema: `prisma/schema.prisma`
- Workflow config UI: `src/app/admin/workflow-approvals/`

## Roles
- EMPLOYEE, MANAGER, LEAD, IT_STAFF, PURCHASING, ADMIN

## Request Status Flow
DRAFT → PENDING_MANAGER → PENDING_LEAD → PENDING_IT → PENDING_ADMIN 
→ PENDING_PURCHASING → ORDERED → DELIVERED → COMPLETED
(Hoặc REJECTED ở bất kỳ bước nào)

## Working with AI
- Trước khi sửa: đọc file liên quan + README.md
- Sau khi sửa: chạy `npm run lint` + `npm run build` + `npm run test`
- Sửa Prisma schema: phải chạy `npx prisma generate` + `npx prisma migrate dev`
- Không commit file `.env`

## Test Accounts
- admin@company.com / password123
- manager@company.com / password123
- it1@company.com / password123
- purchase@company.com / password123
- employee1@company.com / password123