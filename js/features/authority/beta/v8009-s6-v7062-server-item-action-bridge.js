(()=>{
 'use strict';
 if(window.__V7062_SERVER_ITEM_ACTIONS__)return;
 window.__V7062_SERVER_ITEM_ACTIONS__=true;
 const VERSION='V7.062';
 const S={ready:false,enabled:false,lastError:'',actions:0,last:null};
 let gateP=null,chain=Promise.resolve();
 const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
 const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
 const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
 const row=d=>Array.isArray(d)?d[0]:d;
 const itemId=it=>String(it?.id||it?.uid||'');
 function req(prefix){let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}return `${prefix}_${Date.now()}_${r.slice(0,24)}`}
 function toast(title,type='info',detail=''){try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}}
 async function confirmBox(text,opt={}){try{if(typeof v115Confirm==='function')return !!(await v115Confirm(text,opt))}catch(_){}return window.confirm(text)}
 async function gate(force=false){
  if(!window.v7081UseAuthority?.('items')){S.ready=true;S.enabled=false;return false;}
  const finalState=window.v7074ItemAuthorityDiagnostics?.();
  if(finalState?.enforce&&Date.now()-Number(finalState.lastSync||0)<60000){S.ready=true;S.enabled=true;return true}
  if(!force&&S.ready)return S.enabled;
  if(gateP)return gateP;
  gateP=(async()=>{try{const x=db();if(!x||!uid()){S.ready=true;S.enabled=false;return false}const {data,error}=await x.rpc('v7034_client_item_authority_state');if(error)throw error;const g=row(data);S.ready=true;S.enabled=!!g?.item_bridge_enabled;S.lastError='';return S.enabled}catch(e){S.ready=true;S.enabled=false;S.lastError=String(e?.message||e);console.warn('[V7062] item gate',e);return false}finally{gateP=null}})();
  return gateP;
 }
 function apply(r){
  if(!r||r.ok!==true)return false;
  if(Array.isArray(r.inventory))s.inventory=clone(r.inventory);
  if(r.equipment&&typeof r.equipment==='object')s.equipment=clone(r.equipment);
  if(Array.isArray(r.materials))s.materials=clone(r.materials);
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));
  if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  try{render?.()}catch(_){}
  try{renderInventory?.()}catch(_){}
  try{window.v470PaintEquipmentSlots?.()}catch(_){}
  try{window.v448PaintPower?.()}catch(_){}
  try{window.v069SyncCurrencies?.()}catch(_){}
  try{window.v488ForgeRender?.()}catch(_){}
  S.actions++;S.last={at:Date.now(),revision:Number(r.revision)||0};
  return true;
 }
 function q(fn){const task=()=>Promise.resolve().then(fn);chain=chain.then(task,task);return chain}
 async function sellByItem(it){
  const id=itemId(it);if(!id)throw new Error('ITEM_ID_MISSING');
  const x=db();if(!x)throw new Error('SERVER_NOT_READY');
  const {data,error}=await x.rpc('v7062_sell_item',{p_item_id:id,p_request_id:req('v7062_sell')});if(error)throw error;const r=row(data);if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));apply(r);return r;
 }
 try{
  const base=window.sellItem;
  if(typeof base==='function'&&!base.__v7062){
   const w=async function(i){if(!(await gate()))return base.apply(this,arguments);const it=s?.inventory?.[Number(i)];if(!it)return false;const val=typeof sellValue==='function'?Math.max(0,Number(sellValue(it))||0):0;const ok=await confirmBox(`${it.name||'Item'}\
\
Verkaufspreis: ${val} Gold`,{title:'Item verkaufen?',type:'warn',okText:`Für ${val} Gold verkaufen`});if(!ok)return false;return q(async()=>{try{const r=await sellByItem(it);toast('💰 Server-Verkauf bestätigt','success',`+${Number(r.sale_value)||0} Gold`);return true}catch(e){S.lastError=String(e?.message||e);toast('Verkauf abgelehnt','error',S.lastError);return false}})};
   w.__v7062=true;window.sellItem=w;
  }
 }catch(e){console.warn('[V7062] sellItem',e)}
 try{
  const base=window.sellEquipped;
  if(typeof base==='function'&&!base.__v7062){
   const w=async function(slot){if(!(await gate()))return base.apply(this,arguments);const it=s?.equipment?.[String(slot)];if(!it)return false;const val=typeof sellValue==='function'?Math.max(0,Number(sellValue(it))||0):0;const ok=await confirmBox(`${it.name||'Item'}\
\
Der Gegenstand wird verkauft.\
Verkaufspreis: ${val} Gold`,{title:'Angelegtes Item verkaufen?',type:'warn',okText:`Für ${val} Gold verkaufen`});if(!ok)return false;return q(async()=>{try{const r=await sellByItem(it);toast('💰 Server-Verkauf bestätigt','success',`+${Number(r.sale_value)||0} Gold`);return true}catch(e){S.lastError=String(e?.message||e);toast('Verkauf abgelehnt','error',S.lastError);return false}})};
   w.__v7062=true;window.sellEquipped=w;
  }
 }catch(e){console.warn('[V7062] sellEquipped',e)}
 async function chooseSlot(title,material){
  const a=Object.entries(s?.equipment||{}).filter(([,it])=>!!it);
  if(!a.length){toast('Kein Item angelegt','warn','Lege zuerst einen Gegenstand an.');return null}
  try{
   if(typeof v122ChooseEquippedItem==='function')return await v122ChooseEquippedItem(material||{name:title,icon:'✨'});
  }catch(e){console.warn('[V7.131] v122 material chooser',e)}
  try{
   if(typeof v063ChooseEquippedItem==='function')return await v063ChooseEquippedItem(material||{name:title,icon:'✨'});
  }catch(e){console.warn('[V7.131] v063 material chooser',e)}
  toast('Auswahlfenster nicht verfügbar','error','Bitte öffne die Charakterseite erneut und versuche es nochmal.');
  return null;
 }
 try{
  const base=window.v030UseMaterial;
  if(typeof base==='function'&&!base.__v7062){
   const w=async function(i){if(!(await gate()))return base.apply(this,arguments);const mat=s?.materials?.[Number(i)];if(!mat)return false;const c=await chooseSlot(`${mat.icon||''} ${mat.name||'Material'} anwenden auf:`,mat);if(!c)return false;const [slot,it]=c;
    if(String(mat.type)==='gem'&&it?.gem){const ok=await confirmBox(`Auf diesem Item steckt bereits ${it.gem.name||'ein Edelstein'}. Der alte Edelstein wird ersetzt. Fortfahren?`,{title:'Edelstein ersetzen?',type:'warn',okText:'Ersetzen'});if(!ok)return false}
    if(String(mat.type)==='scroll'&&Array.isArray(it?.enchants)&&it.enchants.length){const ok=await confirmBox(`Auf diesem Item liegt bereits ${it.enchants[0]?.name||'eine Verzauberung'}. Die alte Verzauberung wird ersetzt. Fortfahren?`,{title:'Verzauberung ersetzen?',type:'warn',okText:'Ersetzen'});if(!ok)return false}
    return q(async()=>{try{const x=db();if(!x)throw new Error('SERVER_NOT_READY');const {data,error}=await x.rpc('v7062_apply_material',{p_material_id:itemId(mat),p_slot:String(slot),p_request_id:req('v7062_material')});if(error)throw error;const r=row(data);if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));apply(r);toast('✨ Server bestätigt','success',`${mat.name||'Material'} wurde angewendet.`);return true}catch(e){S.lastError=String(e?.message||e);toast('Material nicht angewendet','error',S.lastError);return false}});
   };w.__v7062=true;window.v030UseMaterial=w;
  }
 }catch(e){console.warn('[V7062] material',e)}
 document.addEventListener('click',async ev=>{
  const b=ev.target?.closest?.('#v488Dismantle');if(!b)return;
  if(!(await gate()))return;
  ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
  const cards=[...document.querySelectorAll('#v488ForgeInventory [data-v488-key].selected')];
  const ids=cards.map(c=>String(c.dataset.v488Key||'')).filter(Boolean);if(!ids.length){toast('Keine Items ausgewählt','info','Wähle zuerst Ausrüstung zum Zerlegen.');return}
  const ok=await confirmBox(`${ids.length} Gegenstand${ids.length===1?'':'e'} serverseitig zerlegen?`,{title:'Harzschmiede',type:'warn',okText:'Zerlegen'});if(!ok)return;
  await q(async()=>{try{const x=db();if(!x)throw new Error('SERVER_NOT_READY');const {data,error}=await x.rpc('v7062_dismantle_items',{p_item_ids:ids,p_request_id:req('v7062_dismantle')});if(error)throw error;const r=row(data);if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));apply(r);toast(`+${Number(r.fragments_awarded)||0} Samenfragmente`,'success',`${Number(r.removed)||0} Item${Number(r.removed)===1?'':'s'} serverseitig zerlegt.`)}catch(e){S.lastError=String(e?.message||e);toast('Zerlegen abgelehnt','error',S.lastError)}});
 },true);
 window.v7062ItemAuthorityDiagnostics=()=>clone({version:VERSION,...S});
 window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{S.ready=false;void gate(true)},350),{passive:true});
 window.addEventListener('pageshow',()=>setTimeout(()=>{S.ready=false;void gate(true)},650),{passive:true});
 setTimeout(()=>void gate(true),2400);
})();
