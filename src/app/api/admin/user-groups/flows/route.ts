import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureGroupWorkflowTables, listGroupFlows } from "@/lib/group-workflow";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureGroupWorkflowTables();
  const flows = await listGroupFlows();
  return NextResponse.json(flows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await ensureGroupWorkflowTables();
    const body = await req.json();
    const fromGroupId = String(body?.fromGroupId || "");
    const toGroupId = String(body?.toGroupId || "");
    const minAmountUsd = Number(body?.minAmountUsd ?? 0);
    const description = body?.description ? String(body.description) : null;

    if (!fromGroupId || !toGroupId) {
      return NextResponse.json({ error: "Chon day du nhom nguon va nhom dich" }, { status: 400 });
    }
    if (fromGroupId === toGroupId) {
      return NextResponse.json({ error: "Nhom nguon va nhom dich khong duoc trung nhau" }, { status: 400 });
    }
    if (!Number.isFinite(minAmountUsd) || minAmountUsd < 0) {
      return NextResponse.json({ error: "So tien khong hop le" }, { status: 400 });
    }

    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT TOP 1 [id]
      FROM [dbo].[UserGroupFlow]
      WHERE [fromGroupId] = ${fromGroupId} AND [toGroupId] = ${toGroupId}
    `;

    if (existing[0]?.id) {
      await prisma.$executeRaw`
        UPDATE [dbo].[UserGroupFlow]
        SET [minAmountUsd] = ${minAmountUsd}, [description] = ${description}
        WHERE [id] = ${existing[0].id}
      `;

      const flows = await listGroupFlows();
      const updated = flows.find((flow) => flow.id === existing[0].id);
      return NextResponse.json(updated, { status: 200 });
    }

    const id = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO [dbo].[UserGroupFlow] ([id], [fromGroupId], [toGroupId], [minAmountUsd], [description])
      VALUES (${id}, ${fromGroupId}, ${toGroupId}, ${minAmountUsd}, ${description})
    `;

    const flows = await listGroupFlows();
    const created = flows.find((flow) => flow.id === id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
