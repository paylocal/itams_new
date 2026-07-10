import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "SMTP_REPLY_TO",
  "EMAIL_ENABLED",
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const rows = await prisma.$queryRaw<{ key: string; value: string }[]>`
      SELECT [key], [value] FROM [dbo].[AppConfig] WHERE [key] IN (${KEYS.join(",")})
    `;
    const config = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    for (const key of KEYS) {
      const value = body[key] ?? "";
      await prisma.$executeRaw`
        MERGE [dbo].[AppConfig] AS target
        USING (SELECT ${key} AS [key], ${value} AS [value]) AS source
        ON target.[key] = source.[key]
        WHEN MATCHED THEN UPDATE SET [value] = source.[value], [updatedAt] = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT ([id], [key], [value], [updatedAt])
        VALUES (CONVERT(NVARCHAR(1000), NEWID()), source.[key], source.[value], SYSUTCDATETIME());
      `;
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
