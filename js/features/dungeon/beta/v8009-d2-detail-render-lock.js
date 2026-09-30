(()=>{
'use strict';
if(window.__V7166_DUNGEON_DETAIL_RENDER_LOCK__)return;
window.__V7166_DUNGEON_DETAIL_RENDER_LOCK__=true;
const VERSION='V7.170';
const names=['v251RenderDetail','v244RenderSelectedDungeonMap','v064RenderMap','v261RenderDetail','v260RenderDetail','v426RenderDetail','v427RenderDetail'];
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
  }catch(_){}
}
names.forEach(name=>{
  try{
    const fn=window[name]||globalThis[name];
    if(typeof fn!=='function'||fn.__v7166DungeonDetailLock)return;
    const wrapped=function(){
      const out=fn.apply(this,arguments);
      repair(name);
      queueMicrotask(()=>repair(name+'-microtask'));
      requestAnimationFrame(()=>repair(name+'-raf'));
      return out;
    };
    wrapped.__v7166DungeonDetailLock=true;
    wrapped.__v7166Base=fn;
    assign(name,wrapped);
  }catch(e){console.warn('[V7.168] detail wrapper',name,e)}
});

try{
  const base=window.renderDungeon||((typeof renderDungeon==='function')?renderDungeon:null);
  if(typeof base==='function'&&!base.__v7166DungeonDetailLock){
    const wrapped=function(){
      const out=base.apply(this,arguments);
      repair('renderDungeon');
      return out;
    };
    wrapped.__v7166DungeonDetailLock=true;
    wrapped.__v7166Base=base;
    window.renderDungeon=wrapped;
    try{renderDungeon=wrapped}catch(_){}
  }
}catch(e){console.warn('[V7.168] renderDungeon wrapper',e)}

document.addEventListener('click',e=>{
  const el=e.target instanceof Element?e.target:null;
  if(el?.closest?.('#dungeonMapCard,[data-screen="dungeon"],[data-go="dungeon"]'))requestAnimationFrame(()=>repair('click'));
},true);
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.screen||e?.detail||'')==='dungeon')requestAnimationFrame(()=>repair('navigation'));
},{passive:true});
window.addEventListener('growlegends:foreground-ready',()=>requestAnimationFrame(()=>repair('foreground')),{passive:true});

window.__V7166_DUNGEON_DETAIL_QA__=()=>({
  version:VERSION,
  repairs,
  lastDungeon,
  lastReason,
  active:!!window.renderDungeon?.__v7166DungeonDetailLock,
  detailWrapped:names.filter(n=>!!window[n]?.__v7166DungeonDetailLock),
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
