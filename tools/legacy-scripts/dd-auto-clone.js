const fs = require("fs");
const path = require("path");

// Sua API languages POST de tu dong copy translations
const file = path.join(
  __dirname,
  "src/app/api/admin/languages/route.ts"
);
let content = fs.readFileSync(file, "utf-8");

const newPostHandler = `export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { code, name, flag, isDefault, copyFrom } = await req.json();
    if (!code || !name) {
      return NextResponse.json({ error: "Thieu code/name" }, { status: 400 });
    }
    if (isDefault) {
      await prisma.language.updateMany({
        where: { id: { not: undefined } },
        data: { isDefault: false },
      });
    }
    
    // Tao language moi
    const lang = await prisma.language.create({
      data: { code, name, flag, isDefault: !!isDefault },
    });

    // Copy translations tu ngon ngu goc (mac dinh la 'vi')
    const sourceCode = copyFrom || "vi";
    const sourceLang = await prisma.language.findUnique({
      where: { code: sourceCode },
    });
    if (sourceLang && sourceLang.id !== lang.id) {
      const sourceTranslations = await prisma.translation.findMany({
        where: { languageId: sourceLang.id },
      });
      if (sourceTranslations.length > 0) {
        await prisma.translation.createMany({
          data: sourceTranslations.map((t) => ({
            languageId: lang.id,
            key: t.key,
            value: t.value,
            category: t.category,
          })),
        });
        console.log("Copied " + sourceTranslations.length + " translations to " + code);
      }
    }
    
    return NextResponse.json(lang, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}`;

if (content.includes("export async function POST")) {
  // Tim phan POST handler cu va thay the
  const postStart = content.indexOf("export async function POST");
  if (postStart !== -1) {
    const postEnd = content.indexOf("}", content.indexOf("return NextResponse.json(lang, { status: 201 });", postStart));
    if (postEnd !== -1) {
      // Tim vi tri dong } dong cua ham POST
      let depth = 0;
      let endPos = postStart;
      for (let i = postStart; i < content.length; i++) {
        if (content[i] === "{") depth++;
        if (content[i] === "}") {
          depth--;
          if (depth === 0) {
            endPos = i + 1;
            break;
          }
        }
      }
      content = content.substring(0, postStart) + newPostHandler + content.substring(endPos);
      fs.writeFileSync(file, content, "utf-8");
      console.log("Updated languages POST to auto-clone translations");
    }
  }
}