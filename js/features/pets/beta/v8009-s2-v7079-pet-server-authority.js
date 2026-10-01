(()=>{
'use strict';
if(window.__V7079_PET_SERVER_AUTHORITY__)return;
window.__V7079_PET_SERVER_AUTHORITY__=true;

const VERSION='V7.091';
const P={ready:false,enforce:false,revision:0,total:0,lastSync:0,lastError:'',blockedLocalGrants:0,serverPresentations:0};
let inflight=null,permit=false;

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const baseGrant=typeof window.v686GrantPet==='function'?window.v686GrantPet:null;
const baseTry=typeof window.v686TryPetDrop==='function'?window.v686TryPetDrop:null;
const baseGrow=typeof window.v688PetGrowHarvest==='function'?window.v688PetGrowHarvest:null;
const baseEndgame=typeof window.v688PetEndgameWin==='function'?window.v688PetEndgameWin:null;

function ensure(){
  if(typeof s==='undefined'||!s)return false;
  s.v686PetAlbum=(s.v686PetAlbum&&typeof s.v686PetAlbum==='object')?s.v686PetAlbum:{};
  s.v686PetAlbum.found=(s.v686PetAlbum.found&&typeof s.v686PetAlbum.found==='object')?s.v686PetAlbum.found:{};
  s.v686PetAlbum.dropState=(s.v686PetAlbum.dropState&&typeof s.v686PetAlbum.dropState==='object')?s.v686PetAlbum.dropState:{};
  return true;
}

function repaint(){
  try{window.v686InvalidatePetCache?.()}catch(_){}
  try{window.v686RefreshPetAlbum?.(true)}catch(_){}
  try{window.v6104UpdatePetIndicators?.()}catch(_){}
  try{window.v446PaintCombatPower?.()}catch(_){}
  try{render?.()}catch(_){}
}

function apply(r,{paint=true}={}){
  if(!r?.ok||!ensure())return false;
  P.ready=true;
  P.enforce=String(r.mode||'')==='enforce';
  P.revision=Math.max(0,Number(r.revision)||0);
  P.total=Math.max(0,Number(r.total)||0);
  P.lastSync=Date.now();
  P.lastError='';

  if(P.enforce){
    if(r.found&&typeof r.found==='object')s.v686PetAlbum.found=clone(r.found);
    if(Number.isFinite(Number(r.standardSinceLegendary))){
      s.v686PetAlbum.dropState.standardSinceLegendary=Math.max(0,Number(r.standardSinceLegendary));
    }
    try{
      if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
      localStorage.setItem('grow_idle_save_v1',JSON.stringify(s));
    }catch(_){}
    if(paint)repaint();
  }
  return true;
}

async function refresh(paint=true){
  if(!window.v7081UseAuthority?.('pets')){P.ready=true;P.enforce=false;return null;}
  if(inflight)return inflight;
  const x=db(),id=uid();if(!x||!id)return null;
  /* V7.232: Server 1 is fail-closed for collection state. Before its first
     confirmed pet snapshot, never display a stale local/Beta album as fallback. */
  if(String(window.GROW_SERVER_ID||window.v343CurrentServer||'')==='server1'&&!P.ready&&ensure()){
    s.v686PetAlbum.found={};
    s.v686PetAlbum.dropState.standardSinceLegendary=0;
    if(paint)repaint();
  }
  inflight=(async()=>{
    try{
      const {data,error}=await x.rpc('v7079_pet_state');
      if(error)throw error;
      const r=one(data);
      apply(r,{paint});
      return r;
    }catch(e){
      P.lastError=String(e?.message||e);
      console.warn('[V7079] pet hydrate',e);
      if(String(window.GROW_SERVER_ID||window.v343CurrentServer||'')==='server1'&&ensure()){
        s.v686PetAlbum.found={};
        s.v686PetAlbum.dropState.standardSinceLegendary=0;
        if(paint)repaint();
      }
      return null;
    }finally{inflight=null}
  })();
  return inflight;
}

/* Only server-confirmed drops may use the legacy popup/reward renderer.
   The renderer is allowed for one call, then the canonical collection is restored
   immediately until the server snapshot is applied by the calling bridge. */
window.v7079PresentServerPet=function(petId,quality,source=''){
  if(!baseGrant)return false;
  if(!P.enforce)return baseGrant(petId,quality,source);

  ensure();
  const foundBefore=clone(s.v686PetAlbum.found);
  const pityBefore=Number(s.v686PetAlbum.dropState.standardSinceLegendary)||0;
  let ok=false;
  permit=true;
  try{
    ok=!!baseGrant(petId,quality,source);
    if(ok)P.serverPresentations++;
  }catch(e){
    console.warn('[V7079] server pet presentation',e);
  }finally{
    permit=false;
    s.v686PetAlbum.found=foundBefore;
    s.v686PetAlbum.dropState.standardSinceLegendary=pityBefore;
  }
  return ok;
};

/* Kill every historical client-side random pet roll while Pets=enforce.
   Existing server Quest/Dungeon/Grow/Worldboss/Endgame paths remain authoritative. */
if(baseGrant){
  const wrapped=function(){
    if(P.enforce&&!permit){
      P.blockedLocalGrants++;
      return false;
    }
    return baseGrant.apply(this,arguments);
  };
  wrapped.__v7079PetAuthority=true;
  window.v686GrantPet=wrapped;
}
if(baseTry){
  window.v686TryPetDrop=function(){
    if(P.enforce)return null;
    return baseTry.apply(this,arguments);
  };
}
if(baseGrow){
  window.v688PetGrowHarvest=function(){
    if(P.enforce)return null;
    return baseGrow.apply(this,arguments);
  };
}
if(baseEndgame){
  window.v688PetEndgameWin=function(){
    if(P.enforce)return null;
    return baseEndgame.apply(this,arguments);
  };
}

function boot(){setTimeout(()=>{if(!window.v7206StartupBusy?.())void refresh(true)},350)}
window.addEventListener('growlegends:account-ready',boot,{passive:true});
window.addEventListener('pageshow',()=>{if(Date.now()-P.lastSync>120000)setTimeout(()=>void refresh(true),650)},{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&Date.now()-P.lastSync>120000)setTimeout(()=>void refresh(false),300);
},{passive:true});
setInterval(()=>{
  if(document.hidden||!P.enforce||!uid()||Date.now()-P.lastSync<300000)return;
  void refresh(false);
},60000);
setTimeout(()=>{if(!P.lastSync&&!window.v7206StartupBusy?.())boot()},1500);

window.v7079PetAuthorityRefresh=()=>refresh(true);
window.v7079PetAuthorityDiagnostics=()=>clone({
  version:VERSION,...P,uid:uid()
});
})();
