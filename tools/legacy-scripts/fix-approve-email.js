const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "app",
  "api",
  "requests",
  "[id]",
  "approve",
  "route.ts"
);

let content = fs.readFileSync(file, "utf-8");

// Them import
if (!content.includes('import { sendEmail')) {
  content = content.replace(
    "import { prisma } from \"@/lib/prisma\";",
    "import { prisma } from \"@/lib/prisma\";\nimport { sendEmail, emailTemplates } from \"@/lib/email\";"
  );
}

// Sau khi transaction thanh cong, them goi email cho requester
const beforeReturn = "return NextResponse.json({ success: true, status: newStatus });";
if (content.includes(beforeReturn)) {
  const emailCode = `
    // Gui email thong bao
    try {
      const updatedRequest = await prisma.assetRequest.findUnique({
        where: { id: params.id },
        include: { requester: true },
      });
      if (updatedRequest?.requester?.email) {
        if (decision === "REJECTED") {
          const t = emailTemplates.requestRejected({
            requestNumber: request.requestNumber,
            title: request.title,
            requesterName: updatedRequest.requester.name,
            reason: comment || "Khong co",
            url: (process.env.NEXTAUTH_URL || "http://localhost:3000") + "/requests/" + params.id,
          });
          await sendEmail({
            to: updatedRequest.requester.email,
            subject: t.subject,
            html: t.html,
          });
        } else if (newStatus === "ORDERED") {
          const t = emailTemplates.requestCompleted({
            requestNumber: request.requestNumber,
            title: request.title,
            requesterName: updatedRequest.requester.name,
            url: (process.env.NEXTAUTH_URL || "http://localhost:3000") + "/requests/" + params.id,
          });
          await sendEmail({
            to: updatedRequest.requester.email,
            subject: t.subject,
            html: t.html,
          });
        }
      }
    } catch (e) {
      console.error("Email error:", e);
    }

    `;
  content = content.replace(beforeReturn, emailCode + beforeReturn);
}

fs.writeFileSync(file, content);
console.log("Updated");