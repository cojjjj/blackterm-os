BLACKTERM Vercel API Fix

Drag the included "api" folder into the root of your BLACKTERM project and
allow Windows to replace the existing files:

api/
  ai.ts
  blackterm-ai.ts

The important production fix is the explicit ESM extension:

  from "../src/data/portfolio.js";

After replacing the files, run:

  npx tsc --noEmit
  npm run build
  git add api/ai.ts api/blackterm-ai.ts
  git commit -m "fix: resolve portfolio module in Vercel AI functions"
  git push origin main

Do not place OPENAI_API_KEY inside either source file.
