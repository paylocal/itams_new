import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { approveRequest } from "./approve-service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { decision?: string; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body khong hop le" }, { status: 400 });
  }

  const result = await approveRequest(
    {
      requestId: params.id,
      decision: body.decision || "",
      comment: body.comment,
      currentUser: {
        id: session.user.id,
        role: session.user.role,
        name: session.user.name,
      },
    },
    {
      db: prisma,
      sendEmail,
    }
  );

  return NextResponse.json(result.body, { status: result.status });
}
