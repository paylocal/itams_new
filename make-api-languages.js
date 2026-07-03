const fs = require("fs");
const path = require("path");

const code = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const langs = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { code: true, name: true, flag: true, isDefault: true },
  });
  return NextResponse.json(langs);
}
`;

const dir = path.join(__dirname, "src/app/api/languages");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "route.ts"), code);
console.log("Created public languages API");