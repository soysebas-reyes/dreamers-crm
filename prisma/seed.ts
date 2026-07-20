import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { addDays, subDays } from "date-fns";
import {
  PrismaClient,
  Stage,
  ProjectStatus,
  DreamerSource,
  Channel,
  Direction,
  InteractionOutcome,
  TaskStatus,
  HelperRole,
  TagKind,
  RememberCategory,
  MilestoneType,
  SuccessOutcome,
  ProjectOutcome,
} from "../src/generated/prisma/client";

if (process.env.NODE_ENV === "production" && !process.env.SEED_FORCE) {
  throw new Error(
    "Refusing to seed a production database without SEED_FORCE=1. This script wipes and recreates demo data.",
  );
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and fill in your Supabase connection string.",
  );
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const now = new Date();

// Stage cadence/duration defaults — PRD §4.1. Team-configurable; these are
// the starting values a fresh team gets.
const STAGE_CONFIG: Array<{
  stage: Stage;
  cadenceDays: number;
  targetStageDays: number | null;
  firstTouchHours: number | null;
}> = [
  {
    stage: Stage.INTAKE,
    cadenceDays: 2,
    targetStageDays: 5,
    firstTouchHours: 48,
  },
  {
    stage: Stage.DISCOVERY,
    cadenceDays: 5,
    targetStageDays: 14,
    firstTouchHours: null,
  },
  {
    stage: Stage.ACTIVE_HELP,
    cadenceDays: 7,
    targetStageDays: 112,
    firstTouchHours: null,
  },
  {
    stage: Stage.LAUNCH_SUPPORT,
    cadenceDays: 5,
    targetStageDays: 42,
    firstTouchHours: null,
  },
  {
    stage: Stage.MOMENTUM,
    cadenceDays: 14,
    targetStageDays: 56,
    firstTouchHours: null,
  },
  {
    stage: Stage.GRADUATED,
    cadenceDays: 90,
    targetStageDays: null,
    firstTouchHours: null,
  },
];

async function main() {
  console.log("Seeding Dreamers CRM demo data...");

  // ── Team ────────────────────────────────────────────────────────────────
  let team = await prisma.team.findFirst({ where: { name: "HelpBnk Crew" } });
  if (!team) {
    team = await prisma.team.create({ data: { name: "HelpBnk Crew" } });
  }
  const teamId: string = team.id;

  // ── Stage config (upsert) ────────────────────────────────────────────────
  for (const sc of STAGE_CONFIG) {
    await prisma.stageConfig.upsert({
      where: { teamId_stage: { teamId: teamId, stage: sc.stage } },
      update: {
        cadenceDays: sc.cadenceDays,
        targetStageDays: sc.targetStageDays,
        firstTouchHours: sc.firstTouchHours,
      },
      create: {
        teamId: teamId,
        stage: sc.stage,
        cadenceDays: sc.cadenceDays,
        targetStageDays: sc.targetStageDays,
        firstTouchHours: sc.firstTouchHours,
      },
    });
  }

  // ── Dev helpers (upsert by email — dev-login identities) ────────────────
  const lead = await prisma.user.upsert({
    where: { email: "lead@dev.local" },
    update: {
      teamId: teamId,
      name: "Sam",
      role: HelperRole.LEAD,
      emailVerified: now,
    },
    create: {
      email: "lead@dev.local",
      name: "Sam",
      role: HelperRole.LEAD,
      teamId: teamId,
      timezone: "Europe/London",
      emailVerified: now,
    },
  });
  const helper = await prisma.user.upsert({
    where: { email: "helper@dev.local" },
    update: {
      teamId: teamId,
      name: "Priya",
      role: HelperRole.HELPER,
      emailVerified: now,
    },
    create: {
      email: "helper@dev.local",
      name: "Priya",
      role: HelperRole.HELPER,
      teamId: teamId,
      timezone: "Europe/London",
      emailVerified: now,
    },
  });

  // ── Tags ─────────────────────────────────────────────────────────────────
  const tagDefs: Array<{ name: string; kind: TagKind }> = [
    { name: "food", kind: TagKind.THEME },
    { name: "creative", kind: TagKind.THEME },
    { name: "spring-2026-cohort", kind: TagKind.PROGRAM },
    { name: "sensitive-family-situation", kind: TagKind.FLAG },
  ];
  for (const t of tagDefs) {
    await prisma.tag.upsert({
      where: { teamId_name: { teamId: teamId, name: t.name } },
      update: {},
      create: { teamId: teamId, name: t.name, kind: t.kind },
    });
  }

  // ── Wipe existing demo domain data for this team (FK-safe order) ────────
  const dreamerIds = (
    await prisma.dreamer.findMany({
      where: { teamId: teamId },
      select: { id: true },
    })
  ).map((d) => d.id);
  const projectIds = (
    await prisma.project.findMany({
      where: { dreamerId: { in: dreamerIds } },
      select: { id: true },
    })
  ).map((p) => p.id);

  await prisma.dreamerTag.deleteMany({
    where: { dreamerId: { in: dreamerIds } },
  });
  await prisma.rememberItem.deleteMany({
    where: { dreamerId: { in: dreamerIds } },
  });
  await prisma.milestone.deleteMany({
    where: { projectId: { in: projectIds } },
  });
  await prisma.stageTransition.deleteMany({
    where: { projectId: { in: projectIds } },
  });
  await prisma.task.deleteMany({ where: { dreamerId: { in: dreamerIds } } });
  await prisma.note.deleteMany({ where: { dreamerId: { in: dreamerIds } } });
  await prisma.interaction.deleteMany({
    where: { dreamerId: { in: dreamerIds } },
  });
  await prisma.handoff.deleteMany({ where: { dreamerId: { in: dreamerIds } } });
  await prisma.channelIdentity.deleteMany({
    where: { dreamerId: { in: dreamerIds } },
  });
  await prisma.project.deleteMany({ where: { dreamerId: { in: dreamerIds } } });
  await prisma.dreamer.deleteMany({ where: { id: { in: dreamerIds } } });

  const foodTag = await prisma.tag.findFirstOrThrow({
    where: { teamId: teamId, name: "food" },
  });
  const creativeTag = await prisma.tag.findFirstOrThrow({
    where: { teamId: teamId, name: "creative" },
  });

  // ── Helper: create a Dreamer + one active Dream + channel identities ────
  async function seedDreamer(input: {
    firstName: string;
    lastName: string;
    ownerId: string;
    source: DreamerSource;
    dreamTitle: string;
    dreamStatement: string;
    originalAsk: string;
    stage: Stage;
    status: ProjectStatus;
    stageEnteredDaysAgo: number;
    waitingFor?: string;
    tagIds?: string[];
    phone: string;
  }) {
    const dreamer = await prisma.dreamer.create({
      data: {
        teamId: teamId,
        ownerId: input.ownerId,
        firstName: input.firstName,
        lastName: input.lastName,
        source: input.source,
        dreamStatement: input.dreamStatement,
        originalAsk: input.originalAsk,
        communicationPreference: Channel.WHATSAPP,
        locationCity: "Manchester",
        locationCountry: "GB",
        timezone: "Europe/London",
      },
    });

    await prisma.channelIdentity.create({
      data: {
        dreamerId: dreamer.id,
        channel: Channel.WHATSAPP,
        handle: input.phone,
        isPrimary: true,
      },
    });

    if (input.tagIds) {
      for (const tagId of input.tagIds) {
        await prisma.dreamerTag.create({
          data: { dreamerId: dreamer.id, tagId },
        });
      }
    }

    const project = await prisma.project.create({
      data: {
        dreamerId: dreamer.id,
        ownerId: input.ownerId,
        title: input.dreamTitle,
        stage: input.stage,
        status: input.status,
        stageEnteredAt: subDays(now, input.stageEnteredDaysAgo),
        waitingFor: input.waitingFor,
      },
    });

    await prisma.stageTransition.create({
      data: {
        projectId: project.id,
        fromStage: null,
        toStage: input.stage,
        changedById: input.ownerId,
        occurredAt: subDays(now, input.stageEnteredDaysAgo),
      },
    });

    return { dreamer, project };
  }

  // 1. Sofia Okafor — Priya — Active Help — OVERDUE
  const p1 = await seedDreamer({
    firstName: "Sofia",
    lastName: "Okafor",
    ownerId: helper.id,
    source: DreamerSource.HELPBNK_DM,
    dreamTitle: "Sourdough micro-bakery",
    dreamStatement:
      "I want to open a sourdough micro-bakery so I can work for myself.",
    originalAsk:
      "Needs help getting food-hygiene certified and finding a market stall.",
    stage: Stage.ACTIVE_HELP,
    status: ProjectStatus.ACTIVE,
    stageEnteredDaysAgo: 24,
    tagIds: [foodTag.id],
    phone: "+447700900001",
  });
  await prisma.interaction.create({
    data: {
      dreamerId: p1.dreamer.id,
      projectId: p1.project.id,
      helperId: helper.id,
      channel: Channel.WHATSAPP,
      direction: Direction.OUTBOUND,
      occurredAt: subDays(now, 6),
      summary: "She got the market stall confirmed for next month.",
      outcome: InteractionOutcome.PROGRESSED,
    },
  });
  await prisma.task.create({
    data: {
      dreamerId: p1.dreamer.id,
      projectId: p1.project.id,
      assigneeId: helper.id,
      title: "Send hygiene cert link",
      dueAt: subDays(now, 2),
      isNextAction: true,
      status: TaskStatus.OPEN,
    },
  });
  await prisma.rememberItem.create({
    data: {
      dreamerId: p1.dreamer.id,
      category: RememberCategory.FAMILY,
      factText: "Daughter Lina, 7, obsessed with dinosaurs",
      resurfaceOn: addDays(now, 3),
      createdById: helper.id,
    },
  });

  // 2. Maya Chen — Sam — Discovery — WAITING_ON_DREAMER, due-today nudge
  const p2 = await seedDreamer({
    firstName: "Maya",
    lastName: "Chen",
    ownerId: lead.id,
    source: DreamerSource.EVENT,
    dreamTitle: "Community app pitch deck",
    dreamStatement:
      "I want to build an app that helps neighbours share tools and skills.",
    originalAsk:
      "Wants feedback on her pitch deck before approaching investors.",
    stage: Stage.DISCOVERY,
    status: ProjectStatus.WAITING_ON_DREAMER,
    stageEnteredDaysAgo: 9,
    waitingFor: "Sending over her draft pitch deck",
    tagIds: [creativeTag.id],
    phone: "+447700900002",
  });
  await prisma.interaction.create({
    data: {
      dreamerId: p2.dreamer.id,
      projectId: p2.project.id,
      helperId: lead.id,
      channel: Channel.EMAIL,
      direction: Direction.OUTBOUND,
      occurredAt: subDays(now, 7),
      summary: "Asked her to send the draft deck when ready, no rush.",
      outcome: InteractionOutcome.NO_CHANGE,
    },
  });
  await prisma.task.create({
    data: {
      dreamerId: p2.dreamer.id,
      projectId: p2.project.id,
      assigneeId: lead.id,
      title: "Check in — has she sent the deck?",
      dueAt: now,
      isNextAction: true,
      status: TaskStatus.OPEN,
    },
  });

  // 3. Marcus Hale — Priya — Launch Support — due today, FEARS remember-item
  const p3 = await seedDreamer({
    firstName: "Marcus",
    lastName: "Hale",
    ownerId: helper.id,
    source: DreamerSource.DOORBELL,
    dreamTitle: "Street-food truck launch",
    dreamStatement:
      "I want my food truck serving Saturday markets across the city.",
    originalAsk:
      "Needs a hand rehearsing his market-stall pitch to organisers.",
    stage: Stage.LAUNCH_SUPPORT,
    status: ProjectStatus.ACTIVE,
    stageEnteredDaysAgo: 10,
    tagIds: [foodTag.id],
    phone: "+447700900003",
  });
  await prisma.interaction.create({
    data: {
      dreamerId: p3.dreamer.id,
      projectId: p3.project.id,
      helperId: helper.id,
      channel: Channel.PHONE_CALL,
      direction: Direction.MUTUAL,
      occurredAt: subDays(now, 3),
      summary: "Ran through his pitch for Saturday's market organisers.",
      outcome: InteractionOutcome.PROGRESSED,
    },
  });
  await prisma.task.create({
    data: {
      dreamerId: p3.dreamer.id,
      projectId: p3.project.id,
      assigneeId: helper.id,
      title: "Confirm market-stall pitch time for Saturday",
      dueAt: now,
      isNextAction: true,
      status: TaskStatus.OPEN,
    },
  });
  await prisma.rememberItem.create({
    data: {
      dreamerId: p3.dreamer.id,
      category: RememberCategory.FEARS,
      factText:
        "Terrified of the food-hygiene inspection — go gently, talk him through it",
      createdById: helper.id,
    },
  });

  // 4. Amara Diallo — Sam — Active Help — GOING QUIET, adrift (no open next step)
  const p4 = await seedDreamer({
    firstName: "Amara",
    lastName: "Diallo",
    ownerId: lead.id,
    source: DreamerSource.REFERRAL,
    dreamTitle: "Catering side business",
    dreamStatement:
      "I want to cater small events on weekends alongside my day job.",
    originalAsk:
      "Wanted an accountability partner while building her client list.",
    stage: Stage.ACTIVE_HELP,
    status: ProjectStatus.ACTIVE,
    stageEnteredDaysAgo: 40,
    tagIds: [foodTag.id],
    phone: "+447700900004",
  });
  await prisma.interaction.create({
    data: {
      dreamerId: p4.dreamer.id,
      projectId: p4.project.id,
      helperId: lead.id,
      channel: Channel.WHATSAPP,
      direction: Direction.OUTBOUND,
      occurredAt: subDays(now, 12),
      summary: "Checked in on how her first two catering bookings went.",
      outcome: InteractionOutcome.NO_CHANGE,
    },
  });
  // Deliberately no open next-action task — demonstrates the "adrift" state
  // in the Going Quiet queue section (no scheduled step at all).
  const completedTask = await prisma.task.create({
    data: {
      dreamerId: p4.dreamer.id,
      projectId: p4.project.id,
      assigneeId: lead.id,
      title: "Check in on first bookings",
      dueAt: subDays(now, 12),
      isNextAction: false,
      status: TaskStatus.DONE,
      completedAt: subDays(now, 12),
    },
  });
  void completedTask;

  // 5. David Osei — Priya — Intake — created yesterday, auto first-contact task
  const p5 = await seedDreamer({
    firstName: "David",
    lastName: "Osei",
    ownerId: helper.id,
    source: DreamerSource.WALK_IN,
    dreamTitle: "Barbershop",
    dreamStatement: "I want to open my own barbershop on the high street.",
    originalAsk: "Walked in wanting general guidance — not yet assessed.",
    stage: Stage.INTAKE,
    status: ProjectStatus.ACTIVE,
    stageEnteredDaysAgo: 1,
    phone: "+447700900005",
  });
  await prisma.task.create({
    data: {
      dreamerId: p5.dreamer.id,
      projectId: p5.project.id,
      assigneeId: helper.id,
      title: "Make first contact",
      dueAt: addDays(subDays(now, 1), 2), // created yesterday, due +48h
      isNextAction: true,
      status: TaskStatus.OPEN,
    },
  });

  // 6. Elena Petrova — Sam — Momentum — healthy, not due for a while
  const p6 = await seedDreamer({
    firstName: "Elena",
    lastName: "Petrova",
    ownerId: lead.id,
    source: DreamerSource.SOCIAL_DM,
    dreamTitle: "Etsy jewelry shop",
    dreamStatement:
      "I want my handmade jewellery shop to support me full-time.",
    originalAsk: "Wanted a sounding board while she scaled up from a hobby.",
    stage: Stage.MOMENTUM,
    status: ProjectStatus.ACTIVE,
    stageEnteredDaysAgo: 20,
    tagIds: [creativeTag.id],
    phone: "+447700900006",
  });
  await prisma.interaction.create({
    data: {
      dreamerId: p6.dreamer.id,
      projectId: p6.project.id,
      helperId: lead.id,
      channel: Channel.EMAIL,
      direction: Direction.INBOUND,
      occurredAt: subDays(now, 4),
      summary:
        "She's steady — two repeat customers this month, no new blockers.",
      outcome: InteractionOutcome.NO_CHANGE,
    },
  });
  await prisma.task.create({
    data: {
      dreamerId: p6.dreamer.id,
      projectId: p6.project.id,
      assigneeId: lead.id,
      title: "Momentum check-in",
      dueAt: addDays(now, 9),
      isNextAction: true,
      status: TaskStatus.OPEN,
    },
  });

  // 7. Jamal Wright — Priya — Discovery — GHOSTED
  const p7 = await seedDreamer({
    firstName: "Jamal",
    lastName: "Wright",
    ownerId: helper.id,
    source: DreamerSource.SOCIAL_DM,
    dreamTitle: "Music production course",
    dreamStatement:
      "I want to teach music production to kids in my neighbourhood.",
    originalAsk: "Asked about funding options for equipment, went quiet after.",
    stage: Stage.DISCOVERY,
    status: ProjectStatus.GHOSTED,
    stageEnteredDaysAgo: 50,
    tagIds: [creativeTag.id],
    phone: "+447700900007",
  });
  await prisma.interaction.createMany({
    data: [
      {
        dreamerId: p7.dreamer.id,
        projectId: p7.project.id,
        helperId: helper.id,
        channel: Channel.WHATSAPP,
        direction: Direction.OUTBOUND,
        occurredAt: subDays(now, 44),
        summary: "Gentle nudge — checking how the equipment research is going.",
        outcome: InteractionOutcome.NO_CHANGE,
      },
      {
        dreamerId: p7.dreamer.id,
        projectId: p7.project.id,
        helperId: helper.id,
        channel: Channel.WHATSAPP,
        direction: Direction.OUTBOUND,
        occurredAt: subDays(now, 20),
        summary:
          "Open-door close sent: door stays open, no more nudges unless he replies.",
        outcome: InteractionOutcome.NO_CHANGE,
      },
    ],
  });

  // 8. Rosa Martinez — Sam — Graduated
  const p8 = await seedDreamer({
    firstName: "Rosa",
    lastName: "Martinez",
    ownerId: lead.id,
    source: DreamerSource.REFERRAL,
    dreamTitle: "Community garden",
    dreamStatement:
      "I want to turn the empty lot on my street into a shared garden.",
    originalAsk: "Needed help finding funding and getting council permission.",
    stage: Stage.GRADUATED,
    status: ProjectStatus.ACTIVE,
    stageEnteredDaysAgo: 20,
    phone: "+447700900008",
  });
  await prisma.project.update({
    where: { id: p8.project.id },
    data: {
      closedAt: subDays(now, 20),
      outcome: ProjectOutcome.ACHIEVED,
      outcomeNote: "Garden opened to the public with council backing.",
      successOutcomes: [SuccessOutcome.LAUNCHED, SuccessOutcome.SKILL_UNLOCKED],
      graduationStory:
        "Rosa turned an empty lot into a thriving community garden in under a year — she now runs the planting rota herself and has taught two neighbours to do the same.",
      helperReflection:
        "Council permissions took longer than expected; next time, start that thread in week one.",
      alumniOptIn: true,
    },
  });
  await prisma.milestone.create({
    data: {
      projectId: p8.project.id,
      type: MilestoneType.LAUNCH,
      occurredAt: subDays(now, 25),
      storyNote: "Community garden opened to the public.",
    },
  });

  console.log("Seed complete.");
  console.log(`  Team: ${team.name}`);
  console.log(
    `  Dev login: lead@dev.local (Sam, LEAD), helper@dev.local (Priya, HELPER)`,
  );
  console.log("  8 Dreamers seeded across Intake -> Graduated, covering:");
  console.log(
    "    - Overdue, Due today, Going quiet (adrift), Ghosted, Graduated",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
