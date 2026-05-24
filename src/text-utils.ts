import { createHash } from "node:crypto";
import type { RedditRecord } from "./types.js";

export function normalizeWhitespace(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function stableId(prefix: string, value: string): string {
  const digest = createHash("sha256").update(value).digest("hex").slice(0, 12);
  return `${prefix}-${digest}`;
}

export function stripFullnamePrefix(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  return value.trim().replace(/^(?:t1|t3)_/, "");
}

export function parseScore(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function toIsoDate(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    return new Date(millis).toISOString();
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return toIsoDate(numeric);
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return undefined;
}

export function fullText(record: RedditRecord): string {
  return normalizeWhitespace([record.title, record.body].filter(Boolean).join("\n"));
}

export function isDeletedText(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "" || normalized === "[deleted]" || normalized === "[removed]";
}

export function splitSentences(value: string): string[] {
  const normalized = normalizeWhitespace(value);
  if (normalized === "") {
    return [];
  }

  const sentences = normalized
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => cleanRedditMarkup(sentence))
    .filter(Boolean);

  return sentences.length > 0 ? sentences : [cleanRedditMarkup(normalized)];
}

export function cleanRedditMarkup(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/^>+\s?/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
  );
}

export function uniqueCount(values: Array<string | undefined>): number {
  return new Set(values.filter((value): value is string => Boolean(value))).size;
}
