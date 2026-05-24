#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { stdin, stderr, stdout } from "node:process";
import { Command, InvalidArgumentError } from "commander";
import { config as loadEnv } from "dotenv";
import { analyzeRecords } from "./analysis/analyzer.js";
import { synthesizeAnalysis } from "./analysis/synthesis.js";
import { parseRedditExport } from "./importers/index.js";
import { renderJsonReport, renderMarkdownReport } from "./report/render.js";
import type { InputFormat } from "./types.js";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const program = new Command();

program
  .name("reddit-market-lens")
  .description("Analyze pasted or exported Reddit data into market research reports.")
  .version("0.1.0");

program
  .command("analyze")
  .argument("<input>", "Path to Reddit JSON, CSV, text export, or '-' for stdin.")
  .option("-f, --format <format>", "Input format: auto, json, csv, or text.", parseFormat, "auto")
  .option("-o, --out <path>", "Write the report to a file instead of stdout.")
  .option("--report <format>", "Report format: markdown or json.", parseReportFormat, "markdown")
  .option("--title <title>", "Report title.", "Reddit Market Lens Report")
  .option("--openai", "Use OPENAI_API_KEY for optional synthesis; falls back deterministically.")
  .option("--min-cluster-size <count>", "Minimum records needed for a cluster.", parsePositiveInteger, 1)
  .action(async (input: string, options: AnalyzeCommandOptions) => {
    const content = input === "-" ? await readStdin() : await readFile(input, "utf8");
    const corpus = parseRedditExport(content, {
      format: options.format,
      sourceName: input === "-" ? "stdin" : input
    });
    const analysis = analyzeRecords(corpus.records, {
      minClusterRecords: options.minClusterSize
    });
    const synthesis = await synthesizeAnalysis(analysis, { useOpenAI: Boolean(options.openai) });
    const report =
      options.report === "json"
        ? renderJsonReport(analysis)
        : renderMarkdownReport(analysis, { title: options.title, synthesis });

    if (options.out) {
      await writeFile(options.out, report, "utf8");
      stderr.write(`Wrote ${options.report} report to ${options.out}\n`);
      return;
    }

    stdout.write(report);
  });

program.parseAsync().catch((error: unknown) => {
  stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

interface AnalyzeCommandOptions {
  format: InputFormat;
  out?: string;
  report: "markdown" | "json";
  title: string;
  openai?: boolean;
  minClusterSize: number;
}

function parseFormat(value: string): InputFormat {
  if (value === "auto" || value === "json" || value === "csv" || value === "text") {
    return value;
  }

  throw new InvalidArgumentError("format must be one of: auto, json, csv, text");
}

function parseReportFormat(value: string): "markdown" | "json" {
  if (value === "markdown" || value === "json") {
    return value;
  }

  throw new InvalidArgumentError("report must be one of: markdown, json");
}

function parsePositiveInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new InvalidArgumentError("value must be a positive integer");
  }

  return parsed;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}
