(()=>{
'use strict';
if(window.__V7101_PUBLIC_PROFILE_COALESCER__)return;
window.__V7101_PUBLIC_PROFILE_COALESCER__=true;

const P={lastAt:0,lastOkAt:0,lastError:'',calls:0,coalesced:0,suppressedLegacyWrites:0};
let timer=0,inflight=null,lastRequestedForce=false;

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;

async function sync(force=false){
  /* V7.228: Server 1 identity must be created only by the atomic character bootstrap.
     Do not manufacture a placeholder profile while name/class are still unset. */
  try{
    if(String(window.v343CurrentServer||'')==='server1'){
      const st=(typeof s!=='undefined'&&s)||null;
      if(!(st?.playerClass&&st?.characterNameSet&&String(st?.characterName||'').trim().length>=2))return false;
    }
  }catch(_){}
  const id=uid(),x=db();
  if(!id||!x||document.hidden)return false;
  const now=Date.now(),minGap=force?2500:15000;
  if(inflight){P.coalesced++;return inflight}
  if(P.lastAt&&now-P.lastAt<minGap){
    P.coalesced++;
    schedule(force,minGap-(now-P.lastAt)+50);
    return true;
  }

  P.lastAt=now;P.calls++;
  inflight=(async()=>{
    try{
      const {data,error}=await x.rpc('v7101_sync_public_profile');
      if(error)throw error;
      const r=one(data)||{};
      if(!r.ok)throw new Error(String(r.reason||'PROFILE_SYNC_REJECTED'));
      P.lastOkAt=Date.now();P.lastError='';
      return true;
    }catch(e){
      P.lastError=String(e?.message||e);
      /* A genuinely new account may not have a public profile row yet.
         Create it once through the existing profile payload, then canonicalize. */
      if(/PROFILE_MISSING/i.test(P.lastError)){
        try{
          const payload=(typeof v073ProfilePayload==='function')?v073ProfilePayload():null;
          if(payload?.id&&payload?.character_name){
            const {error:insErr}=await x.from('profiles').insert(payload);
            if(insErr&&!/duplicate|23505/i.test(String(insErr?.message||insErr)))throw insErr;
            const {data:d2,error:e2}=await x.rpc('v7101_sync_public_profile');
            if(e2)throw e2;
            if(one(d2)?.ok){P.lastOkAt=Date.now();P.lastError='';return true}
          }
        }catch(e2){P.lastError=String(e2?.message||e2)}
      }
      console.warn('[V7.109] public profile sync',e);
      return false;
    }finally{inflight=null}
  })();
  return inflight;
}
function schedule(force=false,delay=null){
  lastRequestedForce=lastRequestedForce||!!force;
  clearTimeout(timer);
  const ms=delay==null?(force?120:1200):Math.max(80,Number(delay)||1200);
  timer=setTimeout(()=>{
    const f=lastRequestedForce;lastRequestedForce=false;
    void sync(f);
  },ms);
  return true;
}

/* Legacy profile mirror writers are intentionally converted into successful
   no-op query builders. The canonical server RPC above is the single writer. */
function fakeUpdate(fields){
  P.suppressedLegacyWrites++;
  schedule(false,900);
  const result=()=>({data:{id:uid()||null,updated_at:new Date().toISOString()},error:null});
  const b={
    eq(){return b},is(){return b},neq(){return b},match(){return b},
    select(){return b},limit(){return b},
    maybeSingle(){return Promise.resolve(result())},
    single(){return Promise.resolve(result())},
    then(resolve,reject){return Promise.resolve(result()).then(resolve,reject)}
  };
  return b;
}
window.v7101ProfileUpdate=fakeUpdate;
window.v7101SyncPublicProfile=sync;
window.v7101SchedulePublicProfileSync=schedule;
window.v7101PublicProfileDiagnostics=()=>({...P,inflight:!!inflight,uid:uid()});

window.addEventListener('growlegends:first-playable',()=>schedule(true,600),{passive:true});
window.addEventListener('pageshow',()=>{if(window.v7206StartupBusy?.())return;if(Date.now()-P.lastOkAt>30000)schedule(true,350)},{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&Date.now()-P.lastOkAt>60000)schedule(true,350);
},{passive:true});
setInterval(()=>{
  if(!document.hidden&&uid()&&Date.now()-P.lastOkAt>55000)schedule(false,100);
},60000);
})();
