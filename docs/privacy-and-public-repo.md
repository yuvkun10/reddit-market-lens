# Privacy, security and Reddit data notes

- Use only data you are allowed to export, paste, analyze, and share.
- Treat Reddit exports as potentially sensitive because usernames, links, quotes, and community context can identify people.
- Review generated reports before sharing them outside your team.
- Avoid committing raw exports, private research notes, generated reports with personal data, `.env`, `.env.local`, or API keys.
- The project does not include private-auth scraping behavior and should stay limited to user-provided exports and pasted text.
- Optional OpenAI synthesis sends selected clusters and quotes to the configured OpenAI model. Leave `--openai` off for fully local deterministic analysis.
- CI runs linting, typechecking, tests, build, public-surface checks, `npm audit --audit-level=moderate`, and `npm outdated`.
- Dependabot is configured to check npm packages and GitHub Actions on a weekly schedule.

## Public repository expectations

This repository is intended to stay public-safe:

- Tracked Markdown is limited to `README.md` and the files under `docs/`. Before 19 Sep 2026 `README.md` was the only tracked Markdown file.
- `.env.example` is tracked as a safe template.
- Local agent notes, Obsidian folders, `.codex`, env files, source exports, and generated workflow logs should remain untracked.
- Commits and project docs should stay free of attribution markers, generated-by language, bot trailers, and secrets.
