# Contributing to Dreamers CRM

Thanks for helping build this. A few things to know before you send a PR.

## Setup

Follow the [README quickstart](README.md#quickstart-local-dev-10-minutes) — your own free Supabase project is your dev database. There's nothing shared to break.

## Design source of truth

[docs/PRD.md](docs/PRD.md) is the spec. PRs that contradict its §10 anti-patterns (helper leaderboards, guilt-red UI, fake auto-sent messages to Dreamers, surveillance telemetry) will be declined regardless of code quality — this is unusual for a contributing guide to say, but it's the project's identity, not a style preference.

## Vocabulary discipline

UI copy never contains: _lead, prospect, deal, close, closed-lost, churn, pipeline value, quota_ (docs/PRD.md §2). If you're adding user-facing copy, check it against the glossary table in that section.

## Workflow

1. Fork, branch, PR to `main`.
2. PRs are squash-merged — write a clear PR title, commit history inside the PR doesn't need to be clean.
3. CI must be green (lint, format, typecheck, build, and the DB-backed test suite).
4. Conventional commit style for PR titles: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`.

## Database migrations

- `npm run db:migrate` (`prisma migrate dev`) is for migration authors only — it needs a shadow database. Everyone else uses `npm run db:deploy`.
- **After generating a migration, review the SQL before committing it.** The iron-rule partial unique index (`task_one_open_next_action` in `prisma/migrations/*_iron_rule_constraints/`) and the note/milestone CHECK constraints aren't expressible in `schema.prisma`, so Prisma's diff engine doesn't know about them — a future `prisma migrate dev` run can propose `DROP INDEX "task_one_open_next_action"` or drop the CHECK constraints. If you see that in generated SQL, delete those lines before applying.
- **New tables need Row Level Security enabled.** Supabase auto-generates a public Data API (PostgREST) with grants to `anon`/`authenticated` roles on the `public` schema. Prisma connects as the table owner, which RLS never blocks, so enabling RLS with zero policies locks out the Data API without touching the app. Add `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;` to your migration for any new table.
- If `prisma migrate dev`'s shadow-database step fails with **P3014**, set `SHADOW_DATABASE_URL` to a second free Supabase project's connection string and add it to `prisma.config.ts`'s `datasource` block (commented out there already).

## Code style

Prettier + ESLint, enforced by a pre-commit hook (husky + lint-staged) and CI. Don't fight the formatter.

## Tests

`npm run test` runs two projects: unit tests (no DB, always run) and DB-backed integration tests (gated on `TEST_DATABASE_URL`, auto-skipped if unset — CI always sets it against a throwaway `postgres:16` container). Point `TEST_DATABASE_URL` at a second free Supabase project, or a local Postgres, if you want to run the DB tests yourself.

## Component library notes

shadcn's `base-nova` preset here is [Base UI](https://base-ui.com)-backed, not Radix. There's no `asChild` prop — use the `render` prop for polymorphic rendering instead:

```tsx
// Radix-style (won't work here)
<Button asChild><a href="/foo">Link</a></Button>

// Base UI style
<Button render={<a href="/foo" />}>Link</Button>
```

## Prisma client imports

`src/generated/prisma/client.ts` exports the full `PrismaClient` class and pulls in its Node-only runtime (`node:crypto`, `node:fs`, etc.) — importing anything from it, even just an enum, drags that runtime into any bundle that reaches it. In `"use client"` components and shared code (like `src/lib/validations/`), import enums from `src/generated/prisma/enums` instead. Server-only files (`src/server/actions/`, `src/server/queries/`, `src/lib/prisma.ts`) can import from `client.ts` freely.

## Licensing

MIT, inbound = outbound — by submitting a PR you agree your contribution is licensed under the project's MIT license. No CLA.
