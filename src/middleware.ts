import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const mustChangePassword = (token as any)?.mustChangePassword;
    const pathname = req.nextUrl.pathname;

    if (
      mustChangePassword &&
      pathname !== "/change-password" &&
      pathname !== "/login" &&
      pathname !== "/api/auth/signin" &&
      pathname !== "/api/auth/signout" &&
      !pathname.startsWith("/api/")
    ) {
      return NextResponse.redirect(new URL("/change-password", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/((?!api/auth|api/languages|api/translations/|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};