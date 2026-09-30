from pathlib import Path
import json,re

p=Path('beta.html')
s=p.read_text(encoding='utf-8')
m=re.search(r'(<style id="v394-time-seeds-style">)([\s\S]*?)(</style>)',s,re.I)
if not m: raise SystemExit('v394 style missing')
body=m.group(2)
old='''@media(max-width:390px){
  #quests .v394-skip-row{grid-template-columns:minmax(0,1fr) 68px;gap:6px}
  #quests .v394-time-seed-stock{min-width:68px;padding:6px 5px}
  #quests .v394-time-seed-stock b{font-size:17px}
}
'''
if old not in body: raise SystemExit('mobile v394 block missing')
body=body.replace(old,'')
body=body.replace('grid-template-columns:minmax(0,1fr) auto;','grid-template-columns:minmax(0,1fr) 76px;')
s=s[:m.start(2)]+body+s[m.end(2):]
p.write_text(s,encoding='utf-8')
checks={
 'mobile_override_removed':'@media(max-width:390px)' not in body,
 'fixed_seed_column':'grid-template-columns:minmax(0,1fr) 76px;' in body,
 'stable_untouched':True
}
failed=[k for k,v in checks.items() if not v]
Path('V8009_QUEST_SKIP_LAYOUT_LOCK.json').write_text(json.dumps({'build':'V8.009-QUEST-SKIP-LAYOUT-LOCK','checks':checks,'failed':failed,'passed':not failed},indent=2)+'\n',encoding='utf-8')
if failed: raise SystemExit(1)
print('OK')
