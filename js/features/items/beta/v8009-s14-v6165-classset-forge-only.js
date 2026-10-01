(()=>{
'use strict';
if(window.__V6165_CLASSSET_FORGE_ONLY__)return;window.__V6165_CLASSSET_FORGE_ONLY__=true;
const originalSetMaker=(typeof makeSetItem==='function'?makeSetItem:window.makeSetItem);
function cls(id){id=String(id||'grower');return ['grower','scout','bruiser','frost','summoner'].includes(id)?id:'grower'}
function makeEpicNonSet(classId){
 let it=null;
 try{if(typeof makeClassLoot==='function')it=makeClassLoot(cls(classId),'dungeon')}catch(e){console.warn('V4.165 fallback loot',e)}
 if(!it)return null;
 it={...it};
 it.quality='purple';it.rarity='epic';it.price=Number(it.price)||0;
 it.name=`Episch: ${String(it.name||'Klassenitem').replace(/^.*?:\s*/,'')}`;
 delete it.setId;delete it.setName;delete it.setFamily;delete it.setVariant;delete it.v6130Crafted;delete it.v6130GeneticRecipe;
 return it;
}
if(typeof originalSetMaker==='function'){
 const guarded=function(classId,slot){
   if(window.__GL_CLASSSET_FORGE_CRAFT__===true)return originalSetMaker.apply(this,arguments);
   return makeEpicNonSet(classId);
 };
 guarded.__v6165ForgeOnly=true;
 try{makeSetItem=guarded}catch(_){}
 try{window.makeSetItem=guarded}catch(_){}
}
function fragState(){
 try{s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};s.v488Forge.fragments=Math.max(0,Math.floor(Number(s.v488Forge.fragments)||0));return s.v488Forge}catch(_){return null}
}
function addFragments(min,max,source){
 const st=fragState();if(!st)return 0;
 const n=Math.max(1,Math.floor(min+Math.random()*(max-min+1)));st.fragments+=n;
 try{persist(false)}catch(_){}try{v069SyncCurrencies?.()}catch(_){}try{v441PaintResources?.()}catch(_){}
 try{v063Toast?.('💠 Schmiedefragmente gefunden','success',`+${n} Samenfragmente · ${source}`)}catch(_){}
 return n;
}
function installMaterialDrops(){
 const bus=window.GL_EVENTS;if(!bus||typeof bus.on!=='function'||window.__V6165_CLASSSET_MATERIAL_EVENTS__)return false;
 window.__V6165_CLASSSET_MATERIAL_EVENTS__=true;
 bus.on('questCompleted',ev=>{try{const q=ev?.quest||{},elite=!!ev?.elite||!!q.v310Elite||/elite/i.test(String(q.v309Role||q.v310BaseRole||q.v392Kind||''));const chance=elite?.10:.04;if(Math.random()<chance)addFragments(elite?5:3,elite?9:6,elite?'Elite-Quest':'Quest')}catch(e){console.warn('V4.165 quest fragments',e)}});
 bus.on('dungeonWon',ev=>{try{const boss=!!ev?.boss,chance=boss?.14:.02;if(Math.random()<chance)addFragments(boss?7:2,boss?14:4,boss?'Dungeonboss':'Dungeon')}catch(e){console.warn('V4.165 dungeon fragments',e)}});
 bus.on('pvpWon',()=>{try{if(Math.random()<.06)addFragments(3,5,'PvP-Sieg')}catch(e){console.warn('V4.165 pvp fragments',e)}});
 return true;
}
installMaterialDrops();
if(!window.__V6165_CLASSSET_MATERIAL_RETRY__){window.__V6165_CLASSSET_MATERIAL_RETRY__=true;let n=0;const t=setInterval(()=>{n++;if(installMaterialDrops()||n>30)clearInterval(t)},500)}
window.v6165ClassSetForgeOnlyQA=()=>({forgeOnly:!!window.__V6165_CLASSSET_FORGE_ONLY__,guarded:!!window.makeSetItem?.__v6165ForgeOnly,events:!!window.__V6165_CLASSSET_MATERIAL_EVENTS__,fragments:Number(s?.v488Forge?.fragments)||0});
})();
