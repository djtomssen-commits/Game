(()=>{
'use strict';
if(window.__V7070_GROW_HYDRATION__)return;
window.__V7070_GROW_HYDRATION__=true;

const VERSION='V7.091';
let hydrated=false, hydrating=null, hydratedUid='', lastHydratedAt=0, lastRevision=0;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const row=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
function syncLegacyGrowRecovery(reason='server'){
  if(window.v7081UseAuthority?.('grow'))return false;
  try{
    const id=uid();if(!id||!ensure())return false;
    const k='growLegendsGrowStateV499:'+id;
    let old=null;try{old=JSON.parse(localStorage.getItem(k)||'null')}catch(_){old=null}
    const grow=clone(s.grow)||{};
    const rev=Math.max(
      1,
      Number(old?.rev)||0,
      Number(old?.grow?.v499Revision)||0,
      Number(grow?.v499Revision)||0
    )+1;
    grow.v499Revision=rev;
    s.grow.v499Revision=rev;
    localStorage.setItem(k,JSON.stringify({
      owner:id,rev,savedAt:Date.now(),reason:'server-v7075:'+String(reason||'server'),core:'',grow
    }));
    localStorage.setItem('grow_idle_save_v1',JSON.stringify(s));
    return true;
  }catch(e){console.warn('[V7075] legacy grow snapshot sync',e);return false}
}
window.v7075SyncLegacyGrowRecovery=syncLegacyGrowRecovery;

function growScreen(){return document.getElementById('grow')}
function showBarrier(detail='Serverstand wird geladen …'){
  const g=growScreen();if(!g)return;
  let o=document.getElementById('v7070GrowSync');
  if(!o){
    o=document.createElement('div');o.id='v7070GrowSync';
    o.innerHTML='<div class="v7070-leaf">🌱</div><b>Growroom wird synchronisiert</b><span></span>';
    g.appendChild(o);
  }
  const s=o.querySelector('span');if(s)s.textContent=detail;
  g.classList.add('v7070-grow-syncing');
}
function hideBarrier(){growScreen()?.classList.remove('v7070-grow-syncing')}

function ensure(){
  if(typeof s==='undefined'||!s)return false;
  s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
  s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
  s.grow.plants=Array.isArray(s.grow.plants)?s.grow.plants:[];
  s.grow.equipment=(s.grow.equipment&&typeof s.grow.equipment==='object')?s.grow.equipment:{lamp:0,pots:0};
  s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};
  s.grow.v492.stats=(s.grow.v492.stats&&typeof s.grow.v492.stats==='object')?s.grow.v492.stats:{};
  s.grow.v492.week=(s.grow.v492.week&&typeof s.grow.v492.week==='object')?s.grow.v492.week:{};
  s.grow.v6130=(s.grow.v6130&&typeof s.grow.v6130==='object')?s.grow.v6130:{};
  s.grow.v6160=(s.grow.v6160&&typeof s.grow.v6160==='object')?s.grow.v6160:{};
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  return true;
}
function applyServer(r){
  if(!r||r.ok!==true||!ensure())return false;
  if(r.grow_seeds&&typeof r.grow_seeds==='object')s.grow.seeds=clone(r.grow_seeds);
  if(Array.isArray(r.plants))s.grow.plants=clone(r.plants);
  if(Number.isFinite(Number(r.time_seeds)))s.timeSeeds=Math.max(0,Number(r.time_seeds));
  if(r.genetics&&typeof r.genetics==='object')s.grow.v6130=clone(r.genetics);
  if(r.orders&&typeof r.orders==='object'){
    const old=s.grow.v6160||{};
    const canonicalOrders=clone(r.orders);
    s.grow.v6160={...old,...canonicalOrders,
      history:Array.isArray(old.history)?old.history:[],
      rewardHistory:Array.isArray(old.rewardHistory)?old.rewardHistory:[]};
    window.__V7208_GROW_ORDERS_CANONICAL__=clone(canonicalOrders);
  }
  const g=r.grow_state;
  if(g&&typeof g==='object'){
    s.grow.roomLevel=Math.max(1,Number(g.room_level)||1);
    s.grow.equipment.lamp=Math.max(0,Number(g.lamp_level)||0);
    s.grow.equipment.pots=Math.max(0,Number(g.pots_level)||0);
    const z=s.grow.v492;
    z.masteryXp=Math.max(0,Number(g.mastery_xp)||0);
    z.bag=Array.isArray(g.bag)?clone(g.bag):[];
    z.active=g.active&&typeof g.active==='object'?clone(g.active):null;
    z.stats.harvested=Math.max(0,Number(g.harvested)||0);
    z.stats.perfect=Math.max(0,Number(g.perfect)||0);
    z.stats.splus=Math.max(0,Number(g.splus)||0);
    z.stats.mutationCount=Math.max(0,Number(g.mutation_count)||0);
    z.stats.prismatic=Math.max(0,Number(g.prismatic)||0);
    z.week={
      key:String(g.week_key||z.week.key||''),
      harvested:Math.max(0,Number(g.week_harvested)||0),
      perfect:Math.max(0,Number(g.week_perfect)||0),
      mutations:Math.max(0,Number(g.week_mutations)||0),
      claimed:!!g.week_claimed
    };
    lastRevision=Math.max(lastRevision,Number(g.revision)||0);
  }
  if(r.weather&&typeof r.weather==='object')window.GL_WEATHER=clone(r.weather);
  if(Number.isFinite(Number(r.level)))s.level=Math.max(1,Number(r.level));
  if(Number.isFinite(Number(r.xp)))s.xp=Math.max(0,Number(r.xp));
  if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
  if(Number.isFinite(Number(r.harz)))s.harzTaler=Math.max(0,Number(r.harz));
  if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));
  /* V7.136: no synchronous full-state compatibility snapshots during normal
     authoritative hydration. The in-memory state is already canonical. */
  if(!window.v7081UseAuthority?.('grow')){
    syncLegacyGrowRecovery('hydrate');
    try{localStorage.setItem('grow_idle_save_v1',JSON.stringify(s))}catch(_){}
  }
  return true;
}

async function hydrate(force=false,silent=false){
  if(!window.v7081UseAuthority?.('grow')){hydrated=false;hideBarrier();return false;}
  const id=uid();
  if(!id){if(!silent)showBarrier('Warte auf die Konto-Verbindung …');return false}
  const diag=()=>{try{return window.v7065GrowAuthorityDiagnostics?.()||null}catch(_){return null}};
  const d0=diag();
  if(!force&&d0?.ready&&d0?.enabled){hydrated=true;hydratedUid=id;lastHydratedAt=Date.now();hideBarrier();return true}
  if(hydrating)return hydrating;
  if(!silent)showBarrier('Serverstand wird geladen …');
  hydrating=(async()=>{
    try{
      const r=await window.v7065GrowAuthorityRefresh?.();
      const d=diag();
      if(r?.ok||d?.enabled){
        hydrated=true;hydratedUid=id;lastHydratedAt=Date.now();
        lastRevision=Math.max(lastRevision,Number(r?.grow_state?.revision)||0);
        window.__V7070_GROW_SERVER_MODE__=true;hideBarrier();return true;
      }
      return false;
    }catch(e){console.warn('[V7148] grow hydration delegate',e);return false}
    finally{hydrating=null}
  })();
  return hydrating;
}

/* Never let a later generic cloud/local restore overwrite an already verified
   server Grow state. Preserve the current canonical Grow snapshot across it. */
try{
  if(typeof v075ApplyCloudSave==='function'&&!window.__V7070_CLOUD_GROW_GUARD__){
    const base=v075ApplyCloudSave;
    v075ApplyCloudSave=async function(){
      const protect=hydrated&&hydratedUid===uid()&&ensure();
      const growKeep=protect?clone(s.grow):null;
      const timeKeep=protect?clone(s.timeSeeds):null;
      const r=await base.apply(this,arguments);
      if(protect&&growKeep){
        s.grow=growKeep;s.timeSeeds=timeKeep;
        if(!window.v7081UseAuthority?.('grow'))try{localStorage.setItem('grow_idle_save_v1',JSON.stringify(s))}catch(_){}
      }
      return r;
    };
    window.v075ApplyCloudSave=v075ApplyCloudSave;
    window.__V7070_CLOUD_GROW_GUARD__=true;
  }
}catch(e){console.warn('[V7070] cloud grow guard',e)}

/* Do not render stale local/cloud plants while the authoritative snapshot is
   still loading. This removes the "harvested plant appears, then disappears"
   and "real plant appears seconds later" flicker. */
let baseRender=null;
try{
  if(typeof renderGrow==='function'&&!window.__V7070_RENDER_GUARD__){
    baseRender=renderGrow;
    const wrapped=function(){
      const id=uid();
      const d=window.v7065GrowAuthorityDiagnostics?.();
      const sameAccount=!!id&&d?.authorityUid===id;
      if(id&&(!d?.enabled||!d?.ready||!sameAccount)){
        hydrated=false;
        showBarrier(sameAccount?'Serverstand wird geladen …':'Kontostand wird synchronisiert …');
        void hydrate(!sameAccount);
        return;
      }
      if(id&&d?.enabled&&d?.ready&&sameAccount&&!hydrated){hydrated=true;hydratedUid=id;lastHydratedAt=Date.now();hideBarrier();}
      return baseRender.apply(this,arguments);
    };
    wrapped.__v7069=true;
    renderGrow=wrapped;window.renderGrow=wrapped;
    window.__V7070_RENDER_GUARD__=true;
  }
}catch(e){console.warn('[V7070] render guard',e)}

/* V7.147: V7065 is the sole Grow server-state owner. Historical V7070 startup,
   pageshow, visibility and 90s refreshes are retired to avoid a second RPC/render lane. */
window.__V7070_AUTO_REFRESH_RETIRED_V7148__=true;
window.v7070GrowHydrationRefresh=()=>hydrate(false,true);
window.v7070GrowHydrationDiagnostics=()=>({
  version:VERSION,hydrated,hydratedUid,lastHydratedAt,lastRevision,
  uid:uid(),serverMode:!!window.__V7070_GROW_SERVER_MODE__
});
})();
