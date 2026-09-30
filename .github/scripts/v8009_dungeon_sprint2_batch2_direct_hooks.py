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
    return ms[0]

def replace_body(src,sid,new_body):
    m=get_script(src,sid)
    return src[:m.start('body')]+new_body+src[m.end('body'):]

# ---- v4165: remove four detail wrappers + renderDungeon battle-gate wrapper.
m=get_script(beta,'v4165-dungeon-key-live-battle-index-fix')
body=m.group('body')

old_detail=""" /* Detail renderers are heavily wrapped elsewhere. Stamp the actually rendered dungeon after the
    full render chain so subsequent enemy/fight clicks cannot fall back to the old selection. */
 ['v251RenderDetail','v244RenderSelectedDungeonMap','v064RenderMap','v261RenderDetail'].forEach(name=>{
   try{
     const fn=window[name]||globalThis[name];
     if(typeof fn!=='function'||fn.__v4165DetailStamp)return;
     const wrapped=function(){const r=fn.apply(this,arguments);stampDetail();return r};
     wrapped.__v4165DetailStamp=true;window[name]=wrapped;
     try{
       if(name==='v251RenderDetail')v251RenderDetail=wrapped;
       if(name==='v244RenderSelectedDungeonMap')v244RenderSelectedDungeonMap=wrapped;
       if(name==='v064RenderMap')v064RenderMap=wrapped;
       if(name==='v261RenderDetail')v261RenderDetail=wrapped;
     }catch(_){}
   }catch(_){}
 });

"""
new_detail=""" /* Sprint 2: expose the detail stamp directly. The canonical D2 map path calls
    this after v261 renders, so four historical detail wrappers are unnecessary. */
 window.v4165StampDetail=stampDetail;

"""
if old_detail not in body:
    raise RuntimeError('v4165 detail wrapper block not found')
body=body.replace(old_detail,new_detail,1)

old_gate=""" /* Reconcile the button after the complete renderer chain. This is event-driven,
    not another polling timer/observer. It specifically repairs disabled=true
    left by an old completed-dungeon render. */
 try{
   const base=window.renderDungeon||(typeof renderDungeon==='function'?renderDungeon:null);
   if(typeof base==='function'&&!base.__v4165BattleGate){
     const wrapped=function(){
       const r=base.apply(this,arguments);
       if(s?.dungeon?.layer==='dungeon'&&s?.dungeon?.view==='battle'){
         requestAnimationFrame(()=>syncBattleGate('render-raf'));
       }
       return r;
     };
     wrapped.__v4165BattleGate=true;
     window.renderDungeon=wrapped;try{renderDungeon=wrapped}catch(_){ }
   }
 }catch(e){console.warn('V4.165 render battle gate',e)}

"""
new_gate=""" /* Sprint 2: renderDungeon battle-gate wrapper retired.
    The canonical D2 battle path already calls v4165SyncBattleGate directly. */

"""
if old_gate not in body:
    raise RuntimeError('v4165 renderDungeon gate wrapper not found')
body=body.replace(old_gate,new_gate,1)
beta=replace_body(beta,'v4165-dungeon-key-live-battle-index-fix',body)

# ---- v7051: expose claim button sync directly; keep all receipt/server logic.
m=get_script(beta,'v7051-atomic-dungeon-receipt-client')
body=m.group('body')
old_v7051="""/* Re-own rendering only for button identity. Mirror mode remains byte-for-byte behaviorally legacy. */
try{
 const base=window.renderDungeon||((typeof renderDungeon==='function')?renderDungeon:null);
 if(typeof base==='function'&&!base.__v7051ButtonOwner){
  const w=function(){const r=base.apply(this,arguments);setTimeout(claimButton,0);return r};w.__v7051ButtonOwner=true;w.__v7051Base=base;window.renderDungeon=w;try{renderDungeon=w}catch(_){}
 }
}catch(e){console.warn('[V7051] render owner',e)}

"""
new_v7051="""/* Sprint 2: button identity is synchronized directly by the canonical D2
   renderer. Server receipt, authority and click interception remain unchanged. */
window.v7051ClaimButtonSync=claimButton;

"""
if old_v7051 not in body:
    raise RuntimeError('v7051 render owner block not found')
body=body.replace(old_v7051,new_v7051,1)
beta=replace_body(beta,'v7051-atomic-dungeon-receipt-client',body)

# ---- structural validation
for forbidden in (
  '__v4165DetailStamp',
  '__v4165BattleGate',
  '__v7051ButtonOwner',
  '__v7051Base',
):
    if forbidden in beta:
        raise RuntimeError(f'redundant hook remains active: {forbidden}')

for required in (
  'window.v4165StampDetail=stampDetail',
  'window.v4165SyncBattleGate=syncBattleGate',
  'window.v7051ClaimButtonSync=claimButton',
  'window.v7051RunServerDungeon=()=>runServerDungeon()',
  'wrapped.__v4165BattleSync=true',
):
    if required not in beta:
        raise RuntimeError(f'critical retained behavior missing: {required}')

owner='js/features/dungeon/beta/v8009-d2-visual-owner.js'
seal='js/features/dungeon/beta/v8009-d5-final-detail-seal.js'
if beta.count(owner)!=1 or beta.count(seal)!=1:
    raise RuntimeError('canonical owner/seal include count changed')
if beta.find('id="v4165-dungeon-key-live-battle-index-fix"')>beta.find(owner):
    raise RuntimeError('v4165 must load before canonical owner')
if beta.find('id="v7051-atomic-dungeon-receipt-client"')>beta.find(owner):
    raise RuntimeError('v7051 must load before canonical owner')

body_end=beta.lower().rfind('</body>')
if beta.rfind('<script',0,body_end)!=beta.rfind('<script id="v8009-dungeon-d5-final-detail-seal"',0,body_end):
    raise RuntimeError('D5 final seal no longer last script')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-DUNGEON-SPRINT-2-BATCH2',
 'scope':'beta only',
 'stable_unchanged':True,
 'removed_hooks':[
   'v4165 four detail renderer wrappers',
   'v4165 renderDungeon battle-gate wrapper',
   'v7051 renderDungeon button-owner wrapper'
 ],
 'direct_hooks':[
   'v4165StampDetail',
   'v4165SyncBattleGate',
   'v7051ClaimButtonSync'
 ],
 'retained_critical_logic':[
   'v4165 v251StartCurrentDungeonFight authority wrapper',
   'v4165 key selection / live index',
   'v7051 atomic server receipt and authority',
   'v7051 server fight click interception'
 ],
 'beta_before_bytes':before_bytes,
 'beta_after_bytes':len(beta.encode()),
 'beta_before_sha256':before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'gameplay_changed':False,
 'combat_math_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_DUNGEON_SPRINT2_BATCH2.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
