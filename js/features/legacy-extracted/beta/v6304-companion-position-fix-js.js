
(()=>{
'use strict';
if(window.__V6304_COMPANION_POSITION_FIX__)return;
window.__V6304_COMPANION_POSITION_FIX__=true;

function repair(){
 try{
   if(String(s?.playerClass||'')!=='summoner')return;
   window.v6287EnsureRoster?.();
 }catch(_){}
}
document.addEventListener('click',e=>{
 const hit=e.target instanceof Element?e.target.closest(
   '#fightBtn,[data-vt-fight],[data-screen="dungeon"],[data-go="dungeon"],'+
   '[data-screen="tower"],[data-go="tower"],[data-screen="pvp"],[data-go="pvp"]'
 ):null;
 if(hit)setTimeout(repair,40);
},true);
window.addEventListener('growlegends:account-ready',repair,{passive:true});

window.v6304CompanionPositionDiagnostics=()=>({
 version:'V6.304',
 roster:document.querySelector('.v6287-summon-roster')?{
   position:getComputedStyle(document.querySelector('.v6287-summon-roster')).position,
   parent:document.querySelector('.v6287-summon-roster').parentElement?.id||document.querySelector('.v6287-summon-roster').parentElement?.className||''
 }:null,
 actor:document.querySelector('.v6287-summon-fx')?{
   left:getComputedStyle(document.querySelector('.v6287-summon-fx')).left,
   top:getComputedStyle(document.querySelector('.v6287-summon-fx')).top
 }:null
});
})();
