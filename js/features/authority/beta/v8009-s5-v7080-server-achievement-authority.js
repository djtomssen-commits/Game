(()=>{
'use strict';
if(window.__V7080_ACHIEVEMENT_AUTHORITY__)return;
window.__V7080_ACHIEVEMENT_AUTHORITY__=true;

const VERSION='V7.091';
const A={
  ready:false,enforce:false,revision:0,completed:0,
  lastSync:0,lastError:'',metrics:{},pending:false,painting:false,
  serverUid:'',serverDone:{}
};
let inflight=null,timer=null,pendingShow=false;

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const row=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const n=v=>Math.max(0,Number(v)||0);
const legacyOpen=typeof window.v106OpenBook==='function'?window.v106OpenBook:null;
const legacyCheck=typeof window.v106CheckAchievements==='function'?window.v106CheckAchievements:null;

function resetAccountScope(){
  const u=uid();
  if(u===A.serverUid)return false;
  A.serverUid=u;A.serverDone={};A.ready=false;A.enforce=false;A.revision=0;A.completed=0;A.lastSync=0;A.lastError='';A.metrics={};pendingShow=false;
  return true;
}

window.v7080ResetAccountScope=resetAccountScope;

function ensure(){
  if(typeof s==='undefined'||!s)return false;
  s.v106Achievements=(s.v106Achievements&&typeof s.v106Achievements==='object')?s.v106Achievements:{};
  s.v106Achievements.done=(s.v106Achievements.done&&typeof s.v106Achievements.done==='object')?s.v106Achievements.done:{};
  s.v106Achievements.stats=(s.v106Achievements.stats&&typeof s.v106Achievements.stats==='object')?s.v106Achievements.stats:{};
  return true;
}

function metricFor(id){
  const m=A.metrics||{}, k=String(id||'');
  if(/^lvl\d+$/.test(k))return n(m.level);
  if(/^d\d+$/.test(k))return n(m.dungeonCompleted);
  if(/^fight\d+$/.test(k))return n(m.dungeonWins);
  if(/^gold/.test(k))return n(m.goldEarned);
  if(/^grow492_first$|^grow492_25$/.test(k))return n(m.growHarvested);
  if(/^grow492_perfect/.test(k))return n(m.growPerfect);
  if(/^grow492_mut/.test(k))return n(m.growMutations);
  if(k==='grow492_book8')return n(m.growDiscovered);
  if(k==='grow492_prism')return n(m.growPrismatic);
  if(/^groworders/.test(k))return n(m.growOrders);
  if(/^genetics/.test(k))return n(m.geneticsCrosses);
  if(/^grow\d+$/.test(k))return n(m.plantsGrown);
  if(/^quest\d+$/.test(k))return n(m.questsDone);
  if(k==='pvp_fight1')return n(m.pvpFights);
  if(/^pvp_win/.test(k)||k==='pvp10'||k==='pvp100')return n(m.pvpWins);
  if(/^pvp_buds/.test(k))return n(m.pvpBuds);
  if(k==='equip6')return n(m.equipCount);
  if(k==='gemall')return n(m.allGemmed);
  if(k==='enchall')return n(m.allEnchanted);
  if(/^harz/.test(k))return n(m.harz);
  if(/^power/.test(k))return n(m.power);
  if(/^wb/.test(k))return n(m.worldbossWins);
  if(/^myth/.test(k))return n(m.mythicCount);
  if(/^legend/.test(k))return n(m.legendaryCount);
  if(k==='talent10'||k==='talent50')return n(m.talentSpent);
  if(k==='talent100branch')return n(m.talentBranchMax);
  if(k==='talent250')return n(m.talentM5);
  if(k==='talent300')return n(m.talentM6);
  if(/^tower/.test(k))return n(m.towerBestFloor);
  if(/^login/.test(k))return n(m.loginTotal);
  if(/^petmyth/.test(k))return n(m.petMythicRows);
  if(/^petrow/.test(k))return n(m.petRows);
  if(/^pet\d+$/.test(k))return n(m.petFound);
  if(/^forge_d/.test(k))return n(m.forgeDismantled);
  if(/^forge_c/.test(k))return n(m.forgeCrafted);
  if(/^rift_boss/.test(k))return n(m.riftBossWins);
  if(/^rift_win/.test(k))return n(m.riftWins);
  if(/^rift_/.test(k))return n(m.riftsDone);
  if(k==='shift1')return n(m.shiftCompleted);
  if(/^shift(?:10h|50h|100h|250h)$/.test(k))return n(m.shiftHours);
  if(k==='shift_full10')return n(m.shiftFull10);
  if(k==='shift_lucky1')return n(m.shiftRareFinds);
  if(/^frame\d+$/.test(k))return n(m.frameCount);
  return 0;
}

function installGetters(){
  if(!window.v7081UseAuthority?.('achievements'))return;
  try{
    if(typeof V106_ACH==='undefined'||!Array.isArray(V106_ACH))return;
    V106_ACH.forEach(r=>{
      if(!Array.isArray(r)||!r[0])return;
      const id=String(r[0]);
      r[3]=()=>metricFor(id);
    });
  }catch(e){console.warn('[V7080] achievement getters',e)}
}

function titleFor(id){
  try{
    const r=Array.isArray(V106_ACH)?V106_ACH.find(x=>String(x?.[0])===String(id)):null;
    return String(r?.[1]||id);
  }catch(_){return String(id)}
}
function attrName(){
  try{return typeof v106MainAttrName==='function'?v106MainAttrName():'Hauptattribut'}catch(_){return'Hauptattribut'}
}
function repaintBook(){
  if(!legacyOpen||A.painting||!document.querySelector('#v106Overlay.show'))return;
  A.painting=true;
  try{legacyOpen()}catch(e){console.warn('[V7080] repaint book',e)}
  finally{A.painting=false}
}
function paint(){
  try{window.v446PaintCombatPower?.()}catch(_){}
  try{window.v069SyncCurrencies?.()}catch(_){}
  try{window.v6104UpdatePetIndicators?.()}catch(_){}
  try{repaintBook()}catch(_){}
}

function apply(r,show=false){
  if(!r?.ok||!ensure())return false;

  resetAccountScope();
  const wasReady=A.ready;
  const beforeServer=new Set(Object.keys(A.serverDone||{}));

  A.ready=true;
  A.enforce=String(r.mode||'')==='enforce';
  A.revision=n(r.revision);
  A.completed=n(r.completed);
  A.metrics=(r.metrics&&typeof r.metrics==='object')?clone(r.metrics):{};
  A.lastSync=Date.now();
  A.lastError='';

  if(!A.enforce)return true;

  const nextDone=clone(r.done||{});
  s.v106Achievements.done=nextDone;
  s.v106Achievements.stats=clone(r.stats||{});
  A.serverDone=clone(nextDone);

  s.v435GoldLifetime=(s.v435GoldLifetime&&typeof s.v435GoldLifetime==='object')?s.v435GoldLifetime:{version:1};
  s.v435GoldLifetime.version=1;
  s.v435GoldLifetime.earned=n(r?.stats?.goldEarned);
  s.v435GoldLifetime.lastGold=n(s.gold);

  try{
    if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
    localStorage.setItem('grow_idle_save_v1',JSON.stringify(s));
  }catch(_){}

  installGetters();
  paint();

  if(show&&wasReady){
    /* V7.214: compare server snapshot -> server snapshot. Local s can be replaced
       during account hydration and must never make old achievements look new. */
    const fresh=Object.keys(A.serverDone||{}).filter(id=>!beforeServer.has(id));
    if(fresh.length){
      try{window.v6111Sfx?.('achievement')}catch(_){}
      fresh.slice(0,5).forEach((id,idx)=>{
        setTimeout(()=>{
          try{
            window.v063Toast?.(
              '🏆 Erfolg abgeschlossen!',
              'success',
              `${titleFor(id)} · +1 ${attrName()}`
            );
          }catch(_){}
        },90+idx*140);
      });
    }
  }
  return true;
}

async function refresh(show=false,force=false){
  resetAccountScope();
  if(!window.v7081UseAuthority?.('achievements')){A.ready=true;A.enforce=false;return null;}
  if(inflight)return inflight;
  if(A.lastSync&&Date.now()-A.lastSync<(force?15000:60000))return null;
  const x=db(),id=uid();if(!x||!id)return null;

  inflight=(async()=>{
    try{
      const {data,error}=await x.rpc('v7080_achievement_state');
      if(error)throw error;
      const r=row(data);
      apply(r,show);
      return r;
    }catch(e){
      A.lastError=String(e?.message||e);
      console.warn('[V7080] achievement hydrate',e);
      return null;
    }finally{
      inflight=null;
    }
  })();
  return inflight;
}

function schedule(show=false,ms=120){
  pendingShow=pendingShow||!!show;
  clearTimeout(timer);
  timer=setTimeout(()=>{
    const sshow=pendingShow;pendingShow=false;
    void refresh(sshow,false);
  },Math.max(50,Number(ms)||120));
  return false;
}

/* The Illegal Book may still receive dozens of historical client-side calls.
   Under enforce those calls can only request a server refresh; they can no
   longer create an achievement or its +1 attribute locally. */
function serverCheck(show=true){
  if(!window.v7081UseAuthority?.('achievements')){
    try{return legacyCheck?legacyCheck(show):false}catch(_){return false}
  }
  if(A.painting)return false;
  if(!A.enforce&&!A.ready){
    schedule(false,70);
    return false;
  }
  if(A.enforce)return schedule(!!show,90);
  return false;
}
try{v106CheckAchievements=serverCheck}catch(_){}
window.v106CheckAchievements=serverCheck;

if(legacyOpen){
  const serverOpen=function(){
    if(!window.v7081UseAuthority?.('achievements')){
      return legacyOpen.apply(this,arguments);
    }
    installGetters();
    A.painting=true;
    let out;
    try{out=legacyOpen.apply(this,arguments)}
    finally{A.painting=false}
    void refresh(false,false).then(()=>repaintBook());
    return out;
  };
  try{v106OpenBook=serverOpen}catch(_){}
  window.v106OpenBook=serverOpen;
}

function boot(){
  resetAccountScope();
  installGetters();
  /* V7.095: achievement state hydrates on demand instead of competing at boot. */
}
window.addEventListener('growlegends:account-ready',boot,{passive:true});
window.addEventListener('pageshow',()=>{if(Date.now()-A.lastSync>120000)setTimeout(()=>void refresh(false,true),650)},{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&Date.now()-A.lastSync>120000)setTimeout(()=>void refresh(false,false),300);
},{passive:true});
setTimeout(()=>{if(!A.lastSync)boot()},1600);

window.v7080AchievementRefresh=(show=false)=>refresh(!!show,true);
window.v7080AchievementDiagnostics=()=>clone({
  version:VERSION,...A,uid:uid()
});
})();
