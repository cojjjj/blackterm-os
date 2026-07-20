from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
PROJECT = Path.cwd()

app_path = PROJECT / "src" / "App.tsx"
if not app_path.exists():
    raise SystemExit(
        "Run this installer from the BLACKTERM project root containing src/App.tsx."
    )

files = (
    "src/components/AchievementWall.tsx",
    "src/data/achievements.ts",
    "src/styles/achievement-wall.css",
)

for relative in files:
    source = (ROOT / relative).resolve()
    destination = (PROJECT / relative).resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)

    if source == destination:
        print(f"Already in place: {relative}")
    else:
        shutil.copy2(source, destination)
        print(f"Installed: {relative}")

backup = PROJECT / ".blackterm-backups" / "App.before-achievement-wall.tsx"
backup.parent.mkdir(parents=True, exist_ok=True)
if not backup.exists():
    shutil.copy2(app_path, backup)

app = app_path.read_text(encoding="utf-8")

component_import = "import AchievementWall from './components/AchievementWall';"
style_import = "import './styles/achievement-wall.css';"

if component_import not in app:
    anchor = "import CredentialVault from './components/CredentialVault';"
    if anchor in app:
        app = app.replace(anchor, anchor + "\n" + component_import)
    else:
        anchor = "import BlackTermAIController from './components/BlackTermAIController';"
        app = app.replace(anchor, anchor + "\n" + component_import)

if style_import not in app:
    anchor = "import './styles/credential-vault.css';"
    if anchor in app:
        app = app.replace(anchor, anchor + "\n" + style_import)
    else:
        anchor = "import './styles/blackterm-ai-controller.css';"
        app = app.replace(anchor, anchor + "\n" + style_import)

if "'achievements'" not in app.split("type AppId =", 1)[1].split(";", 1)[0]:
    app = app.replace(
        "type AppId = 'command'",
        "type AppId = 'achievements'|'command'",
        1,
    )

achievement_app = (
    "  { id:'achievements', title:'Achievement Wall', "
    "icon:'/icons/certs.svg', hint:'Operator milestones and unlocks' },"
)

if achievement_app not in app:
    anchor = "const apps: { id: AppId; title: string; icon: string; hint:string }[] = ["
    app = app.replace(anchor, anchor + "\n" + achievement_app, 1)

if "case'achievements':return <AchievementWall/>;" not in app:
    anchor = "  switch(id){"
    app = app.replace(
        anchor,
        anchor + "\n   case'achievements':return <AchievementWall/>;",
        1,
    )

app_path.write_text(app, encoding="utf-8")
print("Updated: src/App.tsx")

controller_path = PROJECT / "src" / "components" / "BlackTermAIController.tsx"
if controller_path.exists():
    controller = controller_path.read_text(encoding="utf-8")

    # Add the app target if the controller has its own AppTarget union.
    if '  | "achievements"' not in controller and 'type AppTarget =' in controller:
        controller = controller.replace(
            'type AppTarget =\n',
            'type AppTarget =\n  | "achievements"\n',
            1,
        )

    achievement_command = """    if (/\\b(achievement|achievements|milestone|milestones|trophy|trophies)\\b/i.test(query)) {
      openApp("achievements");
      notify("Achievement Wall opened.");

      addMessage({
        role: "assistant",
        content:
          "Achievement Wall opened with Tyler's career, cybersecurity, training, builder, and platform milestones.",
        category: "OPERATOR ACHIEVEMENTS",
        actions: [{ label: "Open Achievement Wall", app: "achievements" }],
      });

      setMode("LIVE AI");
      return true;
    }

"""

    signature = "  function runLocalCommand(query: string): boolean {\n"
    if "OPERATOR ACHIEVEMENTS" not in controller and signature in controller:
        controller = controller.replace(
            signature,
            signature + achievement_command,
            1,
        )

    controller_path.write_text(controller, encoding="utf-8")
    print("Updated: src/components/BlackTermAIController.tsx")

api_path = PROJECT / "api" / "blackterm-ai.ts"
if api_path.exists():
    api = api_path.read_text(encoding="utf-8")
    achievement_import = (
        'import { achievementRecords } from "../src/data/achievements.js";'
    )

    if achievement_import not in api:
        api = achievement_import + "\n" + api

    if "    achievementRecords,\n" not in api:
        if "    credentialRecords,\n" in api:
            api = api.replace(
                "    credentialRecords,\n",
                "    credentialRecords,\n    achievementRecords,\n",
                1,
            )
        else:
            api = api.replace(
                "    socials,\n",
                "    socials,\n    achievementRecords,\n",
                1,
            )

    api_path.write_text(api, encoding="utf-8")
    print("Updated: api/blackterm-ai.ts")

print("")
print("BLACKTERM Achievement Wall installed.")
print("Next:")
print("  npx tsc --noEmit")
print("  npm run build")
