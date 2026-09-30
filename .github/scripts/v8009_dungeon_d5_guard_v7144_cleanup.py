from pathlib import Path
import hashlib, json

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=hashlib.sha256(beta.encode()).hexdigest()

old="""  const stage=card.querySelector('.v261-stage');if(!stage)return;
  stage.querySelectorAll(':scope>.v261-bg,:scope>.v261-fx').forEach(n=>n.remove());
  stage.style.setProperty('background-image','none','important');
  const imgs=[...stage.querySelectorAll(':scope>.gl-dungeon-map-bg-img')];imgs.slice(1).forEach(n=>n.remove());
  paintDungeonTimer(true);"""

new="""  const stage=card.querySelector('.v261-stage');if(!stage)return;
  const imgs=[...stage.querySelectorAll(':scope>.gl-dungeon-map-bg-img')];
  const bg=imgs[0];
  const canonicalReady=!!bg&&!bg.hidden&&(!bg.complete||bg.naturalWidth>0);
  /* V8.009 D5: never destroy the visible fallback before the canonical
     background has actually loaded. This was the source of the black map. */
  stage.querySelectorAll(':scope>.v261-fx').forEach(n=>n.remove());
  if(canonicalReady){
    stage.querySelectorAll(':scope>.v261-bg').forEach(n=>n.remove());
    stage.style.setProperty('background-image','none','important');
  }
  imgs.slice(1).forEach(n=>n.remove());
  paintDungeonTimer(true);"""

count=beta.count(old)
if count!=1:
    raise RuntimeError(f'expected one v7144 cleanup block, got {count}')
beta=beta.replace(old,new,1)
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('stable changed')

report={
  'build':'V8.009-DUNGEON-D5-GUARD-V7144-CLEANUP',
  'scope':'beta only',
  'stable_unchanged':True,
  'beta_before_sha256':before,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'change':'v7144 removes legacy map background only after canonical background image is loaded',
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D5_GUARD_V7144_CLEANUP.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
