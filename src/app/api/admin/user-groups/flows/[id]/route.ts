import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureGroupWorkflowTables, listGroupFlows } from "@/lib/group-workflow";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const duplicate = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT TOP 1 [id]
      FROM [dbo].[UserGroupFlow]
      WHERE [fromGroupId] = ${fromGroupId}
        AND [toGroupId] = ${toGroupId}
        AND [id] <> ${params.id}
    `;

    if (duplicate[0]?.id) {
      return NextResponse.json({ error: "Flow giua 2 nhom nay da ton tai" }, { status: 409 });
    }

    await prisma.$executeRaw`
      UPDATE [dbo].[UserGroupFlow]
      SET [fromGroupId] = ${fromGroupId}, [toGroupId] = ${toGroupId}, [minAmountUsd] = ${minAmountUsd}, [description] = ${description}
      WHERE [id] = ${params.id}
    `;

    const flows = await listGroupFlows();
    const updated = flows.find((flow) => flow.id === params.id);
    return NextResponse.json(updated);
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
    await ensureGroupWorkflowTables();
    await prisma.$executeRaw`
      DELETE FROM [dbo].[UserGroupFlow]
      WHERE [id] = ${params.id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
