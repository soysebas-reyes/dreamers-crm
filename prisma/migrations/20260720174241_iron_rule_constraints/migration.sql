-- ═══ Iron rule (PRD §4.3): at most ONE open Next Step per Dream ═══
-- Prisma cannot express partial unique indexes in schema.prisma, so this is
-- hand-written. IMPORTANT: `prisma migrate dev` diffs indexes (unlike views)
-- and WILL propose dropping this index in a future generated migration if
-- the model doesn't reference it — always review generated migration SQL
-- before applying, and delete any `DROP INDEX "task_one_open_next_action"`
-- line you see (see CONTRIBUTING.md).
CREATE UNIQUE INDEX "task_one_open_next_action"
  ON "task" ("project_id")
  WHERE "is_next_action" = true
    AND "status" = 'OPEN'
    AND "archived_at" IS NULL
    AND "project_id" IS NOT NULL;

-- ═══ Notes must attach to a dreamer or a project (PRD §6.6) ═══
ALTER TABLE "note" ADD CONSTRAINT "note_has_parent_chk"
  CHECK ("dreamer_id" IS NOT NULL OR "project_id" IS NOT NULL);

-- ═══ Custom milestones need a label (PRD §6.7) ═══
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_custom_label_chk"
  CHECK ("type" <> 'CUSTOM' OR "custom_label" IS NOT NULL);

-- ═══ Supabase hardening: block the anon Data API from Prisma-owned tables ═══
-- Supabase grants default privileges on the public schema to anon/authenticated
-- roles for its auto-generated Data API (PostgREST). Prisma connects as the
-- table owner, which RLS never blocks — so enabling RLS with zero policies
-- locks out PostgREST without affecting the app. New tables added in future
-- migrations should get `ENABLE ROW LEVEL SECURITY` added the same way (see
-- CONTRIBUTING.md checklist).
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
