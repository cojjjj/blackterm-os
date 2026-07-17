from pathlib import Path
import re,shutil,sys

project=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
source=Path(__file__).parent
app_path=project/'src/App.tsx';css_path=project/'src/styles.css'
if not app_path.exists() or not css_path.exists(): raise SystemExit('Could not find BLACKTERM OS project.')

backup=project/'.blackterm-backups';backup.mkdir(exist_ok=True)
shutil.copy2(app_path,backup/'App.pre-desktop-layout.backup.tsx')
shutil.copy2(css_path,backup/'styles.pre-desktop-layout.backup.css')

app=app_path.read_text(encoding='utf-8');css=css_path.read_text(encoding='utf-8')

# Import
anchor="import Window from './components/Window';"
new_import=anchor+"\nimport { DesktopWorkspace, StartAppGrid } from './components/DesktopWorkspace';"
if "from './components/DesktopWorkspace'" not in app:
    if anchor not in app: raise SystemExit('Could not locate Window import.')
    app=app.replace(anchor,new_import,1)
    print('[ok] desktop workspace import')

# Replace desktop icon renderer. Handles any slice count.
pattern=r'<div className="desktop-icons">\{apps\.slice\(0,\d+\)\.map\(a=><button key=\{a\.id\}.*?</button>\)\}</div>'
replacement='<DesktopWorkspace apps={apps} openApp={openApp}/>'
app,count=re.subn(pattern,replacement,app,count=1,flags=re.S)
if count: print('[ok] draggable desktop renderer')
elif '<DesktopWorkspace apps={apps}' in app: print('[skip] draggable desktop renderer')
else: raise SystemExit('Could not locate desktop icon renderer.')

# Replace Start menu app list only.
pattern=r'<div className="start-apps">\{apps\.map\(a=><button key=\{a\.id\}.*?</button>\)\}</div>'
replacement='<StartAppGrid apps={apps} openApp={openApp}/>'
app,count=re.subn(pattern,replacement,app,count=1,flags=re.S)
if count: print('[ok] Start menu drag and add controls')
elif '<StartAppGrid apps={apps}' in app: print('[skip] Start menu integration')
else: raise SystemExit('Could not locate Start menu app list.')

# Version labels.
replacements=[
 ('BLACKTERM BIOS v13.0.26','BLACKTERM BIOS v13.1.26'),
 ('BLACKTERM OS v13 —','BLACKTERM OS v13.1 —'),
 ('// v13.0</small>','// v13.1</small>'),
 ('BLACKTERM OS v13.0</span>','BLACKTERM OS v13.1</span>')
]
for old,new in replacements: app=app.replace(old,new)

marker='/* BLACKTERM OS v13.1 — persistent draggable desktop */'
if marker not in css:
    css+='\\n\\n'+(source/'desktop-layout.css').read_text(encoding='utf-8')
    print('[ok] desktop layout styles')

target=project/'src/components/DesktopWorkspace.tsx'
target.parent.mkdir(parents=True,exist_ok=True)
src=source/'src/components/DesktopWorkspace.tsx'
if src.resolve()!=target.resolve(): shutil.copy2(src,target)

app_path.write_text(app,encoding='utf-8');css_path.write_text(css,encoding='utf-8')
print('[ok] localStorage persistence')
print('[ok] right-click shortcut removal')
print('[ok] align and reset controls')
print('[ok] backups saved')
print('\\nBLACKTERM OS v13.1 installed. Run: npm.cmd run build')
