const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "src/app/api/languages");
fs.mkdirSync(dir, { recursive: true });

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

fs.writeFileSync(path.join(dir, "route.ts"), code, "utf-8");
console.log("Created public languages API");