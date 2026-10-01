(()=>{
'use strict';
if(window.__V6297_CLASS_DISPLAY_PARITY__)return;window.__V6297_CLASS_DISPLAY_PARITY__=true;

const META=Object.freeze({
 grower:{name:'Bud-Barbar',icon:'⚔️',primary:'staerke'},
 scout:{name:'Blatt-Schütze',icon:'🏹',primary:'geschick'},
 bruiser:{name:'Bong-Magier',icon:'🔮',primary:'intelligenz'},
 frost:{name:'Bekiffter Frost-Todesritter',icon:'❄️',primary:'staerke'},
 summoner:{name:'Harzruferin',icon:'🕯️',primary:'intelligenz'}
});
window.V6297_CLASS_META=META;
window.v6297ClassMeta=id=>META[String(id||'')]||META.grower;
window.v6297ClassName=id=>(META[String(id||'')]||META.grower).name;

const state=()=>{try{return typeof s!=='undefined'?s:window.s||null}catch(_){return window.s||null}};
const activeClass=()=>String(state()?.playerClass||'grower');

function repairTowerRows(){
 document.querySelectorAll('#tower #vTRanking .vT-leader-row,#tower #vTWednesdayRanking .vT-leader-row').forEach(row=>{
   row.style.setProperty('display','grid','important');
   row.style.setProperty('grid-template-columns','30px minmax(0,1fr) auto','important');
   const score=row.querySelector('.vT-score');
   if(score){
     score.style.setProperty('display','block','important');
     score.style.setProperty('text-align','right','important');
     score.style.setProperty('margin-left','auto','important');
   }
 });
}
function repairCharacter(){
 if(activeClass()!=='summoner')return;
 const sub=document.getElementById('avatarSubtitle');
 if(sub&&!/Harzruferin/i.test(sub.textContent||''))sub.textContent='Harzruferin · Herrin von Nebel, Knochen und Bud-Geistern';
 const p=document.getElementById('v4156ClassPassive');
 if(p&&!/Ruf aus dem Dunst/i.test(p.textContent||'')){
   p.innerHTML='<b>🕯️ Klassenpassive · Ruf aus dem Dunst</b><br>10 % Grundchance auf einen Begleiter · spätestens der 5. eigene Angriff beschwört garantiert.';
 }
}
function repair(){repairTowerRows();repairCharacter()}

document.addEventListener('click',e=>{
 const hit=e.target instanceof Element?e.target.closest(
   '[data-screen="tower"],[data-go="tower"],[data-vt-tab="rank"],'+
   '[data-screen="character"],[data-go="character"],'+
   '[data-screen="hall"],[data-go="hall"],'+
   '[data-screen="guild"],[data-go="guild"]'
 ):null;
 if(hit)setTimeout(repair,40);
},true);
window.addEventListener('growlegends:account-ready',()=>setTimeout(repair,100));
window.addEventListener('pageshow',()=>setTimeout(repair,80),{passive:true});
window.addEventListener('growlegends:foreground-ready',repair,{passive:true});

window.v6297ClassDisplayDiagnostics=()=>({
 version:'V6.297',
 classId:activeClass(),
 classMeta:META[activeClass()]||null,
 towerRows:[...document.querySelectorAll('#tower #vTRanking .vT-leader-row')].map(r=>({
   classId:r.dataset.classId||'',
   display:getComputedStyle(r).display,
   score:r.querySelector('.vT-score b')?.textContent||'',
   floor:r.querySelector('.vT-score span')?.textContent||''
 }))
});
})();
