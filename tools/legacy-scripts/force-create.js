const fs = require("fs");
const path = require("path");

// Tao auth.ts
const authFile = path.join(__dirname, "src/lib/auth.ts");
const authContent = `import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || "itams-secret-key-12345",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.isActive) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};
`;

fs.writeFileSync(authFile, authContent, "utf-8");
console.log("Created auth.ts");

// Tao route auth
const authRouteDir = path.join(__dirname, "src/app/api/auth/[...nextauth]");
if (!fs.existsSync(authRouteDir)) {
  fs.mkdirSync(authRouteDir, { recursive: true });
}
const authRouteFile = path.join(authRouteDir, "route.ts");
const authRouteContent = `import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
`;

fs.writeFileSync(authRouteFile, authRouteContent, "utf-8");
console.log("Created auth route");

// Update .env
const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  let env = fs.readFileSync(envFile, "utf-8");
  if (!env.includes("NEXTAUTH_URL")) {
    env += '\nNEXTAUTH_URL="http://192.168.10.13:3000"\n';
    fs.writeFileSync(envFile, env);
    console.log("Added NEXTAUTH_URL");
  } else {
    // Replace NEXTAUTH_URL with IP
    env = env.replace(/NEXTAUTH_URL=.*/, 'NEXTAUTH_URL="http://192.168.10.13:3000"');
    fs.writeFileSync(envFile, env);
    console.log("Updated NEXTAUTH_URL");
  }
}

console.log("Done");