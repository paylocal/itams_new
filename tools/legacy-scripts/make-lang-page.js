const fs = require("fs");
const path = require("path");

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LanguageManager } from "@/components/admin/language-manager";

export default async function LanguagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return <LanguageManager />;
}
`;

const file = path.join(
  __dirname,
  "src",
  "app",
  "(dashboard)",
  "admin",
  "languages",
  "page.tsx"
);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code);
console.log("Created");