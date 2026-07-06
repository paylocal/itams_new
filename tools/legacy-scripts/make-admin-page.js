const fs = require("fs");
const path = require("path");

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSettings } from "@/components/admin/admin-settings";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return <AdminSettings />;
}
`;

const file = path.join(
  __dirname,
  "src",
  "app",
  "(dashboard)",
  "admin",
  "page.tsx"
);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, code, "utf-8");
console.log("Created");