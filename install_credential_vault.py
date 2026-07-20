from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
PROJECT = Path.cwd()

app_path = PROJECT / "src" / "App.tsx"
if not app_path.exists():
    raise SystemExit("Run this from the BLACKTERM project root containing src/App.tsx.")

for relative in (
    "src/components/CredentialVault.tsx",
    "src/data/credentials.ts",
    "src/styles/credential-vault.css",
):
    source = ROOT / relative
    destination = PROJECT / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)

backup = PROJECT / ".blackterm-backups" / "App.before-credential-vault.tsx"
backup.parent.mkdir(parents=True, exist_ok=True)
if not backup.exists():
    shutil.copy2(app_path, backup)

app = app_path.read_text(encoding="utf-8")

component_import = "import CredentialVault from './components/CredentialVault';"
style_import = "import './styles/credential-vault.css';"

if component_import not in app:
    anchor = "import BlackTermAIController from './components/BlackTermAIController';"
    app = app.replace(anchor, anchor + "\n" + component_import)

if style_import not in app:
    anchor = "import './styles/blackterm-ai-controller.css';"
    app = app.replace(anchor, anchor + "\n" + style_import)

app = app.replace(
    "{ id:'certs', title:'Certifications', icon:'/icons/certs.svg', hint:'Verified records' }",
    "{ id:'certs', title:'Credential Vault', icon:'/icons/certs.svg', hint:'Verified certification records' }",
)

lines = app.splitlines()
found = False
for i, line in enumerate(lines):
    if "case'certs':return" in line or 'case "certs":' in line:
        indent = line[: len(line) - len(line.lstrip())]
        lines[i] = indent + "case'certs':return <CredentialVault/>;"
        found = True
        break

if not found:
    raise SystemExit("Could not find the certs case in src/App.tsx.")

app_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

api_path = PROJECT / "api" / "blackterm-ai.ts"
if api_path.exists():
    api = api_path.read_text(encoding="utf-8")
    import_line = 'import { credentialRecords } from "../src/data/credentials.js";'
    if import_line not in api:
        api = import_line + "\n" + api
    if "    credentialRecords,\n" not in api:
        api = api.replace("    socials,\n", "    socials,\n    credentialRecords,\n", 1)
    api_path.write_text(api, encoding="utf-8")

print("BLACKTERM Credential Vault installed.")
print(f"Backup: {backup}")
print("Run: npx tsc --noEmit")
print("Then: npm run build")
