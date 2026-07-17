from pathlib import Path
import shutil,sys
project=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
source=Path(__file__).parent
app_path=project/'src/App.tsx';css_path=project/'src/styles.css'
if not app_path.exists() or not css_path.exists(): raise SystemExit('Could not find BLACKTERM OS project.')
backup=project/'.blackterm-backups';backup.mkdir(exist_ok=True)
shutil.copy2(app_path,backup/'App.pre-home-lab.backup.tsx');shutil.copy2(css_path,backup/'styles.pre-home-lab.backup.css')
app=app_path.read_text(encoding='utf-8');css=css_path.read_text(encoding='utf-8')
def patch(old,new,label):
 global app
 if new in app: print('[skip]',label);return
 if old not in app: raise SystemExit('Could not patch '+label)
 app=app.replace(old,new,1);print('[ok]',label)
patch("import ThreatMap from './components/ThreatMap';","import ThreatMap from './components/ThreatMap';\nimport HomeLab from './components/HomeLab';",'component import')
patch("|'threatmap';","|'threatmap'|'homelab';",'AppId')
patch("{ id:'threatmap', title:'Threat Map', icon:'/icons/threat-map.svg', hint:'Global intelligence visualization' },","{ id:'threatmap', title:'Threat Map', icon:'/icons/threat-map.svg', hint:'Global intelligence visualization' },\n  { id:'homelab', title:'Home Lab', icon:'/icons/home-lab.svg', hint:'Interactive cyber range topology' },",'app registry')
patch("case'files':return <FileExplorer openApp={openApp}/>; case'security':return <SecurityCenter/>; case'threatmap':return <ThreatMap/>;","case'files':return <FileExplorer openApp={openApp}/>; case'security':return <SecurityCenter/>; case'threatmap':return <ThreatMap/>; case'homelab':return <HomeLab/>;",'window renderer')
if "s.includes('home lab')" not in app:
 needle="if(s.includes('threat map')||s.includes('global threat')||s==='threatmap'){"
 insertion="if(s.includes('home lab')||s.includes('cyber range')||s==='lab'||s==='homelab'){openApp('homelab');return{from:'ai',text:'BLACKTERM LAB is open. It visualizes Tyler’s workstation, VirtualBox environment, Kali Linux, Windows endpoint, Wazuh manager, Ubuntu server, telemetry paths, and hands-on security workflow.',actions:[{label:'Open Home Lab',app:'homelab'}]}};\n   "
 if needle in app: app=app.replace(needle,insertion+needle,1);print('[ok] AI integration')
app=app.replace('apps.slice(0,13)','apps.slice(0,14)',1)
app=app.replace('BLACKTERM BIOS v10.1.26','BLACKTERM BIOS v11.0.26').replace('BLACKTERM OS v10.1 —','BLACKTERM OS v11 —').replace('// v10.1</small>','// v11.0</small>').replace('BLACKTERM OS v10.1</span>','BLACKTERM OS v11.0</span>').replace('AI SECURITY THREAT-MAP TERMINAL GITHUB RESUME','AI SECURITY THREAT-MAP HOME-LAB TERMINAL GITHUB RESUME')
if '/* BLACKTERM OS v11 — Home Lab Visualization */' not in css: css+='\n\n'+(source/'home-lab.css').read_text(encoding='utf-8');print('[ok] styles')
(project/'src/components').mkdir(parents=True,exist_ok=True);(project/'public/icons').mkdir(parents=True,exist_ok=True)
app_path.write_text(app,encoding='utf-8');css_path.write_text(css,encoding='utf-8')
print('BLACKTERM OS v11 Home Lab installed. Run: npm.cmd run build')
