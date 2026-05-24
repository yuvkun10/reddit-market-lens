import { parseCsvExport } from "./csv.js";
import { parseJsonExport } from "./json.js";
import { parseTextExport } from "./text.js";
import type { InputFormat, ParseOptions, RedditCorpus, RedditRecord } from "../types.js";
import { uniqueCount } from "../text-utils.js";

export function parseRedditExport(content: string, options: ParseOptions = {}): RedditCorpus {
  const sourceName = options.sourceName;
  const format = resolveFormat(content, options.format ?? "auto", sourceName);

  const records =
    format === "json"
      ? parseJsonExport(content, sourceName)
      : format === "csv"
        ? parseCsvExport(content, sourceName)
        : parseTextExport(content, sourceName);

  return buildCorpus(records);
}

export function buildCorpus(records: RedditRecord[]): RedditCorpus {
  const deduped = new Map<string, RedditRecord>();
  for (const record of records) {
    if (!deduped.has(record.id)) {
      deduped.set(record.id, record);
    }
  }

  const allRecords = [...deduped.values()];
  const posts = allRecords.filter((record) => record.kind === "post");
  const comments = allRecords.filter((record) => record.kind === "comment");

  return {
    records: allRecords,
    posts,
    comments,
    stats: {
      recordCount: allRecords.length,
      postCount: posts.length,
      commentCount: comments.length,
      subredditCount: uniqueCount(allRecords.map((record) => record.subreddit)),
      authorCount: uniqueCount(allRecords.map((record) => record.author))
    }
  };
}

function resolveFormat(content: string, requested: InputFormat, sourceName?: string): Exclude<InputFormat, "auto"> {
  if (requested !== "auto") {
    return requested;
  }

  const lowerName = sourceName?.toLowerCase() ?? "";
  if (lowerName.endsWith(".json")) {
    return "json";
  }
  if (lowerName.endsWith(".csv")) {
    return "csv";
  }
  if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    return "text";
  }

  const trimmed = content.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return "json";
  }

  const firstLine = trimmed.split(/\r?\n/, 1)[0]?.toLowerCase() ?? "";
  if (firstLine.includes(",") && (firstLine.includes("body") || firstLine.includes("title"))) {
    return "csv";
  }

  return "text";
}
