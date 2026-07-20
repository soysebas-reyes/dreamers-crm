import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI tooling (migrate, studio, introspect) connects via DIRECT_URL —
// Supabase's session pooler (port 5432). It supports the DDL and prepared
// statements migrations need, unlike the transaction pooler the running app
// uses. See .env.example for why these must be two different connection
// strings on Supabase's free tier.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
    // Fallback if `prisma migrate dev`'s shadow-database creation ever hits
    // P3014 through Supabase's pooler: set SHADOW_DATABASE_URL to a second
    // free Supabase project's session-pooler URL and uncomment below.
    // shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
