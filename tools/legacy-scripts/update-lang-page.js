const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "app",
  "(dashboard)",
  "admin",
  "languages",
  "page.tsx"
);
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

fs.writeFileSync(file, code);
console.log("Updated");