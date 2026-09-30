
(()=>{
'use strict';
if(window.__V7110_QUEST_AUTHORITY_SYNC__)return;
window.__V7110_QUEST_AUTHORITY_SYNC__=true;

const VERSION='V7.110';
const S={syncing:null,lastAt:0,lastError:'',lastEnergy:null,lastRevision:null};
const row=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const enforced=()=>{
  try{
    if(typeof window.v7081UseAuthority==='function'&&window.v7081UseAuthority('quest'))return true;
    return String(window.v7040AuthorityDiagnostics?.()?.domains?.quest||'')==='enforce';
  }catch(_){return false}
};
const serverOffer=q=>!!(q&&typeof q==='object'&&(q.v7043ServerOffer||q.v6359ServerOffer||/^srv_q_/.test(String(q.id||''))));
const questSig=()=>{try{return JSON.stringify({
  energy:Math.max(0,Number(s?.energy)||0),
  offers:(s?.quests?.offers||[]).map(q=>[String(q?.id||''),Number(q?.energy)||0,Number(q?.v321DampfBase)||0]),
  active:s?.quests?.active?[String(s.quests.active.id||''),Number(s.quests.active.endsAt||s.quests.active.end||0)]:null,
  elite:String(s?.quests?.eliteOffer?.id||'')
})}catch(_){return ''}};

function persistLocal(){
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
}
function applyQuestState(q){
  if(!q?.ok)return false;
  s.quests=(s?.quests&&typeof s.quests==='object')?s.quests:{offers:[],active:null,eliteOffer:null};
  if(Number.isFinite(Number(q.energy))){s.energy=Math.max(0,Number(q.energy));S.lastEnergy=s.energy}
  if(Array.isArray(q.offers))s.quests.offers=clone(q.offers);
  if('active' in q)s.quests.active=q.active?clone(q.active):null;
  if('eliteOffer' in q)s.quests.eliteOffer=q.eliteOffer?clone(q.eliteOffer):null;
  if(q.day){
    const day=String(q.day);s.v026DampfDay=day;
    s.v271DampfRefill={day,count:Math.max(0,Number(q.refills)||0)};
    const d=q.daily||{};
    s.v109HarzDaily={day,firstQuest:!!d.firstQuest,questEnergy:Math.max(0,Number(d.questEnergy)||0),energyHarz:Math.max(0,Number(d.energyHarz)||0)};
  }
  S.lastRevision=Number(q.revision)||null;S.lastAt=Date.now();S.lastError='';
  return true;
}
function paint(){
  try{window.v069SyncCurrencies?.()}catch(_){}
  try{window.v271PaintDampf?.()}catch(_){}
  try{window.renderQuests?.()}catch(_){}
}
async function sync(force=false,paintNow=true){
  if(!enforced())return null;
  if(window.__V7214_QUEST_MUTATION_BUSY__===true)return null;
  const now=Date.now();
  if(!force&&S.lastAt&&now-S.lastAt<2500)return null;
  if(S.syncing)return S.syncing;
  const x=db();if(!x)return null;
  S.syncing=(async()=>{
    try{
      let q=null;
      if(typeof window.v7045QuestCanonicalState==='function')q=await window.v7045QuestCanonicalState(!!force);
      else{
        const {data,error}=await x.rpc('v7044_get_quest_state');if(error)throw error;
        q=row(data);
      }
      if(!q?.ok)throw new Error(String(q?.reason||'QUEST_STATE_REJECTED'));
      const before=questSig();
      applyQuestState(q);persistLocal();
      if(paintNow&&before!==questSig())paint();
      else if(paintNow){try{window.v069SyncCurrencies?.();window.v271PaintDampf?.()}catch(_){}}
      return q;
    }catch(e){S.lastError=String(e?.message||e);console.warn('[V7.110] quest authority sync',e);return null}
    finally{S.syncing=null}
  })();
  return S.syncing;
}

/* Server offers already contain their canonical cost. Legacy level-band painters must not rewrite it. */
try{
  const base=window.v321QuestDampfBase||((typeof v321QuestDampfBase==='function')?v321QuestDampfBase:null);
  if(typeof base==='function'&&!base.__v7110ServerCost){
    const wrapped=function(q,level){
      if(enforced()&&serverOffer(q)){
        const n=Number(q?.v321DampfBase??q?.energy);
        if(Number.isFinite(n)&&n>0)return Math.floor(n);
      }
      return base.apply(this,arguments);
    };
    wrapped.__v7110ServerCost=true;window.v321QuestDampfBase=wrapped;try{v321QuestDampfBase=wrapped}catch(_){}
  }
}catch(e){console.warn('[V7.110] quest cost owner',e)}

try{
  const base=window.v271NormalizeQuestOffers||((typeof v271NormalizeQuestOffers==='function')?v271NormalizeQuestOffers:null);
  if(typeof base==='function'&&!base.__v7110ServerOffers){
    const wrapped=function(){
      const offers=s?.quests?.offers;
      if(enforced()&&Array.isArray(offers)&&offers.length&&offers.every(serverOffer)){
        offers.forEach(q=>{
          const n=Math.max(1,Math.floor(Number(q?.v321DampfBase??q?.energy)||1));
          q.energy=n;q.v321DampfBase=n;q.v271DampfCost=true;
        });
        return offers;
      }
      return base.apply(this,arguments);
    };
    wrapped.__v7110ServerOffers=true;window.v271NormalizeQuestOffers=wrapped;try{v271NormalizeQuestOffers=wrapped}catch(_){}
  }
}catch(e){console.warn('[V7.110] quest offer owner',e)}

/* Always reconcile Dampf/offers immediately before a server-authoritative quest start. */
try{
  const base=window.startQuest;
  if(typeof base==='function'&&!base.__v7110Preflight){
    const wrapped=async function(i){
      if(!enforced())return base.apply(this,arguments);
      const idx=Number(i);
      const before=s?.quests?.offers?.[idx];
      const beforeServer=serverOffer(before);
      const beforeRole=String(before?.v309Role||'');
      const beforeCost=Math.max(1,Math.floor(Number(before?.v321DampfBase??before?.energy)||1));
      await sync(true);
      const q=s?.quests?.offers?.[idx];
      const afterRole=String(q?.v309Role||'');
      const afterCost=Math.max(1,Math.floor(Number(q?.v321DampfBase??q?.energy)||1));
      /* V7.130: ids are intentionally opaque and must not be used as a UI
         identity check. Only stop when a non-server legacy card would change
         its actual role/cost after canonical reconciliation. */
      if(idx>=0&&idx<=2&&before&&!beforeServer&&q&&(beforeRole!==afterRole||beforeCost!==afterCost)){
        try{window.renderQuests?.()}catch(_){}
        try{window.v063Toast?.('Aufträge aktualisiert','info','Die Questangebote wurden mit dem Server abgeglichen. Bitte den gewünschten Auftrag erneut antippen.')}catch(_){}
        return false;
      }
      const need=Math.max(1,Math.floor(Number(q?.v321DampfBase??q?.energy)||1));
      const have=Math.max(0,Math.floor(Number(s?.energy)||0));
      if(q&&have<need){
        try{window.v063Toast?.('Quest nicht gestartet','warn',`Nicht genug Dampf. Serverstand: ${have} · benötigt: ${need}.`)}catch(_){}
        return false;
      }
      const r=await base.apply(this,arguments);
      if(r&&Number.isFinite(Number(r.energy))){S.lastEnergy=Math.max(0,Number(r.energy));S.lastAt=Date.now()}
      return r;
    };
    wrapped.__v7110Preflight=true;wrapped.__v7110Base=base;window.startQuest=wrapped;try{startQuest=wrapped}catch(_){}
  }
}catch(e){console.warn('[V7.110] quest preflight install',e)}

/* V7.122: route wrapper retired. The shared navigation owner performs one
   canonical quest sync without adding another v032Go layer. */
window.v7110SyncQuestAuthority=sync;
window.v7110QuestAuthorityEnforced=enforced;
window.__V7110_QUEST_ROUTE_WRAP_RETIRED__='v7122-shared-event';

window.addEventListener('growlegends:account-ready',()=>{const run=()=>{if(Date.now()-Number(S.lastAt||0)>60000)void sync(false)};if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(run,350);else setTimeout(run,420)},{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>{if(enforced()&&Date.now()-Number(S.lastAt||0)>60000)void sync(false)},700),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&enforced()&&Date.now()-Number(S.lastAt||0)>60000)setTimeout(()=>void sync(false),250)},{passive:true});

window.v7110QuestDiagnostics=()=>({version:VERSION,enforced:enforced(),lastAt:S.lastAt,lastEnergy:S.lastEnergy,lastRevision:S.lastRevision,lastError:S.lastError,offers:(s?.quests?.offers||[]).map(q=>({id:q?.id||'',energy:q?.energy,server:serverOffer(q)}))});
})();
