from pathlib import Path
import sys
project=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve(); base=Path(__file__).parent
app_path=project/'src/App.tsx'; css_path=project/'src/styles.css'
if not app_path.exists() or not css_path.exists(): raise SystemExit('Run with the BLACKTERM OS project folder as the argument.')
app=app_path.read_text(encoding='utf-8'); css=css_path.read_text(encoding='utf-8')
def patch(old,new,label):
 global app
 if new in app: print('[skip]',label); return
 if old not in app: raise SystemExit('Could not find insertion point: '+label)
 app=app.replace(old,new,1); print('[ok]',label)
patch("import Window from './components/Window';","import Window from './components/Window';\nimport ThreatMap from './components/ThreatMap';",'component import')
patch("|'gallery'|'interview';","|'gallery'|'interview'|'threatmap';",'AppId')
patch("{ id:'security', title:'Security Center', icon:'/icons/security.svg', hint:'SOC telemetry' },","{ id:'security', title:'Security Center', icon:'/icons/security.svg', hint:'SOC telemetry' },\n  { id:'threatmap', title:'Threat Map', icon:'/icons/threat-map.svg', hint:'Global intelligence visualization' },",'app registry')
patch("if(s.includes('open github')||s==='github'){openApp('github');","if(s.includes('threat map')||s.includes('global threat')||s==='threatmap'){openApp('threatmap');return{from:'ai',text:'Global Threat Intelligence is open. It is an interactive educational simulation featuring animated routes, threat filters, regional intelligence, and a rotating event stream.',actions:[{label:'Open Threat Map',app:'threatmap'}]}};\n   if(s.includes('open github')||s==='github'){openApp('github');",'AI integration')
patch("case'files':return <FileExplorer openApp={openApp}/>; case'security':return <SecurityCenter/>;","case'files':return <FileExplorer openApp={openApp}/>; case'security':return <SecurityCenter/>; case'threatmap':return <ThreatMap/>;",'window renderer')
app=app.replace('apps.slice(0,12)','apps.slice(0,13)',1).replace('BLACKTERM OS v9 —','BLACKTERM OS v10 —').replace('// v9.0</small>','// v10.0</small>').replace('BLACKTERM OS v9.0</span>','BLACKTERM OS v10.0</span>')
marker='/* BLACKTERM OS v10 — Global Threat Intelligence */'
if marker not in css: css+='\n\n'+(base/'threat-map.css').read_text(encoding='utf-8')
(project/'src/components').mkdir(parents=True,exist_ok=True); (project/'public/icons').mkdir(parents=True,exist_ok=True)
(project/'src/components/ThreatMap.tsx').write_text((base/'src/components/ThreatMap.tsx').read_text(encoding='utf-8'),encoding='utf-8')
(project/'public/icons/threat-map.svg').write_text((base/'public/icons/threat-map.svg').read_text(encoding='utf-8'),encoding='utf-8')
app_path.write_text(app,encoding='utf-8'); css_path.write_text(css,encoding='utf-8')
print('\nBLACKTERM OS v10 Threat Map installed. Run: npm run build')
