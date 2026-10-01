(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const DCOUNT=()=>Math.max(1,Number(typeof dungeons!=='undefined'&&dungeons?.length)||20);
 const int=n=>Math.max(0,Math.round(Number(n)||0));

 function shape(){
  s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
  s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
  s.dungeon.completed=Array.isArray(s.dungeon.completed)?[...new Set(s.dungeon.completed.map(Number).filter(Number.isInteger))]:[];
  s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?[...new Set(s.dungeon.unlocked.map(Number).filter(Number.isInteger))]:[];
  if(!s.dungeon.unlocked.includes(0))s.dungeon.unlocked.unshift(0);
  const max=DCOUNT()-1;
  s.dungeon.selected=Math.max(0,Math.min(max,Number(s.dungeon.selected)||0));
  for(let i=0;i<=max;i++){
   if(s.dungeon.progress[i]!=null)s.dungeon.progress[i]=Math.max(0,Math.min(9,Number(s.dungeon.progress[i])||0));
  }
 }

 function validCompletion(i){
  i=Number(i);if(!Number.isInteger(i)||i<0||i>=DCOUNT())return false;
  /* A sealed dungeon is only valid after its boss room was reached. */
  if(!s.dungeon.completed.includes(i)||Number(s.dungeon.progress?.[i])<9)return false;
  /* V6.229: Dungeon 1 has no hard per-enemy level lock. A strong build may
     legitimately beat the boss below level 19, so level must never invalidate
     a real boss completion. Boss-room progress is the completion authority. */
  return true;
 }

 function repair(reason='runtime',persistFix=true){
  shape();let changed=false;
  const before=s.dungeon.completed.slice();
  s.dungeon.completed=before.filter(i=>validCompletion(i));
  if(before.length!==s.dungeon.completed.length)changed=true;

  /* V6.229: never reset Dungeon-1 boss progress based on player level.
     D1 intentionally allows strong builds to progress ahead of recommendation. */
  if(!s.dungeon.unlocked.includes(0)){s.dungeon.unlocked.unshift(0);changed=true}

  if(changed){
   try{console.warn('V4.159 repaired dungeon integrity',reason,{level:s.level,completed:s.dungeon.completed,progress0:s.dungeon.progress?.[0]})}catch(e){}
   try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
   if(persistFix && window.__V200_AUTH_READY__===true){
    try{if(typeof persist==='function')persist(false)}catch(e){console.warn('V4.159 dungeon repair save',e)}
   }
  }
  return changed;
 }
 window.v4158RepairDungeonState=repair;

 /* Final live truth: Dungeon 1 is always unlocked from Level 1; a stale completed
    bit can no longer close a dungeon unless its boss progress is real. */
 /* V8.009: dungeonUnlocked override retired; v4165 is the later live key authority. */
 try{
  if(typeof dungeonCompleted==='function'){
   dungeonCompleted=function(i){shape();return validCompletion(Number(i))};
   try{window.dungeonCompleted=dungeonCompleted}catch(e){}
  }
 }catch(e){}
 /* V8.009: dungeonAvailable override retired; v4165 owns final availability. */

 /* Repair after the authoritative account save has actually been applied. */
 try{
  if(typeof v075ApplyCloudSave==='function'&&!window.__v4158CloudDungeon){
   const base=v075ApplyCloudSave;
   v075ApplyCloudSave=async function(){
    const r=await base.apply(this,arguments);
    repair('cloud-after',true);
    return r;
   };
   try{window.v075ApplyCloudSave=v075ApplyCloudSave}catch(e){}
   window.__v4158CloudDungeon=true;
  }
 }catch(e){}

 /* Phase 2 retired: v4158 renderDungeon wrapper. Dungeon integrity repair is
    called explicitly by the canonical owner and still runs on auth/navigation. */
 /* V7.121: integrity repair no longer deepens v032Go; run after the canonical
    V467 entry pass and rebuild only when repair actually changes state. */
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')!=='dungeon')return;
  try{if(repair('nav',true)&&typeof window.v467RebuildDungeonWorld==='function')window.v467RebuildDungeonWorld('v4158-repair')}catch(err){}
 });
 window.__v4158Go='v7121-event';

 /* The screenshot also exposed a separate Supabase mirror regression:
    profiles integer columns can receive a decimal gear_score (e.g. 39.2).
    profiles is display-only, so normalize its integer fields without touching
    gameplay stats, items, saves or combat calculations. */
 try{
  if(typeof v073ProfilePayload==='function'&&!window.__v4158ProfileInts){
   const base=v073ProfilePayload;
   v073ProfilePayload=function(){
    const p=base.apply(this,arguments)||{};
    ['level','bosses','gear_score','dungeons','combat_power','worldboss_attempts','worldboss_wins','pvp_buds','pvp_wins','pvp_losses','pvp_fights'].forEach(k=>{
     if(k in p)p[k]=int(p[k]);
    });
    return p;
   };
   try{window.v073ProfilePayload=v073ProfilePayload}catch(e){}
   window.__v4158ProfileInts=true;
  }
 }catch(e){}

 function stamp(){}
 window.v4158DungeonDiagnostics=()=>({
  version:V.short,level:Number(s?.level)||1,dungeon1Unlocked:typeof dungeonUnlocked==='function'?dungeonUnlocked(0):true,
  dungeon1Completed:typeof dungeonCompleted==='function'?dungeonCompleted(0):false,
  completed:[...(s?.dungeon?.completed||[])],progress0:Number(s?.dungeon?.progress?.[0])||0,
  frostAutoEquipRecognizesWeapon2:typeof window.v480AutoEquip==='function'&&/weapon2/.test(String(window.v480AutoEquip))
 });

 /* Targeted Systemtechnik contracts, no replacement of the established runner. */
 try{
  const qa=window.v4107RunQA||window.v4102RunQA;
  if(typeof qa==='function'&&!window.__v4158Qa){
   const wrapped=function(){
    const r=qa.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;
    const add=(name,pass,detail)=>r.results.push({category:'Dungeon & Profil V4.159',name,pass:!!pass,severity:'error',detail});
    add('Dungeon 1 ist ab Level 1 grundsätzlich freigeschaltet',typeof dungeonUnlocked==='function'&&dungeonUnlocked(0)===true,'Abschluss/Versiegelung wird separat geprüft');
    add('Versiegelung braucht echten Bossfortschritt',(s.dungeon?.completed||[]).every(i=>Number(s.dungeon?.progress?.[i])>=9),'completed[] nur bei Bossraum');
    add('Server-Guard schützt Dungeon-Einstieg',typeof window.v7051EnsureDungeonState==='function','vor Öffnen wird kanonischer Serverstatus geprüft');
    add('Frost-Auto-Ausrüsten kennt Waffe II',typeof window.v480AutoEquip==='function'&&/weapon2/.test(String(window.v480AutoEquip)),'stärkste zwei Frost-Waffen werden gewählt');
    try{const p=v073ProfilePayload?.()||{};const ks=['level','bosses','gear_score','dungeons','combat_power','worldboss_attempts','worldboss_wins','pvp_buds','pvp_wins','pvp_losses','pvp_fights'].filter(k=>k in p);add('Profil-Integerfelder sind ganzzahlig',ks.every(k=>Number.isInteger(Number(p[k]))),ks.map(k=>`${k}:${p[k]}`).join(' · '))}catch(e){add('Profil-Integerfelder sind ganzzahlig',false,e?.message||String(e))}
    r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r;
   };
   window.v4107RunQA=wrapped;if(window.v4102RunQA===qa)window.v4102RunQA=wrapped;window.__v4158Qa=true;
  }
 }catch(e){}

 repair('startup',false);stamp();
 window.addEventListener('growlegends:account-ready',()=>{repair('account-ready',true);stamp();requestAnimationFrame(()=>{try{if(document.getElementById('dungeon')?.classList.contains('active'))renderDungeon?.()}catch(e){}})});
 window.addEventListener('pageshow',()=>{repair('pageshow',true);stamp()},{passive:true});
})();
