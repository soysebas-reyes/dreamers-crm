import type { DefaultSession } from "next-auth";
import type { HelperRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User {
    role?: HelperRole;
  }

  interface Session {
    user: {
      id: string;
      role: HelperRole;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: HelperRole;
  }
}
