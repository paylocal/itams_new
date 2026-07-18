# Auto-Accept Rules for ITAMS Project

## ✅ Auto-accept (no confirmation needed):

- Read any file (.ts, .tsx, .js, .json, .md, .prisma, .env.example)
- Edit/Write files within `D:/Project/itams-new-clean/`
- List files in project
- Run npm scripts: `npm run dev`, `npm run build`, `npm run test`, `npm run lint`
- Run npx commands: `npx prisma generate`, `npx prisma migrate dev`
- Git operations: `git add`, `git commit`, `git status`, `git log`, `git diff`
- Test API endpoints (read-only, localhost)
- Open browser to localhost:3000-3010
- MCP filesystem tools within project directory
- MCP custom tools: read_file, edit_file, write_file, list_files, check_port, test_login, test_api, run_command
- Read dev server logs

## ⚠️ Require explicit confirmation:

- `npm install <new-package>` — installing new dependency
- `npm install -g` — installing global package
- `pip install`, `apt install`, etc.
- Deleting files (any)
- `taskkill /F /IM`
- Git push
- Database migrations on production
- Modifying `.env` files (real secrets)
- Running on ports other than 3000-3010
- Modifying package.json dependencies
- Changing database schema (Prisma)
- Sending emails

## 🚫 NEVER auto-execute:

- `rm -rf`, `format`, `del /f /s /q`
- Commands outside `D:/Project/itams-new-clean/`
- Modifying system files
- Spending cloud credits (Ollama Cloud) without asking
- Disabling security features
- Accessing files outside project scope

## Behavior:

1. For AUTO-ACCEPT actions: execute immediately, show brief result
2. For CONFIRM actions: show what will happen, ask "Confirm? (yes/no)"
3. For NEVER actions: refuse and explain why
4. Always log destructive operations before executing
