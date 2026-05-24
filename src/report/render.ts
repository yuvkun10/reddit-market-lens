import type { InsightCluster, MarketAnalysis, Quote, Synthesis } from "../types.js";

export interface RenderOptions {
  title?: string;
  generatedAt?: string;
  synthesis?: Synthesis;
}

export function renderMarkdownReport(analysis: MarketAnalysis, options: RenderOptions = {}): string {
  const title = options.title ?? "Reddit Market Lens Report";
  const generatedAt = options.generatedAt ?? analysis.generatedAt;
  const lines = [
    `# ${title}`,
    "",
    `_Generated ${generatedAt}_`,
    "",
    "## Executive Summary",
    ...analysis.executiveSummary.map((item) => `- ${item}`),
    "",
    "## Market Signals",
    "",
    "### Pain Points",
    ...renderClusters(analysis.painPoints),
    "",
    "### Personas",
    ...renderClusters(analysis.personas),
    "",
    "### Desired Outcomes",
    ...renderClusters(analysis.desiredOutcomes),
    "",
    "### Objections",
    ...renderClusters(analysis.objections),
    "",
    "## Representative Quotes",
    ...renderQuotes(analysis.quotes),
    "",
    "## Recommended Next Steps",
    ...analysis.recommendations.map((item) => `- ${item}`)
  ];

  if (options.synthesis) {
    lines.push(
      "",
      `## ${options.synthesis.provider === "openai" ? "OpenAI" : "Deterministic"} Synthesis`,
      ...options.synthesis.summary.map((item) => `- ${item}`)
    );
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

export function renderJsonReport(analysis: MarketAnalysis): string {
  return `${JSON.stringify(analysis, null, 2)}\n`;
}

function renderClusters(clusters: InsightCluster[]): string[] {
  if (clusters.length === 0) {
    return ["- No cluster detected."];
  }

  return clusters.flatMap((cluster) => [
    `#### ${cluster.label}`,
    "",
    cluster.summary,
    "",
    `- Evidence: ${cluster.prevalence} records`,
    `- Keywords: ${cluster.keywords.slice(0, 8).join(", ")}`,
    ...cluster.quotes.slice(0, 2).flatMap((quote) => ["", `> ${quote.text}`, "", quoteCitation(quote)]),
    ""
  ]);
}

function renderQuotes(quotes: Quote[]): string[] {
  if (quotes.length === 0) {
    return ["- No representative quotes extracted."];
  }

  return quotes.slice(0, 8).flatMap((quote) => [
    `> ${quote.text}`,
    "",
    quoteCitation(quote),
    ""
  ]);
}

function quoteCitation(quote: Quote): string {
  const parts = [
    quote.author ? `u/${quote.author}` : undefined,
    quote.subreddit ? `r/${quote.subreddit}` : undefined,
    `score ${quote.score}`,
    `source ${quote.sourceId}`
  ].filter(Boolean);

  return `_${parts.join(" | ")}_`;
}
