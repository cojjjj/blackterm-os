BLACKTERM OS Recruiter Mode crash fix

Replace:
  src/App.tsx

Cause:
The Recruiter Tour opened the internal 'interview' app on its final step, but that app was missing from the central apps registry. React then tried to read title/icon data from an undefined registry entry and rendered a blank screen.

This patch registers:
  id: interview
  title: Why Tyler?
  icon: /icons/interview.svg

Then run:
  npm.cmd run build
  git add .
  git commit -m "Fix Recruiter Mode final step crash"
  git push
