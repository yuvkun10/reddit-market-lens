import type { RedditRecord, RedditRecordKind } from "../types.js";
import {
  normalizeWhitespace,
  parseScore,
  stableId,
  stripFullnamePrefix,
  toIsoDate
} from "../text-utils.js";

type JsonObject = Record<string, unknown>;

export function parseJsonExport(content: string, sourceName?: string): RedditRecord[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error(`Invalid Reddit JSON export: ${(error as Error).message}`, { cause: error });
  }

  const candidates = collectJsonCandidates(parsed);
  return candidates
    .map(({ value, kind }) => normalizeJsonRecord(value, kind, sourceName))
    .filter((record): record is RedditRecord => Boolean(record));
}

function collectJsonCandidates(value: unknown): Array<{ value: unknown; kind?: RedditRecordKind }> {
  if (Array.isArray(value)) {
    return value.map((item) => ({ value: item }));
  }

  if (!isObject(value)) {
    return [];
  }

  const posts = asArray(value.posts).map((item) => ({ value: item, kind: "post" as const }));
  const comments = asArray(value.comments).map((item) => ({ value: item, kind: "comment" as const }));
  if (posts.length > 0 || comments.length > 0) {
    return [...posts, ...comments];
  }

  const children = isObject(value.data) ? asArray(value.data.children) : [];
  if (children.length > 0) {
    return children.map((item) => ({ value: item }));
  }

  return [{ value }];
}

function normalizeJsonRecord(
  value: unknown,
  fallbackKind?: RedditRecordKind,
  sourceName?: string
): RedditRecord | null {
  const raw = unwrapRedditData(value);
  if (!raw) {
    return null;
  }

  const kind = inferKind(value, raw, fallbackKind);
  const title = normalizeWhitespace(readString(raw, ["title"]));
  const body = normalizeWhitespace(
    readString(raw, ["body", "selftext", "text", "content", "comment"])
  );
  if (title === "" && body === "") {
    return null;
  }

  const id =
    stripFullnamePrefix(readString(raw, ["id", "name"])) ??
    stableId("json", `${kind}|${title}|${body}|${readString(raw, ["author"])}`);
  const permalink = readString(raw, ["permalink"]);

  return {
    id,
    kind,
    sourceFormat: "json",
    sourceName,
    title: title || undefined,
    body,
    subreddit: readString(raw, ["subreddit"]) || undefined,
    author: readString(raw, ["author"]) || undefined,
    score: parseScore(raw.score),
    createdAt: toIsoDate(raw.created_utc ?? raw.createdAt ?? raw.created_at),
    url: normalizeUrl(readString(raw, ["url"]), permalink),
    permalink: permalink || undefined,
    parentId: stripFullnamePrefix(raw.parent_id),
    postId:
      stripFullnamePrefix(raw.link_id) ??
      stripFullnamePrefix(raw.post_id) ??
      stripFullnamePrefix(raw.submission_id)
  };
}

function inferKind(value: unknown, raw: JsonObject, fallbackKind?: RedditRecordKind): RedditRecordKind {
  const wrapperKind = isObject(value) ? readString(value, ["kind"]) : "";
  const rawKind = readString(raw, ["kind", "type"]);
  const marker = `${wrapperKind} ${rawKind}`.toLowerCase();

  if (fallbackKind) {
    return fallbackKind;
  }
  if (marker.includes("t1") || marker.includes("comment")) {
    return "comment";
  }
  if (marker.includes("t3") || marker.includes("post") || marker.includes("submission")) {
    return "post";
  }
  if (readString(raw, ["body", "comment"]) && !readString(raw, ["title"])) {
    return "comment";
  }

  return "post";
}

function unwrapRedditData(value: unknown): JsonObject | null {
  if (!isObject(value)) {
    return null;
  }

  if (isObject(value.data)) {
    return value.data;
  }

  return value;
}

function normalizeUrl(url: string, permalink: string): string | undefined {
  if (url !== "") {
    return url;
  }
  if (permalink.startsWith("/")) {
    return `https://www.reddit.com${permalink}`;
  }
  return permalink || undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: JsonObject, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return "";
}
