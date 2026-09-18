# Usage reference

Analyze a JSON export and print Markdown:

```bash
npm run dev -- analyze ./reddit-export.json --format json
```

Analyze CSV and write a Markdown report:

```bash
npm run dev -- analyze ./reddit-export.csv --format csv --out report.md
```

Analyze pasted text from stdin:

```powershell
Get-Content .\reddit-notes.txt | npm run dev -- analyze - --format text --title "Buyer Research"
```

Render JSON:

```bash
npm run dev -- analyze ./reddit-export.json --report json --out report.json
```

Use optional OpenAI synthesis:

```bash
npm run dev -- analyze ./reddit-export.json --openai
```

Set `OPENAI_API_KEY` in ignored local configuration before using `--openai`.

CLI options:

```text
reddit-market-lens analyze <input>
  --format <auto|json|csv|text>
  --out <path>
  --report <markdown|json>
  --title <title>
  --openai
  --min-cluster-size <count>
```

Development and release checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
npm outdated
npm run public:check
git diff --check
```
