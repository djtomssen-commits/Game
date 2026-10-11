(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const DEF=[
  ['staerke','💪','Stärke','Erhöht deinen Schaden'],
  ['geschick','🎯','Geschick','Erhöht Präzision und Tempo'],
  ['intelligenz','🧠','Intelligenz','Erhöht Magieschaden'],
  ['ausdauer','❤️','Ausdauer','Erhöht deine Lebenspunkte'],
  ['glueck','🍀','Glück','Verbessert Krit-Chance & Beute']
 ];

 /* V8.164: freeze the canonical calculator once. Several retired/compatibility
    layers still wrap the global totalAttr symbol later in boot. The attribute
    UI must not change its numeric source just because that global function
    identity changes. The captured calculator still reads the live state. */
 const canonicalTotalAttr=(typeof totalAttr==='function')
  ? totalAttr
  : (k=>Number(s?.attrs?.[k])||0);

 function primary(){try{return s?.playerClass==='scout'?'geschick':(s?.playerClass==='bruiser'||s?.playerClass==='summoner')?'intelligenz':'staerke'}catch(e){return'staerke'}}
 function value(k){try{return Math.round(Number(canonicalTotalAttr(k))||0)}catch(e){return Math.round(Number(s?.attrs?.[k])||0)}}
 function points(){try{return Math.max(0,Math.floor(Number(s?.points)||0))}catch(e){return 0}}
 function role(k){if(k===primary())return 'Hauptattribut · Schaden/Kampfkraft';if(k==='ausdauer')return 'Lebenspunkte';if(k==='glueck'){const c=Math.min(60,5+(Number(value('glueck'))||0)*0.35);return `Krit-Chance & Beute · Crit ${c.toFixed(1)} %`}return 'Nebenattribut'}
 function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 let v8178LastBreakdown=null,v8178FirstPaintAt=0;
 function v8178Breakdown(){
  const cls=String(s?.playerClass||''),rows={};
  DEF.forEach(([k])=>{
   const equipment=[];let equipmentTotal=0;
   try{Object.entries(s?.equipment||{}).forEach(([slot,it])=>{const n=Number(it?.bonus?.[k])||0;if(n){equipment.push({slot,id:String(it?.id||it?.uid||''),value:n,setId:it?.setId||null});equipmentTotal+=n}})}catch(_){}
   rows[k]={
    shown:value(k),
    base:Number(s?.attrs?.[k])||0,
    classBonus:Number(classes?.[cls]?.bonus?.[k])||0,
    equipmentTotal,
    equipment,
    setBonus:typeof setBonusValue==='function'?(Number(setBonusValue(k))||0):0
   };
  });
  return{uid:String((typeof v073User!=='undefined'&&v073User?.id)||window.v073User?.id||''),points:points(),classId:cls,setCount:(()=>{try{return Object.values(s?.equipment||{}).filter(it=>it?.setId===cls).length}catch(_){return 0}})(),rows};
 }
 /* V8.386: classify real, server-authoritative changes before warning.
    A +1 confirmed point and a material applied to a known equipped slot are
    normal stat changes, not unexplained value flicker. Beta-only logic. */
 let v8386ExpectedSpend=0,v8386ExpectedMaterial=0,v8386Unexplained=0;
 function v8386SameEquipment(a,b,exceptSlot=''){
  const normalized=items=>JSON.stringify((items||[])
   .filter(x=>x.slot!==exceptSlot)
   .map(x=>[x.slot,x.id,x.setId,Number(x.value)||0])
   .sort((x,y)=>String(x[0]).localeCompare(String(y[0]))));
  return normalized(a)===normalized(b);
 }
 function v8386ExpectedReason(before,after,keys){
  if(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()!=='beta')return '';
  if(!before.uid||before.uid!==after.uid||before.classId!==after.classId||before.setCount!==after.setCount)return '';
  if(keys.length===1&&before.points-after.points===1){
   const key=keys[0];
   const ok=DEF.every(([k])=>{
    const a=before.rows?.[k],b=after.rows?.[k];if(!a||!b)return false;
    return Number(b.base)-Number(a.base)===(k===key?1:0)
     &&Number(b.shown)-Number(a.shown)===(k===key?1:0)
     &&Number(a.classBonus)===Number(b.classBonus)
     &&Number(a.setBonus)===Number(b.setBonus)
     &&v8386SameEquipment(a.equipment,b.equipment);
   });
   if(ok)return 'spend';
  }
  const marker=window.__V8386_MATERIAL_APPLY_CONTEXT__;
  if(!marker||!marker.slot||Date.now()-Number(marker.at)>2500||Date.now()<Number(marker.at))return '';
  if(before.points!==after.points)return '';
  let equipmentDelta=false;
  const expected=DEF.every(([k])=>{
   const a=before.rows?.[k],b=after.rows?.[k];if(!a||!b)return false;
   if(Number(a.base)!==Number(b.base)||Number(a.classBonus)!==Number(b.classBonus)
      ||Number(a.setBonus)!==Number(b.setBonus)
      ||!v8386SameEquipment(a.equipment,b.equipment,marker.slot))return false;
   const old=(a.equipment||[]).find(x=>x.slot===marker.slot);
   const next=(b.equipment||[]).find(x=>x.slot===marker.slot);
   if(old&&next&&(old.id!==next.id||old.setId!==next.setId))return false;
   const difference=(Number(next?.value)||0)-(Number(old?.value)||0);
   if(Math.abs(difference)>0.00001)equipmentDelta=true;
   /* totalAttr is rounded; an equipment delta can shift the display by at
      most one whole unit more/less due to rounding its previous fraction. */
   return Math.abs((Number(b.shown)-Number(a.shown))-difference)<=1.00001;
  });
  if(expected&&equipmentDelta){
   window.__V8386_MATERIAL_APPLY_CONTEXT__=null;return 'material';
  }
  return '';
 }
 function v8178Report(before,after){
  try{
   if(!before||!after||Date.now()-v8178FirstPaintAt<250)return;
   const changed={};
   DEF.forEach(([k])=>{const a=before.rows?.[k],b=after.rows?.[k];if(Number(a?.shown)!==Number(b?.shown))changed[k]={before:a,after:b}});
   const keys=Object.keys(changed);
   if(!keys.length)return;
   const expected=v8386ExpectedReason(before,after,keys);
   if(expected==='spend'){v8386ExpectedSpend++;return}
   if(expected==='material'){v8386ExpectedMaterial++;return}
   v8386Unexplained++;
   /* Report only the pertinent numerical breakdown, not account IDs or
      item identifiers. The full comparison stays local in memory. */
   const safeChanges=Object.fromEntries(keys.map(k=>[k,{
    before:{shown:changed[k].before?.shown,base:changed[k].before?.base,
     equipmentTotal:changed[k].before?.equipmentTotal,
     classBonus:changed[k].before?.classBonus,setBonus:changed[k].before?.setBonus},
    after:{shown:changed[k].after?.shown,base:changed[k].after?.base,
     equipmentTotal:changed[k].after?.equipmentTotal,
     classBonus:changed[k].after?.classBonus,setBonus:changed[k].after?.setBonus}
   }]));
   void window.__GL_RUNTIME_WATCHDOG__?.report?.('attribute_value_changed','warn',{
    changed:safeChanges,
    beforeMeta:{classId:before.classId,setCount:before.setCount},
    afterMeta:{classId:after.classId,setCount:after.setCount}
   },{screen:'character',incidentKey:keys.join(',')});
  }catch(_){}
 }
 function paint(){
    if(!document.getElementById('character')?.classList.contains('active'))return false;
  const box=document.getElementById('attrs');if(!box)return false;
  const p=primary(),pts=points();
  const ordered=[...DEF.filter(x=>x[0]===p),...DEF.filter(x=>x[0]!==p)];
  const currentBreakdown=v8178Breakdown();
  const snapshot=ordered.map(([k])=>[k,currentBreakdown.rows[k].shown]);
  const sig=JSON.stringify([p,pts,snapshot]);
  if(box.dataset.v4140Sig===sig){
    v8178LastBreakdown=currentBreakdown;
    const ap=document.getElementById('v459AttrPoints');if(ap)ap.textContent=`${pts} Punkte`;
    document.getElementById('v419AttrPoints')?.remove();
    return true;
  }
  if(box.dataset.v4140Sig&&v8178LastBreakdown)v8178Report(v8178LastBreakdown,currentBreakdown);
  if(!v8178FirstPaintAt)v8178FirstPaintAt=Date.now();
  v8178LastBreakdown=currentBreakdown;
  box.dataset.v4140Sig=sig;
  box.innerHTML=ordered.map(([k,icon,name,desc])=>`<div class="v4140-attr ${k===p?'v4140-primary':''}" data-v4140-attr="${k}"><div class="v4140-attr-icon">${icon}</div><div class="v4140-attr-copy"><div class="v4140-attr-name">${esc(name)}</div><div class="v4140-attr-value">${value(k)}</div><div class="v4140-attr-desc">${esc(desc)}</div><div class="v4140-attr-role">${esc(role(k))}</div></div><button type="button" data-v4140-plus="${k}" ${pts<1?'disabled':''} aria-label="${esc(name)} erhöhen">+</button></div>`).join('');
  box.querySelectorAll('[data-v4140-plus]').forEach(btn=>{btn.onclick=()=>{const k=String(btn.dataset.v4140Plus||'');if(!DEF.some(x=>x[0]===k)||points()<1)return;try{if(typeof incAttr==='function')incAttr(k)}catch(e){console.warn('V4.159 attribute spend',e)};requestAnimationFrame(paint)}});
  const ap=document.getElementById('v459AttrPoints');if(ap)ap.textContent=`${pts} Punkte`;
  document.getElementById('v419AttrPoints')?.remove();
  return true;
 }
 window.v4140PaintAttributes=paint;
 /* V8.166: broad persist repaint retired.
    persist() is a global save/render primitive and is triggered by unrelated
    hydration/state changes. Attribute repaint is owned only by the attribute
    tab lifecycle, explicit point spending, and authoritative equipment sync. */
 window.__v4140PersistWrapped='retired-v8166';
 /* v459 owns visible attribute-tab lifecycle; persist repaint remains for actual point changes. */
 window.__v4140RenderWrapped='retired';
 window.__v4140GoWrapped='v459-tab-owner';
 window.v4140AttributeDiagnostics=()=>{const rows=[...document.querySelectorAll('#attrs > [data-v4140-attr]')];return{version:V.short,rowCount:rows.length,keys:rows.map(x=>x.dataset.v4140Attr),duplicates:rows.length-new Set(rows.map(x=>x.dataset.v4140Attr)).size,primary:primary(),points:points(),values:Object.fromEntries(DEF.map(([k])=>[k,value(k)])),calculatorFrozen:true,expectedSpendChanges:v8386ExpectedSpend,expectedMaterialChanges:v8386ExpectedMaterial,unexplainedChanges:v8386Unexplained}};
})();
