import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NewRequestForm } from "@/components/requests/new-request-form";

export default async function NewRequestPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Admin khong tao yeu cau; chi employee/manager/lead/it/purchasing co the tao
  if (session.user.role === "ADMIN") redirect("/requests");

  return <NewRequestForm />;
}
