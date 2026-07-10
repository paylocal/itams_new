import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      passwordExpired?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    passwordExpired?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    passwordExpired?: boolean;
  }
}
