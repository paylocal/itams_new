const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "lib", "prisma.ts");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes("globalForPrisma")) {
  const newContent = `import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;
  fs.writeFileSync(file, newContent);
  console.log("Optimized prisma client");
}