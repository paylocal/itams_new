const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "src/app/api/translations/[locale]");
fs.mkdirSync(dir, { recursive: true });

const code = `import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { locale } = params;
  const language = await prisma.language.findUnique({
    where: { code: locale },
    include: { translations: true },
  });
  if (!language) {
    return NextResponse.json({});
  }
  const dict = {};
  language.translations.forEach((t) => {
    dict[t.key] = t.value;
  });
  return NextResponse.json(dict);
}
`;

fs.writeFileSync(path.join(dir, "route.ts"), code, "utf-8");
console.log("Created translations API");