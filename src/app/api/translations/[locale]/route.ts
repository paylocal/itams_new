import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const language = await prisma.language.findUnique({
    where: { code: params.locale },
    include: { translations: true },
  });
  if (!language) return NextResponse.json({});
  const dict: Record<string, string> = {};
  language.translations.forEach((t) => { dict[t.key] = t.value; });
  return NextResponse.json(dict);
}
