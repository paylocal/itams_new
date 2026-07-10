import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const defaultPassword = (formData.get("defaultPassword") as string) || "ChangeMe123!";
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Skip header row, expect columns: Email, Name, Role, Department, ManagerEmail, Position
    const header = rows[0] || [];
    const dataRows = rows.slice(1);

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
      skippedRows: [] as number[],
    };

    const validRoles = ["EMPLOYEE", "MANAGER", "LEAD", "IT_STAFF", "PURCHASING", "ADMIN"];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2;
      const email = String(row[0] || "").trim();
      const name = String(row[1] || "").trim();
      const role = String(row[2] || "EMPLOYEE").trim().toUpperCase();
      const department = String(row[3] || "").trim() || null;
      const managerEmail = String(row[4] || "").trim() || null;
      const position = String(row[5] || "").trim() || null;

      if (!email || !name) {
        results.errors.push(`Dong ${rowNum}: thieu email hoac ten`);
        continue;
      }
      if (!validRoles.includes(role)) {
        results.errors.push(`Dong ${rowNum}: role khong hop le (${role})`);
        continue;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        results.skipped++;
        results.skippedRows.push(rowNum);
        continue;
      }

      let managerId: string | null = null;
      if (managerEmail) {
        const manager = await prisma.user.findUnique({ where: { email: managerEmail } });
        if (manager) managerId = manager.id;
      }

      const hash = await bcrypt.hash(defaultPassword, 10);
      await prisma.user.create({
        data: {
          email,
          name,
          role,
          department,
          position,
          managerId,
          passwordHash: hash,
          isActive: true,
        },
      });
      results.created++;
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
