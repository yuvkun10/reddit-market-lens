# Configuration

Optional local configuration:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Then edit `.env.local` locally. Do not commit `.env.local`, `.env`, exports, source data, or generated reports that include private or sensitive information.

## Safe environment configuration

`.env.example` documents optional settings without secrets:

```dotenv
# Optional. Leave blank unless using --openai.
OPENAI_API_KEY=

# Optional. Used only when --openai is set.
OPENAI_MODEL=gpt-5-mini
```

The CLI loads `.env.local` first and then `.env` if either file exists. Both are ignored by Git. The optional OpenAI request uses the Responses API with `store: false` and sends only the supplied clusters and quotes needed for synthesis.
