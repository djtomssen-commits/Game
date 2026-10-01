(()=>{
'use strict';
if(window.__V6296_HARZ_COMPANIONS__)return;
window.__V6296_HARZ_COMPANIONS__=true;

const state=()=>{try{return typeof s!=='undefined'?s:window.s||null}catch(_){return window.s||null}};
const active=()=>String(state()?.playerClass||'')==='summoner';

function rosterSoon(){
 if(!active())return;
 requestAnimationFrame(()=>{try{window.v6287EnsureRoster?.()}catch(_){}});
 setTimeout(()=>{try{window.v6287EnsureRoster?.()}catch(_){}},80);
}

/* Quest finale is a dynamic overlay. */
try{
 if(typeof v311PlayFight==='function'&&!v311PlayFight.__v6296Roster){
   const base=v311PlayFight;
   const wrapped=async function(){
     const p=base.apply(this,arguments);
     rosterSoon();
     return await p;
   };
   wrapped.__v6296Roster=true;
   try{v311PlayFight=wrapped}catch(_){}
   window.v311PlayFight=wrapped;
 }
}catch(_){}

/* Tower/dungeon/PvP buttons create or repaint their combat DOM after click. */
document.addEventListener('click',e=>{
 if(!active())return;
 const hit=e.target instanceof Element
   ? e.target.closest('[data-vt-fight],[data-vt-route],#fightBtn,[data-v209-fight],#v204FightBtn')
   : null;
 if(hit)rosterSoon();
},true);

window.v6296CompanionDiagnostics=()=>({
 version:'V6.296',
 active:active(),
 rosterNodes:document.querySelectorAll('.v6287-summon-roster').length,
 summonFxNodes:document.querySelectorAll('.v6287-summon-fx').length,
 rule:'10% Grundchance · spätestens 5. eigener Angriff garantiert'
});
})();
