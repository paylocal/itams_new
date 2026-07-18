const fs = require("fs");
const path = require("path");

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminLanguageTabs } from "@/components/admin/admin-language-tabs";

export default async function LanguagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return <AdminLanguageTabs />;
}
`;

const dir = path.join(__dirname, "src/app/(dashboard)/admin/languages");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "page.tsx");
fs.writeFileSync(file, code, "utf-8");
console.log("Created admin/languages/page.tsx");