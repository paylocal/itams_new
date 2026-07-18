import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/users-manager";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      manager: { select: { id: true, name: true } },
    },
  });

  const managers = users
    .filter((u) => u.role === "MANAGER" || u.role === "LEAD")
    .map((u) => ({ id: u.id, name: u.name, role: u.role }));

  return <UsersManager users={users} managers={managers} />;
}
