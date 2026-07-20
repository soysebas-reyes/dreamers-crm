import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Next.js 16 renamed the `middleware` file convention to `proxy` (see
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy). This is
// the outer gate only — it redirects unauthenticated requests to /login, but
// each server action still checks the session itself (Next's own guidance:
// a matcher change can silently drop coverage for a Server Function on a
// route it protects, so auth must never rely on this alone).
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
