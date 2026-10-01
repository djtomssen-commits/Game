(()=>{
'use strict';
if(window.__V7132_ITEM_AUTHORITY_LOCKDOWN__)return;
window.__V7132_ITEM_AUTHORITY_LOCKDOWN__=true;
const VERSION='V7.132'; /* feature version only; global release is owned by final version owner */
const D={serverRefreshes:0,equips:0,unequips:0,autoEquips:0,materials:0,autoMaterialCalls:0,blockedLegacyAutoClicks:0,pendingCleared:0,lastError:''};
let chain=Promise.resolve();
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const itemId=it=>String(it?.id||it?.uid||'');
const toast=(title,type='info',detail='')=>{try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}};
function serial(fn){const run=()=>Promise.resolve().then(fn);chain=chain.then(run,run);return chain}
function requestId(prefix){let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}return `${prefix}_${Date.now()}_${r.slice(0,24)}`}
function saveCache(){try{if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
function repaint(){
 try{renderInventory?.()}catch(_){}
 try{window.v470PaintEquipmentSlots?.()}catch(_){}
 try{window.v459CompactInventory?.()}catch(_){}
 try{window.v448PaintPower?.()}catch(_){}
 try{window.v446PaintCombatPower?.()}catch(_){}
 try{window.v069SyncCurrencies?.()}catch(_){}
 try{window.v441PaintResources?.()}catch(_){}
 try{window.v546RenderMaterials?.()}catch(_){}
 try{window.v480UpdateAutoBars?.()}catch(_){}
}
function applyServer(r,{paint=true}={}){
 if(!r||r.ok!==true)return false;
 if(Array.isArray(r.inventory))s.inventory=clone(r.inventory);
 if(r.equipment&&typeof r.equipment==='object')s.equipment=clone(r.equipment);
 if(Array.isArray(r.materials))s.materials=clone(r.materials);
 s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
 if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));
 if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
 if(Number.isFinite(Number(r.harz)))s.harzTaler=Math.max(0,Number(r.harz));
 saveCache();if(paint)repaint();return true;
}
async function rpc(name,args={}){
 const x=db();if(!x||!uid())throw new Error('SERVER_NOT_READY');
 const {data,error}=await x.rpc(name,args);if(error)throw error;
 return one(data);
}
async function ensureAuthority({paint=false}={}){
 if(!uid()||!db())throw new Error('SERVER_NOT_READY');
 let use=false;
 try{use=!!window.v7081UseAuthority?.('items')}catch(_){}
 if(!use){
  try{await window.v7081CapabilitiesRefresh?.()}catch(_){}
  try{use=!!window.v7081UseAuthority?.('items')}catch(_){}
 }
 /* V7.132 is deliberately fail-closed for authenticated gameplay item writes.
    No local mutation is allowed while authority state is unknown. */
 if(!use)throw new Error('ITEM_AUTHORITY_NOT_READY');
 let r=null;
 try{r=await window.v7074ItemAuthorityRefresh?.(false,paint)}catch(_){}
 if(!r){r=await rpc('v7034_client_item_authority_state');if(r?.ok)applyServer(r,{paint})}
 if(!r?.ok)throw new Error(String(r?.reason||'ITEM_AUTHORITY_STATE_FAILED'));
 if(String(r.item_mode||'')!=='enforce')throw new Error('ITEM_AUTHORITY_NOT_ENFORCED');
 D.serverRefreshes++;return r;
}
function equipmentIds(eq){const out={};['head','body','boots','ring','amulet','weapon','weapon2'].forEach(sl=>out[sl]=itemId(eq?.[sl])||null);return out}
async function submitEquipment(eq,prefix){
 const r=await rpc('v7097_rearrange_item_ids',{p_event_id:requestId(prefix),p_equipment_ids:equipmentIds(eq)});
 if(!r?.ok)throw new Error(String(r?.reason||r?.decision||'SERVER_REJECTED'));
 applyServer(r,{paint:true});return r;
}
const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
function score(it){
 if(!it)return-1;let total=0;const gem=it?.gem,ench=(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant);
 for(const k of COMBAT){let v=Number(it?.bonus?.[k])||0;if(gem?.stat===k)v-=Number(gem.value)||0;if(k==='glueck'&&ench?.effect==='luck')v-=Number(ench.value)||0;total+=Math.max(0,v)}
 try{if(typeof window.v6201MysticCompareValue==='function')total+=Math.max(0,Number(window.v6201MysticCompareValue(it))||0)}catch(_){}
 return total;
}
function equipTarget(it,eq){
 const sl=String(it?.slot||'').toLowerCase();
 if(String(s?.playerClass||'')==='frost'&&sl==='weapon'){
  if(!eq.weapon)return'weapon';if(!eq.weapon2)return'weapon2';return score(eq.weapon2)<score(eq.weapon)?'weapon2':'weapon';
 }
 return sl;
}
function classOk(it){const cls=String(s?.playerClass||'');return !it?.classId||!cls||String(it.classId)===cls}

/* Manual equip/unequip: final owner, no local fallback. */
const legacyEquip=window.equip,legacyUnequip=window.unequip;
window.equip=function(index){
 const clicked=itemId(s?.inventory?.[Number(index)]);
 return serial(async()=>{
  try{
   await ensureAuthority({paint:false});
   const i=(s.inventory||[]).findIndex(it=>itemId(it)===clicked);if(i<0){repaint();return false}
   const it=s.inventory[i];if(!classOk(it)){toast('Falsche Klasse','warn','Dieses Item kann von deiner Klasse nicht getragen werden.');return false}
   const eq=clone(s.equipment||{}),target=equipTarget(it,eq);if(!target){toast('Nicht anlegbar','warn','Ungültiger Ausrüstungsplatz.');return false}
   eq[target]=it;await submitEquipment(eq,'v7132_equip');D.equips++;toast('✅ Server bestätigt','success',`${it.name||'Item'} wurde angelegt.`);return true;
  }catch(e){D.lastError=String(e?.message||e);toast('Ausrüstung nicht geändert','error','Serverstatus konnte nicht bestätigt werden. Es wurde nichts lokal verändert.');return false}
 });
};
try{equip=window.equip}catch(_){}
window.unequip=function(slot){
 return serial(async()=>{
  try{
   await ensureAuthority({paint:false});slot=String(slot||'');const it=s?.equipment?.[slot];if(!it){repaint();return false}
   const eq=clone(s.equipment||{});eq[slot]=null;await submitEquipment(eq,'v7132_unequip');D.unequips++;toast('✅ Server bestätigt','success',`${it.name||'Item'} wurde abgelegt.`);return true;
  }catch(e){D.lastError=String(e?.message||e);toast('Ausrüstung nicht geändert','error','Serverstatus konnte nicht bestätigt werden. Es wurde nichts lokal verändert.');return false}
 });
};
try{unequip=window.unequip}catch(_){}

/* Material use: direct canonical RPC. The chooser is UI-only; the item mutation
   happens exclusively inside v7062_apply_material. */
const legacyMaterial=window.v030UseMaterial;
async function chooseEquipped(mat){
 try{if(typeof window.v122ChooseEquippedItem==='function')return await window.v122ChooseEquippedItem(mat)}catch(_){}
 try{if(typeof window.v063ChooseEquippedItem==='function')return await window.v063ChooseEquippedItem(mat)}catch(_){}
 return null;
}
window.v030UseMaterial=function(index){
 const clickedId=itemId(s?.materials?.[Number(index)]);
 return serial(async()=>{
  try{
   await ensureAuthority({paint:false});
   const i=(s.materials||[]).findIndex(m=>itemId(m)===clickedId);if(i<0){toast('Material nicht gefunden','warn','Der Serverbestand wurde aktualisiert.');repaint();return false}
   const mat=s.materials[i];const chosen=await chooseEquipped(mat);if(!chosen)return false;const [slot]=chosen;
   const r=await rpc('v7062_apply_material',{p_material_id:itemId(mat),p_slot:String(slot),p_request_id:requestId('v7132_material')});
   if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));applyServer(r,{paint:true});D.materials++;toast('✨ Server bestätigt','success',`${mat.name||'Material'} wurde dauerhaft angewendet.`);return true;
  }catch(e){D.lastError=String(e?.message||e);toast('Material nicht angewendet','error','Serverstatus konnte nicht bestätigt werden. Es wurde nichts lokal verändert.');return false}
 });
};

/* Auto equip: use the existing proposal calculator only as a read-only planner.
   The resulting equipment IDs are committed by the server in one transaction. */
window.v480AutoEquip=function(){
 return serial(async()=>{
  try{
   await ensureAuthority({paint:false});
   const p=typeof window.v7097AutoEquipProposal==='function'?window.v7097AutoEquipProposal():null;
   if(!p?.changed){toast('Ausrüstung bereits optimal','info','Keine bessere Ausrüstung gefunden.');return false}
   await submitEquipment(p.eq,'v7132_autoequip');D.autoEquips++;toast('⚡ Server-Auto-Ausrüsten','success','Beste verfügbare Ausrüstung dauerhaft angelegt.');return true;
  }catch(e){D.lastError=String(e?.message||e);toast('Auto-Ausrüsten abgelehnt','error','Serverstatus konnte nicht bestätigt werden. Es wurde nichts lokal verändert.');return false}
 });
};

/* V7.063 already contains the canonical server auto-material algorithm. Keep it,
   but call it only after authority has been confirmed so it can never take its
   historical local fallback branch. */
const canonicalAutoMaterials=window.v480AutoMaterials;
window.v480AutoMaterials=function(){
 return serial(async()=>{
  try{
   await ensureAuthority({paint:false});
   if(typeof canonicalAutoMaterials!=='function')throw new Error('SERVER_AUTO_MATERIAL_NOT_READY');
   D.autoMaterialCalls++;return await canonicalAutoMaterials();
  }catch(e){D.lastError=String(e?.message||e);toast('Auto-Material abgelehnt','error','Serverstatus konnte nicht bestätigt werden. Es wurde nichts lokal verändert.');return false}
 });
};

/* The old V4.80 bars stored lexical references to local-only auto functions.
   Capture their click before target onclick and route to the final server owners. */
document.addEventListener('click',ev=>{
 const equipBtn=ev.target?.closest?.('#v480EquipAutoBar button');
 const matBtn=ev.target?.closest?.('#v480MaterialAutoBar button');
 if(!equipBtn&&!matBtn)return;
 ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();D.blockedLegacyAutoClicks++;
 if(equipBtn)void window.v480AutoEquip();else void window.v480AutoMaterials();
},true);
function bindFinalAutoButtons(){
 const e=document.querySelector('#v480EquipAutoBar button');if(e)e.onclick=()=>window.v480AutoEquip();
 const m=document.querySelector('#v480MaterialAutoBar button');if(m)m.onclick=()=>window.v480AutoMaterials();
}
try{
 const base=window.v480UpdateAutoBars;
 if(typeof base==='function')window.v480UpdateAutoBars=function(){const r=base.apply(this,arguments);bindFinalAutoButtons();return r};
}catch(_){}

/* Retire the old account-handshake replay which can re-apply local V4.80 plans. */
function clearLegacyPending(){
 try{for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k&&k.startsWith('growLegendsV486AutoPending:')){sessionStorage.removeItem(k);D.pendingCleared++}}}catch(_){}
}
clearLegacyPending();
window.v486FlushPendingAuto=function(){clearLegacyPending();return false};

window.addEventListener('growlegends:account-ready',()=>{clearLegacyPending();const run=()=>void ensureAuthority({paint:true}).catch(e=>{D.lastError=String(e?.message||e)});if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(run,350);else setTimeout(run,500)},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character'){bindFinalAutoButtons();void ensureAuthority({paint:false}).catch(()=>{})}});
setTimeout(()=>{bindFinalAutoButtons();clearLegacyPending()},300);

window.v7132ItemAuthorityDiagnostics=()=>clone({version:VERSION,...D,uid:!!uid(),equipOwner:typeof window.equip==='function',materialOwner:typeof window.v030UseMaterial==='function'});
window.__V7132_ITEM_AUTHORITY__=Object.freeze({
  manualEquip:'server-only',manualUnequip:'server-only',materialApply:'server-only',autoEquip:'server-only',autoMaterials:'server-only',legacyAutoReplay:false,localStorageRole:'confirmed-server-cache-only'
});
})();
