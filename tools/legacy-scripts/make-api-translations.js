const fs = require("fs");
const path = require("path");

const code = `import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const language = await prisma.language.findUnique({
    where: { code: params.locale },
    include: { translations: true },
  });
  if (!language) return NextResponse.json({});
  const dict = {};
  language.translations.forEach((t) => {
    dict[t.key] = t.value;
  });
  return NextResponse.json(dict);
}
`;

const dir = path.join(__dirname, "src/app/api/translations/[locale]");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "route.ts"), code);
console.log("Created translations API");