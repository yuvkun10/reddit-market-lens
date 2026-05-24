import { TAXONOMY, type TaxonomyDefinition } from "./taxonomy.js";
import { extractQuotes } from "./quotes.js";
import { buildCorpus } from "../importers/index.js";
import type {
  AnalyzeOptions,
  CorpusStats,
  InsightCluster,
  MarketAnalysis,
  RedditRecord
} from "../types.js";
import { fullText, uniqueCount } from "../text-utils.js";

export function analyzeRecords(records: RedditRecord[], options: AnalyzeOptions = {}): MarketAnalysis {
  const corpus = buildCorpus(records);
  const generatedAt = options.now ?? new Date().toISOString();
  const minClusterRecords = options.minClusterRecords ?? 1;
  const maxQuotesPerCluster = options.maxQuotesPerCluster ?? 3;
  const filteredRecords = corpus.records.filter((record) => fullText(record) !== "");

  const painPoints = clusterDefinitions(
    TAXONOMY.painPoints,
    filteredRecords,
    minClusterRecords,
    maxQuotesPerCluster
  );
  const personas = clusterDefinitions(TAXONOMY.personas, filteredRecords, minClusterRecords, maxQuotesPerCluster);
  const desiredOutcomes = clusterDefinitions(
    TAXONOMY.desiredOutcomes,
    filteredRecords,
    minClusterRecords,
    maxQuotesPerCluster
  );
  const objections = clusterDefinitions(TAXONOMY.objections, filteredRecords, minClusterRecords, maxQuotesPerCluster);
  const quotes = extractQuotes(filteredRecords, { maxQuotes: 12 });
  const executiveSummary = buildExecutiveSummary(corpus.stats, painPoints, personas, desiredOutcomes, objections);
  const recommendations = buildRecommendations(painPoints, desiredOutcomes, objections);

  return {
    generatedAt,
    corpusStats: corpus.stats,
    painPoints,
    personas,
    desiredOutcomes,
    objections,
    quotes,
    executiveSummary,
    recommendations
  };
}

function clusterDefinitions(
  definitions: TaxonomyDefinition[] | undefined,
  records: RedditRecord[],
  minRecords: number,
  maxQuotes: number
): InsightCluster[] {
  return (definitions ?? [])
    .map((definition) => buildCluster(definition, records, maxQuotes))
    .filter((cluster): cluster is InsightCluster => Boolean(cluster))
    .filter((cluster) => cluster.recordIds.length >= minRecords)
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));
}

function buildCluster(
  definition: TaxonomyDefinition,
  records: RedditRecord[],
  maxQuotes: number
): InsightCluster | null {
  const matchedRecords = records.filter((record) => matchCount(fullText(record), definition.keywords) > 0);
  if (matchedRecords.length === 0) {
    return null;
  }

  const score = matchedRecords.reduce((total, record) => {
    const keywordScore = matchCount(fullText(record), definition.keywords) * 10;
    return total + keywordScore + Math.max(record.score, 0);
  }, 0);

  return {
    id: definition.id,
    category: definition.category,
    label: definition.label,
    summary: definition.summary,
    keywords: definition.keywords,
    recordIds: matchedRecords.map((record) => record.id),
    prevalence: matchedRecords.length,
    score,
    quotes: extractQuotes(matchedRecords, { maxQuotes, tags: [definition.label] })
  };
}

function matchCount(value: string, keywords: string[]): number {
  const lower = value.toLowerCase();
  return keywords.filter((keyword) => lower.includes(keyword.toLowerCase())).length;
}

function buildExecutiveSummary(
  stats: CorpusStats,
  painPoints: InsightCluster[],
  personas: InsightCluster[],
  desiredOutcomes: InsightCluster[],
  objections: InsightCluster[]
): string[] {
  const topPain = painPoints[0];
  const topPersona = personas[0];
  const topOutcome = desiredOutcomes[0];
  const topObjection = objections[0];

  return [
    topPain
      ? `${topPain.label} is the clearest pain point, appearing in ${topPain.prevalence} of ${stats.recordCount} normalized records.`
      : `No dominant pain point was detected across ${stats.recordCount} normalized records.`,
    topPersona
      ? `${topPersona.label} are the most visible persona signal across ${uniqueCount(topPersona.recordIds)} supporting records.`
      : "No persona cluster crossed the evidence threshold.",
    topOutcome
      ? `The strongest desired outcome is ${topOutcome.label.toLowerCase()}.`
      : "Desired outcomes were too sparse for a confident cluster.",
    topObjection
      ? `The leading objection to address is ${topObjection.label.toLowerCase()}.`
      : "No major adoption objection was detected."
  ];
}

function buildRecommendations(
  painPoints: InsightCluster[],
  desiredOutcomes: InsightCluster[],
  objections: InsightCluster[]
): string[] {
  const recommendations: string[] = [];

  if (painPoints[0]) {
    recommendations.push(`Lead messaging with the top pain point: ${painPoints[0].label}.`);
  }
  if (desiredOutcomes[0]) {
    recommendations.push(`Turn ${desiredOutcomes[0].label.toLowerCase()} into a concrete promise and demo flow.`);
  }
  if (objections[0]) {
    recommendations.push(`Prepare proof for the main objection: ${objections[0].label}.`);
  }

  return recommendations;
}
