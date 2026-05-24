import type { Quote, RedditRecord } from "../types.js";
import { cleanRedditMarkup, fullText, isDeletedText, splitSentences } from "../text-utils.js";

const SIGNAL_TERMS = [
  "need",
  "want",
  "wish",
  "hate",
  "pain",
  "painful",
  "waste",
  "manual",
  "expensive",
  "budget",
  "trust",
  "error",
  "security",
  "export",
  "pricing",
  "blocks",
  "unclear"
];

export interface ExtractQuoteOptions {
  maxQuotes?: number;
  tags?: string[];
}

interface QuoteCandidate {
  quote: Quote;
  rank: number;
  dedupeKey: string;
}

export function extractQuotes(records: RedditRecord[], options: ExtractQuoteOptions = {}): Quote[] {
  const maxQuotes = options.maxQuotes ?? 8;
  const tags = options.tags ?? [];
  const candidates = records.flatMap((record) => candidatesForRecord(record, tags));
  const bestByText = new Map<string, QuoteCandidate>();

  for (const candidate of candidates) {
    const previous = bestByText.get(candidate.dedupeKey);
    if (!previous || candidate.rank > previous.rank) {
      bestByText.set(candidate.dedupeKey, candidate);
    }
  }

  return [...bestByText.values()]
    .sort((left, right) => right.rank - left.rank || left.quote.sourceId.localeCompare(right.quote.sourceId))
    .slice(0, maxQuotes)
    .map((candidate) => candidate.quote);
}

function candidatesForRecord(record: RedditRecord, tags: string[]): QuoteCandidate[] {
  const textSources = [record.body, record.title, fullText(record)]
    .filter((value): value is string => Boolean(value))
    .map((value) => cleanRedditMarkup(value));
  const candidates: QuoteCandidate[] = [];

  for (const source of textSources) {
    for (const sentence of splitSentences(source)) {
      const text = cleanRedditMarkup(sentence);
      if (!isUsefulQuote(text)) {
        continue;
      }

      const signalScore = SIGNAL_TERMS.filter((term) => text.toLowerCase().includes(term)).length;
      const lengthScore = Math.min(text.length / 20, 10);
      const rank = record.score * 2 + signalScore * 12 + lengthScore;
      const dedupeKey = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

      candidates.push({
        quote: {
          id: `${record.id}:${candidates.length + 1}`,
          sourceId: record.id,
          text,
          author: record.author,
          subreddit: record.subreddit,
          score: record.score,
          url: record.url ?? record.permalink,
          tags
        },
        rank,
        dedupeKey
      });
    }
  }

  return candidates;
}

function isUsefulQuote(text: string): boolean {
  if (isDeletedText(text) || text.length < 24 || text.length > 280) {
    return false;
  }

  const lower = text.toLowerCase();
  const hasSignal = SIGNAL_TERMS.some((term) => lower.includes(term));
  return hasSignal || text.length >= 80;
}
