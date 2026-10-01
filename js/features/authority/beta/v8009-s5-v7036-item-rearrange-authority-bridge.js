/* ===== V7.036 safe staged item rearrange bridge =====
   Lirane-only backend gate for the first item-authority test.
   Only pure inventory <-> equipment rearrangements are authoritative here.
   No sell/socket/enchant/forge/reward path is migrated by this bridge.
*/
(function(){
 'use strict';
 if(window.__V7034_ITEM_REARRANGE_BRIDGE__)return;
 window.__V7034_ITEM_REARRANGE_BRIDGE__=true;

 const state={version:'V7.036',uid:'',ready:false,enabled:false,gate:null,lastError:'',actions:0,hydratedAt:0};
 let gatePromise=null,chain=Promise.resolve();
 const deep=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
 function uid(){try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}}
 function db(){try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}}
 function toast(title,type='info',detail=''){
  try{if(typeof v063Toast==='function')return v063Toast(title,type,detail)}catch(_){}
  try{if(type==='error'&&typeof v115Alert==='function')return v115Alert(detail||title,title,'error')}catch(_){}
  console[type==='error'?'error':'log']('[V7034]',title,detail);
 }
 function ensureShape(){
  s.inventory=Array.isArray(s?.inventory)?s.inventory:[];
  s.equipment=(s?.equipment&&typeof s.equipment==='object')?s.equipment:{};
  if(!Object.prototype.hasOwnProperty.call(s.equipment,'weapon2'))s.equipment.weapon2=null;
  s.materials=Array.isArray(s?.materials)?s.materials:[];
  s.v488Forge=(s?.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
 }
 function applyServer(row,{persist=true}={}){
  if(!row)return false;
  ensureShape();
  if(Array.isArray(row.inventory))s.inventory=deep(row.inventory);
  if(row.equipment&&typeof row.equipment==='object')s.equipment=deep(row.equipment);
  if(Array.isArray(row.materials))s.materials=deep(row.materials);
  if(Number.isFinite(Number(row.fragments)))s.v488Forge.fragments=Math.max(0,Number(row.fragments));
  state.hydratedAt=Date.now();
  try{if(typeof render==='function')render()}catch(_){}
  try{window.v470PaintEquipmentSlots?.()}catch(_){}
  try{window.v459CompactInventory?.()}catch(_){}
  try{window.v448PaintPower?.()}catch(_){}
  if(persist){
   try{if(typeof persist==='function')persist(false);else localStorage.setItem(KEY,JSON.stringify(s))}catch(e){console.warn('[V7034] persist',e)}
  }
  return true;
 }
 function reset(){state.uid=uid();state.ready=false;state.enabled=false;state.gate=null;state.lastError='';gatePromise=null}
 async function loadGate(force=false){
  const id=uid(),x=db();if(!id||!x)return null;
  if(state.uid!==id)reset();
  if(!force&&state.ready&&state.gate)return state.gate;
  if(gatePromise)return gatePromise;
  gatePromise=(async()=>{
   try{
    const {data,error}=await x.rpc('v7034_client_item_authority_state');
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;
    if(!row?.ok)throw new Error('Item authority state unavailable');
    state.uid=id;state.ready=true;state.enabled=!!row.item_bridge_enabled;state.gate=row;state.lastError='';
    /* Safety: gate refresh must NEVER overwrite newer local loot or equipment. */
    return row;
   }catch(e){state.lastError=String(e?.message||e||'');console.warn('[V7034] gate',e);return null}
   finally{gatePromise=null}
  })();
  return gatePromise;
 }
 function enqueue(fn){const task=()=>Promise.resolve().then(fn);chain=chain.then(task,task);return chain}
 function eventId(){
  let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}
  return 'v7034_rearrange_'+Date.now()+'_'+r.slice(0,24);
 }
 async function submit(inv,eq){
  const x=db();if(!x)throw new Error('SERVER_NOT_READY');
  const {data,error}=await x.rpc('v7034_rearrange_item_state',{p_event_id:eventId(),p_inventory:inv,p_equipment:eq});
  if(error)throw error;
  const row=Array.isArray(data)?data[0]:data;
  if(!row?.ok){throw new Error(String(row?.decision||'SERVER_REJECTED'))}
  applyServer(row,{persist:true});state.actions++;state.gate={...(state.gate||{}),...row,item_bridge_enabled:true,item_guard:true};
  return row;
 }
 function itemKey(it){return String(it?.id||it?.uid||'')}
 function itemSetFrom(inv,eq){
  const a=[];
  try{(Array.isArray(inv)?inv:[]).forEach(it=>{const k=itemKey(it);if(k)a.push(k)})}catch(_){}
  try{Object.values(eq&&typeof eq==='object'?eq:{}).forEach(it=>{const k=itemKey(it);if(k)a.push(k)})}catch(_){}
  return a.sort();
 }
 function gateMatchesLocal(gate){
  try{
   ensureShape();
   const a=itemSetFrom(s.inventory,s.equipment),b=itemSetFrom(gate?.inventory,gate?.equipment);
   return a.length===b.length&&a.every((x,i)=>x===b[i]);
  }catch(_){return false}
 }
 function classOk(it){return !it?.classId||String(it.classId)===String(s?.playerClass||'')}
 function proposedEquip(index){
  ensureShape();const i=Number(index),live=s.inventory?.[i];if(!live)return null;
  if(!classOk(live))return {error:'Falsche Klasse'};
  const slot=String(live.slot||'');if(!slot)return {error:'Item hat keinen Ausrüstungsplatz'};
  const inv=deep(s.inventory),eq=deep(s.equipment),it=inv[i];
  const old=eq[slot]||null;eq[slot]=it;inv.splice(i,1);if(old)inv.push(old);
  return {inv,eq,item:it,slot};
 }
 function proposedUnequip(slot){
  ensureShape();slot=String(slot||'');const live=s.equipment?.[slot];if(!live)return null;
  const inv=deep(s.inventory),eq=deep(s.equipment),it=eq[slot];inv.push(it);eq[slot]=null;
  return {inv,eq,item:it,slot};
 }

 try{
  const base=window.equip;
  if(typeof base==='function'){
   window.equip=function(i){const ctx=this,args=arguments;return enqueue(async()=>{
    const gate=await loadGate(false);if(!gate?.item_bridge_enabled)return base.apply(ctx,args);
    if(!gateMatchesLocal(gate)){state.lastError='LOCAL_SERVER_ITEM_DRIFT';toast('Server-Abgleich pausiert','info','Neues oder noch nicht synchronisiertes Item erkannt. Der normale Spielablauf bleibt aktiv.');return base.apply(ctx,args)}
    const p=proposedEquip(i);if(!p)return false;if(p.error){toast('Nicht anlegbar','warn',p.error);return false}
    try{await submit(p.inv,p.eq);toast('✅ Server bestätigt','success',`${p.item?.name||'Item'} wurde angelegt.`);return true}
    catch(e){state.lastError=String(e?.message||e||'');toast('Ausrüstung nicht geändert','error','Der Server hat den Wechsel nicht bestätigt. '+state.lastError);return false}
   })};
   try{equip=window.equip}catch(_){}
  }
 }catch(e){console.warn('[V7034] equip wrap',e)}

 try{
  const base=window.unequip;
  if(typeof base==='function'){
   window.unequip=function(slot){const ctx=this,args=arguments;return enqueue(async()=>{
    const gate=await loadGate(false);if(!gate?.item_bridge_enabled)return base.apply(ctx,args);
    if(!gateMatchesLocal(gate)){state.lastError='LOCAL_SERVER_ITEM_DRIFT';toast('Server-Abgleich pausiert','info','Neues oder noch nicht synchronisiertes Item erkannt. Der normale Spielablauf bleibt aktiv.');return base.apply(ctx,args)}
    const p=proposedUnequip(slot);if(!p)return false;
    try{await submit(p.inv,p.eq);toast('✅ Server bestätigt','success',`${p.item?.name||'Item'} wurde abgelegt.`);return true}
    catch(e){state.lastError=String(e?.message||e||'');toast('Ausrüstung nicht geändert','error','Der Server hat den Wechsel nicht bestätigt. '+state.lastError);return false}
   })};
   try{unequip=window.unequip}catch(_){}
  }
 }catch(e){console.warn('[V7034] unequip wrap',e)}

 /* Auto-equip changes several slots at once through private V4.80 helpers.
    Keep it blocked for the single staged test account until that path has its own
    server proposal builder; all non-gated players remain unchanged. */
 try{
  const base=window.v480AutoEquip;
  if(typeof base==='function')window.v480AutoEquip=function(){const ctx=this,args=arguments;return enqueue(async()=>{
   const gate=await loadGate(false);if(!gate?.item_bridge_enabled)return base.apply(ctx,args);
   toast('Auto-Ausrüsten kurz gesperrt','info','Für den Servertest bitte Items einzeln anlegen oder ablegen.');return false;
  })};
 }catch(e){console.warn('[V7034] auto-equip wrap',e)}

 window.v7034ItemAuthorityRefresh=()=>loadGate(true);
 window.v7034ItemAuthorityDiagnostics=()=>({
  version:state.version,uid:state.uid,ready:state.ready,enabled:state.enabled,
  revision:Number(state.gate?.revision)||0,actions:state.actions,hydratedAt:state.hydratedAt,lastError:state.lastError
 });
 function boot(){const id=uid();if(state.uid&&state.uid!==id)reset();const d=window.v7074ItemAuthorityDiagnostics?.();if(d?.enforce&&Date.now()-Number(d.lastSync||0)<60000){state.uid=id;state.ready=true;state.enabled=true;state.hydratedAt=Date.now();return}if(window.v7206StartupBusy?.())return;if(id&&db())void loadGate(true)}
 window.addEventListener('growlegends:account-ready',()=>setTimeout(boot,220));
 window.addEventListener('growlegends:first-playable',()=>setTimeout(boot,900),{passive:true});
 window.addEventListener('pageshow',()=>setTimeout(boot,420),{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(boot,420)},{passive:true});
 setTimeout(boot,2100);
})();
