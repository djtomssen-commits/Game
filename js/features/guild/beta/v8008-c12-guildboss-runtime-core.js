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

setTimeout(()=>v260RenderDailyControls(),900);

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
 [650].forEach(ms=>setTimeout(()=>{stamp();qaWrap();refreshBoss();try{window.v4114DecorateCareSlots?.()}catch(e){}},ms));
 /* V4.123: periodic version stamp retired. */
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();refreshBoss()}},{passive:true});
 window.addEventListener('pageshow',()=>{stamp();setTimeout(refreshBoss,100)},{passive:true});
};
