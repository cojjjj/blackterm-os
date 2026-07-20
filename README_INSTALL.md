# BLACKTERM AI — OS Control v1

This update turns BLACKTERM AI into an operating-system assistant.

## Added capabilities

- Opens BLACKTERM applications from natural-language commands
- Launches recruiter evidence workflows
- Sends portfolio and recruiter questions to the live OpenAI endpoint
- Includes current Observer identity, XP, active app, and network telemetry
- Reports live Observer Network numbers
- Detects job and hiring queries and requests an evidence-based fit analysis
- Adds contextual application buttons beneath AI answers
- Keeps local OS commands available when OpenAI is unavailable
- Preserves session conversation history

## Install

Extract this ZIP directly into:

```text
C:\Users\tyler\Desktop\blackterm-os-portfolio
```

It should add:

```text
src\components\BlackTermAIController.tsx
src\styles\blackterm-ai-controller.css
install_blackterm_ai_control.py
```

Run:

```powershell
cd "C:\Users\tyler\Desktop\blackterm-os-portfolio"
python .\install_blackterm_ai_control.py
npm run build
```

Then test locally using the same PowerShell environment that successfully loaded
your OpenAI key:

```powershell
vercel dev
```

Open `http://localhost:3000`, launch Assistant.exe, and try:

```text
Open my resume
Show Python projects
Report current observer network status
Start recruiter mode
I'm hiring for a desktop support technician. How strong is Tyler's fit?
Open Incident Engine
```

## Deploy

```powershell
git add .
git commit -m "feat: give BLACKTERM AI desktop control and recruiter analysis"
git push origin main
```

Your existing `OPENAI_API_KEY` remains server-side in Vercel.
