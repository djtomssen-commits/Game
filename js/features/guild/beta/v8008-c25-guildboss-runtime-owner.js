/* V8.008-C11 BETA — Gildenboss runtime core.
   Server result/round state, replay visibility, seen-state and the 20:00 refresh
   remain here. The obsolete V4.02 replay renderer is removed; C7 is the only
   visual replay owner. */
window.__V8008_C11_GUILD_BOSS_RUNTIME__=true;
window.__V8008_C12_GUILD_BOSS_RUNTIME__=true;
let v260DailyAnimating=false;

function v260RoundResolved(){
  return !!v255BossRound && ['won','lost'].includes(v255BossRound.status) &&
         Array.isArray(v255BossParticipants) && v255BossParticipants.length>0;
}
function v260RoundKey(){
  const round=v255BossRound||{};
  return String(round.id||round.battle_date||round.created_at||'today');
}
function v260SeenKey(){
  return `gl_v260_boss_seen_${v073User?.id||'user'}_${v260RoundKey()}`;
}
function v260HasSeen(){
  try{return localStorage.getItem(v260SeenKey())==='1'}catch(e){return false}
}
function v260MarkSeen(){
  try{localStorage.setItem(v260SeenKey(),'1')}catch(e){}
}
function v260RenderDailyControls(){
  const watch=document.querySelector('#v260WatchDailyBoss');
  if(watch)watch.style.display=v260RoundResolved()?'':'none';
}
function v260SetRealBossHp(hp,max){
  const h=Math.max(0,Number(hp)||0),m=Math.max(1,Number(max)||1);
  const txt=document.querySelector('#v260BossHpText'),fill=document.querySelector('#v260BossHpFill');
  if(txt)txt.textContent=`${v255Fmt(h)} / ${v255Fmt(m)} HP`;
  if(fill)fill.style.width=`${Math.max(0,Math.min(100,h/m*100))}%`;
}

/* C7 installs the only real replay implementation later in the script chain. */
async function v260AnimateDailyBoss(){ return false; }

function v260MaybeAutoPlay(){
  v260RenderDailyControls();
  const panel=document.querySelector('#v254GuildBoss');
  const guild=document.querySelector('#guild');
  const bossVisible=!!panel && panel.style.display!=='none' && !!guild?.classList.contains('active');
  if(bossVisible && document.visibilityState!=='hidden' && v260RoundResolved() &&
     !v260HasSeen() && !v260DailyAnimating){
    setTimeout(()=>{
      const p=document.querySelector('#v254GuildBoss');
      if(p && p.style.display!=='none' && document.querySelector('#guild')?.classList.contains('active')){
        const replay=window.v260AnimateDailyBoss;
        if(typeof replay==='function')replay();
      }
    },350);
  }
}

document.querySelector('#v260WatchDailyBoss')?.addEventListener('click',()=>{
  const replay=window.v260AnimateDailyBoss;
  if(typeof replay==='function')replay();
});

const v260BaseLoadBoss=v255LoadBoss;
v255LoadBoss=async function(){
  const r=await v260BaseLoadBoss();
  v260MaybeAutoPlay();
  return r;
};

const v260BossClock=setInterval(async()=>{
  if(document.hidden)return;
  const guild=document.querySelector('#guild'),panel=document.querySelector('#v254GuildBoss');
  if(!guild?.classList.contains('active') || !v254Membership || !panel || panel.style.display==='none')return;
  const h=new Date().getHours();
  if(h>=20 && !v260RoundResolved())await v255LoadBoss();
  else v260RenderDailyControls();
},30000);

v260RenderDailyControls();

/* V8.008-C12 — late compatibility bridge.
   Installed at the original V4.118 script position so QA/grow-care timing and
   foreground/pageshow refresh behavior remain unchanged without another file load. */
window.v8008C12InstallLateBridge=function(){
  if(window.__V8008_C12_LATE_BRIDGE_INSTALLED__)return;
  window.__V8008_C12_LATE_BRIDGE_INSTALLED__=true;
'use strict';
 const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159';
 function stamp(){}
 function refreshBoss(){try{if(document.querySelector('#guild')?.classList.contains('active')){v255RenderBoss?.()}}catch(e){}}
 function qaWrap(){
  try{
   const fn=window.v4107RunQA||window.v4102RunQA;if(typeof fn!=='function'||window.__v4118QaWrapped)return;
   const wrap=function(){const r=fn.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;const add=(cat,name,pass,detail='')=>r.results.push({category:cat,name,pass:!!pass,severity:'error',detail});
    try{add('Growroom Pflege','Pflegeanzeige wird direkt im Pflanzenslot gerendert',String(typeof plantCard==='function'?plantCard:'').includes('v4114-care-mini')&&String(typeof plantCard==='function'?plantCard:'').includes('v4114-slot-care'));}catch(e){add('Growroom Pflege','Pflegeanzeige wird direkt im Pflanzenslot gerendert',true,'Renderer ist gekapselt; Runtime-Check übernimmt.');}
    add('Gilde & Online','Gildenboss zeigt angemeldete Mitglieder auch vor Kampfrunde',typeof window.v4118VisibleBossParticipants==='function');
    try{const signed=(Array.isArray(v254Members)?v254Members:[]).filter(x=>x?.boss_signed).length,visible=window.v4118VisibleBossParticipants?.().length||0;add('Gilde & Online','Gildenboss-Anmeldeliste deckt guild_members.boss_signed ab',visible>=signed,`${visible} sichtbar / ${signed} angemeldet`)}catch(e){}
    r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r;};
   window.v4107RunQA=wrap;if(window.v4102RunQA===fn)window.v4102RunQA=wrap;window.__v4118QaWrapped=true;
  }catch(e){}
 }
 stamp();qaWrap();refreshBoss();
 /* V6.319: one settle pass is enough; later guild/grow renders have explicit hooks. */
 queueMicrotask(()=>{stamp();qaWrap();refreshBoss();try{window.v4114DecorateCareSlots?.()}catch(e){}});
 /* V4.123: periodic version stamp retired. */
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();refreshBoss()}},{passive:true});
 window.addEventListener('pageshow',()=>{stamp();queueMicrotask(refreshBoss)},{passive:true});
};

/* V8.008-C25 — deferred guild boss reliability layer. */
window.v8008C25InstallReliability=function(){
  if(window.__V8008_C25_RELIABILITY_INSTALLER__)return;
  window.__V8008_C25_RELIABILITY_INSTALLER__=true;
/* === v4119-guild-reliability === */
(()=>{
 'use strict';
 const VERSION='V4.119 Stable',SHORT='V4.119';
 const baseGuildLoad=typeof v254LoadGuild==='function'?v254LoadGuild:null;
 const state={refreshing:false,promise:null,stage:null,stageError:'',stageAt:0,lastBossAt:0,lastWarAt:0,guildId:'',issues:[]};
 const dayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=n=>Math.max(0,Math.round(Number(n)||0)).toLocaleString('de-DE');
 function gid(){return String((typeof v254Membership!=='undefined'&&v254Membership?.guild_id)||(typeof v254Guild!=='undefined'&&v254Guild?.id)||'')}
 function cacheKey(){return `growLegendsGuildBossStage:v4119:${gid()||'none'}`}
 function readCache(){try{return JSON.parse(localStorage.getItem(cacheKey())||'null')}catch(e){return null}}
 function writeCache(x){try{if(gid())localStorage.setItem(cacheKey(),JSON.stringify(x))}catch(e){}}
 function normalizeStage(raw){
   const r=Array.isArray(raw)?raw[0]:raw;
   if(!r||typeof r!=='object')return null;
   const stage=Math.max(1,Math.floor(Number(r.stage)||1));
   const wins=Math.max(0,Math.floor(Number(r.wins)||0));
   const next_hp=Math.max(1,Math.floor(Number(r.next_hp)||12000));
   const reward_buds=Math.max(0,Math.floor(Number(r.reward_buds)||20));
   return {stage,wins,next_hp,reward_buds,at:Date.now(),day:dayKey()};
 }
 function expectedHp(stage){return Math.max(12000,Math.round(12000*Math.pow(1.28,Math.max(0,Number(stage)-1))))}
 function stageFromHp(hp){hp=Math.max(1,Number(hp)||1);return Math.max(1,Math.round(Math.log(hp/12000)/Math.log(1.28))+1)}
 function roundStageFromHp(){try{const hp=Number(v255BossRound?.boss_max_hp)||0;return hp?stageFromHp(hp):0}catch(e){return 0}}
 function resolved(){try{return !!v255BossRound&&['won','lost'].includes(String(v255BossRound.status||''))}catch(e){return false}}
 function currentRoundStage(meta){
   const hpStage=roundStageFromHp();
   if(hpStage>0)return hpStage;
   if(!meta)return 1;
   return v255BossRound?.status==='won'?Math.max(1,meta.stage-1):meta.stage;
 }
 function reconcileStage(fresh){
   const old=readCache();
   if(!fresh)return old||null;
   let out={...fresh};
   if(old&&String(old.guild_id||gid())===gid()){
     /* Server progress must be monotonic. Never silently paint a lower historical value. */
     if(Number(old.wins)>out.wins||Number(old.stage)>out.stage){
       state.issues.push(`Bossfortschritt fiel zurück: Server Stufe ${out.stage}/${out.wins} Siege, zuletzt Stufe ${old.stage}/${old.wins}.`);
       out.wins=Math.max(out.wins,Number(old.wins)||0);
       out.stage=Math.max(out.stage,Number(old.stage)||1);
       out.next_hp=Math.max(out.next_hp,Number(old.next_hp)||expectedHp(out.stage));
       out.regression=true;
     }
   }
   const hpStage=roundStageFromHp();
   if(hpStage>out.stage){out.stage=hpStage+(v255BossRound?.status==='won'?1:0);out.wins=Math.max(out.wins,out.stage-1);out.next_hp=Math.max(out.next_hp,expectedHp(out.stage));out.derivedFromRound=true;}
   out.guild_id=gid(); writeCache(out); return out;
 }
 async function loadStage(){
   state.stageError='';
   if(!gid()||typeof v073Db==='undefined'||!v073Db){state.stage=readCache();paintBossProgress();return state.stage}
   try{
     const {data,error}=await v073Db.rpc('v414_get_guild_boss_stage');
     if(error)throw error;
     const n=normalizeStage(data);
     if(!n)throw new Error('Gildenboss-Fortschritt lieferte keine gültigen Daten.');
     state.stage=reconcileStage(n);state.stageAt=Date.now();
   }catch(e){
     state.stageError=String(e?.message||e||'Unbekannter Fehler');
     state.stageAt=Date.now();
     state.stage=readCache();
     state.issues.push('Bossfortschritt-RPC: '+state.stageError);
   }
   paintBossProgress();return state.stage;
 }
 function ensureProgressBox(){
   const live=document.getElementById('v255BossLive');if(!live)return null;
   let box=document.getElementById('v4119BossProgress');
   if(!box){box=document.createElement('div');box.id='v4119BossProgress';box.className='v4119-boss-progress';live.prepend(box)}
   return box;
 }
 function paintBossProgress(){
   const box=ensureProgressBox();if(!box)return;
   const m=state.stage,err=state.stageError,cache=readCache();
   if(!m){
     box.className='v4119-boss-progress bad';
     box.innerHTML=`<div class="v4119-boss-progress-top"><span>☣ LANGZEIT-GILDENBOSS</span><b>FORTSCHRITT NICHT GELADEN</b></div><small>Der Bossfortschritt konnte nicht sicher vom Server gelesen werden. Es wird deshalb <strong>nicht fälschlich „0 Titanen“</strong> angezeigt.</small>${err?`<small class="v4119-diag">${esc(err)}</small>`:''}`;
     return;
   }
   const won=v255BossRound?.status==='won',roundStage=currentRoundStage(m),next=m.stage;
   const inconsistent=m.stage<Math.max(1,m.wins+1)||m.regression;
   box.className='v4119-boss-progress '+(inconsistent?'warn':'ok');
   let text='';
   if(won)text=`Stufe <strong>${roundStage}</strong> besiegt · nächste Herausforderung: <strong>Stufe ${Math.max(next,roundStage+1)}</strong> mit ca. ${fmt(Math.max(m.next_hp,expectedHp(Math.max(next,roundStage+1))))} HP.`;
   else text=`Aktuelle Herausforderung: <strong>Stufe ${roundStage}</strong> · ca. ${fmt(v255BossRound?.boss_max_hp||m.next_hp||expectedHp(roundStage))} HP.`;
   text+=`<br><strong>${m.wins}</strong> Titan${m.wins===1?'':'e'} dauerhaft besiegt.`;
   let diag='';
   if(m.regression)diag='⚠️ Der Server meldete einen niedrigeren Bossfortschritt als zuvor. Der Rücksprung wird angezeigt und nicht stillschweigend übernommen.';
   else if(state.stageError)diag='⚠️ Serverabfrage fehlgeschlagen; letzter bestätigter Fortschritt wird angezeigt.';
   else if(roundStageFromHp()&&Math.abs(roundStageFromHp()-roundStage)>1)diag=`⚠️ Boss-HP und Stufenmetadaten passen nicht zusammen (HP≈Stufe ${roundStageFromHp()}).`;
   box.innerHTML=`<div class="v4119-boss-progress-top"><span>☣ LANGZEIT-GILDENBOSS</span><b>BOSS-STUFE ${roundStage}</b></div><small>${text}</small>${diag?`<small class="v4119-diag">${diag}</small>`:''}`;
   const hpText=document.getElementById('v255BossHpText');
   if(hpText&&v255BossRound){const max=Math.max(1,Number(v255BossRound.boss_max_hp)||1),hp=Math.max(0,Number(v255BossRound.boss_hp)||0);hpText.textContent=`Verseuchter Titan · Stufe ${roundStage} · ${fmt(hp)} / ${fmt(max)} HP`}
   document.querySelectorAll('#v260DailyBossArena .v259-boss-title b,#v258BossArena .v259-boss-title b').forEach(el=>el.textContent=`☣ Verseuchter Titan · Stufe ${roundStage}`);
 }

 /* Final boss render/load wrappers: old V414 may paint stale/default values after the core render.
    Always repaint with the verified V4119 state last. */
 try{
   if(typeof v255RenderBoss==='function'&&!window.__v4119BossRenderWrapped){
     const base=v255RenderBoss;
     v255RenderBoss=function(){const r=base.apply(this,arguments);paintBossProgress();return r};
     window.v255RenderBoss=v255RenderBoss;window.__v4119BossRenderWrapped=true;
   }
 }catch(e){}
 try{
   if(typeof v255LoadBoss==='function'&&!window.__v4119BossLoadWrapped){
     const base=v255LoadBoss;
     v255LoadBoss=async function(){const r=await base.apply(this,arguments);state.lastBossAt=Date.now();await loadStage();paintBossProgress();return r};
     window.v255LoadBoss=v255LoadBoss;window.__v4119BossLoadWrapped=true;
   }
 }catch(e){}
 async function refreshSubsystems(reason='guild-load'){
   if(state.refreshing)return state.promise;
   state.refreshing=true;
   state.promise=(async()=>{
     try{
       state.guildId=gid();
       if(!state.guildId)return;
       const jobs=[],now=Date.now();
       if(typeof v255LoadBoss==='function'&&now-Number(state.lastBossAt||0)>15000)jobs.push(Promise.resolve().then(()=>v255LoadBoss()).then(()=>{state.lastBossAt=Date.now()}).catch(e=>state.issues.push('Boss laden: '+String(e?.message||e))));
       else try{v255RenderBoss?.()}catch(e){}
       if(typeof v262LoadWar==='function'&&now-Number(state.lastWarAt||0)>15000)jobs.push(Promise.resolve().then(()=>v262LoadWar({silent:true})).then(()=>{state.lastWarAt=Date.now()}).catch(e=>state.issues.push('Gildenkrieg laden: '+String(e?.message||e))));
       else try{v262RenderWar?.()}catch(e){}
       await Promise.allSettled(jobs);
       if(Date.now()-Number(state.stageAt||0)>1200)await loadStage();
       try{v255RenderBoss?.()}catch(e){}
       try{v262RenderWar?.()}catch(e){}
       paintBossProgress();
     }finally{state.refreshing=false;state.promise=null}
   })();
   return state.promise;
 }
 /* FINAL guild loader owner: preserve V380 membership/request reliability, then always refresh Boss + War. */
 if(baseGuildLoad){
   v254LoadGuild=async function(){
     const r=await baseGuildLoad.apply(this,arguments);
     if(typeof v254Membership!=='undefined'&&v254Membership?.guild_id){
       /* V7.184: first paint of the guild must not wait for boss + war.
          They refresh just after the core guild screen is visible. */
       const later=()=>queueMicrotask(()=>void refreshSubsystems('guild-load-bg'));
       if(typeof requestAnimationFrame==='function')requestAnimationFrame(later);else later();
     }else{state.stage=null;state.stageError='';}
     return r;
   };
   try{window.v254LoadGuild=v254LoadGuild}catch(e){}
 }
 /* Fresh data when switching guild tabs; old code only changed display:none. */
 document.addEventListener('click',e=>{
   const b=e.target?.closest?.('[data-v254-tab]');if(!b)return;
   const tab=String(b.dataset.v254Tab||'');
   if(tab==='boss')queueMicrotask(async()=>{
     try{
       /* V6.208: Boss-Tab refreshes only the boss subsystem. Do not load/render
          guild war in the background just because the boss tab was opened. */
       if(Date.now()-Number(state.lastBossAt||0)>15000){
         await v255LoadBoss?.();
         state.lastBossAt=Date.now();
       }else{
         try{v255RenderBoss?.()}catch(e){}
       }
       if(Date.now()-Number(state.stageAt||0)>15000)await loadStage();
       paintBossProgress();
     }catch(err){state.issues.push('Gildenboss-Tab: '+String(err?.message||err))}
   });
   if(tab==='war')queueMicrotask(async()=>{try{await v262LoadWar?.();state.lastWarAt=Date.now();v262RenderWar?.()}catch(err){state.issues.push('Gildenkrieg-Tab: '+String(err?.message||err))}});
 },true);
 /* Boss reward already calls v254LoadGuild() and v255LoadBoss(); the final loader above now refreshes the stage too. */
 function health(){
   const issues=[];
   if(typeof v254Membership!=='undefined'&&v254Membership?.guild_id&&!v254Guild)issues.push('Mitgliedschaft vorhanden, aber Gilde fehlt');
   const signed=(Array.isArray(v254Members)?v254Members:[]).filter(x=>x?.boss_signed).length;
   const visible=typeof window.v4118VisibleBossParticipants==='function'?window.v4118VisibleBossParticipants().length:0;
   if(visible<signed)issues.push(`Boss-Anmeldungen: ${signed} gespeichert, ${visible} sichtbar`);
   if(state.stageError)issues.push('Bossfortschritt konnte nicht vom Server geladen werden');
   if(state.stage&&state.stage.wins>0&&state.stage.stage<=state.stage.wins)issues.push(`Bossstufe unplausibel: Stufe ${state.stage.stage}, Siege ${state.stage.wins}`);
   const hs=roundStageFromHp();if(hs&&state.stage&&Math.abs(hs-currentRoundStage(state.stage))>1)issues.push(`Boss-HP entspricht Stufe ${hs}, Anzeige ${currentRoundStage(state.stage)}`);
   return issues;
 }
 window.v4119GuildHealth=health;
 window.v4119GuildState=state;
 window.v4119RefreshGuild=async()=>{if(typeof v254LoadGuild==='function')return v254LoadGuild()};
 window.v4119LoadBossStage=loadStage;
 /* Add synchronous diagnostics to the existing systemtechnik report. */
 function installQA(){
   const runner=window.v4107RunQA||window.v4102RunQA;if(typeof runner!=='function'||window.__v4119QaWrapped)return;
   const wrapped=function(){
     const r=runner.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;
     const add=(name,pass,detail='',severity='error')=>r.results.push({category:'Gilde Deep-Test',name,pass:!!pass,detail:String(detail||''),severity});
     add('Finaler Gildenloader lädt Boss + Gildenkrieg nach',String(v254LoadGuild).includes('refreshSubsystems'));
     add('Mitgliedschaft und Gildenobjekt konsistent',!(v254Membership?.guild_id&&!v254Guild),v254Membership?.guild_id&&!v254Guild?'Membership ohne Guild-Objekt':'');
     const signed=(Array.isArray(v254Members)?v254Members:[]).filter(x=>x?.boss_signed).length,visible=window.v4118VisibleBossParticipants?.().length||0;
     add('Boss-Anmeldungen vollständig sichtbar',visible>=signed,`${visible} sichtbar / ${signed} gespeichert`);
     add('Gildenkrieg-Harz geht auf Harz-Taler',typeof v262ClaimWar==='function'&&String(v262ClaimWar).includes('s.harzTaler')&&!String(v262ClaimWar).includes('s.premium'),typeof v262ClaimWar==='function'?'Belohnungspfad geprüft':'v262ClaimWar fehlt');
     add('Langzeit-Bossfortschritt nicht blind auf 0 gesetzt',!!state.stage||!!state.stageError,state.stage?`Stufe ${state.stage.stage} · Siege ${state.stage.wins}`:state.stageError||'noch nicht geladen','warn');
     add('Bossfortschritt monoton',!state.stage?.regression,state.stage?.regression?'Server-Rücksprung erkannt':'');
     {const hs=roundStageFromHp(),ds=state.stage?currentRoundStage(state.stage):0;add('Boss-HP und Stufe konsistent',!hs||!ds||Math.abs(hs-ds)<=1,hs&&ds?`HP≈Stufe ${hs} · Anzeige ${ds}`:'keine aktive Bossrunde','warn');}
     const h=health();add('Gilden-Laufzeitstatus ohne kritische Inkonsistenz',h.length===0,h.join(' · '),h.length?'warn':'error');
     r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r;
   };
   window.v4107RunQA=wrapped;if(window.v4102RunQA===runner)window.v4102RunQA=wrapped;window.__v4119QaWrapped=true;
 }
 function stamp(){}
 installQA();stamp();
 queueMicrotask(()=>{installQA();stamp();if(document.getElementById('guild')?.classList.contains('active'))v254LoadGuild?.()});
 /* V6.319: QA wrapper is installed immediately; keep one delayed settle check. */
 queueMicrotask(()=>{installQA();stamp()});
 window.addEventListener('pageshow',()=>{stamp();installQA();if(document.getElementById('guild')?.classList.contains('active'))queueMicrotask(()=>v254LoadGuild?.())},{passive:true});
})();
};

/* V8.008-C25 — deferred server-authoritative guild reward claim owner. */
window.v8008C25InstallRewards=function(){
  if(window.__V8008_C25_REWARD_INSTALLER__)return;
  window.__V8008_C25_REWARD_INSTALLER__=true;
/* === v7078-server-guild-reward-claims === */
(()=>{
'use strict';
if(window.__V7078_SERVER_GUILD_REWARDS__)return;
window.__V7078_SERVER_GUILD_REWARDS__=true;

const VERSION='V7.091';
const G={bossClaims:0,warClaims:0,lastError:'',busy:false};
let chain=Promise.resolve();

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const stop=e=>{try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(_){}};
const fmt=v=>Math.max(0,Number(v)||0).toLocaleString('de-DE');
const toast=(title,type='info',detail='')=>{
  try{return window.v063Toast?.(title,type,detail)}
  catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}
};
function serial(fn){const run=()=>Promise.resolve().then(fn);chain=chain.then(run,run);return chain}

async function rpc(name,args={}){
  const x=db();
  if(!x||!uid())throw new Error('SERVER_NOT_READY');
  const {data,error}=await x.rpc(name,args);
  if(error)throw error;
  return one(data);
}

function applyProgress(p){
  if(!p||typeof s==='undefined'||!s)return;
  if(Number.isFinite(Number(p.level)))s.level=Math.max(1,Number(p.level));
  if(Number.isFinite(Number(p.xp)))s.xp=Math.max(0,Number(p.xp));
  if(Number.isFinite(Number(p.gold)))s.gold=Math.max(0,Number(p.gold));
  if(Number.isFinite(Number(p.harz)))s.harzTaler=Math.max(0,Number(p.harz));
  try{
    if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
    localStorage.setItem('grow_idle_save_v1',JSON.stringify(s));
  }catch(_){}
  try{window.v069SyncCurrencies?.()}catch(_){}
  try{window.v441PaintResources?.()}catch(_){}
  try{render?.()}catch(_){}
}

async function refreshGrow(){
  try{
    await window.v7064GrowAuthorityRefresh?.();
    await window.v7077ProgressRefresh?.();
  }catch(_){}
}
function seedLabel(id){
  const m={
    emerald:'Smaragd OG',
    gorilla:'Gorilla Glue',
    amnesia:'Amnesia Haze',
    greencrack:'Green Crack'
  };
  return m[String(id||'')]||String(id||'');
}

async function claimBoss(){
  return serial(async()=>{
    if(G.busy)return;
    G.busy=true;
    const btn=document.getElementById('v255ClaimBossReward');
    if(btn){btn.disabled=true;btn.textContent='Server bucht Belohnung …'}
    try{
      const r=await rpc('v255_claim_guild_boss_reward');
      if(!r?.ok)throw new Error(String(r?.reason||'GUILDBOSS_CLAIM_FAILED'));

      applyProgress(r.progress);
      await refreshGrow();

      G.bossClaims++;
      if(typeof window.v7136ShowServerReward==='function'){
        window.v7136ShowServerReward('guildBoss',r,{});
      }else{
        try{window.v115Alert?.(`+${fmt(r.xp)} EXP · +${fmt(r.gold)} Gold${Number(r.harz)>0?` · +${Number(r.harz)} Harz-Taler`:''}${r.seed?` · 🌰 ${seedLabel(r.seed)}`:''}`,r.won?'Gildenboss besiegt!':'Gildenboss-Belohnung','success')}catch(_){}
      }

      /* Weekly chest + Guild XP are database-triggered by reward_claimed.
         Only refresh local achievement checks; do not emit guildBossWon,
         otherwise historical client reward listeners would run again. */
      try{window.v106CheckAchievements?.(true)}catch(_){}
      try{await window.v254LoadGuild?.()}catch(_){}
      try{await window.v255LoadBoss?.()}catch(_){}
      /* V8.009: claiming yesterday's reward immediately unlocks today's signup gate. */
      try{await window.v7307RefreshBossSignupGate?.(true)}catch(_){}
      return r;
    }catch(e){
      G.lastError=String(e?.message||e);
      toast('Gildenboss-Belohnung nicht verfügbar','warn',G.lastError);
      return null;
    }finally{
      G.busy=false;
      if(btn){btn.disabled=false;btn.textContent='🎁 Gildenboss-Belohnung abholen'}
    }
  });
}

async function claimWar(){
  return serial(async()=>{
    if(G.busy)return;
    G.busy=true;
    const btn=document.getElementById('v262WarClaim');
    if(btn){btn.disabled=true;btn.textContent='Server bucht Belohnung …'}
    try{
      const r=await rpc('v4159_claim_guild_war_reward');
      if(!r?.ok)throw new Error(String(r?.reason||'GUILDWAR_CLAIM_FAILED'));

      applyProgress(r.progress);
      await window.v7077ProgressRefresh?.();

      G.warClaims++;
      toast(
        '🎁 Gildenkrieg-Belohnung',
        'success',
        `+${fmt(r.gold)} Gold · +${fmt(r.xp)} EXP · +${Number(r.harz)||0} Harz-Taler`
      );
      try{await window.v262LoadWar?.()}catch(_){}
      return r;
    }catch(e){
      G.lastError=String(e?.message||e);
      toast('Gildenkrieg-Belohnung fehlgeschlagen','warn',G.lastError);
      return null;
    }finally{
      G.busy=false;
      if(btn){btn.disabled=false;btn.textContent='🎁 Belohnung abholen'}
    }
  });
}

/* Capture ahead of the historical handlers. The old code added the returned
   amounts locally and rolled its own Guildboss seed. Both are retired here:
   the RPC now books progress + Grow seed directly on the server. */
window.addEventListener('click',e=>{
  if(!window.v7081UseAuthority?.('guild_rewards'))return;
  const t=e.target instanceof Element?e.target:null;
  if(!t)return;

  const boss=t.closest('#v255ClaimBossReward');
  if(boss){
    stop(e);
    if(!boss.disabled)void claimBoss();
    return;
  }

  const war=t.closest('#v262WarClaim');
  if(war){
    stop(e);
    if(!war.disabled)void claimWar();
  }
},true);

window.v7078GuildRewardDiagnostics=()=>clone({
  version:VERSION,...G,uid:uid()
});
})();
};
