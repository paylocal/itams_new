const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "app",
  "api",
  "requests",
  "new",
  "route.ts"
);

let content = fs.readFileSync(file, "utf-8");

// Them import sendEmail
if (!content.includes('import { sendEmail')) {
  content = content.replace(
    "import { prisma } from \"@/lib/prisma\";",
    "import { prisma } from \"@/lib/prisma\";\nimport { sendEmail, emailTemplates } from \"@/lib/email\";"
  );
}

// Them include manager
content = content.replace(
    "managerId: true,",
    "managerId: true,\n        manager: { select: { name: true, email: true } },"
);

// Them goi email truoc return
const returnIndex = content.indexOf("return NextResponse.json(request");
if (returnIndex > -1) {
  const emailCode = `
    // Gui email cho manager
    try {
      if (user.email) {
        const template = emailTemplates.requestCreated({
          requestNumber: request.requestNumber,
          title: request.title,
          requesterName: session.user.name || "",
          managerName: user.manager?.name || "Manager",
          url: (process.env.NEXTAUTH_URL || "http://localhost:3000") + "/approvals",
        });
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
        });
      }
    } catch (e) {
      console.error("Email error:", e);
    }

    `;
  content = content.slice(0, returnIndex) + emailCode + content.slice(returnIndex);
}

fs.writeFileSync(file, content);
console.log("Updated");