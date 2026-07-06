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

// Tìm phần gửi email cho NV khi rejected và thêm gửi cho manager
const oldCode = `      // GUI EMAIL CHO NV
      try {
        if (request.requester.email) {
          const t = emailTemplates.requestRejected({
            requestNumber: request.requestNumber,
            title: request.title,
            requesterName: request.requester.name,
            reason: comment,
            url:
              (process.env.NEXTAUTH_URL || "http://localhost:3000") +
              "/requests/" + params.id,
          });
          await sendEmail({
            to: request.requester.email,
            subject: t.subject,
            html: t.html,
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }`;

const newCode = `      // GUI EMAIL CHO NV + MANAGER
      try {
        // 1. Gui cho NV
        if (request.requester.email) {
          const t = emailTemplates.requestRejected({
            requestNumber: request.requestNumber,
            title: request.title,
            requesterName: request.requester.name,
            reason: comment,
            url:
              (process.env.NEXTAUTH_URL || "http://localhost:3000") +
              "/requests/" + params.id,
          });
          await sendEmail({
            to: request.requester.email,
            subject: t.subject,
            html: t.html,
          });
        }

        // 2. Gui cho manager (thong bao de manager biet NV bi tu choi)
        const requesterWithManager = await prisma.user.findUnique({
          where: { id: request.requesterId },
          include: { manager: true },
        });
        if (requesterWithManager?.manager?.email) {
          const t = emailTemplates.requestRejected({
            requestNumber: request.requestNumber,
            title: request.title,
            requesterName: request.requester.manager.name, // Hien thi ten manager
            reason: comment,
            url:
              (process.env.NEXTAUTH_URL || "http://localhost:3000") +
              "/requests/" + params.id,
          });
          await sendEmail({
            to: requesterWithManager.manager.email,
            subject: \`[ITAMS] YC \${request.requestNumber} da bi tu choi boi \${session.user.name}\`,
            html: t.html,
          });
        }
      } catch (e) {
        console.error("Email error:", e);
      }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(file, content);
  console.log("Updated reject email logic");
} else {
  console.log("Old code not found. Check file structure.");
}