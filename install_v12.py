from pathlib import Path
import shutil,sys

project=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
source=Path(__file__).parent
app_path=project/'src/App.tsx'; css_path=project/'src/styles.css'
if not app_path.exists() or not css_path.exists(): raise SystemExit('Could not find BLACKTERM OS project.')

backup=project/'.blackterm-backups';backup.mkdir(exist_ok=True)
shutil.copy2(app_path,backup/'App.pre-v12.backup.tsx');shutil.copy2(css_path,backup/'styles.pre-v12.backup.css')

app=app_path.read_text(encoding='utf-8');css=css_path.read_text(encoding='utf-8')
def patch(old,new,label):
 global app
 if new in app: print('[skip]',label);return
 if old not in app: raise SystemExit('Could not patch '+label)
 app=app.replace(old,new,1);print('[ok]',label)

patch("import HomeLab from './components/HomeLab';","import HomeLab from './components/HomeLab';\nimport IncidentEngine, { IncidentStatusOverlay } from './components/IncidentEngine';",'incident import')
patch("|'homelab';","|'homelab'|'incident';",'AppId')
patch("{ id:'homelab', title:'Home Lab', icon:'/icons/home-lab.svg', hint:'Interactive cyber range topology' },","{ id:'homelab', title:'Home Lab', icon:'/icons/home-lab.svg', hint:'Interactive cyber range topology' },\n  { id:'incident', title:'Incident Engine', icon:'/icons/incident.svg', hint:'Connected detection and response mission' },",'app registry')
patch("case'homelab':return <HomeLab/>;","case'homelab':return <HomeLab/>; case'incident':return <IncidentEngine openApp={openApp}/>;",'window renderer')
patch("<FloatingAssistant onOpen={()=>openApp('assistant')}/>","<IncidentStatusOverlay openApp={openApp}/><FloatingAssistant onOpen={()=>openApp('assistant')}/>",'global incident overlay')

if "s.includes('incident simulation')" not in app:
 needle="if(s.includes('home lab')||s.includes('cyber range')||s==='lab'||s==='homelab'){"
 insert="if(s.includes('incident simulation')||s.includes('start mission')||s.includes('mission 01')||s==='incident'){openApp('incident');return{from:'ai',text:'The BLACKTERM Incident Simulation Engine is open. Mission 01 connects campaign origin, Windows execution, Sysmon telemetry, Wazuh detection, AI-assisted investigation, and endpoint containment.',actions:[{label:'Open Incident Engine',app:'incident'},{label:'View Home Lab',app:'homelab'},{label:'Security Center',app:'security'}]}};\n   "
 if needle in app: app=app.replace(needle,insert+needle,1);print('[ok] AI integration')

app=app.replace('apps.slice(0,14)','apps.slice(0,15)',1)
app=app.replace('BLACKTERM BIOS v11.1.26','BLACKTERM BIOS v12.0.26').replace('BLACKTERM OS v11.1 —','BLACKTERM OS v12 —').replace('// v11.1</small>','// v12.0</small>').replace('BLACKTERM OS v11.1</span>','BLACKTERM OS v12.0</span>')
app=app.replace('AI SECURITY THREAT-MAP HOME-LAB TERMINAL GITHUB RESUME','AI SECURITY INCIDENT-ENGINE THREAT-MAP HOME-LAB TERMINAL GITHUB RESUME')

marker='/* BLACKTERM OS v12 — Incident Simulation Engine */'
if marker not in css: css+='\\n\\n'+(source/'incident-engine.css').read_text(encoding='utf-8');print('[ok] styles')

(project/'src/components').mkdir(parents=True,exist_ok=True);(project/'public/icons').mkdir(parents=True,exist_ok=True)
for rel in ['src/components/IncidentEngine.tsx','src/components/incidentBus.ts','public/icons/incident.svg']:
 src=source/rel;dst=project/rel;dst.parent.mkdir(parents=True,exist_ok=True)
 if src.resolve()!=dst.resolve(): shutil.copy2(src,dst)
app_path.write_text(app,encoding='utf-8');css_path.write_text(css,encoding='utf-8')
print('[ok] shared incident state')
print('[ok] connected mission workflow')
print('[ok] global status overlay')
print('[ok] backups saved')
print('\\nBLACKTERM OS v12 installed. Run: npm.cmd run build')
