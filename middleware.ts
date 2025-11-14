// /middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Protect routes by role
    if (pathname.startsWith("/student") && token?.role !== "student") {
      return Response.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/teacher") && token?.role !== "teacher") {
      return Response.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return Response.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*"],
};
