import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserProfile } from "@/components/user/user-profile";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      position: true,
      lastPasswordChangeAt: true,
      createdAt: true,
      manager: { select: { name: true } },
    },
  });

  if (!user) redirect("/login");

  return <UserProfile user={user} />;
}
