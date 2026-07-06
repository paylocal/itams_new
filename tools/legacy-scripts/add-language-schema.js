const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "prisma", "schema.prisma");
let content = fs.readFileSync(file, "utf-8");

// Them model Language va Translation
const languageModels = `

model Language {
  id        String   @id @default(cuid())
  code      String   @unique        // vi, en, ja, zh, etc.
  name      String                    // Tieng Viet, English
  flag      String?                   // emoji hoac URL flag
  isActive  Boolean  @default(true)
  isDefault Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  translations Translation[]
}

model Translation {
  id          String   @id @default(cuid())
  languageId  String
  language    Language @relation(fields: [languageId], references: [id], onDelete: Cascade)
  key         String                    // nav.dashboard, common.login, etc.
  value       String                    // Gia tri da dich
  category    String?                   // common, nav, status, etc.
  updatedAt   DateTime @updatedAt

  @@unique([languageId, key])
  @@index([key])
  @@index([category])
}
`;

if (!content.includes("model Language")) {
  content = content + languageModels;
  fs.writeFileSync(file, content);
  console.log("Added Language models");
}