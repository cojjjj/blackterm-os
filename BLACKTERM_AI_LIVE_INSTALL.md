# BLACKTERM AI — Live Intelligence Core

## What this update does

- Adds a secure Vercel Function at `/api/ai`
- Calls the OpenAI Responses API only from the server
- Keeps `OPENAI_API_KEY` out of browser code
- Grounds answers about Tyler in `src/data/portfolio.ts`
- Preserves local BLACKTERM commands that open apps
- Falls back to the local portfolio index if the live service fails
- Adds a simple per-instance rate limit

## Environment variables

Set these in Vercel:

```text
OPENAI_API_KEY=your secret API key
OPENAI_MODEL=gpt-5-mini
```

`OPENAI_MODEL` is optional.

Never use a variable beginning with `VITE_` for the OpenAI key.

## Install

Copy these files into the current BLACKTERM project:

```text
api/ai.ts
src/App.tsx
src/styles.css
```

No OpenAI npm package is required. The Vercel Function uses the native server-side
`fetch` API.

## Build

```powershell
npm run build
```

## Commit and deploy

```powershell
git add .
git commit -m "feat: add live BLACKTERM AI intelligence core"
git push origin main
```

Vercel will deploy `/api/ai` automatically because it is inside the root `api`
directory.

After Vercel reports `Ready`, test:

```text
https://YOUR-DOMAIN.vercel.app/api/ai
```

A browser GET should return JSON similar to:

```json
{"online":true,"service":"BLACKTERM AI"}
```

Then open BLACKTERM AI and ask:

```text
Who is Tyler?
```

The header should change to `LIVE AI`. If the endpoint is unavailable, BLACKTERM
will show `LOCAL FALLBACK` and continue answering from its built-in index.
