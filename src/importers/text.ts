import type { RedditRecord, RedditRecordKind } from "../types.js";
import { cleanRedditMarkup, normalizeWhitespace, stableId } from "../text-utils.js";

export function parseTextExport(content: string, sourceName?: string): RedditRecord[] {
  return content
    .split(/\n\s*\n/g)
    .map((block, index) => normalizeTextBlock(block, index, sourceName))
    .filter((record): record is RedditRecord => Boolean(record));
}

function normalizeTextBlock(block: string, index: number, sourceName?: string): RedditRecord | null {
  const lines = block
    .split(/\r?\n/)
    .map((line) => cleanRedditMarkup(line))
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const firstLine = lines[0] ?? "";
  const commentPrefix = /^(?:comment|reply)\s*[:-]\s*/i;
  const isComment = commentPrefix.test(firstLine);
  const kind: RedditRecordKind = isComment ? "comment" : "post";
  let title: string | undefined;
  let subreddit: string | undefined;
  let bodyLines = [...lines];

  if (isComment) {
    bodyLines[0] = firstLine.replace(commentPrefix, "");
  } else {
    const subredditTitle = firstLine.match(/^r\/([A-Za-z0-9_]+)\s*[-:]\s*(.+)$/);
    if (subredditTitle) {
      subreddit = subredditTitle[1];
      title = normalizeWhitespace(subredditTitle[2]);
      bodyLines = lines.slice(1);
    } else if (/^title\s*:/i.test(firstLine)) {
      title = normalizeWhitespace(firstLine.replace(/^title\s*:/i, ""));
      bodyLines = lines.slice(1);
    }
  }

  const body = normalizeWhitespace(bodyLines.join("\n"));
  if (!title && body === "") {
    return null;
  }

  const id = stableId("text", `${kind}|${subreddit ?? ""}|${title ?? ""}|${body}`);
  return {
    id,
    kind,
    sourceFormat: "text",
    sourceName,
    title,
    body,
    subreddit,
    score: 0
  };
}
