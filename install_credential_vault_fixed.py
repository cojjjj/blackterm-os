from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
PROJECT = Path.cwd()

app_path = PROJECT / "src" / "App.tsx"
if not app_path.exists():
    raise SystemExit(
        "Run this from the BLACKTERM project root containing src/App.tsx."
    )

for relative in (
    "src/components/CredentialVault.tsx",
    "src/data/credentials.ts",
    "src/styles/credential-vault.css",
):
    source = (ROOT / relative).resolve()
    destination = (PROJECT / relative).resolve()

    destination.parent.mkdir(parents=True, exist_ok=True)

    # If the ZIP was extracted directly into the project root,
    # source and destination are already the same file.
    if source == destination:
        print(f"Already in place: {relative}")
        continue

    shutil.copy2(source, destination)
    print(f"Installed: {relative}")

backup = PROJECT / ".blackterm-backups" / "App.before-credential-vault.tsx"
backup.parent.mkdir(parents=True, exist_ok=True)

if not backup.exists():
    shutil.copy2(app_path, backup)
    print(f"Backup created: {backup}")
else:
    print(f"Backup already exists: {backup}")

app = app_path.read_text(encoding="utf-8")

component_import = "import CredentialVault from './components/CredentialVault';"
style_import = "import './styles/credential-vault.css';"

if component_import not in app:
    anchor = "import BlackTermAIController from './components/BlackTermAIController';"
    if anchor not in app:
        raise SystemExit(
            "Could not find the BlackTermAIController import in src/App.tsx."
        )
    app = app.replace(anchor, anchor + "\n" + component_import)

if style_import not in app:
    anchor = "import './styles/blackterm-ai-controller.css';"
    if anchor not in app:
        raise SystemExit(
            "Could not find the BLACKTERM AI stylesheet import in src/App.tsx."
        )
    app = app.replace(anchor, anchor + "\n" + style_import)

app = app.replace(
    "{ id:'certs', title:'Certifications', icon:'/icons/certs.svg', hint:'Verified records' }",
    "{ id:'certs', title:'Credential Vault', icon:'/icons/certs.svg', hint:'Verified certification records' }",
)

lines = app.splitlines()
found = False

for index, line in enumerate(lines):
    if "case'certs':return" in line or 'case "certs":' in line:
        indent = line[: len(line) - len(line.lstrip())]
        lines[index] = indent + "case'certs':return <CredentialVault/>;"
        found = True
        break

if not found:
    raise SystemExit("Could not find the certs case in src/App.tsx.")

app_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("Updated: src/App.tsx")

api_path = PROJECT / "api" / "blackterm-ai.ts"

if api_path.exists():
    api = api_path.read_text(encoding="utf-8")
    credential_import = (
        'import { credentialRecords } from "../src/data/credentials.js";'
    )

    if credential_import not in api:
        api = credential_import + "\n" + api

    if "    credentialRecords,\n" not in api:
        api = api.replace(
            "    socials,\n",
            "    socials,\n    credentialRecords,\n",
            1,
        )

    api_path.write_text(api, encoding="utf-8")
    print("Updated: api/blackterm-ai.ts")

print("")
print("BLACKTERM Credential Vault installed successfully.")
print("Next commands:")
print("  npx tsc --noEmit")
print("  npm run build")
