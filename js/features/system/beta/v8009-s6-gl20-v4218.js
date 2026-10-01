(function(){
 const NAMES=['Der verseuchte Keller','Das überwucherte Labor','Der toxische Dachgarten','Die Sporenkatakomben','Der Harz-Sumpf','Die Schimmelminen','Der verbotene Gewächshaustrakt','Die Nebelkanäle','Der Dornenfriedhof','Das Labor unter Grünhain','Die Kristall-Growhöhle','Der Schädlingsbunker','Die Wurzelgruft','Der Pilztempel','Das verseuchte Hochhaus','Der Tunnel der Blattjäger','Die Harzfestung','Das schwarze Gewächshaus','Die Kammer des Grünfluchs','Der Thron der Milbenkaiserin'];
 const ARTS=['assets/v7198-base64/840b19b569ee8c8aabeb.jpg','assets/v7198-base64/2e78148db8b42d03faad.jpg','assets/v7198-base64/38c1637838f2a6676f9e.jpg','assets/v7198-base64/830e43463cc73262b014.jpg','assets/v7198-base64/75f80c915a9229a9c792.jpg','assets/v7198-base64/7edb55fae06c69c28c2f.jpg','assets/v7198-base64/dda08bd092f3c1314921.jpg','assets/v7198-base64/61bfad1c752edf799b13.jpg','assets/v7198-base64/916d473e8c1a1ad4d63b.jpg','assets/v7198-base64/e7c98a5a2bc6cd0f558e.jpg','assets/v7198-base64/4a76aeb8fcf2b14047fe.jpg','assets/v7198-base64/24e318d9a2aaa64728b6.jpg','assets/v7198-base64/8cc552e64ce6d4896205.jpg','assets/v7198-base64/97e59a5638b0bf66f6fe.jpg','assets/v7198-base64/99ed14a60d943124e773.jpg','assets/v7198-base64/de556fbee2dab4b313b8.jpg','assets/v7198-base64/9c9199af1ca784517bcc.jpg','assets/v7198-base64/236f43719a33c802598c.jpg','assets/v7198-base64/0b3999e7d14c5dbab54d.jpg','assets/v7198-base64/1482370ac9871ec892a9.jpg'];
 let painting=false;
 function canonicalDungeonReady(){
   try{
     if(window.__V7203_LOGIN_DUNGEON_READY__===true||window.__V7202_LOGIN_DUNGEON_READY__===true)return true;
     const d=window.v7051DungeonDiagnostics?.();
     if(d?.stateReady===true)return true;
     const logged=typeof v073User!=='undefined'&&!!v073User&&!v073User.is_anonymous;
     const established=!!s?.characterNameSet&&!!s?.playerClass;
     if(!logged||!established)return true;
     return false;
   }catch(_){return false}
 }
 const esc=v=>typeof v251Esc==='function'?v251Esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 function worldState(i){
   try{if(typeof v251DungeonWorldState==='function')return v251DungeonWorldState(i)}catch(e){}
   try{if(typeof dungeonCompleted==='function'&&dungeonCompleted(i))return 'completed'}catch(e){}
   const d=(typeof dungeons!=='undefined'?dungeons?.[i]:window.dungeons?.[i]);if(!d)return 'locked';
   const levelOk=Number(s?.level||0)>=Number(d.minLevel||1);let keyOk=i===0;
   try{keyOk=i===0||(typeof dungeonUnlocked==='function'&&dungeonUnlocked(i))}catch(e){}
   if(levelOk&&keyOk){
     for(let x=0;x<20;x++){
       try{const dx=dungeons?.[x];if(!dx)continue;if(typeof dungeonCompleted==='function'&&dungeonCompleted(x))continue;const l=Number(s?.level||0)>=Number(dx.minLevel||1);const k=x===0||(typeof dungeonUnlocked==='function'&&dungeonUnlocked(x));if(l&&k)return x===i?'current':'available'}catch(e){}
     }
     return 'available';
   }
   return 'locked';
 }
 function stateText(i,st){
   if(st==='completed')return '';
   if(st==='current')return 'AKTUELL';
   if(st==='available')return 'BETRETBAR';
   const d=dungeons?.[i];let req=Number(d?.minLevel||1);try{if(i>0&&typeof v250KeyRequiredLevel==='function')req=v250KeyRequiredLevel(i)}catch(e){}
   if(Number(s?.level||0)<req)return `AB LVL ${req}`;
   return `STEIN ${i+1} FEHLT`;
 }
 function nextIndex(){for(let i=0;i<20;i++){try{if(typeof dungeonCompleted!=='function'||!dungeonCompleted(i))return i}catch(e){return i}}return 19}
 function tile(i){
   const st=worldState(i),nm=NAMES[i]||`Dungeon ${i+1}`;
   const mark=st==='completed'?'✓':st==='locked'?'🔒':st==='current'?'⚔':'◆';
   return `<button type="button" class="gl20g-card ${st}" data-gl20g-dungeon="${i}" aria-label="Dungeon ${i+1}: ${esc(nm)}"><span class="gl20g-art" style="background-image:url('${ARTS[i]}')"></span><span class="gl20g-badge">${i+1}</span><span class="gl20g-mark">${mark}</span><span class="gl20g-info"><span class="gl20g-name">${esc(nm)}</span><span class="gl20g-state">${esc(stateText(i,st))}</span></span></button>`;
 }
 function hideLegacy(card){
   card.style.removeProperty('background-image');
   let el=card.previousElementSibling,n=0;while(el&&n++<8){const prev=el.previousElementSibling;const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(t.includes('verseuchte gebiete')&&!t.includes('dungeons'))el.style.setProperty('display','none','important');el=prev}
 }
 function render(){
   /* WICHTIG: Sobald ein Dungeon geöffnet wurde, darf kein alter World-Repaint
      die 10-Gegner-Karte wieder überschreiben. Das war der Grund, warum der
      aktuelle Dungeon scheinbar nicht anklickbar war. */
   if(s?.dungeon?.layer==='dungeon')return false;
   if(painting)return false;painting=true;
   try{
     try{v243RepairAndSaveDungeonKeys?.()}catch(e){}
     try{v250EnsureKeyProgress?.()}catch(e){}
     const card=document.querySelector('#dungeonMapCard')||document.querySelector('#dungeon > .card:first-of-type');if(!card)return false;
     document.getElementById('dungeonBattleCard')?.style.setProperty('display','none');
     card.id='dungeonMapCard';card.className='card gl20g-world';card.style.display='';card.style.backgroundImage='none';
     if(!canonicalDungeonReady()){
       const ticket=(typeof dungeonWaitText==='function'?dungeonWaitText():'Serverstand wird geprüft …');
       card.innerHTML=`<div class="gl20g-head"><div class="gl20g-skull">💀</div><div><div class="gl20g-kicker">VERSEUCHTE GEBIETE</div><div class="gl20g-title">DUNGEONS</div><div class="gl20g-sub">Wähle deinen Dungeon · 20 Gebiete · je 10 Gegner</div></div><div class="gl20g-ticket"><b>🎟️ DUNGEON-VERSUCH</b><span id="dungeonTicketText">${esc(ticket)}</span></div></div><div class="gl20g-mapframe"><div class="gl20g-server-loading"><div><i>⏳</i><b>Dungeonstand wird geladen</b><span>Abgeschlossene und freigeschaltete Dungeons werden zuerst serverseitig bestätigt. Bis dahin wird kein lokaler Zwischenstand als betretbar angezeigt.</span></div></div></div>`;
       hideLegacy(card);
       return true;
     }
     const next=nextIndex(),st=worldState(next),nm=NAMES[next]||`Dungeon ${next+1}`;
     let keyLabel='STARTGEBIET',keyMain='KEIN STEIN NÖTIG',keySub='Dungeon 1 ist direkt geöffnet';
     if(next>0){let has=false;try{has=typeof dungeonUnlocked==='function'&&dungeonUnlocked(next)}catch(e){};keyLabel=`SCHLÜSSELSTEIN ${next+1}`;keyMain=has?'GEFUNDEN':'NOCH NICHT GEFUNDEN';keySub=has?`Schlüsselstein ${next+1} gefunden`:(typeof v250KeyStatusText==='function'?v250KeyStatusText(next):`Schlüsselstein ${next+1} fehlt`)}
     const ticket=(typeof dungeonWaitText==='function'?dungeonWaitText():'Kostenlosen Versuch prüfen …');
     card.innerHTML=`<div class="gl20g-head"><div class="gl20g-skull">💀</div><div><div class="gl20g-kicker">VERSEUCHTE GEBIETE</div><div class="gl20g-title">DUNGEONS</div><div class="gl20g-sub">Wähle deinen Dungeon · 20 Gebiete · je 10 Gegner</div></div><div class="gl20g-ticket"><b>🎟️ DUNGEON-VERSUCH</b><span id="dungeonTicketText">${esc(ticket)}</span></div></div><div class="gl20g-mapframe"><div class="gl20g-grid">${Array.from({length:20},(_,i)=>tile(i)).join('')}</div></div><div class="gl20g-footer"><div class="gl20g-foot"><small>NÄCHSTER DUNGEON</small><b>${esc(nm)}</b><span>Dungeon ${next+1} · ${esc(stateText(next,st)||'ABGESCHLOSSEN')}</span></div><div class="gl20g-foot"><small>${esc(keyLabel)}</small><b class="${st!=='locked'?'green':''}">${esc(keyMain)}</b><span>${esc(keySub)}</span></div></div>`;
     card.querySelectorAll('[data-gl20g-dungeon]').forEach(btn=>{
       btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();openDungeon(Number(btn.dataset.gl20gDungeon))});
     });
     hideLegacy(card);
     return true;
   }finally{painting=false}
 }
 function openDungeon(i){
   i=Math.max(0,Math.min(19,Number(i)||0));
   const st=worldState(i),d=dungeons?.[i];if(!d)return false;
   if(st==='completed'){try{v063Toast?.(`${d.name} wurde bereits abgeschlossen.`,'warn')}catch(e){};return false}
   if(st==='locked'){try{v063Toast?.(stateText(i,st)||'Dieser Dungeon ist gesperrt.','warn',d.name)}catch(e){};return false}
   s.dungeon??={};s.dungeon.progress??={};s.dungeon.selected=i;s.dungeon.room=Math.max(0,Math.min(9,Number(s.dungeon.progress?.[i]??0)||0));s.dungeon.layer='dungeon';s.dungeon.view='map';
   try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
   let ok=false;
   try{if(typeof v251RenderDetail==='function')ok=v251RenderDetail()!==false;else if(typeof v244RenderSelectedDungeonMap==='function')ok=v244RenderSelectedDungeonMap()!==false;else if(typeof v064RenderMap==='function')ok=v064RenderMap()!==false}catch(e){console.error('GL20 V4.218 detail',e)}
   if(!ok)try{if(typeof renderDungeon==='function'){renderDungeon();ok=true}}catch(e){console.error(e)}
   if(ok)try{window.scrollTo({top:0,behavior:'smooth'})}catch(e){}
   return ok;
 }
 window.gl20RenderWorld=render;window.gl20OpenDungeon=openDungeon;window.v251RenderWorld=render;window.v065RenderWorld=render;
 const boot=()=>{const sec=document.getElementById('dungeon');if(sec?.classList.contains('active')&&s?.dungeon?.layer!=='dungeon')render()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
 window.addEventListener('pageshow',()=>setTimeout(boot,0));
})();
