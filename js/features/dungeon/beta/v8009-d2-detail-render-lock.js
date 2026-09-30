(()=>{
'use strict';
if(window.__V7166_DUNGEON_DETAIL_RENDER_LOCK__)return;
window.__V7166_DUNGEON_DETAIL_RENDER_LOCK__=true;
const VERSION='V7.170';
let repairs=0,lastDungeon=0,lastReason='boot';

function dungeonIndex(){
  try{if(typeof window.v048DungeonIndex==='function')return Math.max(0,Math.min(19,Number(window.v048DungeonIndex())||0))}catch(_){}
  try{if(Number.isInteger(window.__GL_LIVE_DUNGEON_INDEX__))return Math.max(0,Math.min(19,window.__GL_LIVE_DUNGEON_INDEX__))}catch(_){}
  try{return Math.max(0,Math.min(19,Number(window.s?.dungeon?.selected??s?.dungeon?.selected)||0))}catch(_){return 0}
}
function isDetailVisible(){
  try{
    const screen=document.getElementById('dungeon');
    if(!screen?.classList.contains('active'))return false;
    const st=window.s?.dungeon??s?.dungeon;
    if(st?.layer==='world'||String(st?.view||'map')!=='map')return false;
    const card=document.getElementById('dungeonMapCard');
    return !!card&&card.style.display!=='none';
  }catch(_){return false}
}
function tagCard(di){
  const card=document.getElementById('dungeonMapCard');
  const stage=card?.querySelector('.v261-stage');
  if(!card||!stage)return false;
  for(let d=1;d<=20;d++)card.classList.remove(`v7166-d${d}`);
  const no=di+1;
  card.classList.add('gl-dungeon-canonical-map','v468-master',`v7166-d${no}`);
  card.dataset.v7166Dungeon=String(no);
  card.dataset.glDungeonVisual=String(no);
  card.dataset.v4165DungeonIndex=String(di);
  stage.style.setProperty('background-image',`url("v474_dungeon_assets/d${no}_bg.jpg")`,'important');
  stage.style.setProperty('background-size','cover','important');
  stage.style.setProperty('background-position','center center','important');
  stage.style.setProperty('background-repeat','no-repeat','important');
  return true;
}
function repair(reason='manual'){
  try{enforceCanonicalDetail('repair:'+reason)}catch(_){}
  if(!isDetailVisible())return false;
  const di=dungeonIndex();
  lastDungeon=di+1;lastReason=reason;repairs++;
  tagCard(di);
  try{window.glDungeonVisualRefresh?.()}catch(e){console.warn('[V7.168] canonical asset refresh',e)}
  tagCard(di);
  return true;
}
window.v7166DungeonDetailRepair=repair;

function assign(name,wrapped){
  try{window[name]=wrapped}catch(_){}
  try{
    if(name==='v251RenderDetail')v251RenderDetail=wrapped;
    else if(name==='v244RenderSelectedDungeonMap')v244RenderSelectedDungeonMap=wrapped;
    else if(name==='v064RenderMap')v064RenderMap=wrapped;
    else if(name==='v261RenderDetail')v261RenderDetail=wrapped;
    else if(name==='v260RenderDetail')v260RenderDetail=wrapped;
  }catch(_){}
}
/* Sprint 2: historical detail wrappers retired. The canonical D2 map owner
   calls v7166DungeonDetailRepair() directly after v261 renders. */


/* V8.009 D5: v261 is the final 10-room DOM owner.
   Older receipt/key/preview layers still call v251/v244/v064 directly.
   Point every historical detail entry at ONE canonical function so a late
   refresh cannot rebuild the black/simplified legacy map after D2 painted it. */
const canonicalAliases=['v251RenderDetail','v244RenderSelectedDungeonMap','v064RenderMap','v260RenderDetail'];
const canonicalDetail=window.v261RenderDetail;
let aliasRepairs=0,lastAliasReason='boot';
function enforceCanonicalDetail(reason='manual'){
  const fn=window.__V7166_CANONICAL_DETAIL__||canonicalDetail||window.v261RenderDetail;
  if(typeof fn!=='function')return false;
  window.__V7166_CANONICAL_DETAIL__=fn;
  lastAliasReason=reason;
  canonicalAliases.forEach(name=>{
    if(window[name]!==fn){
      assign(name,fn);
      aliasRepairs++;
    }
  });
  return true;
}
window.v7166EnforceCanonicalDetail=enforceCanonicalDetail;
enforceCanonicalDetail('boot');
setTimeout(()=>enforceCanonicalDetail('boot-120'),120);
setTimeout(()=>enforceCanonicalDetail('boot-500'),500);

/* Sprint 2: global renderDungeon wrapper retired. Repair is now a direct
   canonical hook plus event/foreground safety net. */


document.addEventListener('click',e=>{
  const el=e.target instanceof Element?e.target:null;
  if(el?.closest?.('#dungeonMapCard,[data-screen="dungeon"],[data-go="dungeon"]')){
    enforceCanonicalDetail('click');
    requestAnimationFrame(()=>repair('click'));
  }
},true);
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.screen||e?.detail||'')==='dungeon'){
    enforceCanonicalDetail('navigation');
    requestAnimationFrame(()=>repair('navigation'));
  }
},{passive:true});
window.addEventListener('growlegends:foreground-ready',()=>{
  enforceCanonicalDetail('foreground');
  requestAnimationFrame(()=>repair('foreground'));
},{passive:true});
window.addEventListener('pageshow',()=>{
  enforceCanonicalDetail('pageshow');
  setTimeout(()=>enforceCanonicalDetail('pageshow-120'),120);
  setTimeout(()=>enforceCanonicalDetail('pageshow-500'),500);
},{passive:true});

window.__V7166_DUNGEON_DETAIL_QA__=()=>({
  version:VERSION,
  repairs,
  lastDungeon,
  lastReason,
  active:typeof window.v7166DungeonDetailRepair==='function',
  wrapperMode:false,
  detailWrapped:[],
  canonicalAliases:canonicalAliases.filter(n=>window[n]===window.__V7166_CANONICAL_DETAIL__),
  aliasRepairs,
  lastAliasReason,
  cardClass:document.getElementById('dungeonMapCard')?.className||'',
  bg:document.querySelector('#dungeonMapCard .v261-stage')?.style?.backgroundImage||'',
  canonicalBg:document.querySelector('#dungeonMapCard .gl-dungeon-map-bg-img')?.getAttribute('src')||'',
  nodeArts:document.querySelectorAll('#dungeonMapCard .gl-dungeon-node-art').length,
  roadVisible:!!document.querySelector('#dungeonMapCard .v261-road')&&getComputedStyle(document.querySelector('#dungeonMapCard .v261-road')).display!=='none'
});

const V=Object.freeze({short:'V7.214',label:'V7.214 Stable',number:'7.213'});
window.GROW_LEGENDS_VERSION=V;
window.__GROW_LEGENDS_RELEASE__='V7.216';
window.__GL_CURRENT_BUILD__='V7.216';
const paintVersion=()=>{
  try{document.querySelectorAll('.version,.v372-logo em,.v371-logo em,.v366-ver').forEach(el=>{if(el?.tagName!=='STYLE')el.textContent=V.short})}catch(_){}
  try{document.title='Grow Legends V7.216'}catch(_){}
};
paintVersion();
window.addEventListener('growlegends:account-ready',paintVersion,{passive:true});
repair('boot');
})();
