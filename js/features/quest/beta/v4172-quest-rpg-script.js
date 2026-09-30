
(function(){
 const ELITE_CHANCE=6;
 function offers(){
   try{if(Array.isArray(s?.quests?.offers))return s.quests.offers.slice(0,3);if(Array.isArray(s?.quests?.available))return s.quests.available.slice(0,3);if(Array.isArray(s?.quests?.list))return s.quests.list.slice(0,3)}catch(e){}
   return [];
 }
 function energy(){try{return Math.max(0,Math.floor(Number(s?.energy??s?.dampf??0)||0))}catch(e){return 0}}
 function enhance(){
   const root=document.querySelector('#quests'); const hero=root?.querySelector('.v386-mira'); const shell=root?.querySelector('.v386-shell');
   if(!root||!hero||!shell)return;
   hero.querySelector('.v386-mira-name')?.replaceChildren(document.createTextNode('QUESTS'));
   const bubble=hero.querySelector('.v386-bubble'); if(bubble)bubble.textContent='Dampf verbrauchen, Belohnungen sichern!';
   if(!hero.querySelector('.v4172-giver-art')){const a=document.createElement('div');a.className='v4172-giver-art';hero.appendChild(a)}
   let res=shell.querySelector('.v4172-resource');
   if(!res){res=document.createElement('div');res.className='v4172-resource';hero.insertAdjacentElement('afterend',res)}
   const dampfCap=(typeof v271DampfCap==='function'?v271DampfCap():(typeof v271DampfEventActive==='function'&&v271DampfEventActive()?300:100));
   const dampfNow=Math.min(dampfCap,energy());
   res.innerHTML=`<div>💨 <b>${dampfNow}/${dampfCap}</b> Dampf<br><small>Regeneriert täglich um 00:00 Uhr</small></div><div class="seed">🌱 Zeit-Samen: <b>${Math.max(0,Math.floor(Number(s?.timeSeeds)||0))}</b></div>`;
   const qs=offers();
   root.querySelectorAll('.v386-card').forEach((card,i)=>{
     const q=qs[i]||{}; const body=card.querySelector('.v386-card-body');
     if(body){body.dataset.v4172Title=q.title||q.name||['Nebel über dem Gewächshaus','Spuren zum alten Labor','Der fluchende Gartenzwerg'][i]||'Auftrag';body.dataset.v4172Desc=q.desc||q.description||['Erkunde den Auftrag und sichere dir die Belohnung.','Folge den Spuren und finde heraus, was dahinter steckt.','Eine gefährliche Aufgabe wartet auf dich.'][i]||''}
     card.classList.toggle('v4172-elite-card',!!q.v310Elite);
   });
   let elite=shell.querySelector('.v4172-elite-info');
   if(!elite){elite=document.createElement('section');elite.className='v4172-elite-info';const ref=shell.querySelector('.v387-refresh');if(ref)ref.before(elite);else shell.appendChild(elite)}
   const activeElite=qs.some(q=>q?.v310Elite);
   elite.innerHTML=`<div class="v4172-elite-icon">👑</div><div><b>Elite-Quest</b><span>${activeElite?'Elite-Auftrag ist in den aktuellen Angeboten verfügbar.':'Kann nur nach einer erfolgreich abgeschlossenen Quest erscheinen.'}</span></div><b class="v4172-elite-chance">${ELITE_CHANCE} % Chance</b>`;
   /* V7.151: one owner places the elite block during the normal quest paint. */
   const list=shell.querySelector('.v386-list');
   if(list&&elite.nextElementSibling!==list)shell.insertBefore(elite,list);
 }
 const oldRender=renderQuests;renderQuests=function(){const r=oldRender.apply(this,arguments);setTimeout(enhance,0);return r};
 /* V7.122: duplicate quest-nav enhancement retired; renderQuests owns it. */
 setTimeout(enhance,700);
})();
