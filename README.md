# Dreamers CRM

> A HubSpot-style CRM for tracking people you're helping — not people you're selling to.
> Built for [HelpBnk](https://helpbnk.com). Every active Dream has exactly one Next Step.
> Nobody who asked for help gets forgotten here.

## What it does

- **Today queue** — the daily "who do I contact" list: overdue, due today, going quiet.
- **≤15-second quick-log** — log a touchpoint with two required fields; everything else is defaulted.
- **A 6-stage journey** — Intake → Discovery → Active Help → Launch Support → Momentum → Graduated, with cadence tracking per stage.

The full method and data model are in [docs/PRD.md](docs/PRD.md) — read it before contributing; it's the design source of truth for this repo.

## Quickstart (local dev, ~10 minutes)

Prereqs: Node 20.9+ (24 recommended), npm. No Docker needed — the database is a free hosted Supabase project.

1. **Clone and install**

   ```bash
   git clone https://github.com/soysebas-reyes/dreamers-crm.git
   cd dreamers-crm
   npm install
   ```

2. **Create a free Supabase project** at [supabase.com](https://supabase.com) (any region works; EU/UK is closer to the data-residency guidance in docs/PRD.md §11.1). From the dashboard: **Connect → ORMs → Prisma** gives you both connection strings you need next.

3. **Configure your environment**

   Copy `.env.example` to `.env` using your editor (or `cp .env.example .env` / `Copy-Item .env.example .env` — avoid PowerShell's `>` redirect, it can write a BOM that breaks env parsing). Paste in the two Supabase connection strings.

   Generate an auth secret:

   ```bash
   npx auth secret
   ```

   This writes `AUTH_SECRET` to `.env.local` — copy that value into your `.env` too (Next.js reads both files, but Prisma's CLI only reads `.env`).

4. **Create the schema and demo data**

   ```bash
   npm run db:deploy   # applies committed migrations — no shadow DB needed
   npm run db:seed     # 1 team, 2 helpers, 8 Dreamers spanning Intake -> Graduated
   ```

5. **Run it**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. (Windows will prompt to allow Node through the firewall on first run — allow it.)

6. **Log in**

   Development mode ships a zero-config login: on `/login`, pick **"Continue as Sam (Lead)"** or **"Continue as Priya (Helper)"**. The same login is available on deployments with `DEMO_MODE=true` (see [Demo deployment](#demo-deployment)). Magic-link email (Resend) is production-only.

You should land on `/today` with a populated queue — the seed data is engineered so all three sections (overdue, due today, going quiet) have something in them on first run.

### Windows-specific notes

- **Don't clone inside OneDrive.** OneDrive's file sync locks files mid-write during `npm install` and `prisma generate`, causing `EPERM` errors. Clone somewhere like `C:\dev\dreamers-crm` instead.
- If your Supabase password contains `@ : / %`, URL-encode it or regenerate an alphanumeric one — this is the most common setup snag.

## Demo deployment

To run a public demo (e.g. on Vercel) without configuring email login, set the environment
variable `DEMO_MODE=true` and redeploy. This:

- shows a site-wide banner stating that all data is fictional, and
- enables the passwordless "Explore the demo as Sam / Priya" logins from the seed data in
  production.

Be aware of what that means: **anyone can log in and edit the demo data**. Only ever enable
`DEMO_MODE` on a deployment seeded exclusively with fictional data (`npm run db:seed` — set
`SEED_FORCE=1` when the environment is production), never where real personal data could exist
(see [SECURITY.md](SECURITY.md)). Re-run the seed to reset the demo if visitors leave it in a
mess, and note that `/login` is statically prerendered, so changing `DEMO_MODE` only takes
effect on the next build/deploy.

## Stack

Next.js (App Router) · TypeScript · Prisma 7 (driver adapters, `@prisma/adapter-pg`) · Supabase Postgres · Auth.js v5 · Tailwind + shadcn/ui (Base UI) · Vitest.

## Roadmap

See the repo's [milestones](https://github.com/soysebas-reyes/dreamers-crm/milestones) and `docs/PRD.md` §13 for the full MVP → V1.1 → V2 plan. This repo currently implements the **foundation + core loop**: auth, Dreamer/Dream CRUD, the quick-log, the Today queue, and the Dreamer profile.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Look for issues labeled `good first issue`.

## License

MIT — see [LICENSE](LICENSE).
