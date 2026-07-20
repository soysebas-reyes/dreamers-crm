-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('INTAKE', 'DISCOVERY', 'ACTIVE_HELP', 'LAUNCH_SUPPORT', 'MOMENTUM', 'GRADUATED', 'CLOSED_REFERRED', 'CLOSED_UNRESPONSIVE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'WAITING_ON_DREAMER', 'PAUSED', 'GHOSTED', 'RE_ENGAGED', 'DORMANT');

-- CreateEnum
CREATE TYPE "DreamerSource" AS ENUM ('HELPBNK_DM', 'DOORBELL', 'EVENT', 'SOCIAL_DM', 'REFERRAL', 'WALK_IN', 'OTHER');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('WHATSAPP', 'EMAIL', 'VIDEO_CALL', 'PHONE_CALL', 'IN_PERSON', 'HELPBNK_DM', 'VOICE_NOTE', 'SOCIAL_DM', 'OTHER');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('OUTBOUND', 'INBOUND', 'MUTUAL');

-- CreateEnum
CREATE TYPE "InteractionOutcome" AS ENUM ('PROGRESSED', 'NO_CHANGE', 'NEW_BLOCKER', 'NO_SHOW', 'DREAMER_WIN', 'CONCERN_FLAG');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WaitingOn" AS ENUM ('HELPER', 'DREAMER', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "ProjectOutcome" AS ENUM ('ACHIEVED', 'PARTIALLY_ACHIEVED', 'DREAMER_PIVOTED', 'DREAMER_STEPPED_BACK', 'WE_COULDNT_HELP');

-- CreateEnum
CREATE TYPE "SuccessOutcome" AS ENUM ('FIRST_REVENUE', 'LAUNCHED', 'REGISTERED', 'FUNDED', 'FIRST_HIRE_OR_PARTNER', 'SKILL_UNLOCKED', 'PLAN_TO_ACTION', 'REDIRECTED_WELL', 'PAYS_IT_FORWARD');

-- CreateEnum
CREATE TYPE "MilestoneType" AS ENUM ('FIRST_SALE', 'BUSINESS_REGISTERED', 'FIRST_HIRE', 'LAUNCH', 'FUNDING', 'FIRST_PUBLIC_PITCH', 'CAME_BACK_AFTER_SETBACK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ConsentScope" AS ENUM ('PRIVATE', 'TEAM', 'PUBLIC');

-- CreateEnum
CREATE TYPE "RememberCategory" AS ENUM ('FAMILY', 'DATES', 'FEARS', 'JOYS', 'PREFERENCES', 'CONTEXT');

-- CreateEnum
CREATE TYPE "HelperRole" AS ENUM ('HELPER', 'LEAD');

-- CreateEnum
CREATE TYPE "HelperStatus" AS ENUM ('ACTIVE', 'AWAY', 'LEFT');

-- CreateEnum
CREATE TYPE "TagKind" AS ENUM ('THEME', 'PROGRAM', 'FLAG');

-- CreateEnum
CREATE TYPE "NoteVisibility" AS ENUM ('TEAM', 'OWNER_AND_LEAD');

-- CreateEnum
CREATE TYPE "HandoffStatus" AS ENUM ('PENDING_BRIEF', 'BRIEF_COMPLETED', 'INTRO_SENT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('REASSIGNMENT', 'BREAK_GLASS_ACCESS', 'EXPORT', 'GDPR_ERASURE', 'CONFIG_CHANGE', 'OTHER');

-- CreateTable
CREATE TABLE "helper" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "role" "HelperRole" NOT NULL DEFAULT 'HELPER',
    "status" "HelperStatus" NOT NULL DEFAULT 'ACTIVE',
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timezone" TEXT,
    "team_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "helper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_account" (
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_account_pkey" PRIMARY KEY ("provider","provider_account_id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "auth_verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_verification_token_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_config" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "stage" "Stage" NOT NULL,
    "cadence_days" INTEGER NOT NULL,
    "target_stage_days" INTEGER,
    "first_touch_hours" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stage_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dreamer" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "preferred_name" TEXT,
    "location_city" TEXT,
    "location_country" CHAR(2),
    "timezone" TEXT,
    "source" "DreamerSource" NOT NULL DEFAULT 'OTHER',
    "dream_statement" TEXT,
    "original_ask" TEXT,
    "bio_context" TEXT,
    "communication_preference" "Channel",
    "consent_contact" BOOLEAN NOT NULL DEFAULT true,
    "consent_story_sharing" BOOLEAN NOT NULL DEFAULT false,
    "sensitivity_flag" BOOLEAN NOT NULL DEFAULT false,
    "do_not_contact_until" DATE,
    "date_of_birth" DATE,
    "guardian_consent_at" TIMESTAMP(3),
    "owner_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "dreamer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_identity" (
    "id" UUID NOT NULL,
    "dreamer_id" UUID NOT NULL,
    "channel" "Channel" NOT NULL,
    "handle" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "channel_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" UUID NOT NULL,
    "dreamer_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stage" "Stage" NOT NULL DEFAULT 'INTAKE',
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "stage_entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_id" UUID NOT NULL,
    "north_star" TEXT,
    "north_star_target_date" DATE,
    "plan_steps" JSONB,
    "waiting_for" TEXT,
    "pause_reason" TEXT,
    "resume_date" DATE,
    "outcome" "ProjectOutcome",
    "outcome_note" TEXT,
    "referred_to" TEXT,
    "success_outcomes" "SuccessOutcome"[] DEFAULT ARRAY[]::"SuccessOutcome"[],
    "outcome_evidence" JSONB,
    "graduation_story" TEXT,
    "dreamer_quote" TEXT,
    "dreamer_quote_consent" BOOLEAN NOT NULL DEFAULT false,
    "helper_reflection" TEXT,
    "alumni_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction" (
    "id" UUID NOT NULL,
    "dreamer_id" UUID NOT NULL,
    "project_id" UUID,
    "helper_id" UUID NOT NULL,
    "channel" "Channel" NOT NULL,
    "direction" "Direction" NOT NULL DEFAULT 'OUTBOUND',
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "outcome" "InteractionOutcome",
    "counts_as_contact" BOOLEAN NOT NULL DEFAULT true,
    "commitments" JSONB,
    "edited_by_id" UUID,
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" UUID NOT NULL,
    "dreamer_id" UUID NOT NULL,
    "project_id" UUID,
    "assignee_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "is_next_action" BOOLEAN NOT NULL DEFAULT false,
    "waiting_on" "WaitingOn" NOT NULL DEFAULT 'HELPER',
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "snooze_count" INTEGER NOT NULL DEFAULT 0,
    "source_interaction_id" UUID,
    "recreated_from_id" UUID,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" UUID NOT NULL,
    "dreamer_id" UUID,
    "project_id" UUID,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "NoteVisibility" NOT NULL DEFAULT 'TEAM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "type" "MilestoneType" NOT NULL,
    "custom_label" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "evidence_url" TEXT,
    "story_note" TEXT,
    "consent_to_share" "ConsentScope" NOT NULL DEFAULT 'TEAM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remember_item" (
    "id" UUID NOT NULL,
    "dreamer_id" UUID NOT NULL,
    "category" "RememberCategory" NOT NULL,
    "fact_text" TEXT NOT NULL,
    "resurface_on" DATE,
    "source_interaction_id" UUID,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "remember_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "TagKind" NOT NULL DEFAULT 'THEME',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dreamer_tag" (
    "dreamer_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dreamer_tag_pkey" PRIMARY KEY ("dreamer_id","tag_id")
);

-- CreateTable
CREATE TABLE "stage_transition" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "from_stage" "Stage",
    "to_stage" "Stage" NOT NULL,
    "changed_by_id" UUID NOT NULL,
    "reason" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stage_transition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handoff" (
    "id" UUID NOT NULL,
    "dreamer_id" UUID NOT NULL,
    "from_helper_id" UUID NOT NULL,
    "to_helper_id" UUID NOT NULL,
    "status" "HandoffStatus" NOT NULL DEFAULT 'PENDING_BRIEF',
    "brief" JSONB,
    "brief_completed_at" TIMESTAMP(3),
    "intro_sent_at" TIMESTAMP(3),
    "first_touch_due_at" TIMESTAMP(3),
    "first_touch_logged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "handoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "helper_email_key" ON "helper"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_session_session_token_key" ON "auth_session"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "stage_config_team_id_stage_key" ON "stage_config"("team_id", "stage");

-- CreateIndex
CREATE INDEX "dreamer_owner_id_idx" ON "dreamer"("owner_id");

-- CreateIndex
CREATE INDEX "dreamer_team_id_idx" ON "dreamer"("team_id");

-- CreateIndex
CREATE INDEX "channel_identity_channel_handle_idx" ON "channel_identity"("channel", "handle");

-- CreateIndex
CREATE UNIQUE INDEX "channel_identity_dreamer_id_channel_handle_key" ON "channel_identity"("dreamer_id", "channel", "handle");

-- CreateIndex
CREATE INDEX "project_dreamer_id_idx" ON "project"("dreamer_id");

-- CreateIndex
CREATE INDEX "project_owner_id_status_idx" ON "project"("owner_id", "status");

-- CreateIndex
CREATE INDEX "project_stage_status_idx" ON "project"("stage", "status");

-- CreateIndex
CREATE INDEX "interaction_dreamer_id_occurred_at_idx" ON "interaction"("dreamer_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "interaction_project_id_occurred_at_idx" ON "interaction"("project_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "interaction_helper_id_occurred_at_idx" ON "interaction"("helper_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "task_assignee_id_status_due_at_idx" ON "task"("assignee_id", "status", "due_at");

-- CreateIndex
CREATE INDEX "task_project_id_status_idx" ON "task"("project_id", "status");

-- CreateIndex
CREATE INDEX "task_dreamer_id_idx" ON "task"("dreamer_id");

-- CreateIndex
CREATE INDEX "note_dreamer_id_idx" ON "note"("dreamer_id");

-- CreateIndex
CREATE INDEX "note_project_id_idx" ON "note"("project_id");

-- CreateIndex
CREATE INDEX "milestone_project_id_occurred_at_idx" ON "milestone"("project_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "remember_item_dreamer_id_idx" ON "remember_item"("dreamer_id");

-- CreateIndex
CREATE INDEX "remember_item_resurface_on_idx" ON "remember_item"("resurface_on");

-- CreateIndex
CREATE UNIQUE INDEX "tag_team_id_name_key" ON "tag"("team_id", "name");

-- CreateIndex
CREATE INDEX "stage_transition_project_id_occurred_at_idx" ON "stage_transition"("project_id", "occurred_at");

-- CreateIndex
CREATE INDEX "handoff_dreamer_id_idx" ON "handoff"("dreamer_id");

-- CreateIndex
CREATE INDEX "handoff_to_helper_id_status_idx" ON "handoff"("to_helper_id", "status");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_created_at_idx" ON "audit_log"("actor_id", "created_at");

-- AddForeignKey
ALTER TABLE "helper" ADD CONSTRAINT "helper_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "helper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "helper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_config" ADD CONSTRAINT "stage_config_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamer" ADD CONSTRAINT "dreamer_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "helper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamer" ADD CONSTRAINT "dreamer_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_identity" ADD CONSTRAINT "channel_identity_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "helper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_helper_id_fkey" FOREIGN KEY ("helper_id") REFERENCES "helper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_edited_by_id_fkey" FOREIGN KEY ("edited_by_id") REFERENCES "helper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "helper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_source_interaction_id_fkey" FOREIGN KEY ("source_interaction_id") REFERENCES "interaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_recreated_from_id_fkey" FOREIGN KEY ("recreated_from_id") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "helper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remember_item" ADD CONSTRAINT "remember_item_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remember_item" ADD CONSTRAINT "remember_item_source_interaction_id_fkey" FOREIGN KEY ("source_interaction_id") REFERENCES "interaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remember_item" ADD CONSTRAINT "remember_item_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "helper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamer_tag" ADD CONSTRAINT "dreamer_tag_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamer_tag" ADD CONSTRAINT "dreamer_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_transition" ADD CONSTRAINT "stage_transition_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_transition" ADD CONSTRAINT "stage_transition_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "helper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handoff" ADD CONSTRAINT "handoff_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handoff" ADD CONSTRAINT "handoff_from_helper_id_fkey" FOREIGN KEY ("from_helper_id") REFERENCES "helper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handoff" ADD CONSTRAINT "handoff_to_helper_id_fkey" FOREIGN KEY ("to_helper_id") REFERENCES "helper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "helper"("id") ON DELETE SET NULL ON UPDATE CASCADE;
