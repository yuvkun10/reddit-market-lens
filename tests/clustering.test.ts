import { describe, expect, it } from "vitest";
import { analyzeRecords } from "../src/analysis/analyzer.js";
import type { RedditRecord } from "../src/types.js";

const records: RedditRecord[] = [
  {
    id: "p1",
    kind: "post",
    sourceFormat: "json",
    title: "Manual invoice approvals are wasting time",
    body: "Our finance team copies invoices into a spreadsheet and it is painful every month.",
    subreddit: "finance",
    author: "controller",
    score: 31
  },
  {
    id: "c1",
    kind: "comment",
    sourceFormat: "json",
    body: "I need a clean CSV export so my CFO can review errors without manual cleanup.",
    subreddit: "finance",
    author: "ops",
    score: 22,
    postId: "p1"
  },
  {
    id: "c2",
    kind: "comment",
    sourceFormat: "json",
    body: "The product looked useful, but the pricing felt too expensive for our budget.",
    subreddit: "smallbusiness",
    author: "founder",
    score: 18,
    postId: "p1"
  }
];

describe("analyzeRecords", () => {
  it("clusters pain points, personas, desired outcomes, and objections deterministically", () => {
    const analysis = analyzeRecords(records, { now: "2026-05-24T00:00:00.000Z" });

    expect(analysis.generatedAt).toBe("2026-05-24T00:00:00.000Z");
    expect(analysis.painPoints.map((cluster) => cluster.label)).toContain("Manual workflow");
    expect(analysis.personas.map((cluster) => cluster.label)).toContain("Finance leaders");
    expect(analysis.desiredOutcomes.map((cluster) => cluster.label)).toContain("Reliable exports");
    expect(analysis.objections.map((cluster) => cluster.label)).toContain("Price sensitivity");

    const manualWorkflow = analysis.painPoints.find((cluster) => cluster.label === "Manual workflow");
    expect(manualWorkflow?.recordIds).toEqual(["p1", "c1"]);
    expect(manualWorkflow?.quotes[0]?.text).toContain("clean CSV export");

    expect(analysis.executiveSummary[0]).toContain("Manual workflow");
    expect(analysis.recommendations).toContain(
      "Lead messaging with the top pain point: Manual workflow."
    );
  });
});
