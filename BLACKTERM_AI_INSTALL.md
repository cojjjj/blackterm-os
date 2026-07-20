# BLACKTERM AI v3.0 — Installation

This update replaces the old local-only assistant window with a full BLACKTERM Intelligence Core.

## Features

- Answers detailed questions about Tyler's public portfolio
- Handles recruiter questions and hiring-fit analysis
- Answers unrelated general questions through a server-side AI endpoint
- Can recommend and open BLACKTERM applications
- Uses Observer identity and active-app context
- Includes a polished cinematic AI interface
- Falls back to a local portfolio index when the live AI endpoint is unavailable
- Keeps the API key server-side; it is never exposed through Vite client variables

## Files added

```text
api/blackterm-ai.ts
src/components/BlackTermAI.tsx
src/styles/blackterm-ai.css
```

The included `src/App.tsx`, `package.json`, and `package-lock.json` are already updated.

## Local installation

Copy the update into the root of the existing BLACKTERM project and replace files when prompted.

Install dependencies:

```powershell
npm install
```

Run the site:

```powershell
npm run dev
```

Vite's local dev server does not automatically run Vercel serverless functions. The interface will use its local portfolio fallback during ordinary `npm run dev` testing.

To test the actual API locally, install the Vercel CLI and use:

```powershell
npm install -g vercel
vercel dev
```

## OpenAI setup

Create an OpenAI API key in the OpenAI Platform dashboard. Do not use a `VITE_` prefix because that would expose the key to browser code.

In Vercel, add this server-side environment variable:

```text
OPENAI_API_KEY
```

Optional model override:

```text
OPENAI_MODEL
```

The default configured model is:

```text
gpt-5-mini
```

After adding the variable, redeploy the Vercel project without build cache.

## Vercel deployment

Commit and push:

```powershell
git add .
git commit -m "feat: add BLACKTERM AI intelligence core"
git push origin main
```

Then verify the new production deployment includes `OPENAI_API_KEY`.

## Security

- Never place `OPENAI_API_KEY` inside `.env` as `VITE_OPENAI_API_KEY`.
- Never commit the actual key.
- The API sends only curated public portfolio information to the model.
- Private credentials, passwords, relationship history, health data, and exact addresses are intentionally excluded.
- The Responses API call uses `store: false`.

## Updating Tyler's AI knowledge

Edit the `TYLER_CONTEXT` block in:

```text
api/blackterm-ai.ts
```

Then commit and redeploy. A future version can move this knowledge into Supabase and add an admin editor.
