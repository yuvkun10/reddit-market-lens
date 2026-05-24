import { describe, expect, it } from "vitest";
import { analyzeRecords } from "../src/analysis/analyzer.js";
import { deterministicSynthesis } from "../src/analysis/synthesis.js";
import { renderJsonReport, renderMarkdownReport } from "../src/report/render.js";
import type { RedditRecord } from "../src/types.js";

describe("report rendering", () => {
  const records: RedditRecord[] = [
    {
      id: "p1",
      kind: "post",
      sourceFormat: "json",
      title: "Manual billing work is killing us",
      body: "We need automated exports because manual invoice checks waste time.",
      subreddit: "startups",
      author: "founder",
      score: 44
    },
    {
      id: "c1",
      kind: "comment",
      sourceFormat: "json",
      body: "My CFO objects when pricing is unclear and security is not documented.",
      subreddit: "startups",
      author: "opslead",
      score: 16,
      postId: "p1"
    }
  ];

  it("renders a markdown market research report with quotes and next steps", () => {
    const analysis = analyzeRecords(records, { now: "2026-05-24T00:00:00.000Z" });
    const markdown = renderMarkdownReport(analysis, {
      title: "Invoice Research",
      generatedAt: analysis.generatedAt
    });

    expect(markdown).toContain("# Invoice Research");
    expect(markdown).toContain("## Executive Summary");
    expect(markdown).toContain("### Pain Points");
    expect(markdown).toContain("Manual workflow");
    expect(markdown).toContain("> We need automated exports");
    expect(markdown).toContain("Lead messaging with the top pain point");
  });

  it("renders stable JSON and deterministic fallback synthesis", () => {
    const analysis = analyzeRecords(records, { now: "2026-05-24T00:00:00.000Z" });
    const parsed = JSON.parse(renderJsonReport(analysis)) as typeof analysis;
    const synthesis = deterministicSynthesis(analysis);

    expect(parsed.generatedAt).toBe("2026-05-24T00:00:00.000Z");
    expect(parsed.painPoints.length).toBeGreaterThan(0);
    expect(synthesis.provider).toBe("deterministic");
    expect(synthesis.summary[0]).toContain("Manual workflow");
  });
});
