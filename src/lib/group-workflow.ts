import { prisma } from "@/lib/prisma";

export type GroupFlowRow = {
  id: string;
  fromGroupId: string;
  toGroupId: string;
  minAmountUsd: unknown;
  description: string | null;
  createdAt: Date;
  fromGroupName?: string | null;
  fromGroupLevel?: number | null;
  toGroupName?: string | null;
  toGroupLevel?: number | null;
};

export type ApprovalChainStep = {
  groupId: string;
  groupName: string;
  groupLevel: number;
  approverId: string | null;
  approverName: string | null;
  approverEmail: string | null;
  minAmountUsd: number;
};

export async function ensureGroupWorkflowTables() {
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

IF OBJECT_ID(N'[dbo].[UserGroupFlow]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[UserGroupFlow] (
    [id] NVARCHAR(191) NOT NULL PRIMARY KEY,
    [fromGroupId] NVARCHAR(191) NOT NULL,
    [toGroupId] NVARCHAR(191) NOT NULL,
    [minAmountUsd] DECIMAL(18, 2) NOT NULL DEFAULT 0,
    [description] NVARCHAR(MAX) NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [UQ_UserGroupFlow_from_to] UNIQUE ([fromGroupId], [toGroupId]),
    CONSTRAINT [FK_UserGroupFlow_from] FOREIGN KEY ([fromGroupId]) REFERENCES [dbo].[UserGroup]([id]),
    CONSTRAINT [FK_UserGroupFlow_to] FOREIGN KEY ([toGroupId]) REFERENCES [dbo].[UserGroup]([id])
  )
END
`);
}

export async function listGroupsWithMembers() {
  type Row = {
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

  const rows = await prisma.$queryRaw<Row[]>`
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
    ORDER BY g.level ASC, g.createdAt DESC, u.name ASC
  `;

  const map = new Map<string, any>();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        code: row.code,
        name: row.name,
        level: Number(row.level),
        managesLevel: row.managesLevel === null ? null : Number(row.managesLevel),
        description: row.description,
        createdAt: row.createdAt,
        members: [],
      });
    }

    if (row.memberId && row.userId) {
      map.get(row.id).members.push({
        id: row.memberId,
        userId: row.userId,
        user: {
          id: row.userId,
          name: row.userName,
          email: row.userEmail,
          role: row.userRole,
        },
      });
    }
  }

  return Array.from(map.values());
}

export async function listGroupFlows() {
  type Row = {
    id: string;
    fromGroupId: string;
    toGroupId: string;
    minAmountUsd: unknown;
    description: string | null;
    createdAt: Date;
    fromGroupName: string | null;
    fromGroupLevel: number | null;
    toGroupName: string | null;
    toGroupLevel: number | null;
  };

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      f.id,
      f.fromGroupId,
      f.toGroupId,
      f.minAmountUsd,
      f.description,
      f.createdAt,
      fg.name AS fromGroupName,
      fg.level AS fromGroupLevel,
      tg.name AS toGroupName,
      tg.level AS toGroupLevel
    FROM [dbo].[UserGroupFlow] f
    INNER JOIN [dbo].[UserGroup] fg ON fg.id = f.fromGroupId
    INNER JOIN [dbo].[UserGroup] tg ON tg.id = f.toGroupId
    ORDER BY fg.level ASC, f.minAmountUsd ASC, fg.name ASC, tg.name ASC
  `;

  return rows.map((row) => ({
    id: row.id,
    fromGroupId: row.fromGroupId,
    toGroupId: row.toGroupId,
    minAmountUsd: Number(row.minAmountUsd),
    description: row.description,
    createdAt: row.createdAt,
    fromGroupName: row.fromGroupName,
    fromGroupLevel: row.fromGroupLevel === null ? null : Number(row.fromGroupLevel),
    toGroupName: row.toGroupName,
    toGroupLevel: row.toGroupLevel === null ? null : Number(row.toGroupLevel),
  }));
}

export function statusForGroupLevel(level: number): string {
  if (level === 2) return "PENDING_LEAD";
  if (level === 3) return "PENDING_MANAGER";
  if (level === 4) return "PENDING_ADMIN";
  return "PENDING_MANAGER";
}

export async function getPrimaryGroupForUser(userId: string) {
  type Row = { id: string; name: string; level: number };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT TOP 1 g.id, g.name, g.level
    FROM [dbo].[UserGroupMember] m
    INNER JOIN [dbo].[UserGroup] g ON g.id = m.groupId
    WHERE m.userId = ${userId}
    ORDER BY g.level ASC, g.createdAt DESC
  `;

  return rows[0] || null;
}

export async function pickGroupApprover(groupId: string) {
  type Row = { id: string; name: string | null; email: string | null };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT TOP 1 u.id, u.name, u.email
    FROM [dbo].[UserGroupMember] m
    INNER JOIN [dbo].[User] u ON u.id = m.userId
    WHERE m.groupId = ${groupId} AND u.isActive = 1
    ORDER BY u.createdAt ASC
  `;

  return rows[0] || null;
}

export async function pickGroupApproverByManagerChain(groupId: string, actorUserId: string) {
  type Row = { id: string; name: string | null; email: string | null };

  const managerRows = await prisma.$queryRaw<Row[]>`
    SELECT TOP 1 m.id, m.name, m.email
    FROM [dbo].[User] actor
    INNER JOIN [dbo].[User] m ON m.id = actor.managerId
    INNER JOIN [dbo].[UserGroupMember] gm ON gm.userId = m.id
    WHERE actor.id = ${actorUserId}
      AND gm.groupId = ${groupId}
      AND m.isActive = 1
  `;

  if (managerRows[0]) return managerRows[0];
  return null;
}

export async function buildApprovalChain(requesterId: string, totalAmount: number) {
  await ensureGroupWorkflowTables();

  const sourceGroup = await getPrimaryGroupForUser(requesterId);
  if (!sourceGroup) return [];

  const flows = await listGroupFlows();
  const byFrom = new Map<string, Array<(typeof flows)[number]>>();
  for (const flow of flows) {
    const list = byFrom.get(flow.fromGroupId) || [];
    list.push(flow);
    byFrom.set(flow.fromGroupId, list);
  }

  const chain: ApprovalChainStep[] = [];
  const visited = new Set<string>();
  let currentGroupId = sourceGroup.id;
  let currentActorId = requesterId;

  while (true) {
    const nextOptions = (byFrom.get(currentGroupId) || [])
      .filter((flow) => totalAmount >= flow.minAmountUsd)
      .sort((a, b) => b.minAmountUsd - a.minAmountUsd);

    const nextFlow = nextOptions[0];
    if (!nextFlow || visited.has(nextFlow.toGroupId)) break;

    visited.add(nextFlow.toGroupId);
    const approver = await pickGroupApproverByManagerChain(nextFlow.toGroupId, currentActorId);
    chain.push({
      groupId: nextFlow.toGroupId,
      groupName: nextFlow.toGroupName || "",
      groupLevel: nextFlow.toGroupLevel || 1,
      approverId: approver?.id || null,
      approverName: approver?.name || null,
      approverEmail: approver?.email || null,
      minAmountUsd: nextFlow.minAmountUsd,
    });

    currentGroupId = nextFlow.toGroupId;
    if (approver?.id) {
      currentActorId = approver.id;
    }
  }

  return chain;
}

export async function getCurrentUserGroupIds(userId: string) {
  type Row = { groupId: string; level: number };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT g.id AS groupId, g.level
    FROM [dbo].[UserGroupMember] m
    INNER JOIN [dbo].[UserGroup] g ON g.id = m.groupId
    WHERE m.userId = ${userId}
    ORDER BY g.level ASC
  `;
  return rows.map((row) => row.groupId);
}
