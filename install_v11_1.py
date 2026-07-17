from pathlib import Path
import shutil,sys

project=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
source=Path(__file__).parent
component=project/'src/components/HomeLab.tsx'
styles=project/'src/styles.css'
app=project/'src/App.tsx'

if not component.exists() or not styles.exists():
    raise SystemExit('Home Lab v11 must already be installed.')

backup=project/'.blackterm-backups'
backup.mkdir(exist_ok=True)
shutil.copy2(component,backup/'HomeLab.v11.backup.tsx')
shutil.copy2(styles,backup/'styles.pre-v11.1.backup.css')
if app.exists(): shutil.copy2(app,backup/'App.pre-v11.1.backup.tsx')

component.write_text((source/'src/components/HomeLab.tsx').read_text(encoding='utf-8'),encoding='utf-8')
css=styles.read_text(encoding='utf-8')
marker='/* BLACKTERM OS v11.1 — Home Lab polish pass */'
if marker not in css:
    css+='\\n\\n'+(source/'v11.1.css').read_text(encoding='utf-8')
styles.write_text(css,encoding='utf-8')

if app.exists():
    text=app.read_text(encoding='utf-8')
    text=text.replace('BLACKTERM BIOS v11.0.26','BLACKTERM BIOS v11.1.26')
    text=text.replace('BLACKTERM OS v11 —','BLACKTERM OS v11.1 —')
    text=text.replace('// v11.0</small>','// v11.1</small>')
    text=text.replace('BLACKTERM OS v11.0</span>','BLACKTERM OS v11.1</span>')
    app.write_text(text,encoding='utf-8')

print('[ok] widened VirtualBox rack')
print('[ok] blinking status LEDs')
print('[ok] selected-node pulse')
print('[ok] highlighted connection paths')
print('[ok] Windows → Sysmon → Wazuh → SOC telemetry flow')
print('[ok] responsive polish')
print('[ok] backups saved')
print('\\nBLACKTERM OS v11.1 installed. Run: npm.cmd run build')
