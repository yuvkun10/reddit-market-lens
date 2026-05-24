import { describe, expect, it } from "vitest";
import { extractQuotes } from "../src/analysis/quotes.js";
import type { RedditRecord } from "../src/types.js";

describe("extractQuotes", () => {
  it("extracts high-signal quotes, strips Reddit markup, and removes duplicates", () => {
    const records: RedditRecord[] = [
      {
        id: "c1",
        kind: "comment",
        sourceFormat: "text",
        body: "> I need a clean CSV export without editing it for an hour.",
        subreddit: "SaaS",
        author: "buyer",
        score: 5
      },
      {
        id: "c2",
        kind: "comment",
        sourceFormat: "text",
        body: "I need a clean CSV export without editing it for an hour.",
        subreddit: "SaaS",
        author: "buyer2",
        score: 12
      },
      {
        id: "c3",
        kind: "comment",
        sourceFormat: "text",
        body: "[deleted]",
        subreddit: "SaaS",
        author: "[deleted]",
        score: 100
      },
      {
        id: "c4",
        kind: "comment",
        sourceFormat: "text",
        body: "Same.",
        subreddit: "SaaS",
        author: "lurker",
        score: 1
      }
    ];

    const quotes = extractQuotes(records, { maxQuotes: 3, tags: ["Reliable exports"] });

    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toMatchObject({
      sourceId: "c2",
      text: "I need a clean CSV export without editing it for an hour.",
      author: "buyer2",
      tags: ["Reliable exports"]
    });
  });
});
