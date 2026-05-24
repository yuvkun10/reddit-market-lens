export type SourceFormat = "json" | "csv" | "text";
export type InputFormat = SourceFormat | "auto";
export type RedditRecordKind = "post" | "comment";

export interface RedditRecord {
  id: string;
  kind: RedditRecordKind;
  sourceFormat: SourceFormat;
  sourceName?: string;
  title?: string;
  body: string;
  subreddit?: string;
  author?: string;
  score: number;
  createdAt?: string;
  url?: string;
  permalink?: string;
  parentId?: string;
  postId?: string;
}

export interface CorpusStats {
  recordCount: number;
  postCount: number;
  commentCount: number;
  subredditCount: number;
  authorCount: number;
}

export interface RedditCorpus {
  records: RedditRecord[];
  posts: RedditRecord[];
  comments: RedditRecord[];
  stats: CorpusStats;
}

export interface ParseOptions {
  format?: InputFormat;
  sourceName?: string;
}

export interface Quote {
  id: string;
  sourceId: string;
  text: string;
  author?: string;
  subreddit?: string;
  score: number;
  url?: string;
  tags: string[];
}

export type ClusterCategory = "pain_point" | "persona" | "desired_outcome" | "objection";

export interface InsightCluster {
  id: string;
  category: ClusterCategory;
  label: string;
  summary: string;
  keywords: string[];
  recordIds: string[];
  prevalence: number;
  score: number;
  quotes: Quote[];
}

export interface AnalyzeOptions {
  now?: string;
  minClusterRecords?: number;
  maxQuotesPerCluster?: number;
}

export interface MarketAnalysis {
  generatedAt: string;
  corpusStats: CorpusStats;
  painPoints: InsightCluster[];
  personas: InsightCluster[];
  desiredOutcomes: InsightCluster[];
  objections: InsightCluster[];
  quotes: Quote[];
  executiveSummary: string[];
  recommendations: string[];
}

export interface Synthesis {
  provider: "deterministic" | "openai";
  summary: string[];
  opportunities: string[];
  warnings: string[];
  model?: string;
  rawText?: string;
}
