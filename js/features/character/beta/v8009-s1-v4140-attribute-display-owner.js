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
 function role(k){if(k===primary())return 'Hauptattribut · Schaden/Kampfkraft';if(k==='ausdauer')return 'Lebenspunkte';if(k==='glueck'){let c='';try{if(typeof v267CritChance==='function')c=` · Crit ${Number(v267CritChance()).toFixed(1)} %`}catch(e){}return 'Krit-Chance & Beute'+c}return 'Nebenattribut'}
 function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 function paint(){
    if(!document.getElementById('character')?.classList.contains('active'))return false;
  const box=document.getElementById('attrs');if(!box)return false;
  const p=primary(),pts=points();
  const ordered=[...DEF.filter(x=>x[0]===p),...DEF.filter(x=>x[0]!==p)];
  box.innerHTML=ordered.map(([k,icon,name,desc])=>`<div class="v4140-attr ${k===p?'v4140-primary':''}" data-v4140-attr="${k}"><div class="v4140-attr-icon">${icon}</div><div class="v4140-attr-copy"><div class="v4140-attr-name">${esc(name)}</div><div class="v4140-attr-value">${value(k)}</div><div class="v4140-attr-desc">${esc(desc)}</div><div class="v4140-attr-role">${esc(role(k))}</div></div><button type="button" data-v4140-plus="${k}" ${pts<1?'disabled':''} aria-label="${esc(name)} erhöhen">+</button></div>`).join('');
  box.querySelectorAll('[data-v4140-plus]').forEach(btn=>{btn.onclick=()=>{const k=String(btn.dataset.v4140Plus||'');if(!DEF.some(x=>x[0]===k)||points()<1)return;try{if(typeof incAttr==='function')incAttr(k)}catch(e){console.warn('V4.159 attribute spend',e)};requestAnimationFrame(paint)}});
  const ap=document.getElementById('v459AttrPoints');if(ap)ap.textContent=`${pts} Punkte`;
  document.getElementById('v419AttrPoints')?.remove();
  return true;
 }
 window.v4140PaintAttributes=paint;
 /* V8.009: v434 live-sync duty consolidated here. Persist remains the state owner;
    this hook only repaints the canonical attribute UI after external point changes. */
 if(typeof persist==='function'&&!window.__v4140PersistWrapped){
  const basePersist=persist;
  persist=function(){
   const r=basePersist.apply(this,arguments);
   requestAnimationFrame(paint);
   return r;
  };
  try{window.persist=persist}catch(e){}
  window.__v4140PersistWrapped=true;
 }
 /* v459 owns visible attribute-tab lifecycle; persist repaint remains for actual point changes. */
 window.__v4140RenderWrapped='retired';
 window.__v4140GoWrapped='v459-tab-owner';
 window.v4140AttributeDiagnostics=()=>{const rows=[...document.querySelectorAll('#attrs > [data-v4140-attr]')];return{version:V.short,rowCount:rows.length,keys:rows.map(x=>x.dataset.v4140Attr),duplicates:rows.length-new Set(rows.map(x=>x.dataset.v4140Attr)).size,primary:primary(),points:points(),values:Object.fromEntries(DEF.map(([k])=>[k,value(k)])),calculatorFrozen:true}};
})();
