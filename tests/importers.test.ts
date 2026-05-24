import { describe, expect, it } from "vitest";
import { parseRedditExport } from "../src/importers/index.js";

describe("parseRedditExport", () => {
  it("normalizes Reddit JSON posts and comments into a common corpus", () => {
    const input = JSON.stringify({
      posts: [
        {
          id: "abc",
          title: "I keep missing invoice changes",
          selftext: "Manual approval is painful.",
          subreddit: "SaaS",
          author: "opslead",
          score: 42,
          created_utc: 1710000000,
          permalink: "/r/SaaS/comments/abc/example"
        }
      ],
      comments: [
        {
          id: "c1",
          body: "We need CSV export that finance can trust.",
          link_id: "t3_abc",
          parent_id: "t3_abc",
          subreddit: "SaaS",
          author: "finance-cfo",
          score: 9
        }
      ]
    });

    const corpus = parseRedditExport(input, { format: "json", sourceName: "sample.json" });

    expect(corpus.records).toHaveLength(2);
    expect(corpus.posts[0]).toMatchObject({
      id: "abc",
      kind: "post",
      title: "I keep missing invoice changes",
      body: "Manual approval is painful.",
      subreddit: "SaaS",
      author: "opslead",
      sourceFormat: "json"
    });
    expect(corpus.posts[0]?.createdAt).toMatch(/^2024-/);
    expect(corpus.comments[0]).toMatchObject({
      id: "c1",
      kind: "comment",
      body: "We need CSV export that finance can trust.",
      postId: "abc",
      parentId: "abc"
    });
    expect(corpus.stats).toMatchObject({ postCount: 1, commentCount: 1, recordCount: 2 });
  });

  it("parses CSV exports with quoted fields and inferred record kinds", () => {
    const csv = [
      "type,id,title,body,subreddit,author,score,parent_id,post_id,created_utc",
      "post,p1,\"Billing, surprise\",\"Unexpected invoices keep hitting my budget\",smallbusiness,owner,15,,,1710000000",
      "comment,c1,,\"I need export to CSV before my accountant trusts it\",smallbusiness,bookkeeper,7,t3_p1,p1,1710000100"
    ].join("\n");

    const corpus = parseRedditExport(csv, { format: "csv", sourceName: "reddit.csv" });

    expect(corpus.records).toHaveLength(2);
    expect(corpus.posts[0]?.title).toBe("Billing, surprise");
    expect(corpus.comments[0]).toMatchObject({
      kind: "comment",
      postId: "p1",
      parentId: "p1",
      body: "I need export to CSV before my accountant trusts it"
    });
  });

  it("turns pasted Reddit text into stable post and comment records", () => {
    const text = [
      "r/startups - Billing exports are painful",
      "I spend an hour cleaning CSV files before finance can use them.",
      "",
      "Comment: Pricing pages hide the real cost and my CFO blocks tools when seats are unclear."
    ].join("\n");

    const corpus = parseRedditExport(text, { format: "text", sourceName: "paste.txt" });

    expect(corpus.records).toHaveLength(2);
    expect(corpus.posts[0]).toMatchObject({
      kind: "post",
      subreddit: "startups",
      title: "Billing exports are painful",
      body: "I spend an hour cleaning CSV files before finance can use them."
    });
    expect(corpus.comments[0]?.body).toBe(
      "Pricing pages hide the real cost and my CFO blocks tools when seats are unclear."
    );
    expect(corpus.records.map((record) => record.id)).toEqual(
      parseRedditExport(text, { format: "text", sourceName: "paste.txt" }).records.map(
        (record) => record.id
      )
    );
    expect(corpus.records.every((record) => /^text-[a-f0-9]{12}$/.test(record.id))).toBe(true);
  });
});
