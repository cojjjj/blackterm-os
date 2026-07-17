from pathlib import Path
import sys
import shutil

project = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
source = Path(__file__).parent
app_path = project / "src/App.tsx"
css_path = project / "src/styles.css"
target_component = project / "src/components/ThreatMap.tsx"

if not app_path.exists() or not css_path.exists():
    raise SystemExit("Could not find src/App.tsx and src/styles.css. Pass your BLACKTERM OS project path.")

if not target_component.exists():
    raise SystemExit("ThreatMap.tsx was not found. Install v10 first, then run this v10.1 installer.")

backup_dir = project / ".blackterm-backups"
backup_dir.mkdir(exist_ok=True)
shutil.copy2(target_component, backup_dir / "ThreatMap.v10.backup.tsx")
shutil.copy2(app_path, backup_dir / "App.pre-v10.1.backup.tsx")
shutil.copy2(css_path, backup_dir / "styles.pre-v10.1.backup.css")

target_component.write_text((source / "src/components/ThreatMap.tsx").read_text(encoding="utf-8"), encoding="utf-8")
print("[ok] cinematic ThreatMap component")

css = css_path.read_text(encoding="utf-8")
marker = "/* BLACKTERM OS v10.1 — Threat Intelligence cinematic startup */"
if marker not in css:
    css += "\n\n" + (source / "v10.1.css").read_text(encoding="utf-8")
    css_path.write_text(css, encoding="utf-8")
    print("[ok] v10.1 startup and audio styles")
else:
    print("[skip] v10.1 styles already present")

app = app_path.read_text(encoding="utf-8")

# Upgrade visible version text.
replacements = [
    ("BLACKTERM BIOS v9.0.26", "BLACKTERM BIOS v10.1.26"),
    ("BLACKTERM OS v10 —", "BLACKTERM OS v10.1 —"),
    ("// v10.0</small>", "// v10.1</small>"),
    ("BLACKTERM OS v10.0</span>", "BLACKTERM OS v10.1</span>"),
]
for old, new in replacements:
    app = app.replace(old, new)

# Expand the main system boot mount/status lines when the exact v9/v10 array exists.
old_mount = "'MOUNT........... /portfolio /projects /resume'"
new_mount = "'MOUNT........... /portfolio /projects /resume /threat-intel'"
app = app.replace(old_mount, new_mount)

old_start = "'STARTING BLACKTERM DESKTOP...'"
new_start = "'APPS............ AI SECURITY THREAT-MAP TERMINAL GITHUB RESUME','STARTING BLACKTERM DESKTOP...'"
if new_start not in app:
    app = app.replace(old_start, new_start)

app_path.write_text(app, encoding="utf-8")
print("[ok] BLACKTERM OS v10.1 labels and boot inventory")
print("[ok] backups saved in .blackterm-backups")
print("\nBLACKTERM OS v10.1 installed.")
print("Run: npm.cmd run build")
