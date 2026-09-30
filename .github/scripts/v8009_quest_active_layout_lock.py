from pathlib import Path
import json,re,hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable_path.read_bytes()).hexdigest()

m=re.search(r'(<style id="v4172-quest-rpg-style">)([\s\S]*?)(</style>)',beta,re.I)
if not m:
    raise SystemExit('v4172 style block missing')

body=m.group(2)
marker='/* V8.009 ACTIVE QUEST LAYOUT LOCK */'
lock=r'''
/* V8.009 ACTIVE QUEST LAYOUT LOCK
   Keep the running quest card geometrically stable across the 390px breakpoint.
   This is part of the existing v4172 RPG layout owner, not an extra style layer. */
#quests.v392-active-mode .v392-active-view{
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
}
#quests.v392-active-mode .v392-active-view .v386-card{
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  grid-template-columns:34% 66%!important;
  min-height:176px!important;
}
#quests.v392-active-mode .v392-active-view .v386-scene{
  min-width:0!important;
  min-height:176px!important;
  height:100%!important;
}
#quests.v392-active-mode .v392-active-view .v386-card-body{
  min-width:0!important;
  padding:10px!important;
  gap:7px!important;
}
#quests.v392-active-mode .v392-active-view .v386-card-body::before{
  font-size:16px!important;
  line-height:1.06!important;
}
#quests.v392-active-mode .v392-active-view .v386-card-body::after{
  font-size:8.5px!important;
  line-height:1.3!important;
  margin-top:-3px!important;
}
#quests.v392-active-mode .v392-active-view .v386-box b{
  font-size:9px!important;
}
'''

if marker not in body:
    body=body.rstrip()+lock+'\n'

new=beta[:m.start(2)]+body+beta[m.end(2):]
beta_path.write_text(new,encoding='utf-8')

# QA inside the canonical style block
m2=re.search(r'<style id="v4172-quest-rpg-style">([\s\S]*?)</style>',new,re.I)
b=m2.group(1) if m2 else ''
checks={
  'marker': marker in b,
  'active_card_lock':'#quests.v392-active-mode .v392-active-view .v386-card' in b,
  'active_scene_lock':'#quests.v392-active-mode .v392-active-view .v386-scene' in b,
  'active_body_lock':'#quests.v392-active-mode .v392-active-view .v386-card-body' in b,
  'stable_unchanged':hashlib.sha256(stable_path.read_bytes()).hexdigest()==stable_sha,
  'single_v4172_style':len(re.findall(r'<style id="v4172-quest-rpg-style">',new,re.I))==1,
}
failed=[k for k,v in checks.items() if not v]
report={
  'build':'V8.009-QUEST-ACTIVE-LAYOUT-LOCK',
  'checks':checks,
  'failed':failed,
  'passed':not failed,
  'stable_sha256':stable_sha,
  'notes':'Active quest geometry is pinned inside the existing v4172 RPG style owner so the <=390px mobile breakpoint cannot resize the running quest card.'
}
Path('V8009_QUEST_ACTIVE_LAYOUT_LOCK.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if failed: raise SystemExit(1)
