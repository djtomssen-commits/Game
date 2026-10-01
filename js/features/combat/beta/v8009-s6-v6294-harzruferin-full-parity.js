(()=>{
'use strict';
if(window.__V6294_HARZ_FULL_PARITY__)return;window.__V6294_HARZ_FULL_PARITY__=true;
const state=()=>{try{return typeof s!=='undefined'?s:window.s||null}catch(_){return window.s||null}};
const isSummoner=()=>String(state()?.playerClass||'')==='summoner';
function svgFallback(icon){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#071008"/><circle cx="150" cy="170" r="105" fill="#18321d" stroke="#76dd62" stroke-width="8"/><text x="150" y="210" text-anchor="middle" font-size="92">${icon}</text></svg>`;
 return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
}
window.v6294TowerImgFallback=(img,kind)=>{
 if(!img||img.dataset.v6294Fallback==='1')return;img.dataset.v6294Fallback='1';
 if(kind==='player'){try{const src=typeof v080AvatarFor==='function'?v080AvatarFor('summoner'):'';if(src&&src!==img.src){img.src=src;return}}catch(_){}img.src=svgFallback('🕯️')}
 else img.src=svgFallback('👹');
};
function repairTower(){
 if(!isSummoner())return;
 const stage=document.querySelector('#tower .v6259-battle');if(!stage)return;stage.classList.add('v6294-summoner-tower');
 const p=document.querySelector('#tower #vTPlayerFighter img'),e=document.querySelector('#tower #vTEnemyFighter img');
 for(const img of [p,e])if(img){img.style.setProperty('display','block','important');img.style.setProperty('visibility','visible','important');img.style.setProperty('opacity','1','important');img.style.setProperty('mix-blend-mode','normal','important');img.style.setProperty('-webkit-mask-image','none','important');img.style.setProperty('mask-image','none','important')}
 if(p&&(!p.getAttribute('src')||(p.complete&&p.naturalWidth===0)))window.v6294TowerImgFallback(p,'player');
 if(e&&(!e.getAttribute('src')||(e.complete&&e.naturalWidth===0)))window.v6294TowerImgFallback(e,'enemy');
}
window.v6294RepairTower=repairTower;
window.V6294_CLASSES=Object.freeze({
 grower:{name:'Bud-Barbar',primary:'staerke',style:'melee'},
 scout:{name:'Blatt-Schütze',primary:'geschick',style:'arrow'},
 bruiser:{name:'Bong-Magier',primary:'intelligenz',style:'magic'},
 frost:{name:'Frost-Todesritter',primary:'staerke',style:'melee'},
 summoner:{name:'Harzruferin',primary:'intelligenz',style:'magic'}
});
document.addEventListener('click',e=>{const n=e.target instanceof Element?e.target.closest('[data-screen="tower"],[data-go="tower"],[data-v085-go="tower"],[data-vt-route],[data-vt-fight]'):null;if(n)setTimeout(repairTower,40)},true);
window.addEventListener('growlegends:account-ready',repairTower,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='tower')repairTower()},{passive:true});
window.v6294HarzruferinParityDiagnostics=()=>({
 version:'V6.294',class:String(state()?.playerClass||''),combatPower:typeof combatPower==='function'?combatPower():null,
 gearTemplates:typeof classGear!=='undefined'?(classGear.summoner||[]).length:0,
 set:typeof classSets!=='undefined'?classSets.summoner?.name||null:null,
 talents:typeof V314_BRANCHES!=='undefined'?(V314_BRANCHES.summoner||[]).map(x=>x.id):[],
 tower:{stage:!!document.querySelector('#tower .v6294-summoner-tower'),player:!!document.querySelector('#tower #vTPlayerFighter img'),enemy:!!document.querySelector('#tower #vTEnemyFighter img')}
});
})();
