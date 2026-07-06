const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "src",
  "app",
  "(dashboard)",
  "admin",
  "suppliers",
  "page.tsx"
);
fs.mkdirSync(path.dirname(file), { recursive: true });

const code = `import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SupplierManager } from "@/components/admin/supplier-manager";

export default async function SuppliersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return <SupplierManager />;
}
`;

fs.writeFileSync(file, code, "utf-8");
console.log("Created suppliers page");