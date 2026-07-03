import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginPage from "./login/page";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  // Neu da login, redirect den dashboard
  if (session) {
    redirect("/dashboard");
  }
  
  // Chua login, hien form login
  return <LoginPage />;
}
