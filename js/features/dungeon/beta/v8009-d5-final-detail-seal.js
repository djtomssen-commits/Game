(()=>{
'use strict';
if(window.__V8009_DUNGEON_D5_FINAL_DETAIL_SEAL__)return;
window.__V8009_DUNGEON_D5_FINAL_DETAIL_SEAL__=true;
/* Workflow-triggered install: keep this file as the final post-legacy owner. */

const ALIASES=['v251RenderDetail','v244RenderSelectedDungeonMap','v064RenderMap','v260RenderDetail'];
let observer=null;
let raf=0;
let repairs=0;
let rebuilds=0;
let lastReason='boot';

function state(){
  try{return window.s?.dungeon??s?.dungeon??null}catch(_){return null}
}
function dungeonIndex(){
  try{if(typeof window.v048DungeonIndex==='function')return Math.max(0,Math.min(19,Number(window.v048DungeonIndex())||0))}catch(_){}
  try{return Math.max(0,Math.min(19,Number(state()?.selected)||0))}catch(_){return 0}
}
function visibleDetail(){
  const screen=document.getElementById('dungeon');
  const st=state();
  if(!screen?.classList.contains('active'))return false;
  if(st?.layer==='world'||String(st?.view||'map')!=='map')return false;
  return true;
}
function canonicalDetail(){
  return window.__V7166_CANONICAL_DETAIL__ || window.v261RenderDetail || null;
}
function enforceAliases(){
  const fn=canonicalDetail();
  if(typeof fn!=='function')return false;
  try{window.__V7166_CANONICAL_DETAIL__=fn}catch(_){}
  for(const name of ALIASES){
    try{window[name]=fn}catch(_){}
    try{
      if(name==='v251RenderDetail')v251RenderDetail=fn;
      else if(name==='v244RenderSelectedDungeonMap')v244RenderSelectedDungeonMap=fn;
      else if(name==='v064RenderMap')v064RenderMap=fn;
      else if(name==='v260RenderDetail')v260RenderDetail=fn;
    }catch(_){}
  }
  return true;
}
function canonicalDomHealthy(){
  const di=dungeonIndex();
  const card=document.getElementById('dungeonMapCard');
  const stage=card?.querySelector('.v261-stage');
  if(!card||!stage)return false;
  if(card.classList.contains('v467-d2'))return false;
  if(!card.classList.contains('gl-dungeon-canonical-map'))return false;
  if(String(card.dataset.glDungeonVisual||'')!==String(di+1))return false;

  const bg=stage.querySelector(':scope > .gl-dungeon-map-bg-img');
  const bgLoaded=!!bg&&!bg.hidden&&(!bg.complete||bg.naturalWidth>0);
  const bgFallback=stage.dataset.glMapFallback==='legacy'&&String(getComputedStyle(stage).backgroundImage||'')!=='none';
  if(!bgLoaded&&!bgFallback)return false;

  const rings=[...stage.querySelectorAll('.v261-ring')];
  if(rings.length<10)return false;
  const visibleRooms=rings.filter(ring=>{
    const img=ring.querySelector(':scope > .gl-dungeon-node-art');
    if(img&&!img.hidden&&(!img.complete||img.naturalWidth>0))return true;
    if(ring.dataset.glAssetFallback==='legacy'){
      try{if(String(getComputedStyle(ring).backgroundImage||'')!=='none')return true}catch(_){}
      if(ring.querySelector(':scope > .v261-bossart'))return true;
    }
    return false;
  }).length;
  if(visibleRooms<10)return false;
  return true;
}
function connect(){
  try{observer?.disconnect()}catch(_){}
  const root=document.getElementById('dungeon');
  if(!root)return;
  observer=new MutationObserver(()=>{
    if(!visibleDetail())return;
    if(canonicalDomHealthy())return;
    schedule('mutation');
  });
  observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','src','hidden']});
}
function seal(reason='manual'){
  lastReason=reason;
  if(!visibleDetail()){enforceAliases();return false}
  repairs++;
  try{observer?.disconnect()}catch(_){}
  enforceAliases();

  const card=document.getElementById('dungeonMapCard');
  if(card)card.classList.remove('v467-d2');

  if(!canonicalDomHealthy()){
    const fn=canonicalDetail();
    if(typeof fn==='function'){
      try{fn();rebuilds++}catch(e){console.warn('[V8.009 D5] canonical detail rebuild',e)}
    }
  }

  try{window.glDungeonVisualRefresh?.()}catch(e){console.warn('[V8.009 D5] visual refresh',e)}
  try{window.v7166DungeonDetailRepair?.('d5-final-seal:'+reason)}catch(_){}
  connect();
  return canonicalDomHealthy();
}
function schedule(reason){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;seal(reason)});
}

window.v8009DungeonD5FinalSeal=seal;
window.v8009DungeonD5SealQA=()=>({
  repairs,rebuilds,lastReason,
  visibleDetail:visibleDetail(),
  healthy:canonicalDomHealthy(),
  aliases:ALIASES.filter(n=>window[n]===canonicalDetail()),
  dungeon:dungeonIndex()+1,
  cardClass:document.getElementById('dungeonMapCard')?.className||'',
  bg:document.querySelector('#dungeonMapCard .gl-dungeon-map-bg-img')?.getAttribute('src')||'',
  nodeArts:document.querySelectorAll('#dungeonMapCard .gl-dungeon-node-art').length
});

enforceAliases();
connect();
document.addEventListener('click',e=>{
  const el=e.target instanceof Element?e.target:null;
  if(el?.closest?.('#dungeon,[data-screen="dungeon"],[data-go="dungeon"],#dungeonMapCard'))schedule('click');
},true);
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||e?.detail?.screen||'');
  if(id==='dungeon')schedule('navigation');
},{passive:true});
window.addEventListener('growlegends:foreground-ready',()=>schedule('foreground'),{passive:true});
window.addEventListener('pageshow',()=>schedule('pageshow'),{passive:true});
queueMicrotask(()=>seal('boot-microtask'));
requestAnimationFrame(()=>seal('boot-raf'));
})();