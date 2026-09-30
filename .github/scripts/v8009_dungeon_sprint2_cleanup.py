from pathlib import Path
import re,json,hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

def get_script(src,sid):
    pat=re.compile(
      r'<script(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
      r'(?P<body>[\s\S]*?)</script\s*>',
      re.I
    )
    ms=list(pat.finditer(src))
    if len(ms)!=1:
        raise RuntimeError(f'expected one active script {sid}, got {len(ms)}')
    return pat,ms[0]

def replace_body(src,sid,new_body):
    pat,m=get_script(src,sid)
    start,end=m.start('body'),m.end('body')
    return src[:start]+new_body+src[end:]

def retire_script(src,sid,marker):
    pat,m=get_script(src,sid)
    body=m.group('body').strip()+'\n'
    return src[:m.start()]+marker+src[m.end():],body

archived=[]
beta,body=retire_script(
  beta,'v4225-final-10er-owner',
  '<!-- v4225-final-10er-owner retired in V8.009-DUNGEON-SPRINT-2: canonical D2/D5 owner supersedes it -->'
)
archived.append(('v4225-final-10er-owner',body))
beta,body=retire_script(
  beta,'v447-d9-preview-button-restore',
  '<!-- v447-d9-preview-button-restore retired in V8.009-DUNGEON-SPRINT-2: production v494 disables preview openers -->'
)
archived.append(('v447-d9-preview-button-restore',body))

# v446: keep timer/combat/runtime fixes, retire only dead D9 preview button + render wrapper.
_,m=get_script(beta,'v446-dungeon-runtime-root-fix')
body=m.group('body')
old_v446="""  function ensureD9PreviewButton(){
    try{
      if(previewActive()) return;
      const card=document.getElementById('dungeonMapCard');
      if(!card) return;
      const selected=Number(s?.dungeon?.selected||0);
      if(selected!==6) return; // derzeit von Dungeon 7 aus testen
      if(card.querySelector('.v441-preview-launch')) return;

      const stage=card.querySelector('.v261-stage');
      if(!stage?.parentNode) return;

      const btn=document.createElement('button');
      btn.type='button';
      btn.className='v441-preview-launch';
      btn.textContent='👁 DUNGEON 9 VORSCHAU – NUR OPTIK, KEIN FORTSCHRITT';
      btn.addEventListener('click',ev=>{
        ev.preventDefault();
        ev.stopPropagation();
        window.v441OpenDungeon9Preview?.();
      });
      stage.parentNode.insertBefore(btn,stage);
    }catch(e){}
  }

  /* Kein MutationObserver mehr für die Vorschau.
     Nur nach echten Dungeon-Rendern neu einsetzen. */
  try{
    const baseRender=window.renderDungeon || renderDungeon;
    if(typeof baseRender==='function' && !baseRender.__v446PostRender){
      const wrapped=function(){
        const out=baseRender.apply(this,arguments);
        requestAnimationFrame(()=>{
          try{ensureD9PreviewButton()}catch(e){}
          try{paintTimer(true)}catch(e){}
        });
        return out;
      };
      wrapped.__v446PostRender=true;
      try{window.renderDungeon=wrapped}catch(e){}
      try{renderDungeon=wrapped}catch(e){}
    }
  }catch(e){}

  setTimeout(ensureD9PreviewButton,120);
  window.addEventListener('pageshow',()=>setTimeout(ensureD9PreviewButton,80),{passive:true});

"""
if old_v446 not in body:
    raise RuntimeError('v446 preview/wrapper block not found')
body=body.replace(old_v446,"""  /* Sprint 2: retired production-dead D9 preview launcher and its
     renderDungeon wrapper. previewActive() remains as a safety guard for any
     stale preview state, while timer/combat ownership stays unchanged. */

""",1)
beta=replace_body(beta,'v446-dungeon-runtime-root-fix',body)

# v494: keep production cleanup and live controls; expose direct canonical hook.
_,m=get_script(beta,'v494-production-dungeon-fix-script')
body=m.group('body')
old_v494="""  /* Final render owner: preview state is cleared before old wrappers can inspect it. */
  try{
    const base=window.renderDungeon || (typeof renderDungeon==='function'?renderDungeon:null);
    if(typeof base==='function' && !base.__v494Production){
      const wrapped=function(){
        previewOff();
        const out=base.apply(this,arguments);
        requestAnimationFrame(restoreLiveControls);
        return out;
      };
      wrapped.__v494Production=true;
      try{window.renderDungeon=wrapped}catch(e){}
      try{renderDungeon=wrapped}catch(e){}
    }
  }catch(e){}

"""
new_v494="""  /* Sprint 2: called directly by the canonical D2 renderer after each
     Dungeon render. No global renderDungeon wrapper is needed anymore. */
  window.v494DungeonProductionSync=function(){
    previewOff();
    restoreLiveControls();
  };

"""
if old_v494 not in body:
    raise RuntimeError('v494 render owner block not found')
body=body.replace(old_v494,new_v494,1)
beta=replace_body(beta,'v494-production-dungeon-fix-script',body)

# v585: direct hook already exists and is called by canonical battle renderer.
_,m=get_script(beta,'v585-dungeon-safe-owner-core')
body=m.group('body')
old_v585="""  try{
    const base=window.renderDungeon||renderDungeon;
    if(typeof base==='function'&&!base.__v586VisualSync){
      const wrapped=function(){
        const out=base.apply(this,arguments);
        setTimeout(sync,0);
        return out;
      };
      wrapped.__v586VisualSync=true;
      try{window.renderDungeon=wrapped}catch(_){ }
      try{renderDungeon=wrapped}catch(_){ }
    }
  }catch(_){ }
"""
new_v585="""  /* Sprint 2: renderDungeon wrapper retired. The canonical D2 battle
     pipeline invokes window.v585SyncDungeonBattle() directly. */
"""
if old_v585 not in body:
    raise RuntimeError('v585 render wrapper block not found')
body=body.replace(old_v585,new_v585,1)
beta=replace_body(beta,'v585-dungeon-safe-owner-core',body)

# Archive only the two fully retired scripts; partial edits remain recoverable in git history.
archive=Path('js/features/dungeon/legacy/v8009-sprint2-retired-render-owners.js')
archive.parent.mkdir(parents=True,exist_ok=True)
archive.write_text(
  '/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-SPRINT-2. DO NOT LOAD. */\n\n'
  +'\n'.join(f'/* ===== {sid} ===== */\n{body}' for sid,body in archived),
  encoding='utf-8'
)

# Structural checks.
for sid in ('v4225-final-10er-owner','v447-d9-preview-button-restore'):
    if re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\']',beta,re.I):
        raise RuntimeError(f'retired script still active: {sid}')

for forbidden in (
  '__v446PostRender','ensureD9PreviewButton',
  '__v494Production','__v586VisualSync',
):
    if forbidden in beta:
        raise RuntimeError(f'redundant owner hook still active: {forbidden}')

for required in (
  'window.v494DungeonProductionSync=function()',
  'window.v585SyncDungeonBattle=sync',
  'function v586ScheduleTimer()',
):
    if required not in beta:
        raise RuntimeError(f'required retained behavior missing: {required}')

owner='js/features/dungeon/beta/v8009-d2-visual-owner.js'
seal='js/features/dungeon/beta/v8009-d5-final-detail-seal.js'
if beta.count(owner)!=1 or beta.count(seal)!=1:
    raise RuntimeError('canonical owner/seal include count changed')
if beta.find('id="v494-production-dungeon-fix-script"')>beta.find(owner):
    raise RuntimeError('v494 must load before canonical D2 owner')
if beta.find('id="v585-dungeon-safe-owner-core"')>beta.find(owner):
    raise RuntimeError('v585 must load before canonical D2 owner')

body_end=beta.lower().rfind('</body>')
last_script=beta.rfind('<script',0,body_end)
seal_script=beta.rfind('<script id="v8009-dungeon-d5-final-detail-seal"',0,body_end)
if last_script!=seal_script:
    raise RuntimeError('D5 final seal is no longer last script')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-DUNGEON-SPRINT-2-BETA',
 'phase':'Retire redundant render owners while preserving direct canonical hooks',
 'scope':'beta only',
 'stable_unchanged':True,
 'fully_retired_scripts':['v4225-final-10er-owner','v447-d9-preview-button-restore'],
 'retired_render_wrappers':['v446 __v446PostRender','v494 __v494Production','v585 __v586VisualSync'],
 'retained_direct_hooks':['v494DungeonProductionSync','v585SyncDungeonBattle'],
 'retained_critical_systems':[
   'v246 fight/reward','v4165 key/battle index','v446 timer/combat',
   'v458/v467/v497 key authority','v7051 server receipt client'
 ],
 'legacy_archive':archive.as_posix(),
 'beta_before_bytes':before_bytes,
 'beta_after_bytes':len(beta.encode()),
 'beta_before_sha256':before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'gameplay_changed':False,
 'combat_math_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_DUNGEON_SPRINT2_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
