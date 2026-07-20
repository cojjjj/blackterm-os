from pathlib import Path
import sys

root = Path(__file__).resolve().parent
app_path = root / "src" / "App.tsx"

if not app_path.exists():
    raise SystemExit("ERROR: Run this installer from the BLACKTERM project root.")

text = app_path.read_text(encoding="utf-8")

import_line = "import BlackTermAIController from './components/BlackTermAIController';\n"
css_line = "import './styles/blackterm-ai-controller.css';\n"

anchor = "import './styles/command-intelligence.css';\n"
if import_line not in text:
    if anchor not in text:
        raise SystemExit("ERROR: Could not find the expected App.tsx import anchor.")
    text = text.replace(anchor, anchor + import_line + css_line, 1)

old_case = (
    "case'assistant':return <AssistantApp openApp={openApp} "
    "activeContext={activeContext}/>;"
)
new_case = (
    "case'assistant':return <BlackTermAIController "
    "openApp={openApp} notify={notify} activeContext={activeContext}/>;"
)

if old_case in text:
    text = text.replace(old_case, new_case, 1)
elif "case'assistant':return <BlackTermAIController" not in text:
    raise SystemExit(
        "ERROR: Could not find the Assistant app case. "
        "Your App.tsx may differ from the expected BLACKTERM version."
    )

backup = app_path.with_suffix(".before-ai-control.tsx")
if not backup.exists():
    backup.write_text(app_path.read_text(encoding="utf-8"), encoding="utf-8")

app_path.write_text(text, encoding="utf-8")

print("BLACKTERM AI OS Control installed.")
print(f"Backup created: {backup}")
print("Next: npm run build")
