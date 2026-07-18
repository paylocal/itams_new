import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { to } = await req.json();
    const target = to || session.user.email;
    if (!target) {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
    }

    const result = await sendEmail({
      to: target,
      subject: "[Quản lý yêu cầu và tài sản] Test email",
      html: "<p>This is a test email from Quản lý yêu cầu và tài sản.</p>",
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        dev: result.dev,
        messageId: result.messageId || null,
      });
    } else {
      return NextResponse.json(
        { error: result.error ? String(result.error) : "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
