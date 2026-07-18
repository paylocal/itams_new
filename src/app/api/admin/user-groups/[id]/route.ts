import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

function levelFromType(type: string): number {
  if (type === "LEADER") return 2;
  if (type === "MANAGER") return 3;
  if (type === "ADMIN") return 4;
  return 1;
}

function defaultManagedLevelFromType(type: string): number | null {
  if (type === "LEADER") return 1;
  if (type === "MANAGER") return 2;
  if (type === "ADMIN") return 3;
  return null;
}

async function ensureGroupTables() {
  await prisma.$executeRawUnsafe(`
IF OBJECT_ID(N'[dbo].[UserGroup]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[UserGroup] (
    [id] NVARCHAR(191) NOT NULL PRIMARY KEY,
    [code] NVARCHAR(191) NOT NULL UNIQUE,
    [name] NVARCHAR(191) NOT NULL,
    [level] INT NOT NULL DEFAULT 1,
    [managesLevel] INT NULL,
    [description] NVARCHAR(MAX) NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  )
END

IF COL_LENGTH(N'dbo.UserGroup', N'managesLevel') IS NULL
BEGIN
  ALTER TABLE [dbo].[UserGroup] ADD [managesLevel] INT NULL
END

IF OBJECT_ID(N'[dbo].[UserGroupMember]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[UserGroupMember] (
    [id] NVARCHAR(191) NOT NULL PRIMARY KEY,
    [groupId] NVARCHAR(191) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [joinedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [UQ_UserGroupMember_group_user] UNIQUE ([groupId], [userId]),
    CONSTRAINT [FK_UserGroupMember_group] FOREIGN KEY ([groupId]) REFERENCES [dbo].[UserGroup]([id]) ON DELETE CASCADE
  )
END
`);
}

type GroupRow = {
  id: string;
  code: string;
  name: string;
  level: number;
  managesLevel: number | null;
  description: string | null;
  createdAt: Date;
  memberId: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
};

async function getGroupById(groupId: string) {
  const rows = await prisma.$queryRaw<GroupRow[]>`
    SELECT
      g.id,
      g.code,
      g.name,
      g.level,
      g.managesLevel,
      g.description,
      g.createdAt,
      m.id AS memberId,
      m.userId,
      u.name AS userName,
      u.email AS userEmail,
      u.role AS userRole
    FROM [dbo].[UserGroup] g
    LEFT JOIN [dbo].[UserGroupMember] m ON m.groupId = g.id
    LEFT JOIN [dbo].[User] u ON u.id = m.userId
    WHERE g.id = ${groupId}
    ORDER BY u.name ASC
  `;

  if (rows.length === 0) return null;

  const first = rows[0];
  return {
    id: first.id,
    code: first.code,
    name: first.name,
    level: Number(first.level),
    managesLevel: first.managesLevel === null ? null : Number(first.managesLevel),
    description: first.description,
    createdAt: first.createdAt,
    members: rows
      .filter((r) => r.memberId && r.userId)
      .map((r) => ({
        id: r.memberId,
        userId: r.userId,
        user: {
          id: r.userId,
          name: r.userName,
          email: r.userEmail,
          role: r.userRole,
        },
      })),
  };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await ensureGroupTables();
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const type = String(body?.type || "EMPLOYEE").toUpperCase();
    const managesLevel = body?.managesLevel === undefined
      ? defaultManagedLevelFromType(type)
      : body.managesLevel === null || body.managesLevel === ""
      ? null
      : Number(body.managesLevel);
    const description = body?.description ? String(body.description) : null;
    const memberIds = Array.isArray(body?.memberIds)
      ? Array.from(new Set(body.memberIds.map((x: unknown) => String(x))))
      : [];

    if (!name) {
      return NextResponse.json({ error: "Ten nhom la bat buoc" }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE [dbo].[UserGroup]
      SET [name] = ${name}, [level] = ${levelFromType(type)}, [managesLevel] = ${managesLevel}, [description] = ${description}
      WHERE [id] = ${params.id}
    `;

    await prisma.$executeRaw`
      DELETE FROM [dbo].[UserGroupMember]
      WHERE [groupId] = ${params.id}
    `;

    for (const userId of memberIds) {
      await prisma.$executeRaw`
        INSERT INTO [dbo].[UserGroupMember] ([id], [groupId], [userId])
        VALUES (${randomUUID()}, ${params.id}, ${userId})
      `;
    }

    const group = await getGroupById(params.id);
    return NextResponse.json(group);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await ensureGroupTables();
    await prisma.$executeRaw`
      DELETE FROM [dbo].[UserGroup]
      WHERE [id] = ${params.id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
