BLACKTERM CINEMATIC ACHIEVEMENT ENGINE

FILES TO REPLACE / ADD

1. Replace:
   src\App.tsx

2. Add:
   src\components\OperatorAchievementFeed.tsx

3. Add:
   src\styles\operator-achievement-feed.css

FEATURES

- Rotating operator achievement feed
- Context-aware suggestions when Resume, GitHub, Projects, TryHackMe,
  or Credential Vault is active
- Cinematic achievement-unlocked notification after desktop startup
- One startup notification per browser session
- Click either panel to open Achievement Wall
- Responsive desktop and mobile positioning

TEST

npx tsc --noEmit
npm run build
vercel dev

PUSH LIVE

git add .
git commit -m "feat: add cinematic achievement notification engine"
git push origin main
