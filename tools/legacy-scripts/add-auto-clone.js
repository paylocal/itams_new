const fs = require("fs");
const path = require("path");

// Sua API languages POST de tu dong copy translations
const file = path.join(
  __dirname,
  "src/app/api/admin/languages/route.ts"
);

if (!fs.existsSync(file)) {
  console.log("File not found:", file);
  process.exit(1);
}

let content = fs.readFileSync(file, "utf-8");

if (!content.includes("Copy translations")) {
  // Thay the toan bo function POST
  const newPost = `export async function POST(req: NextRequest) {
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

    const lang = await prisma.language.create({
      data: { code, name, flag, isDefault: !!isDefault },
    });

    // Copy translations tu ngon ngu goc
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

  // Thay the function POST cu
  const postRegex = /export async function POST\([^)]*\) \{[\s\S]*?\n\}/;
  if (postRegex.test(content)) {
    content = content.replace(postRegex, newPost);
    fs.writeFileSync(file, content, "utf-8");
    console.log("Updated languages POST to auto-clone translations");
  } else {
    console.log("Could not find POST function pattern");
  }
}