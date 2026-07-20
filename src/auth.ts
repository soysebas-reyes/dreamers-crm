import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

// @auth/prisma-adapter's types target the classic `@prisma/client` package
// shape; Prisma 7's custom-output generator (src/generated/prisma) produces
// a structurally equivalent client (same model delegates and methods) under
// a different type identity, so a cast is required here. This is a type-only
// cast — the adapter only calls plain delegate methods (findUnique, create,
// update, delete) that our generated client implements identically.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(
    prisma as unknown as Parameters<typeof PrismaAdapter>[0],
  ),
  providers: [
    // Magic-link email, production only — leave AUTH_RESEND_KEY unset in dev.
    ...(process.env.AUTH_RESEND_KEY
      ? [
          Resend({
            apiKey: process.env.AUTH_RESEND_KEY,
            from: process.env.EMAIL_FROM ?? "login@dreamers-crm.dev",
          }),
        ]
      : []),
    // Zero-config dev login — registered only in development, and only
    // accepts the two @dev.local identities the seed script creates.
    // Double-gated: the provider itself is absent in production builds.
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            id: "dev-login",
            name: "Dev login",
            credentials: { email: { label: "Email", type: "text" } },
            async authorize(credentials) {
              const email = credentials?.email;
              if (typeof email !== "string" || !email.endsWith("@dev.local")) {
                return null;
              }
              const user = await prisma.user.findUnique({ where: { email } });
              if (!user) return null;
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role!;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
