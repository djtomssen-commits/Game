(()=>{
 'use strict';
 if(window.__V6235_ILLEGAL_BOOK__)return;
 window.__V6235_ILLEGAL_BOOK__=true;
 if(typeof V106_ACH==='undefined'||!Array.isArray(V106_ACH))return;

 const add=row=>{if(!V106_ACH.some(x=>x?.[0]===row[0]))V106_ACH.push(row)};
 const n=v=>Math.max(0,Math.floor(Number(v)||0));

 function petFound(){
   const f=s?.v686PetAlbum?.found;
   if(!f||typeof f!=='object')return 0;
   return Object.values(f).reduce((sum,row)=>sum+Object.values(row&&typeof row==='object'?row:{}).filter(Boolean).length,0);
 }
 function petRows(){
   const f=s?.v686PetAlbum?.found||{},qs=['normal','green','blue','purple','orange'];
   return Object.values(f).filter(row=>row&&qs.every(q=>!!row[q])).length;
 }
 function petMythicRows(){
   const f=s?.v686PetAlbum?.found||{},qs=['normal','green','blue','purple','orange','cyan'];
   return Object.values(f).filter(row=>row&&qs.every(q=>!!row[q])).length;
 }
 function towerFloor(){return n(s?.tower?.season?.bestFloor)}
 function loginDays(){return n(s?.v484DailyLogin?.totalClaims)}
 function forgeDismantled(){return n(s?.v488Forge?.dismantled)}
 function forgeCrafted(){return n(s?.v488Forge?.crafted)}
 function riftWins(){return n(s?.v457Endgame?.wins)}
 function riftBossWins(){return n(s?.v457Endgame?.bossWins)}
 function riftsDone(){return Array.isArray(s?.v457Endgame?.completed)?s.v457Endgame.completed.length:0}
 function orders(){return n(s?.grow?.v6160?.claimedTotal)}
 function pvpBuds(){return n(s?.v204Pvp?.buds)}
 function worldBossWins(){return n(s?.v110WorldBoss?.wins)}

 /* Anbauturm – visible best floor is already persistent for the active season.
    Once an achievement is completed, the Illegal Book done-state is permanent. */
 [
  ['tower10','Erste zehn Stockwerke','Erreiche im Anbauturm Etage 10.',towerFloor,10],
  ['tower25','Über den Dächern','Erreiche im Anbauturm Etage 25.',towerFloor,25],
  ['tower50','Halber Wolkenkratzer','Erreiche im Anbauturm Etage 50.',towerFloor,50],
  ['tower75','Höhenrausch','Erreiche im Anbauturm Etage 75.',towerFloor,75],
  ['tower100','Herr des Anbauturms','Erreiche im Anbauturm Etage 100.',towerFloor,100]
 ].forEach(add);

 /* Daily Login – cumulative claimed days, independent of the repeating 7-day cycle. */
 [
  ['login7','Eine Woche im Geschäft','Hole an 7 Tagen einen Login-Bonus ab.',loginDays,7],
  ['login30','Stammkunde','Hole an 30 Tagen einen Login-Bonus ab.',loginDays,30],
  ['login100','Immer wieder da','Hole an 100 Tagen einen Login-Bonus ab.',loginDays,100],
  ['login365','Kein freier Tag','Hole an 365 Tagen einen Login-Bonus ab.',loginDays,365]
 ].forEach(add);

 /* Pet Sammelalbum – uses the authoritative account-scoped collection. */
 [
  ['pet1','Erster Begleiter','Finde deine erste Pet-Qualitätsstufe.',petFound,1],
  ['pet10','Kleine Menagerie','Finde 10 Pet-Qualitätsstufen.',petFound,10],
  ['pet25','Das Album füllt sich','Finde 25 Pet-Qualitätsstufen.',petFound,25],
  ['pet50','Tierisch illegal','Finde 50 Pet-Qualitätsstufen.',petFound,50],
  ['pet100','Fast vollständige Sammlung','Finde 100 Pet-Qualitätsstufen.',petFound,100],
  ['petrow1','Erste komplette Reihe','Sammle bei einem Pet Normal bis Legendär komplett.',petRows,1],
  ['petrow5','Rudelbildung','Vervollständige 5 Pet-Reihen bis Legendär.',petRows,5],
  ['petrow10','Großer Sammler','Vervollständige 10 Pet-Reihen bis Legendär.',petRows,10],
  ['petrow20','Meister des Sammelalbums','Vervollständige alle 20 Pet-Reihen bis Legendär.',petRows,20],
  ['petmyth1','Mythischer Begleiter','Vervollständige eine Pet-Reihe inklusive Mythisch.',petMythicRows,1]
 ].forEach(add);

 /* Harzschmiede – existing lifetime counters. */
 [
  ['forge_d10','Erste Fragmente','Zerlege 10 Gegenstände in der Harzschmiede.',forgeDismantled,10],
  ['forge_d100','Schrott wird Gold wert','Zerlege 100 Gegenstände in der Harzschmiede.',forgeDismantled,100],
  ['forge_d500','Meister der Zerlegung','Zerlege 500 Gegenstände in der Harzschmiede.',forgeDismantled,500],
  ['forge_c1','Regenbogen-Schmied','Stelle dein erstes prismatisches Item her.',forgeCrafted,1],
  ['forge_c10','Prismatische Serie','Stelle 10 prismatische Items her.',forgeCrafted,10],
  ['forge_c25','Harzschmied-Meister','Stelle 25 prismatische Items her.',forgeCrafted,25]
 ].forEach(add);

 /* Nebelrisse – native persistent endgame counters. */
 [
  ['rift_win1','Erster Schritt ins Nichts','Besiege deinen ersten Nebelriss-Gegner.',riftWins,1],
  ['rift_1','Erster Riss versiegelt','Schließe den ersten Nebelriss ab.',riftsDone,1],
  ['rift_3','Drei Risse im Nebel','Schließe 3 Nebelrisse ab.',riftsDone,3],
  ['rift_6','Tiefe im Endgame','Schließe 6 Nebelrisse ab.',riftsDone,6],
  ['rift_9','Jenseits des Nebels','Schließe alle 9 Nebelrisse ab.',riftsDone,9],
  ['rift_boss5','Rissfürsten-Jäger','Besiege 5 Nebelriss-Endgegner.',riftBossWins,5],
  ['rift_win90','Endgame gesäubert','Gewinne alle 90 Nebelriss-Kämpfe.',riftWins,90]
 ].forEach(add);

 /* Existing modern systems get proper long-term tails. */
 [
  ['groworders250','Großabnehmer','Gib 250 Grow-Aufträge ab.',orders,250],
  ['groworders500','Logistikboss','Gib 500 Grow-Aufträge ab.',orders,500],
  ['pvp_buds500','Platin im Nebel','Besitze 500 PvP-Buds.',pvpBuds,500],
  ['pvp_buds1000','Diamant-Händler','Besitze 1.000 PvP-Buds.',pvpBuds,1000],
  ['pvp_buds2000','Legende der Hall of Haze','Besitze 2.000 PvP-Buds.',pvpBuds,2000],
  ['wb50','Smaragd-Plage','Besiege 50 mystische Weltbosse.',worldBossWins,50],
  ['wb100','Koloss-Auslöscher','Besiege 100 mystische Weltbosse.',worldBossWins,100]
 ].forEach(add);

 /* Final category + paging owner. Existing V405 is left intact underneath for compatibility,
    but this layer owns what the player sees after every book opening. */
 const PAGE_SIZE=20;
 const CATS=[
  ['all','📚','Alle'],
  ['level','⭐','Level'],
  ['quest','📜','Quest'],
  ['dungeon','⚔️','Dungeon'],
  ['grow','🌿','Growroom'],
  ['tower','🗼','Anbauturm'],
  ['endgame','🌌','Nebelrisse'],
  ['pvp','🏆','PvP'],
  ['boss','💀','Weltboss'],
  ['pets','🐾','Pets'],
  ['forge','🔨','Harzschmiede'],
  ['login','🎁','Login'],
  ['gear','💎','Ausrüstung'],
  ['wealth','🪙','Besitz'],
  ['talent','🌳','Talente']
 ];
 let active='all',page=0;

 function cat(id){
   id=String(id||'');
   if(/^tower/.test(id))return'tower';
   if(/^login/.test(id))return'login';
   if(/^pet/.test(id))return'pets';
   if(/^forge/.test(id))return'forge';
   if(/^rift/.test(id))return'endgame';
   if(/^talent/.test(id))return'talent';
   if(/^lvl|^power/.test(id))return'level';
   if(/^quest/.test(id))return'quest';
   if(/^d\d|^fight/.test(id))return'dungeon';
   if(/^grow|^seed|^genetics/.test(id))return'grow';
   if(/^pvp/.test(id))return'pvp';
   if(/^wb|^myth/.test(id))return'boss';
   if(/^equip|^gem|^ench|^legend/.test(id))return'gear';
   if(/^gold|^harz/.test(id))return'wealth';
   return'level';
 }

 function renderView(resetPage=false){
   const ov=document.getElementById('v106Overlay'),list=document.getElementById('v106BookList');
   if(!ov||!list||!ov.classList.contains('show'))return false;
   if(resetPage)page=0;

   const rows=V106_ACH;
   const cards=[...list.querySelectorAll('.v106-ach')];
   if(cards.length!==rows.length)return false;

   /* Remove older controls and rebuild a single final authority. */
   ov.querySelectorAll('.v405-category-wrap,.v405-filter-title,.v6235-page-info,.v6235-pager').forEach(x=>x.remove());

   const done=typeof v106CompletedCount==='function'?v106CompletedCount():cards.filter(c=>c.classList.contains('done')).length;
   const total=rows.length,pct=total?Math.round(done/total*100):0;
   let overall=ov.querySelector('.v404-overall');
   if(!overall){
     overall=document.createElement('div');overall.className='v404-overall';
     ov.querySelector('.v106-summary')?.insertAdjacentElement('afterend',overall);
   }
   overall.innerHTML=`<div class="v404-overall-top"><span>GESAMTFORTSCHRITT</span><b>${done} / ${total} · ${pct}%</b></div><div class="v404-overall-bar"><i style="width:${pct}%"></i></div>`;

   const wrap=document.createElement('div');wrap.className='v405-category-wrap v6235-category-wrap';
   wrap.innerHTML='<div class="v405-category-label">Kategorien</div><div class="v405-category-tabs">'+
     CATS.map(c=>`<button type="button" class="v405-category-tab ${active===c[0]?'active':''}" data-v6235-cat="${c[0]}">${c[1]} ${c[2]}</button>`).join('')+'</div>';
   overall.insertAdjacentElement('afterend',wrap);

   cards.forEach((card,i)=>{card.dataset.v6235Cat=cat(rows[i]?.[0]);card.style.display='none'});
   const filtered=cards.filter(c=>active==='all'||c.dataset.v6235Cat===active);
   const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
   page=Math.max(0,Math.min(page,pages-1));
   filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE).forEach(c=>c.style.display='block');

   const selected=CATS.find(c=>c[0]===active)||CATS[0];
   const info=document.createElement('div');info.className='v6235-page-info';
   info.innerHTML=`<span>${selected[1]} ${selected[2]}</span><b>${filtered.length} Erfolge · max. ${PAGE_SIZE} pro Seite</b>`;
   list.insertAdjacentElement('beforebegin',info);

   const pager=document.createElement('div');pager.className='v6235-pager';
   pager.innerHTML=`<button type="button" data-v6235-prev ${page<=0?'disabled':''}>‹ Vorherige</button><span>Seite ${page+1} / ${pages}</span><button type="button" data-v6235-next ${page>=pages-1?'disabled':''}>Nächste ›</button>`;
   list.insertAdjacentElement('afterend',pager);

   wrap.querySelectorAll('[data-v6235-cat]').forEach(btn=>btn.onclick=()=>{
     active=String(btn.dataset.v6235Cat||'all');page=0;renderView(false);
     try{list.scrollIntoView({block:'start'})}catch(_){}
   });
   pager.querySelector('[data-v6235-prev]').onclick=()=>{if(page>0){page--;renderView(false);try{list.scrollIntoView({block:'start'})}catch(_){}}};
   pager.querySelector('[data-v6235-next]').onclick=()=>{if(page<pages-1){page++;renderView(false);try{list.scrollIntoView({block:'start'})}catch(_){}}};

   /* Summary numbers always reflect all achievements, not only the current page. */
   const d=document.getElementById('v106Done'),t=document.getElementById('v106Total'),b=document.getElementById('v106Bonus');
   if(d)d.textContent=done;if(t)t.textContent=total;if(b)b.textContent=`+${done}`;
   return true;
 }

 const previous=window.v106OpenBook;
 if(typeof previous==='function'){
   window.v106OpenBook=function(){
     const wasAlreadyOpen=!!document.getElementById('v106Overlay')?.classList.contains('show');
     const r=previous.apply(this,arguments);
     renderView(!wasAlreadyOpen);
     return r;
   };
   try{v106OpenBook=window.v106OpenBook}catch(_){}
 }

 /* Immediately recognize achievements already satisfied by persistent save data. */
 try{v106CheckAchievements(false)}catch(e){console.warn('V6.235 initial achievement check',e)}

 window.v6235IllegalBookRender=(resetPage=false)=>renderView(!!resetPage);
 window.v6235IllegalBookViewState=()=>({category:active,page:page+1,pageIndex:page,pageSize:PAGE_SIZE,open:!!document.getElementById('v106Overlay')?.classList.contains('show')});
 window.v6235IllegalBookQA=()=>({
   total:V106_ACH.length,
   completed:typeof v106CompletedCount==='function'?v106CompletedCount():0,
   pageSize:PAGE_SIZE,
   categories:CATS.map(x=>x[0]),
   loginClaims:loginDays(),
   towerFloor:towerFloor(),
   petFound:petFound(),
   forgeCrafted:forgeCrafted(),
   riftsDone:riftsDone()
 });
})();
