/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-D5. DO NOT LOAD. */
(function(){
'use strict';
if(window.__V467_D2_DIRECT__)return;
window.__V467_D2_DIRECT__=true;
const ART=["assets/v7195-base64/9e7999eed33af2f77fb9.svg", "assets/v7195-base64/7e5cdcfba9f9f9c933a8.svg", "assets/v7195-base64/74b04bff4be81b8fa754.svg", "assets/v7195-base64/e73622e8c967f856b6a1.svg", "assets/v7195-base64/e3f1c3961a17b527cc61.svg", "assets/v7195-base64/600b6388f6b91f61f130.svg", "assets/v7195-base64/6c98008c386fb1e54bfa.svg", "assets/v7195-base64/27d4c4b9b083ea4ee793.svg", "assets/v7195-base64/dc909d73e5ec5f653a6c.svg"];
const BOSS_ART="assets/v7195-base64/10036d96d08155bdc84a.svg";
const POS=[[13, 15], [38, 19], [63, 23], [84, 30], [83, 48], [62, 56], [41, 64], [19, 56], [55, 78], [84, 84]];
const NAMES=['Blattlaus','Sporenwächter','Rankenbestie','Schimmelgolem','Milbenkrieger','Sporenläufer','Pilzmutant','Nachtfalter','Trauermücke','Wurzelkoloss'];
function selectedIndex(){try{return Math.max(0,Math.min(19,Number(s?.dungeon?.selected||0)||0));}catch(e){return -1;}}
function applyD2(force){
 const card=document.getElementById('dungeonMapCard'); if(!card)return;
 const di=force===true?1:selectedIndex();
 card.classList.toggle('v467-d2',di===1); if(di!==1)return;
 const title=card.querySelector('.v261-title'); if(title)title.innerHTML='DAS<br>ÜBERWUCHERTE<br>LABOR';
 card.querySelectorAll('[data-v261-room]').forEach((node,i)=>{
   const p=POS[i]; if(p){node.style.setProperty('--x',p[0]);node.style.setProperty('--y',p[1]);}
   const nm=node.querySelector('.v261-name'); if(nm&&NAMES[i])nm.textContent=NAMES[i];
 });
 card.querySelectorAll('.v261-road polyline').forEach(el=>el.setAttribute('points','13,15 38,19 63,23 84,30 83,48 62,56 41,64 19,56 55,78 84,84'));
 const sign=card.querySelector('.v261-signboard'); if(sign)sign.innerHTML='ACHTUNG<br>ÜBERWUCHERTES<br>LABOR<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small>';
 const line1=card.querySelector('.v261-line1'); if(line1){const m=String(line1.textContent||'').match(/^(\d+)\s*·/); const ri=m?Math.max(0,Math.min(9,Number(m[1])-1)):0; line1.textContent=(ri+1)+' · '+NAMES[ri]+(ri===9?' – BOSS':''); const thumb=card.querySelector('.v261-thumb'); if(thumb){thumb.textContent='';thumb.style.backgroundImage='url("'+(ri===9?BOSS_ART:ART[ri])+'")';} }
}
const base432=window.v432RenderDetail;
if(typeof base432==='function'&&!base432.__v467D2){
 const wrap=function(){const di=selectedIndex();const out=base432.apply(this,arguments);if(di===1)applyD2(true);else applyD2(false);return out;};
 wrap.__v467D2=true; window.v432RenderDetail=wrap;
}
try{const baseRender=window.renderDungeon||renderDungeon;if(typeof baseRender==='function'&&!baseRender.__v467D2){const rw=function(){const out=baseRender.apply(this,arguments);applyD2(false);return out;};rw.__v467D2=true;window.renderDungeon=rw;try{renderDungeon=rw}catch(e){}}}catch(e){}
setTimeout(()=>applyD2(false),40);
})();
