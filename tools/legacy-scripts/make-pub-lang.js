const fs = require("fs");
const path = require("path");

const code = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const languages = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      code: true,
      name: true,
      flag: true,
      isDefault: true,
    },
  });
  return NextResponse.json(languages);
}
`;

const dir = path.join(__dirname, "src", "app", "api", "languages");
const file = path.join(dir, "route.ts");

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);
console.log("Created:", file);