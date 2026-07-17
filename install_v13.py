from pathlib import Path
import shutil,sys

project=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
source=Path(__file__).parent
app_path=project/'src/App.tsx';css_path=project/'src/styles.css'
if not app_path.exists() or not css_path.exists(): raise SystemExit('Could not find BLACKTERM OS project.')

backup=project/'.blackterm-backups';backup.mkdir(exist_ok=True)
shutil.copy2(app_path,backup/'App.pre-v13.backup.tsx')
shutil.copy2(css_path,backup/'styles.pre-v13.backup.css')

app=app_path.read_text(encoding='utf-8');css=css_path.read_text(encoding='utf-8')

def patch(old,new,label):
 global app
 if new in app: print('[skip]',label);return
 if old not in app: raise SystemExit('Could not patch '+label)
 app=app.replace(old,new,1);print('[ok]',label)

patch("import IncidentEngine, { IncidentStatusOverlay } from './components/IncidentEngine';","import IncidentEngine, { IncidentStatusOverlay } from './components/IncidentEngine';\nimport MalwareSandbox from './components/MalwareSandbox';",'sandbox import')
patch("|'incident';","|'incident'|'sandbox';",'AppId')
patch("{ id:'incident', title:'Incident Engine', icon:'/icons/incident.svg', hint:'Connected detection and response mission' },","{ id:'incident', title:'Incident Engine', icon:'/icons/incident.svg', hint:'Connected detection and response mission' },\n  { id:'sandbox', title:'Malware Sandbox', icon:'/icons/malware-sandbox.svg', hint:'Safe behavior-analysis simulator' },",'app registry')
patch("case'incident':return <IncidentEngine openApp={openApp}/>;","case'incident':return <IncidentEngine openApp={openApp}/>; case'sandbox':return <MalwareSandbox openApp={openApp}/>;",'window renderer')

if "s.includes('malware sandbox')" not in app:
 needle="if(s.includes('incident simulation')||s.includes('start mission')||s.includes('mission 01')||s==='incident'){"
 insert="if(s.includes('malware sandbox')||s.includes('analyze malware')||s.includes('analyze sample')||s==='sandbox'){openApp('sandbox');return{from:'ai',text:'The BLACKTERM Malware Sandbox is open. It safely simulates quarantine, behavioral monitoring, process trees, memory anomalies, MITRE mappings, and IOC extraction without executing real files.',actions:[{label:'Open Malware Sandbox',app:'sandbox'},{label:'Open Incident Engine',app:'incident'}]}};\n   "
 if needle in app: app=app.replace(needle,insert+needle,1);print('[ok] AI integration')

app=app.replace('apps.slice(0,15)','apps.slice(0,16)',1)
app=app.replace('BLACKTERM BIOS v12.0.26','BLACKTERM BIOS v13.0.26')
app=app.replace('BLACKTERM OS v12 —','BLACKTERM OS v13 —')
app=app.replace('// v12.0</small>','// v13.0</small>')
app=app.replace('BLACKTERM OS v12.0</span>','BLACKTERM OS v13.0</span>')
app=app.replace('AI SECURITY INCIDENT-ENGINE THREAT-MAP HOME-LAB TERMINAL GITHUB RESUME','AI SECURITY MALWARE-SANDBOX INCIDENT-ENGINE THREAT-MAP HOME-LAB TERMINAL')

marker='/* BLACKTERM OS v13 — Malware Sandbox */'
if marker not in css:
 css+='\\n\\n'+(source/'malware-sandbox.css').read_text(encoding='utf-8');print('[ok] styles')

(project/'src/components').mkdir(parents=True,exist_ok=True)
(project/'public/icons').mkdir(parents=True,exist_ok=True)
for rel in ['src/components/MalwareSandbox.tsx','public/icons/malware-sandbox.svg']:
 src=source/rel;dst=project/rel;dst.parent.mkdir(parents=True,exist_ok=True)
 if src.resolve()!=dst.resolve(): shutil.copy2(src,dst)

app_path.write_text(app,encoding='utf-8');css_path.write_text(css,encoding='utf-8')
print('[ok] safe simulated sample library')
print('[ok] behavior, process, memory, and IOC views')
print('[ok] Incident Engine and Home Lab actions')
print('[ok] backups saved')
print('\\nBLACKTERM OS v13 installed. Run: npm.cmd run build')
