import type { MarketAnalysis, Synthesis } from "../types.js";

export interface SynthesisOptions {
  useOpenAI?: boolean;
  apiKey?: string;
  model?: string;
}

interface OpenAIResponsePayload {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
}

export function deterministicSynthesis(analysis: MarketAnalysis): Synthesis {
  const topPain = analysis.painPoints[0]?.label ?? "No dominant pain point";
  const topOutcome = analysis.desiredOutcomes[0]?.label ?? "No dominant desired outcome";
  const topObjection = analysis.objections[0]?.label ?? "No dominant objection";

  return {
    provider: "deterministic",
    summary: [
      `${topPain} is the primary research signal.`,
      `${topOutcome} is the clearest product promise to validate.`,
      `${topObjection} is the most important adoption risk to address.`
    ],
    opportunities: analysis.recommendations,
    warnings: [
      "Treat keyword clusters as directional research until validated with customer interviews.",
      "Avoid over-weighting a single high-score Reddit thread without broader evidence."
    ]
  };
}

export async function synthesizeAnalysis(
  analysis: MarketAnalysis,
  options: SynthesisOptions = {}
): Promise<Synthesis> {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!options.useOpenAI || !apiKey) {
    return deterministicSynthesis(analysis);
  }

  const model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-5-mini";
  const fallback = deterministicSynthesis(analysis);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        instructions:
          "You are a market research analyst. Summarize only from the supplied clusters and quotes. Do not invent sources.",
        input: JSON.stringify({
          executiveSummary: analysis.executiveSummary,
          painPoints: analysis.painPoints.slice(0, 5),
          personas: analysis.personas.slice(0, 5),
          desiredOutcomes: analysis.desiredOutcomes.slice(0, 5),
          objections: analysis.objections.slice(0, 5),
          quotes: analysis.quotes.slice(0, 8)
        }),
        temperature: 0.2,
        max_output_tokens: 900,
        store: false
      })
    });

    if (!response.ok) {
      return {
        ...fallback,
        warnings: [...fallback.warnings, `OpenAI synthesis fell back after HTTP ${response.status}.`]
      };
    }

    const payload = (await response.json()) as OpenAIResponsePayload;
    const rawText = extractOutputText(payload);
    if (!rawText) {
      return {
        ...fallback,
        warnings: [...fallback.warnings, "OpenAI synthesis returned no text; deterministic fallback used."]
      };
    }

    return {
      provider: "openai",
      model,
      rawText,
      summary: rawText
        .split(/\n+/)
        .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 6),
      opportunities: fallback.opportunities,
      warnings: fallback.warnings
    };
  } catch (error) {
    return {
      ...fallback,
      warnings: [...fallback.warnings, `OpenAI synthesis fell back after ${String(error)}.`]
    };
  }
}

function extractOutputText(payload: OpenAIResponsePayload): string {
  if (typeof payload.output_text === "string") {
    return payload.output_text.trim();
  }

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("\n")
      .trim() ?? ""
  );
}
