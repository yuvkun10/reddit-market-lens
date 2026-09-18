# Reddit Market Lens

Reddit Market Lens is a TypeScript CLI that turns Reddit exports, CSVs and pasted
Reddit-like notes into market research reports: pain points, personas, desired
outcomes, objections, representative quotes and next steps. It is for founders,
product managers, marketers and researchers working from data they exported
themselves. It does not scrape Reddit or log in to it. Analysis is deterministic
and local; OpenAI synthesis is optional. Status: version 0.1.0.

## Installation

Prerequisites: Node.js 22 or newer and npm.

```bash
npm install
npm run build
```

Configuration is optional. Copy `.env.example` to `.env.local` and set
`OPENAI_API_KEY` and `OPENAI_MODEL` only if you use `--openai`. Details are in
[docs/configuration.md](docs/configuration.md).

## Usage

Analyze an export and write a Markdown report:

```bash
npm run dev -- analyze ./reddit-export.json --format json --out report.md
```

Other common runs:

```bash
npm run dev -- analyze ./reddit-export.csv --format csv --out report.md
npm run dev -- analyze ./reddit-export.json --report json --out report.json
npm run dev -- analyze ./reddit-export.json --openai
```

All options, stdin input and the PowerShell examples are in
[docs/usage.md](docs/usage.md). There is no deployment. The tool runs locally
as a CLI.

## Project structure

```text
├── .github
│   ├── workflows
│   │   └── ci.yml
│   └── dependabot.yml
├── docs
│   ├── architecture.md
│   ├── architecture.mmd
│   └── archive
├── scripts
│   └── check-public-surface.mjs
├── src
│   ├── analysis
│   ├── importers
│   ├── report
│   ├── cli.ts
│   ├── text-utils.ts
│   └── types.ts
├── tests
├── .env.example
├── eslint.config.js
├── package.json
├── tsconfig.json
└── tsconfig.test.json
```

The data flow and the role of each folder are described in [docs/architecture.md](docs/architecture.md).

## Coding style

ESLint runs the `@eslint/js` and `typescript-eslint` recommended rules.
TypeScript runs in `strict` mode and is checked with `tsc --noEmit`. No formatter
and no commit message linter are configured. `npm run public:check` fails if
env files, agent notes, API keys or attribution markers are tracked.

```bash
npm run lint
npm run typecheck
npm run public:check
```

## Test

```bash
npm test
```

Vitest runs the suites in `tests/`: importers, clustering, quote extraction and
report rendering. CI runs lint, typecheck, tests, build,
`npm audit --audit-level=moderate`, `npm outdated` and the public surface check.

## Documentation

- [docs/README.md](docs/README.md): index of all docs, including the archived README
- [docs/overview.md](docs/overview.md): who it is for and use cases
- [docs/architecture.md](docs/architecture.md): data flow, importers, clustering and reports
- [docs/usage.md](docs/usage.md): CLI commands and options
- [docs/configuration.md](docs/configuration.md): env files and OpenAI settings
- [docs/privacy-and-public-repo.md](docs/privacy-and-public-repo.md): privacy notes and public repository rules

## License

MIT. See [LICENSE](LICENSE).
