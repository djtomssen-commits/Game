(()=>{
'use strict';
if(window.__V7074_ITEM_ENFORCE__)return;
window.__V7074_ITEM_ENFORCE__=true;

const VERSION='V7.091';
const A={
  ready:false,enforce:false,busy:false,uid:'',revision:0,lastSync:0,lastError:'',
  hydrations:0,equips:0,unequips:0
};
let refreshP=null,refreshUid='',chain=Promise.resolve();

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const userId=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const itemId=it=>String(it?.id||it?.uid||'');
const toast=(title,type='info',detail='')=>{
  try{return window.v063Toast?.(title,type,detail)}
  catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}
};
function serial(fn){const run=()=>Promise.resolve().then(fn);chain=chain.then(run,run);return chain}
function requestId(){
  let r='';
  try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}
  return `v7074_rearrange_${Date.now()}_${r.slice(0,24)}`;
}
function ensure(){
  if(typeof s==='undefined'||!s)return false;
  s.inventory=Array.isArray(s.inventory)?s.inventory:[];
  s.equipment=(s.equipment&&typeof s.equipment==='object')?s.equipment:{};
  if(!Object.prototype.hasOwnProperty.call(s.equipment,'weapon2'))s.equipment.weapon2=null;
  s.materials=Array.isArray(s.materials)?s.materials:[];
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  return true;
}
function saveLocal(){
  try{
    if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
    else localStorage.setItem('grow_idle_save_v1',JSON.stringify(s));
  }catch(_){}
}
function repaint({attributesChanged=true}={}){
  try{renderInventory?.()}catch(_){}
  try{window.v470PaintEquipmentSlots?.()}catch(_){}
  try{window.v459CompactInventory?.()}catch(_){}
  try{window.v448PaintPower?.()}catch(_){}
  try{window.v446PaintCombatPower?.()}catch(_){}
  try{window.v069SyncCurrencies?.()}catch(_){}
  try{window.v441PaintResources?.()}catch(_){}
  /* Attribute numbers repaint only when the server actually changed equipment. */
  if(attributesChanged){
    try{
      const panel=document.getElementById('v459PanelAttributes');
      if(document.getElementById('character')?.classList.contains('active')&&panel?.classList.contains('active')){
        window.v4140PaintAttributes?.();
        window.v537ApplyAttributes?.();
        try{window.v8144GameplayI18n?.apply?.('character')}catch(__){}
      }
    }catch(_){}
  }
}
function equipmentFingerprint(eq){
  try{
    const out={};
    Object.keys(eq||{}).sort().forEach(slot=>{
      const it=eq?.[slot];
      out[slot]=it?{
        id:String(it.id||it.uid||''),
        bonus:it.bonus||{},
        gem:it.gem||null,
        enchants:Array.isArray(it.enchants)?it.enchants:(it.enchant?[it.enchant]:[]),
        special:it.mysticSpecial||it.mystic_special||it.special||null,
        setId:it.setId||null
      }:null;
    });
    return JSON.stringify(out);
  }catch(_){return ''}
}
function applyServer(row,{paint=true}={}){
  if(!row||!ensure())return false;
  const beforeEquipment=equipmentFingerprint(s.equipment);
  if(Array.isArray(row.inventory))s.inventory=clone(row.inventory);
  if(row.equipment&&typeof row.equipment==='object')s.equipment=clone(row.equipment);
  if(Array.isArray(row.materials))s.materials=clone(row.materials);
  if(Number.isFinite(Number(row.fragments)))s.v488Forge.fragments=Math.max(0,Number(row.fragments));
  const attributesChanged=beforeEquipment!==equipmentFingerprint(s.equipment);
  A.revision=Math.max(0,Number(row.revision)||0);
  A.lastSync=Date.now();
  A.hydrations++;
  saveLocal();
  if(paint)repaint({attributesChanged});
  return true;
}
async function rpc(name,args={}){
  const x=db(),id=userId();
  if(!x||!id)throw new Error('SERVER_NOT_READY');
  const {data,error}=await x.rpc(name,args);
  if(error)throw error;
  return one(data);
}
async function refresh(force=false,paint=true){
  if(!window.v7081UseAuthority?.('items')){A.ready=false;A.enforce=false;return null;}
  const id=userId();
  if(!id||!db())return null;
  if(A.uid&&A.uid!==id){
    A.ready=false;A.enforce=false;A.revision=0;A.lastSync=0;A._gate=null;
    /* Never reuse an in-flight request that belongs to another account. */
    refreshP=null;refreshUid='';
  }
  A.uid=id;
  if(!force&&A.ready&&A.uid===id&&Date.now()-A.lastSync<30000)return A._gate||null;
  if(refreshP&&refreshUid===id)return refreshP;

  const requestUid=id;
  refreshUid=requestUid;
  const p=(async()=>{
    try{
      const row=await rpc('v7034_client_item_authority_state');
      /* Account changed while this RPC was in flight: discard the response. */
      if(userId()!==requestUid||A.uid!==requestUid)return null;
      if(!row?.ok)throw new Error('ITEM_AUTHORITY_STATE_FAILED');
      A.ready=true;
      A.enforce=String(row.item_mode||'')==='enforce';
      A._gate=clone(row);
      A.lastError='';
      if(A.enforce)applyServer(row,{paint});
      else A.lastSync=Date.now();
      return row;
    }catch(e){
      if(userId()!==requestUid||A.uid!==requestUid)return null;
      A.ready=false;
      A.lastError=String(e?.message||e);
      console.warn('[V7074] item authority refresh',e);
      return null;
    }finally{
      if(refreshP===p){refreshP=null;refreshUid=''}
    }
  })();
  refreshP=p;
  return p;
}
function classOk(it){
  const cls=String(s?.playerClass||'');
  return !it?.classId||!cls||String(it.classId)===cls;
}
const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
function score(it){
  if(!it)return -1;
  let total=0;
  const gem=it?.gem;
  const ench=(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant);
  for(const k of COMBAT){
    let v=Number(it?.bonus?.[k])||0;
    if(gem?.stat===k)v-=Number(gem.value)||0;
    if(k==='glueck'&&ench?.effect==='luck')v-=Number(ench.value)||0;
    total+=Math.max(0,v);
  }
  try{if(typeof window.v6201MysticCompareValue==='function')total+=Math.max(0,Number(window.v6201MysticCompareValue(it))||0)}catch(_){}
  return total;
}
function equipTarget(it,eq){
  const sl=String(it?.slot||'').toLowerCase();
  if(String(s?.playerClass||'')==='frost'&&sl==='weapon'){
    if(!eq.weapon)return'weapon';
    if(!eq.weapon2)return'weapon2';
    return score(eq.weapon2)<score(eq.weapon)?'weapon2':'weapon';
  }
  return sl;
}
async function submit(inv,eq){
  const ids={};['head','body','boots','ring','amulet','weapon','weapon2'].forEach(sl=>ids[sl]=itemId(eq?.[sl])||null);
  const row=await rpc('v7097_rearrange_item_ids',{
    p_event_id:requestId(),
    p_equipment_ids:ids
  });
  if(!row?.ok)throw new Error(String(row?.decision||'SERVER_REJECTED'));
  applyServer(row,{paint:true});
  A._gate={...(A._gate||{}),...clone(row),item_mode:'enforce',item_bridge_enabled:true};
  return row;
}
async function authoritativeEquip(index,clickedId){
  const gate=await refresh(false,false);
  if(!gate)return false;
  if(!A.enforce)return null;
  if(!ensure())return false;

  let idx=s.inventory.findIndex(x=>itemId(x)===clickedId);
  if(idx<0){
    toast('Inventar synchronisiert','warn','Das ausgewählte Item ist im Server-Inventar nicht mehr vorhanden.');
    repaint();
    return false;
  }
  const live=s.inventory[idx];
  if(!classOk(live)){
    toast('Falsche Klasse','warn','Dieses Item kann von deiner aktuellen Klasse nicht getragen werden.');
    return false;
  }
  const inv=clone(s.inventory),eq=clone(s.equipment);
  const it=inv[idx];
  const target=equipTarget(it,eq);
  if(!target){
    toast('Nicht anlegbar','warn','Das Item besitzt keinen gültigen Ausrüstungsplatz.');
    return false;
  }
  const old=eq[target]||null;
  eq[target]=it;
  inv.splice(idx,1);
  if(old)inv.push(old);

  try{
    const row=await submit(inv,eq);
    A.equips++;
    toast('✅ Server bestätigt','success',`${it?.name||'Item'} wurde angelegt.`);
    return !!row;
  }catch(e){
    A.lastError=String(e?.message||e);
    toast('Ausrüstung nicht geändert','error',A.lastError);
    await refresh(true,true);
    return false;
  }
}
async function authoritativeUnequip(slot){
  const gate=await refresh(false,false);
  if(!gate)return false;
  if(!A.enforce)return null;
  if(!ensure())return false;

  slot=String(slot||'');
  const live=s.equipment?.[slot];
  if(!live){repaint();return false}
  const inv=clone(s.inventory),eq=clone(s.equipment),it=eq[slot];
  inv.push(it);eq[slot]=null;

  try{
    const row=await submit(inv,eq);
    A.unequips++;
    toast('✅ Server bestätigt','success',`${it?.name||'Item'} wurde abgelegt.`);
    return !!row;
  }catch(e){
    A.lastError=String(e?.message||e);
    toast('Ausrüstung nicht geändert','error',A.lastError);
    await refresh(true,true);
    return false;
  }
}

/* Loaded last: for enforce accounts, manual gear changes can never fall back to
   a local-only mutation. Mirror/off accounts keep the established behavior. */
try{
  const base=window.equip;
  if(typeof base==='function'){
    window.equip=function(i){
      const ctx=this,args=arguments;
      if(!ensure())return base.apply(ctx,args);
      const clicked=itemId(s.inventory?.[Number(i)]);
      return serial(async()=>{
        const gate=await refresh(false,false);
        if(!gate||!A.enforce)return base.apply(ctx,args);
        if(!clicked){repaint();return false}
        return authoritativeEquip(Number(i),clicked);
      });
    };
    try{equip=window.equip}catch(_){}
  }
}catch(e){console.warn('[V7074] equip wrap',e)}

try{
  const base=window.unequip;
  if(typeof base==='function'){
    window.unequip=function(slot){
      const ctx=this,args=arguments;
      return serial(async()=>{
        const gate=await refresh(false,false);
        if(!gate||!A.enforce)return base.apply(ctx,args);
        return authoritativeUnequip(slot);
      });
    };
    try{unequip=window.unequip}catch(_){}
  }
}catch(e){console.warn('[V7074] unequip wrap',e)}

/* A late authoritative hydrate removes stale inventory/equipment from old local
   storage before the player interacts with it. No full-screen blocker is used. */
async function boot(){
  if(!userId())return;
  if(A.ready&&Date.now()-Number(A.lastSync||0)<5000)return;
  await refresh(true,true);
}
window.addEventListener('growlegends:account-ready',()=>{void boot()},{passive:true});
window.addEventListener('pageshow',()=>setTimeout(boot,950),{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&Date.now()-A.lastSync>45000)setTimeout(()=>void refresh(true,false),250);
},{passive:true});
setInterval(()=>{
  if(document.hidden||!A.enforce||!userId())return;
  /* Background verification must not repaint Character/Attributes by timer alone. */
  void refresh(true,false);
},60000);
setTimeout(()=>{if(!window.v7206StartupBusy?.())void boot()},2700);

window.v7074ItemAuthorityRefresh=(force=true,paint=true)=>refresh(!!force,paint!==false);
window.v7074ItemAuthorityDiagnostics=()=>clone({
  version:VERSION,ready:A.ready,enforce:A.enforce,uid:A.uid,
  revision:A.revision,lastSync:A.lastSync,lastError:A.lastError,
  hydrations:A.hydrations,equips:A.equips,unequips:A.unequips
});
})();
