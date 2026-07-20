import { describe, it, expect } from "vitest";
import {
  classifyFreshness,
  bucketTodayQueue,
  type QueueableProject,
} from "./cadence";

describe("classifyFreshness", () => {
  it("is fresh within cadence", () => {
    expect(classifyFreshness(3, 7)).toBe("fresh");
    expect(classifyFreshness(7, 7)).toBe("fresh");
  });

  it("is cooling between 1.0x and 1.5x cadence", () => {
    expect(classifyFreshness(8, 7)).toBe("cooling");
    expect(classifyFreshness(10, 7)).toBe("cooling");
  });

  it("is stale past 1.5x cadence", () => {
    expect(classifyFreshness(11, 7)).toBe("stale");
    expect(classifyFreshness(30, 7)).toBe("stale");
  });

  it("is stale when never contacted", () => {
    expect(classifyFreshness(null, 7)).toBe("stale");
  });
});

describe("bucketTodayQueue", () => {
  const now = new Date("2026-07-20T12:00:00Z");

  function makeProject(
    overrides: Partial<QueueableProject> = {},
  ): QueueableProject {
    return {
      projectId: "p1",
      dreamerId: "d1",
      cadenceDays: 7,
      lastContactAt: new Date("2026-07-19T12:00:00Z"),
      stageEnteredAt: new Date("2026-07-01T12:00:00Z"),
      nextStep: null,
      ...overrides,
    };
  }

  it("buckets a past-due next step as overdue", () => {
    const items = [
      makeProject({
        nextStep: {
          id: "t1",
          title: "Follow up",
          dueAt: new Date("2026-07-18T12:00:00Z"),
        },
      }),
    ];
    const result = bucketTodayQueue(items, now);
    expect(result).toHaveLength(1);
    expect(result[0]?.bucket).toBe("overdue");
  });

  it("buckets a next step due today as due_today", () => {
    const items = [
      makeProject({
        nextStep: {
          id: "t1",
          title: "Follow up",
          dueAt: new Date("2026-07-20T18:00:00Z"),
        },
      }),
    ];
    const result = bucketTodayQueue(items, now);
    expect(result[0]?.bucket).toBe("due_today");
  });

  it("buckets no-next-step (adrift) as going_quiet", () => {
    const items = [makeProject({ nextStep: null })];
    const result = bucketTodayQueue(items, now);
    expect(result[0]?.bucket).toBe("going_quiet");
  });

  it("buckets stale contact with a future next step as going_quiet", () => {
    const items = [
      makeProject({
        lastContactAt: new Date("2026-07-01T12:00:00Z"), // 19 days ago, cadence 7
        nextStep: {
          id: "t1",
          title: "Check in",
          dueAt: new Date("2026-08-01T12:00:00Z"),
        },
      }),
    ];
    const result = bucketTodayQueue(items, now);
    expect(result[0]?.bucket).toBe("going_quiet");
  });

  it("excludes a healthy Dream with recent contact and a future next step", () => {
    const items = [
      makeProject({
        lastContactAt: new Date("2026-07-19T12:00:00Z"), // 1 day ago, cadence 7
        nextStep: {
          id: "t1",
          title: "Check in",
          dueAt: new Date("2026-07-27T12:00:00Z"),
        },
      }),
    ];
    const result = bucketTodayQueue(items, now);
    expect(result).toHaveLength(0);
  });

  it("sorts overdue items oldest-due-first", () => {
    const items = [
      makeProject({
        projectId: "p1",
        nextStep: {
          id: "t1",
          title: "A",
          dueAt: new Date("2026-07-19T12:00:00Z"),
        },
      }),
      makeProject({
        projectId: "p2",
        nextStep: {
          id: "t2",
          title: "B",
          dueAt: new Date("2026-07-15T12:00:00Z"),
        },
      }),
    ];
    const result = bucketTodayQueue(items, now);
    expect(result.map((r) => r.projectId)).toEqual(["p2", "p1"]);
  });

  it("sorts going_quiet by longest silence first, never-contacted first", () => {
    const items = [
      makeProject({
        projectId: "p1",
        lastContactAt: new Date("2026-07-10T12:00:00Z"), // 10 days ago
        nextStep: null,
      }),
      makeProject({
        projectId: "p2",
        lastContactAt: null,
        stageEnteredAt: new Date("2026-07-05T12:00:00Z"),
        nextStep: null,
      }),
    ];
    const result = bucketTodayQueue(items, now);
    expect(result.map((r) => r.projectId)).toEqual(["p2", "p1"]);
  });

  it("gives waiting/paused-equivalent statuses no alarm when contact is recent", () => {
    // Not directly modeled here (status filtering happens in the query layer,
    // per PRD §4.2 — WAITING_ON_DREAMER/PAUSED projects are excluded before
    // reaching bucketTodayQueue), but a fresh, next-step-scheduled item never
    // buckets regardless of stageEnteredAt drift.
    const items = [
      makeProject({
        lastContactAt: new Date("2026-07-20T10:00:00Z"),
        nextStep: {
          id: "t1",
          title: "Check in",
          dueAt: new Date("2026-07-25T12:00:00Z"),
        },
      }),
    ];
    expect(bucketTodayQueue(items, now)).toHaveLength(0);
  });
});
