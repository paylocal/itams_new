import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { ensureGroupWorkflowTables, listGroupFlows, listGroupsWithMembers } from "@/lib/group-workflow";

type Preset = {
  code: string;
  name: string;
  level: number;
  managesLevel: number | null;
  description: string;
  roles: string[];
};

const PRESETS: Preset[] = [
  {
    code: "EMPLOYEE_GROUP_1",
    name: "Nhom Nhan vien 1",
    level: 1,
    managesLevel: null,
    description: "Nhom nhan vien mac dinh duoc tao tu dong",
    roles: ["EMPLOYEE"],
  },
  {
    code: "LEADER_GROUP_CORE",
    name: "Nhom Lead 1",
    level: 2,
    managesLevel: 1,
    description: "Lead quan ly nhom nhan vien",
    roles: ["LEAD"],
  },
  {
    code: "MANAGER_GROUP_CORE",
    name: "Nhom Manager 1",
    level: 3,
    managesLevel: 1,
    description: "Manager quan ly nhom nhan vien",
    roles: ["MANAGER"],
  },
  {
    code: "USER_GROUP_CORE",
    name: "Nhom User 1",
    level: 4,
    managesLevel: 3,
    description: "User/Admin quan ly nhom manager",
    roles: ["ADMIN"],
  },
  {
    code: "IT_GROUP_CORE",
    name: "Nhom IT",
    level: 1,
    managesLevel: null,
    description: "Nhom IT Staff duoc tao tu dong",
    roles: ["IT_STAFF"],
  },
];

type ExistingGroup = { id: string; code: string };

async function getGroupsPayload() {
  return listGroupsWithMembers();
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await ensureGroupWorkflowTables();

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, role: true },
    });

    const existingGroups = await prisma.$queryRaw<ExistingGroup[]>`
      SELECT [id], [code]
      FROM [dbo].[UserGroup]
    `;

    const byCode = new Map(existingGroups.map((g) => [g.code, g]));
    let created = 0;
    let updated = 0;

    for (const preset of PRESETS) {
      const matchedUserIds = users.filter((u) => preset.roles.includes(u.role)).map((u) => u.id);
      const current = byCode.get(preset.code);
      let groupId = current?.id;

      if (!groupId) {
        groupId = randomUUID();
        await prisma.$executeRaw`
          INSERT INTO [dbo].[UserGroup] ([id], [code], [name], [level], [managesLevel], [description])
          VALUES (${groupId}, ${preset.code}, ${preset.name}, ${preset.level}, ${preset.managesLevel}, ${preset.description})
        `;
        created += 1;
      } else {
        await prisma.$executeRaw`
          UPDATE [dbo].[UserGroup]
          SET [name] = ${preset.name}, [level] = ${preset.level}, [managesLevel] = ${preset.managesLevel}, [description] = ${preset.description}
          WHERE [id] = ${groupId}
        `;
        updated += 1;
      }

      await prisma.$executeRaw`
        DELETE FROM [dbo].[UserGroupMember]
        WHERE [groupId] = ${groupId}
      `;

      for (const userId of matchedUserIds) {
        await prisma.$executeRaw`
          INSERT INTO [dbo].[UserGroupMember] ([id], [groupId], [userId])
          VALUES (${randomUUID()}, ${groupId}, ${userId})
        `;
      }
    }

    const groups = await getGroupsPayload();
    const groupByCode = new Map(groups.map((g) => [g.code, g]));
    // Flow mac dinh phu hop voi du lieu test co san (khong co LEAD user)
    const flowSeeds = [
      { from: "EMPLOYEE_GROUP_1", to: "MANAGER_GROUP_CORE", minAmountUsd: 0, description: "Nhan vien -> Manager" },
      { from: "MANAGER_GROUP_CORE", to: "USER_GROUP_CORE", minAmountUsd: 0, description: "Manager -> Admin" },
    ];

    for (const seed of flowSeeds) {
      const fromGroup = groupByCode.get(seed.from);
      const toGroup = groupByCode.get(seed.to);
      if (!fromGroup || !toGroup) continue;

      await prisma.$executeRaw`
        MERGE [dbo].[UserGroupFlow] AS target
        USING (SELECT ${fromGroup.id} AS fromGroupId, ${toGroup.id} AS toGroupId) AS source
        ON target.[fromGroupId] = source.[fromGroupId] AND target.[toGroupId] = source.[toGroupId]
        WHEN MATCHED THEN
          UPDATE SET [minAmountUsd] = ${seed.minAmountUsd}, [description] = ${seed.description}
        WHEN NOT MATCHED THEN
          INSERT ([id], [fromGroupId], [toGroupId], [minAmountUsd], [description])
          VALUES (${randomUUID()}, ${fromGroup.id}, ${toGroup.id}, ${seed.minAmountUsd}, ${seed.description});
      `;
    }

    const flowList = await listGroupFlows();

    return NextResponse.json({
      success: true,
      created,
      updated,
      presets: PRESETS.length,
      groups,
      flows: flowList,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
