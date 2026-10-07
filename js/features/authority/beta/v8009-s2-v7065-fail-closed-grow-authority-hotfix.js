(()=>{
'use strict';
if(window.__V7065_GROW_FAIL_CLOSED__)return;
window.__V7065_GROW_FAIL_CLOSED__=true;
const VERSION='V7.091';
const D={enabled:false,ready:false,busy:false,lastError:'',checks:0,actions:0,lastAction:null};
let chain=Promise.resolve(), gatePromise=null, refreshFlight=null, pollCount=0, authorityUid='';
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const row=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
function toast(t,type='info',d=''){try{return window.v063Toast?.(t,type,d)}catch(_){try{return window.v115Alert?.(d||t,t,type)}catch(__){}}}
function stop(ev){ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation()}
function q(fn){const job=()=>Promise.resolve().then(fn);chain=chain.then(job,job);return chain}
let v7134GrowCacheTimer=0;
function markAuthorityLocal(){
 /* V7.136: the server is canonical. Do not synchronously stringify the full
    gameplay state after every care/plant/harvest tap. Keep only the cheap
    dirty-comparison bookkeeping; canonical state is reloaded from Supabase. */
 clearTimeout(v7134GrowCacheTimer);
 v7134GrowCacheTimer=setTimeout(()=>{
  try{if(typeof v213Comparable==='function'&&typeof v213Dirty!=='undefined'&&!v213Dirty){v213LastComparable=v213Comparable(s)}}catch(_){ }
 },900);
}
async function rpc(name,args={}){const x=db();if(!x||!uid())throw new Error('SERVER_NOT_READY');const {data,error}=await x.rpc(name,args);if(error)throw error;return row(data)}
function ensure(){
 if(typeof s==='undefined'||!s)return false;
 s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
 s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
 s.grow.plants=Array.isArray(s.grow.plants)?s.grow.plants:[];
 s.grow.equipment=(s.grow.equipment&&typeof s.grow.equipment==='object')?s.grow.equipment:{lamp:0,pots:0};
 s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};
 s.grow.v6130=(s.grow.v6130&&typeof s.grow.v6130==='object')?s.grow.v6130:{};
 s.grow.v6160=(s.grow.v6160&&typeof s.grow.v6160==='object')?s.grow.v6160:{};
 s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
 return true;
}
function growPaintSig(){
 try{return JSON.stringify({
  plants:(s?.grow?.plants||[]).map(p=>[p?.uid||p?.id||'',p?.seed||p?.strain||'',p?.stage||'',p?.ready||false,p?.harvestReady||false,p?.careMask||p?.care||null,p?.endsAt||p?.readyAt||0]),
  seeds:s?.grow?.seeds||{},room:s?.grow?.roomLevel||1,equip:s?.grow?.equipment||{},
  active:s?.grow?.v492?.active||null,bag:(s?.grow?.v492?.bag||[]).map(x=>[x?.id||'',x?.qty||x?.amount||1]),
  genetics:s?.grow?.v6130||{},orders:(s?.grow?.v6160?.contracts||[]).map(x=>[x?.id||'',x?.progress||0,x?.completed||false,x?.claimed||false])
 })}catch(_){return ''}
}
function apply(r){
 if(!r||r.ok!==true||!ensure())return false;
 const beforePaint=growPaintSig();
 if(r.grow_seeds&&typeof r.grow_seeds==='object')s.grow.seeds=clone(r.grow_seeds);
 if(Array.isArray(r.plants))s.grow.plants=clone(r.plants);
 if(Number.isFinite(Number(r.time_seeds)))s.timeSeeds=Math.max(0,Number(r.time_seeds));
 if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
 if(Number.isFinite(Number(r.harz)))s.harzTaler=Math.max(0,Number(r.harz));
 if(Number.isFinite(Number(r.level)))s.level=Math.max(1,Number(r.level));
 if(Number.isFinite(Number(r.xp)))s.xp=Math.max(0,Number(r.xp));
 if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));
 if(r.genetics&&typeof r.genetics==='object')s.grow.v6130=clone(r.genetics);
 const orderPayload=(r.orders&&typeof r.orders==='object')?clone(r.orders):(Array.isArray(r.contracts)?{dayKey:String(r.dayKey||s.grow.v6160?.dayKey||''),contracts:clone(r.contracts),rerollsLeft:Math.max(0,Number(r.rerollsLeft)||0),claimedTotal:Math.max(0,Number(r.claimedTotal)||0),completedTotal:Math.max(0,Number(r.completedTotal)||0),revision:Math.max(0,Number(r.revision)||0)}:null);
 if(orderPayload){s.grow.v6160={...s.grow.v6160,...orderPayload};window.__V7208_GROW_ORDERS_CANONICAL__=clone(orderPayload)};
 const g=r.grow_state;
 if(g&&typeof g==='object'){
   s.grow.roomLevel=Math.max(1,Number(g.room_level)||1);
   s.grow.equipment.lamp=Math.max(0,Number(g.lamp_level)||0);
   s.grow.equipment.pots=Math.max(0,Number(g.pots_level)||0);
   s.grow.v492.bag=Array.isArray(g.bag)?clone(g.bag):[];
   s.grow.v492.active=g.active&&typeof g.active==='object'?clone(g.active):null;
 }
 /* V7.184: v6358_upgrade_grow returns the changed equipment levels directly
    at the top level instead of inside grow_state. Consume that authoritative
    delta immediately so Gold + visible upgrade level can never diverge. */
 if(Number.isFinite(Number(r.room_level)))s.grow.roomLevel=Math.max(1,Math.min(4,Number(r.room_level)));
 if(Number.isFinite(Number(r.lamp_level)))s.grow.equipment.lamp=Math.max(0,Math.min(5,Number(r.lamp_level)));
 if(Number.isFinite(Number(r.pots_level)))s.grow.equipment.pots=Math.max(0,Math.min(5,Number(r.pots_level)));
 /* V7.136: no legacy recovery mirror and no whole-app render after a Grow RPC. */
 markAuthorityLocal();
 const growActive=!!document.getElementById('grow')?.classList.contains('active');
 const paintChanged=growPaintSig()!==beforePaint;
 if(growActive&&paintChanged){try{renderGrow?.()}catch(_){};}
 if(growActive){try{window.v6163GrowTabs?.refresh?.()}catch(_){};}
 const seedOverlay=document.getElementById('v495SeedInventory');
 if(seedOverlay?.classList.contains('show'))try{window.v495RenderSeedInventory?.()}catch(_){};
 try{window.v069SyncCurrencies?.()}catch(_){};try{window.v441PaintResources?.()}catch(_){};
 return true;
}
async function refresh(){
 const requestUid=uid();
 if(!requestUid)throw new Error('SERVER_NOT_READY');
 if(refreshFlight)return refreshFlight;
 refreshFlight=(async()=>{
  const r=await rpc('v7064_grow_state');
  if(!r?.ok)throw new Error(String(r?.reason||'GROW_STATE_FAILED'));
  if(uid()!==requestUid)throw new Error('ACCOUNT_CHANGED_DURING_GROW_REFRESH');
  apply(r);authorityUid=requestUid;D.enabled=true;D.ready=true;D.lastError='';window.__V7065_GROW_SERVER_MODE__=true;window.__V7064_GROW_SERVER_MODE__=true;
  return r;
 })();
 try{return await refreshFlight}finally{refreshFlight=null}
}
async function gate(force=false){
  if(!window.v7081UseAuthority?.('grow')){D.enabled=false;D.ready=true;window.__V7065_GROW_SERVER_MODE__=false;window.__V7064_GROW_SERVER_MODE__=false;return false;}
 const currentUid=uid();
 if(D.enabled&&authorityUid&&authorityUid!==currentUid){D.enabled=false;D.ready=false;authorityUid='';window.__V7065_GROW_SERVER_MODE__=false;window.__V7064_GROW_SERVER_MODE__=false;}
 if(D.enabled&&D.ready&&authorityUid===currentUid&&!force)return true;
 if(gatePromise)return gatePromise;
 gatePromise=(async()=>{
   D.checks++;
   try{await refresh();return true}
   catch(e){D.enabled=false;D.ready=!!uid();D.lastError=String(e?.message||e);window.__V7065_GROW_SERVER_MODE__=false;window.__V7064_GROW_SERVER_MODE__=false;return false}
   finally{gatePromise=null}
 })();
 return gatePromise;
}
function req(prefix){let x='';try{x=crypto.randomUUID().replaceAll('-','')}catch(_){x=Math.random().toString(36).slice(2)+Date.now().toString(36)}return `${prefix}_${Date.now()}_${x.slice(0,24)}`}
async function waitAuthority(maxMs=12000){
 const end=Date.now()+Math.max(1000,Number(maxMs)||12000);
 while(Date.now()<end){
  if(uid()&&db())return true;
  await new Promise(r=>setTimeout(r,100));
 }
 return !!(uid()&&db());
}
async function act(name,args,label,success){
 return q(async()=>{
  D.busy=true;
  const wd=window.__GL_RUNTIME_WATCHDOG__?.begin?.(
    name==='v6358_harvest_grow'?'grow_harvest':'grow_action',
    {rpc:name,label:String(label||''),screen:'grow'},
    {slowMs:name==='v6358_harvest_grow'?1600:1300,stallMs:5000}
  );
  try{
   /* V7.093: once the gate is ready, do not force a pre-action state RPC. */
   if(!(await waitAuthority())||!(await gate(false)))throw new Error('SERVER_NOT_READY');
   wd?.phase?.('rpc');
   const r=await rpc(name,args||{});
   wd?.phase?.('apply');
   if(!r?.ok)throw new Error(String(r?.reason||r?.decision||'SERVER_REJECTED'));
   /* Authoritative action responses already contain the changed Grow state. */
   apply(r);
   /* V8.191: Grow mutations change the local truth used by the navigation
      attention badge. Repaint it immediately after the authoritative state
      is applied instead of waiting for a page/navigation lifecycle. */
   try{window.v4162PaintMenuAttentionLocal?.()}catch(_){}
   if(name==='v6358_harvest_grow'&&typeof window.v7136ShowServerReward==='function'){
    try{window.v7136ShowServerReward('harvest',r,{label:'Ernte'})}catch(e){console.warn('[V7.136] harvest complete reward',e)}
   }
   if(name==='v6358_claim_grow_order'&&typeof window.v7136ShowServerReward==='function'){
    try{window.v7136ShowServerReward('growOrder',r,{contractId:String(args?.p_contract_id||''),claimed:true})}catch(e){console.warn('[V7.136] grow order reward',e)}
   }
   /* Class-set actions change the item domain, so refresh that domain only. */
   if(name==='v7064_forge_classset'||name==='v7064_upgrade_classset'){
    try{await window.v7063ItemStageRefresh?.()}catch(_){}
   }
   D.actions++;D.lastAction={name,at:Date.now(),result:clone(r)};
   if(success&&name!=='v6358_harvest_grow'&&name!=='v6358_claim_grow_order')toast(success,'success',label||'Server bestätigt');
   wd?.end?.({ok:true});
   return r;
  }catch(e){
   wd?.fail?.(e);
   D.lastError=String(e?.message||e);toast(label||'Aktion abgelehnt','error',D.lastError);try{await refresh()}catch(_){}return null
  }finally{D.busy=false}
 });
}
function selectedSeed(){ensure();return String(s?.grow?.v492?.selectedSeed||s?.grow?.selectedSeed||'moss')}
function sensitiveTarget(t){return t?.closest?.('[data-v492-buy],[data-v492-plant],[data-v492-care],[data-v492-harvest],[data-v492-activate],[data-v492-week],[data-v492-upgrade],[data-v492-room],[data-v6130-cross],[data-v6160-claim],[data-v6160-reroll],[data-v6130-craft],[data-v6170-upgrade]')||null}
async function runGrowUpgradeButton(btn,kind,label,success){
 if(!btn||btn.dataset.v7065UpgradeBusy==='1')return null;
 const k=String(kind||'').toLowerCase();
 if(!['lamp','pots','room'].includes(k))return null;
 btn.dataset.v7065UpgradeBusy='1';
 const oldText=btn.textContent;
 btn.disabled=true;
 btn.setAttribute('aria-busy','true');
 btn.textContent='Server …';
 try{
  return await act('v6358_upgrade_grow',{p_kind:k},label,success);
 }finally{
  /* A successful apply() normally replaces this button via renderGrow().
     If the old node is still mounted (e.g. rejected request), unlock it using
     the current canonical client copy so one physical tap can never queue
     multiple paid upgrade levels. */
  if(btn.isConnected){
   const current=k==='room'?Number(s?.grow?.roomLevel||1):Number(s?.grow?.equipment?.[k]||0);
   const max=k==='room'?4:5;
   delete btn.dataset.v7065UpgradeBusy;
   btn.removeAttribute('aria-busy');
   btn.disabled=current>=max;
   if(current<max)btn.textContent=oldText;
  }
 }
}

/* Fail closed: once a logged-in account uses the V7.091 client, never fall back
   to historical client-side Grow writes while the authority bridge is connecting. */
window.addEventListener('click',ev=>{
  if(!window.v7081UseAuthority?.('grow'))return;
 const t=ev.target instanceof Element?ev.target:null;if(!t)return;
 const hit=sensitiveTarget(t);if(!hit)return;
 /* V7.109: core Grow controls are valid only inside the active Growroom.
    This prevents recycled data-v492 attributes from firing harvest/care in Dungeon. */
 const coreGrow=hit.matches?.('[data-v492-buy],[data-v492-plant],[data-v492-care],[data-v492-harvest],[data-v492-activate],[data-v492-week],[data-v492-upgrade],[data-v492-room]');
 if(coreGrow){
   /* V7.128: the seed inventory modal is mounted under <body>, not inside #grow.
      Popup seed purchases are still Grow actions and must be captured by the
      server-authoritative owner. Never allow them to fall through to legacy buySeed(). */
   const popupSeedBuy=hit.matches?.('[data-v492-buy]')&&!!hit.closest?.('#v495SeedInventory');
   const growScreen=document.querySelector('#grow');
   const growActive=!!growScreen?.classList.contains('active');
   if(popupSeedBuy){
     if(!growActive){stop(ev);return;}
   }else{
     const root=hit.closest?.('#grow');
     if(!root||!root.classList.contains('active'))return;
   }
 }
 /* Always stop legacy Grow handlers first. If auth is still starting, the
    server action waits for it instead of allowing a local fallback write. */
 stop(ev);
 const buy=t.closest('[data-v492-buy]');if(buy){void act('v6358_buy_seed',{p_seed:String(buy.dataset.v492Buy||'')},'Samenkauf','🌰 Server-Samen gekauft');return}
 const plant=t.closest('[data-v492-plant]');if(plant){void act('v6358_plant_seed',{p_seed:selectedSeed(),p_slot:Number(plant.dataset.v492Plant)},'Pflanzen','🌱 Pflanze serverseitig gesetzt');return}
 const care=t.closest('[data-v492-care]');if(care){void act('v6358_care_plant',{p_plant_uid:String(care.dataset.v492Care||''),p_care_index:Number(care.dataset.v492CareIndex)},'Pflege','🌿 Pflege serverseitig gespeichert');return}
 if(t.closest('[data-v492-harvest]')){void act('v6358_harvest_grow',{},'Ernte','✂️ Server-Ernte abgeschlossen');return}
 const bloom=t.closest('[data-v492-activate]');if(bloom){const i=Number(bloom.dataset.v492Activate),b=s?.grow?.v492?.bag?.[i];if(b?.id)void act('v6358_activate_grow_bloom',{p_bloom_id:String(b.id)},'Grow-Buff','🌿 Grow-Buff serverseitig aktiviert');return}
 if(t.closest('[data-v492-week]')){void act('v6358_claim_grow_week',{},'Wochenbeitrag','🏰 Wochenbeitrag serverseitig abgeholt');return}
 const up=t.closest('[data-v492-upgrade]');if(up){void runGrowUpgradeButton(up,String(up.dataset.v492Upgrade||''),'Grow-Upgrade','⬆️ Grow-Upgrade serverseitig gebucht');return}
 const room=t.closest('[data-v492-room]');if(room){void runGrowUpgradeButton(room,'room','Raum-Upgrade','🏗️ Growroom serverseitig erweitert');return}
 const cross=t.closest('[data-v6130-cross]');if(cross){void act('v7064_start_cross',{p_recipe:String(cross.dataset.v6130Cross||'')},'Genetik','🧬 Kreuzung serverseitig angesetzt');return}
 const claim=t.closest('[data-v6160-claim]');if(claim){void act('v6358_claim_grow_order',{p_contract_id:String(claim.dataset.v6160Claim||'')},'Grow-Auftrag','📦 Grow-Auftrag serverseitig abgeholt');return}
 const rer=t.closest('[data-v6160-reroll]');if(rer){void act('v6358_reroll_grow_order',{p_contract_id:String(rer.dataset.v6160Reroll||'')},'Grow-Auftrag tauschen','🔄 Server-Auftrag getauscht');return}
 const craft=t.closest('[data-v6130-craft]');if(craft){void act('v7064_forge_classset',{p_slot:String(craft.dataset.v6130Craft||''),p_request_id:req('v7065_set')},'Klassenset','🧩 Klassenset serverseitig hergestellt');return}
 const setup=t.closest('[data-v6170-upgrade]');if(setup){void act('v7064_upgrade_classset',{p_item_id:String(setup.dataset.v6170Upgrade||''),p_request_id:req('v7065_setup')},'Klassenset-Aufwertung','⬆️ Klassenset serverseitig aufgewertet');return}
},true);

/* Keep retrying until Supabase auth exists; the old V7.064 one-shot gate could
   miss account-ready on slower Android starts. */
const poll=setInterval(async()=>{
 pollCount++;
 if(window.v7081UseAuthority?.('grow')&&uid()&&db())await gate(false);
 if(D.enabled||(!window.v7081UseAuthority?.('grow')&&window.v7081CapabilitiesDiagnostics?.()?.ready)||pollCount>=4)clearInterval(poll);
},5000);
window.addEventListener('growlegends:account-ready',()=>{if(!window.v7206StartupBusy?.())void gate(true)},{passive:true});
window.addEventListener('growlegends:authority-capabilities-ready',e=>{
 const id=uid(),eventUid=String(e?.detail?.uid||''),growEnabled=!!e?.detail?.caps?.grow;
 if(!id||eventUid!==id||!growEnabled)return;
 void gate(true);
},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{
 if(String(e?.detail?.id||'')!=='grow'||!uid())return;
 const caps=window.v7081CapabilitiesDiagnostics?.();
 if(!caps?.ready||caps?.uid!==uid())void window.v7081CapabilitiesRefresh?.(true);
 else if(caps?.caps?.grow)void gate(false);
},{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void gate(false),250),{passive:true});
setTimeout(()=>{if(!window.v7206StartupBusy?.())void gate(false)},150);
window.v7067ServerCare=async(plantUid,careIndex)=>{
 const pid=String(plantUid||'');const ci=Number(careIndex);
 if(!pid||!Number.isInteger(ci)||ci<0||ci>3)return false;
 const r=await act('v6358_care_plant',{p_plant_uid:pid,p_care_index:ci},'Pflege','🌿 Pflege serverseitig gespeichert');
 if(!r)return false;
 /* act() already applied the authoritative response and painted the Growroom.
    Do not redraw it a second time or re-run the retired local care ledger. */
 try{window.v4114DecorateCareSlots?.()}catch(_){}
 return true;
};
/* V8.194: guild bloom donation is its own server-authoritative Grow mutation.
   The retired v411_add_guild_activity compatibility RPC must never consume a bloom. */
window.v8194DonateGuildBloom=async bloomId=>{
 const bid=String(bloomId||'').trim();
 if(!bid)return {ok:true,donated:false,reason:'INVALID_BLOOM'};
 return act('v8194_donate_guild_bloom',{p_bloom_id:bid},'Gilden-Gewächshaus','');
};
window.v7065GrowAuthorityRefresh=async()=>{try{return await refresh()}catch(e){D.lastError=String(e?.message||e);return null}};
window.v7065GrowAuthorityDiagnostics=()=>clone({version:VERSION,...D,uid:!!uid(),uidValue:uid(),authorityUid,db:!!db(),serverMode:!!window.__V7065_GROW_SERVER_MODE__});
})();
