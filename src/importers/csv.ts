import { parse as parseCsv } from "csv-parse/sync";
import type { RedditRecord, RedditRecordKind } from "../types.js";
import {
  normalizeWhitespace,
  parseScore,
  stableId,
  stripFullnamePrefix,
  toIsoDate
} from "../text-utils.js";

type CsvRow = Record<string, string | undefined>;

export function parseCsvExport(content: string, sourceName?: string): RedditRecord[] {
  let rows: CsvRow[];

  try {
    rows = parseCsv(content, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CsvRow[];
  } catch (error) {
    throw new Error(`Invalid Reddit CSV export: ${(error as Error).message}`, { cause: error });
  }

  return rows
    .map((row, index) => normalizeCsvRecord(row, index, sourceName))
    .filter((record): record is RedditRecord => Boolean(record));
}

function normalizeCsvRecord(row: CsvRow, index: number, sourceName?: string): RedditRecord | null {
  const title = normalizeWhitespace(readField(row, ["title", "post_title", "submission_title"]));
  const body = normalizeWhitespace(
    readField(row, ["body", "selftext", "text", "comment", "content"])
  );
  if (title === "" && body === "") {
    return null;
  }

  const kind = inferKind(row, title);
  const id =
    stripFullnamePrefix(readField(row, ["id", "name", "comment_id", "post_id"])) ??
    stableId("csv", `${kind}|${title}|${body}|${index}`);

  return {
    id,
    kind,
    sourceFormat: "csv",
    sourceName,
    title: title || undefined,
    body,
    subreddit: readField(row, ["subreddit", "community", "sub"]) || undefined,
    author: readField(row, ["author", "user", "username"]) || undefined,
    score: parseScore(readField(row, ["score", "ups", "upvotes"])),
    createdAt: toIsoDate(readField(row, ["created_utc", "created_at", "created"])),
    url: readField(row, ["url", "permalink"]) || undefined,
    permalink: readField(row, ["permalink"]) || undefined,
    parentId: stripFullnamePrefix(readField(row, ["parent_id", "parent"])),
    postId: stripFullnamePrefix(readField(row, ["post_id", "link_id", "submission_id"]))
  };
}

function inferKind(row: CsvRow, title: string): RedditRecordKind {
  const marker = readField(row, ["type", "kind", "record_type"]).toLowerCase();
  if (marker.includes("comment") || marker.includes("t1")) {
    return "comment";
  }
  if (marker.includes("post") || marker.includes("submission") || marker.includes("t3")) {
    return "post";
  }
  return title ? "post" : "comment";
}

function readField(row: CsvRow, keys: string[]): string {
  const lowerCaseEntries = new Map(
    Object.entries(row).map(([key, value]) => [key.toLowerCase(), value ?? ""])
  );

  for (const key of keys) {
    const value = lowerCaseEntries.get(key.toLowerCase());
    if (value !== undefined && value !== "") {
      return value;
    }
  }

  return "";
}
