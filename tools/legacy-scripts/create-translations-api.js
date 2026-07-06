const fs = require("fs");
const path = require("path");

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

  // Convert array to key-value object
  const dict: Record<string, string> = {};
  language.translations.forEach((t) => {
    dict[t.key] = t.value;
  });

  return NextResponse.json(dict);
}
`;

const file = path.join(
  __dirname,
  "src",
  "app",
  "api",
  "translations",
  "[locale]",
  "route.ts"
);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code);
console.log("Created translations API");