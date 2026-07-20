import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma, no adapter. Used by proxy.ts (the Node.js
// runtime "Proxy" file — Next.js 16 renamed middleware.ts) for cheap
// session checks, and spread into the full config in auth.ts.
export default {
  pages: {
    signIn: "/login",
  },
  session: {
    // JWT, not database sessions: with PrismaAdapter present, Auth.js
    // defaults to database sessions, which the Credentials provider does
    // not support (Credentials sign-ins never persist a DB session). JWT
    // must be declared explicitly so the dev-login flow works.
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname.startsWith("/login");
      if (isLoginPage) return true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
