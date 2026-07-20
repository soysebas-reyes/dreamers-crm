import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Stage,
  ProjectStatus,
  TaskStatus,
  Channel,
  Direction,
  HelperRole,
} from "../../src/generated/prisma/client";

// Integration tests against a real Postgres — the partial unique index
// (task_one_open_next_action) that enforces the iron rule (PRD §4.3) only
// exists in a real database, not in mocks. Gated on TEST_DATABASE_URL so
// `npm run test` never fails for a contributor who hasn't set one up; CI
// always runs this against a postgres:16 service container.
const connectionString = process.env.TEST_DATABASE_URL;

describe.skipIf(!connectionString)("quick-log transaction (iron rule)", () => {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString! }),
  });

  let teamId: string;
  let helperId: string;
  let dreamerId: string;
  let projectId: string;

  beforeAll(async () => {
    const team = await prisma.team.create({ data: { name: "Test Team" } });
    teamId = team.id;

    const helper = await prisma.user.create({
      data: {
        email: `test-helper-${Date.now()}@dev.local`,
        name: "Test Helper",
        role: HelperRole.HELPER,
        teamId,
      },
    });
    helperId = helper.id;

    const dreamer = await prisma.dreamer.create({
      data: {
        teamId,
        ownerId: helperId,
        firstName: "Test",
        lastName: "Dreamer",
      },
    });
    dreamerId = dreamer.id;

    const project = await prisma.project.create({
      data: {
        dreamerId,
        ownerId: helperId,
        title: "Test Dream",
        stage: Stage.ACTIVE_HELP,
        status: ProjectStatus.ACTIVE,
      },
    });
    projectId = project.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { dreamerId } });
    await prisma.interaction.deleteMany({ where: { dreamerId } });
    await prisma.project.deleteMany({ where: { dreamerId } });
    await prisma.dreamer.deleteMany({ where: { id: dreamerId } });
    await prisma.user.deleteMany({ where: { id: helperId } });
    await prisma.team.deleteMany({ where: { id: teamId } });
    await prisma.$disconnect();
  });

  it("the partial unique index rejects a second open next-action on the same Dream", async () => {
    await prisma.task.create({
      data: {
        dreamerId,
        projectId,
        assigneeId: helperId,
        title: "First next step",
        dueAt: new Date(),
        isNextAction: true,
        status: TaskStatus.OPEN,
      },
    });

    await expect(
      prisma.task.create({
        data: {
          dreamerId,
          projectId,
          assigneeId: helperId,
          title: "Second next step — should be rejected",
          dueAt: new Date(),
          isNextAction: true,
          status: TaskStatus.OPEN,
        },
      }),
    ).rejects.toThrow();
  });

  it("logging a touchpoint atomically closes the prior next step and opens a new one", async () => {
    await prisma.task.deleteMany({ where: { projectId } });
    const priorTask = await prisma.task.create({
      data: {
        dreamerId,
        projectId,
        assigneeId: helperId,
        title: "Prior next step",
        dueAt: new Date(),
        isNextAction: true,
        status: TaskStatus.OPEN,
      },
    });

    await prisma.$transaction(async (tx) => {
      const interaction = await tx.interaction.create({
        data: {
          dreamerId,
          projectId,
          helperId,
          channel: Channel.WHATSAPP,
          direction: Direction.OUTBOUND,
          summary: "Test touchpoint",
        },
      });

      await tx.task.update({
        where: { id: priorTask.id },
        data: {
          status: TaskStatus.DONE,
          isNextAction: false,
          completedAt: new Date(),
        },
      });

      await tx.task.create({
        data: {
          dreamerId,
          projectId,
          assigneeId: helperId,
          title: "New next step",
          dueAt: new Date(),
          isNextAction: true,
          status: TaskStatus.OPEN,
          sourceInteractionId: interaction.id,
          recreatedFromId: priorTask.id,
        },
      });
    });

    const openTasks = await prisma.task.findMany({
      where: { projectId, isNextAction: true, status: TaskStatus.OPEN },
    });
    expect(openTasks).toHaveLength(1);
    expect(openTasks[0]?.title).toBe("New next step");

    const closedTask = await prisma.task.findUniqueOrThrow({
      where: { id: priorTask.id },
    });
    expect(closedTask.status).toBe(TaskStatus.DONE);
    expect(closedTask.isNextAction).toBe(false);
  });

  it("note.dreamer_id/project_id CHECK constraint requires at least one parent", async () => {
    await expect(
      prisma.note.create({
        data: {
          authorId: helperId,
          body: "Orphan note with no parent",
        },
      }),
    ).rejects.toThrow();
  });
});
