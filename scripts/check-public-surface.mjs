import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

const forbiddenPaths = [
  /^\.env(?:\.|$)/,
  /^AGENTS\.md$/,
  /^Obsidian\//,
  /^\.codex\//
];

const forbiddenContent = [
  new RegExp("sk-[A-Za-z0-9_-]{20,}"),
  new RegExp("(^|\\n)OPENAI_API_KEY[ \\t]*=[ \\t]*[^ \\r\\n#]+"),
  new RegExp("generated\\s+by", "i"),
  new RegExp("co-" + "authored-by", "i"),
  new RegExp("assistant\\s+" + "attribution", "i")
];

const failures = [];

for (const file of tracked) {
  if (forbiddenPaths.some((pattern) => pattern.test(file)) && file !== ".env.example") {
    failures.push(`private path is tracked: ${file}`);
  }

  const content = readFileSync(file, "utf8");
  for (const pattern of forbiddenContent) {
    if (pattern.test(content)) {
      failures.push(`forbidden public content matched ${pattern} in ${file}`);
    }
  }
}

if (!tracked.includes(".env.example")) {
  failures.push(".env.example must be tracked");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Public surface check passed for ${tracked.length} tracked files.`);
