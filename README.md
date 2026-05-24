# Reddit Market Lens

Reddit Market Lens is a TypeScript CLI for turning pasted or exported Reddit data into market research reports. It normalizes posts and comments, detects recurring pain points, personas, desired outcomes, objections, and quote evidence, then renders Markdown or JSON reports.

This project is for user-provided exports and pasted text only. It does not scrape Reddit, bypass authentication, or collect private data.

## Features

- Imports Reddit-like JSON, CSV, and plain text exports.
- Normalizes posts and comments into one typed corpus.
- Clusters market signals with deterministic keyword taxonomies.
- Extracts representative quotes with source metadata.
- Renders Markdown and JSON reports for research handoff.
- Optionally uses OpenAI synthesis through a local `OPENAI_API_KEY`.
- Falls back to deterministic synthesis when OpenAI is not configured or unavailable.

## Install

```bash
npm install
npm run build
```

## Usage

Analyze a JSON export and print Markdown:

```bash
npm run dev -- analyze ./reddit-export.json --format json
```

Analyze CSV and write a report:

```bash
npm run dev -- analyze ./reddit-export.csv --format csv --out report.md
```

Analyze pasted text from stdin:

```bash
Get-Content .\reddit-notes.txt | npm run dev -- analyze - --format text --title "Buyer Research"
```

Render JSON:

```bash
npm run dev -- analyze ./reddit-export.json --report json --out report.json
```

Use optional OpenAI synthesis:

```bash
$env:OPENAI_API_KEY = "your-local-key"
npm run dev -- analyze ./reddit-export.json --openai
```

The CLI also loads ignored local `.env.local` and `.env` files when present.

## Input Notes

JSON can be an array, a Reddit listing with `data.children`, or an object with `posts` and `comments` arrays. CSV headers can use common fields such as `type`, `id`, `title`, `body`, `subreddit`, `author`, `score`, `parent_id`, and `post_id`. Plain text is split on blank lines; blocks starting with `Comment:` or `Reply:` become comments.

## Development

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run public:check
git diff --check
```

Public checks fail if local-only agent files, Obsidian notes, `.codex`, or env files are tracked.
