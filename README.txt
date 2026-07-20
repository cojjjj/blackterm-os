BLACKTERM LIVING OPERATOR PROFILE

This upgrade adds a persistent, editable professional timeline that evolves
alongside Tyler's career.

FEATURES
- Built-in career, certification, project, platform, and training milestones
- Verified XP and operator level
- Timeline filters
- Planned future objectives
- Add new milestones directly from the UI
- Custom records persist in localStorage
- Desktop app entry and Quick Access button
- Fully responsive BLACKTERM styling

INSTALL
1. Extract into the BLACKTERM project root.
2. Replace/add:
   src\App.tsx
   src\components\LivingOperatorProfile.tsx
   src\data\operator-events.ts
   src\styles\living-operator-profile.css

TEST
npx tsc --noEmit
npm run build
vercel dev

PUSH LIVE
git add .
git commit -m "feat: add living operator profile"
git push origin main
