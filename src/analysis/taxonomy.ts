import type { ClusterCategory } from "../types.js";

export interface TaxonomyDefinition {
  id: string;
  category: ClusterCategory;
  label: string;
  summary: string;
  keywords: string[];
}

export const TAXONOMY: Record<string, TaxonomyDefinition[]> = {
  painPoints: [
    {
      id: "manual-workflow",
      category: "pain_point",
      label: "Manual workflow",
      summary: "Users are spending time on repetitive review, cleanup, approval, or spreadsheet work.",
      keywords: [
        "manual",
        "spreadsheet",
        "copy",
        "paste",
        "cleanup",
        "cleaning",
        "editing",
        "waste time",
        "wasting time",
        "painful",
        "hour"
      ]
    },
    {
      id: "trust-accuracy",
      category: "pain_point",
      label: "Trust and accuracy",
      summary: "Users need confidence that records, calculations, and decisions are correct.",
      keywords: ["error", "errors", "trust", "accurate", "duplicate", "mismatch", "reconcile"]
    },
    {
      id: "unexpected-costs",
      category: "pain_point",
      label: "Unexpected costs",
      summary: "Users are frustrated by surprise spend, unclear billing, or hidden costs.",
      keywords: ["unexpected", "surprise", "hidden", "overcharged", "budget", "cost", "invoice"]
    },
    {
      id: "integration-gaps",
      category: "pain_point",
      label: "Integration gaps",
      summary: "Users want tools to connect cleanly with their existing systems.",
      keywords: ["integrate", "integration", "sync", "api", "webhook", "import", "export"]
    }
  ],
  personas: [
    {
      id: "finance-leaders",
      category: "persona",
      label: "Finance leaders",
      summary: "Finance stakeholders care about approvals, records, exports, accuracy, and spend control.",
      keywords: ["finance", "cfo", "accountant", "accounting", "bookkeeper", "controller"]
    },
    {
      id: "founders-operators",
      category: "persona",
      label: "Founders and operators",
      summary: "Operators and owners evaluate tools based on speed, cost, and practical business impact.",
      keywords: ["founder", "owner", "operator", "ops", "small business", "startup"]
    },
    {
      id: "technical-admins",
      category: "persona",
      label: "Technical admins",
      summary: "Technical evaluators look for APIs, integrations, security posture, and maintainability.",
      keywords: ["developer", "admin", "api", "security", "sso", "integration"]
    }
  ],
  desiredOutcomes: [
    {
      id: "reliable-exports",
      category: "desired_outcome",
      label: "Reliable exports",
      summary: "Users want clean CSV, PDF, or report outputs that stakeholders can use immediately.",
      keywords: ["csv", "export", "exports", "report", "pdf", "download"]
    },
    {
      id: "faster-workflows",
      category: "desired_outcome",
      label: "Faster workflows",
      summary: "Users want automation that reduces repetitive work and shortens review cycles.",
      keywords: ["automate", "automated", "automatic", "faster", "save time", "quick"]
    },
    {
      id: "clear-pricing",
      category: "desired_outcome",
      label: "Clear pricing",
      summary: "Users want transparent packaging and predictable costs before adoption.",
      keywords: ["transparent", "clear pricing", "pricing", "cost", "seats"]
    }
  ],
  objections: [
    {
      id: "price-sensitivity",
      category: "objection",
      label: "Price sensitivity",
      summary: "Buyers hesitate when cost, budget fit, or seat-based pricing is unclear.",
      keywords: ["too expensive", "expensive", "budget", "pricing", "cost", "seats"]
    },
    {
      id: "security-concerns",
      category: "objection",
      label: "Security concerns",
      summary: "Buyers need evidence that sensitive data and access controls are handled properly.",
      keywords: ["security", "privacy", "sensitive", "sso", "compliance", "documented"]
    },
    {
      id: "switching-friction",
      category: "objection",
      label: "Switching friction",
      summary: "Buyers resist tools that look hard to migrate, set up, train, or maintain.",
      keywords: ["migration", "setup", "training", "switch", "onboarding", "maintain"]
    }
  ]
};
