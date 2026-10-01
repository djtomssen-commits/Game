/* ===== V4.02 Illegales Buch: achievements ===== */
s.v106Achievements ??={done:{},stats:{plantsGrown:0,goldEarned:0,questsDone:0,dungeonWins:0,pvpWins:0,itemsFound:0}};

function v106MainAttrKey(){
  if(s.playerClass==='bruiser'||s.playerClass==='mage'||s.playerClass==='summoner')return 'intelligenz';
  if(s.playerClass==='scout'||s.playerClass==='ranger')return 'geschick';
  return 'staerke';
}
function v106MainAttrName(){
  return ({staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz'})[v106MainAttrKey()]||'Hauptattribut';
}
function v106Equipped(){return Object.values(s.equipment||{}).filter(Boolean)}
function v106AllEquippedGemmed(){const a=v106Equipped();return a.length>=6&&a.every(it=>!!it.gem)}
function v106AllEquippedEnchanted(){const a=v106Equipped();return a.length>=6&&a.every(it=>Array.isArray(it.enchants)&&it.enchants.length>0)}
function v106CompletedCount(){return Object.keys(s.v106Achievements.done||{}).length}

const V106_ACH=[
 ['lvl10','Erste Sporen','Erreiche Stufe 10.',()=>s.level,10],
 ['lvl20','Auf dem Weg nach oben','Erreiche Stufe 20.',()=>s.level,20],
 ['lvl30','Straßenlegende','Erreiche Stufe 30.',()=>s.level,30],
 ['lvl50','König der Gasse','Erreiche Stufe 50.',()=>s.level,50],
 ['lvl100','Lebende Legende','Erreiche Stufe 100.',()=>s.level,100],
 ['d1','Erster versiegelter Eingang','Schließe Dungeon Nr. 1 ab.',()=>s.dungeon?.completed?.includes(0)?1:0,1],
 ['d5','Dungeonjäger','Schließe 5 Dungeons ab.',()=>s.dungeon?.completed?.length||0,5],
 ['d10','Halbe Unterwelt','Schließe 10 Dungeons ab.',()=>s.dungeon?.completed?.length||0,10],
 ['d20','Herr der Unterwelt','Schließe alle 20 Dungeons ab.',()=>s.dungeon?.completed?.length||0,20],
 ['gold10k','Kleines Vermögen','Verdiene insgesamt 10.000 Gold.',()=>s.v106Achievements.stats.goldEarned||0,10000],
 ['gold100k','Goldhorter','Verdiene insgesamt 100.000 Gold.',()=>s.v106Achievements.stats.goldEarned||0,100000],
 ['gold1m','Schweres Geschäft','Verdiene insgesamt 1.000.000 Gold.',()=>s.v106Achievements.stats.goldEarned||0,1000000],
 ['grow10','Grüner Daumen','Growe 10 Pflanzen an.',()=>s.v106Achievements.stats.plantsGrown||0,10],
 ['grow100','Growroom-Profi','Growe 100 Pflanzen an.',()=>s.v106Achievements.stats.plantsGrown||0,100],
 ['grow1000','Botanischer Wahnsinn','Growe 1.000 Pflanzen an.',()=>s.v106Achievements.stats.plantsGrown||0,1000],
 ['quest10','Laufbursche','Schließe 10 Quests ab.',()=>s.v106Achievements.stats.questsDone||0,10],
 ['quest100','Auftragnehmer','Schließe 100 Quests ab.',()=>s.v106Achievements.stats.questsDone||0,100],
 ['quest500','Keine Fragen stellen','Schließe 500 Quests ab.',()=>s.v106Achievements.stats.questsDone||0,500],
 ['fight25','Kellerkämpfer','Besiege 25 Dungeon-Gegner.',()=>s.v106Achievements.stats.dungeonWins||0,25],
 ['fight250','Bossproblem','Besiege 250 Dungeon-Gegner.',()=>s.v106Achievements.stats.dungeonWins||0,250],
 ['pvp10','Unbeliebter Nachbar','Gewinne 10 PvP-Kämpfe.',()=>s.v106Achievements.stats.pvpWins||0,10],
 ['pvp100','Hall-of-Haze-Schrecken','Gewinne 100 PvP-Kämpfe.',()=>s.v106Achievements.stats.pvpWins||0,100],
 ['equip6','Voll ausgestattet','Trage auf allen 6 Slots Ausrüstung.',()=>v106Equipped().length,6],
 ['gemall','Alles gesockelt','Sockel alle angelegten Gegenstände.',()=>v106AllEquippedGemmed()?1:0,1],
 ['enchall','Alles verzaubert','Habe auf jedem angelegten Item eine Verzauberung.',()=>v106AllEquippedEnchanted()?1:0,1],
 ['harz50','Harziger Reichtum','Besitze gleichzeitig 50 Harz-Taler.',()=>s.harzTaler||0,50],
 ['harz250','Harzbaron','Besitze gleichzeitig 250 Harz-Taler.',()=>s.harzTaler||0,250],
 ['power500','Nicht mehr harmlos','Erreiche 500 Kampfkraft.',()=>{try{return combatPower()}catch(e){return 0}},500],
 ['power1500','Gefürchtet','Erreiche 1.500 Kampfkraft.',()=>{try{return combatPower()}catch(e){return 0}},1500],
 ['seed10','Wundertüten-Sammler','Besitze 10 legendäre Samen gleichzeitig.',()=>s.v077?.seeds||0,10]
];

function v106CheckAchievements(show=true){
  s.v106Achievements??={done:{},stats:{}};
  s.v106Achievements.done??={};s.v106Achievements.stats??={};
  let changed=false;
  for(const [id,title,desc,get,target] of V106_ACH){
    if(s.v106Achievements.done[id])continue;
    let val=0;try{val=Number(get())||0}catch(e){}
    if(val>=target){
      s.v106Achievements.done[id]={at:Date.now()};
      changed=true;
      if(show){
        setTimeout(()=>v063Toast(
          '🏆 Erfolg abgeschlossen!',
          'success',
          `${title} · +1 ${v106MainAttrName()}`
        ),100);
      }
    }
  }
  if(changed){
    if(show)try{window.v6111Sfx?.('achievement')}catch(e){}
    localStorage.setItem(KEY,JSON.stringify(s));
    try{v075ScheduleSave()}catch(e){}
  }
  return changed;
}

/* Every completed achievement permanently contributes +1 to the class main attribute. */
const v106OldTotalAttr=totalAttr;
totalAttr=function(k){
  let value=v106OldTotalAttr(k);
  if(k===v106MainAttrKey())value+=v106CompletedCount();
  return value;
};

function v106OpenBook(){
  v106CheckAchievements(false);
  const ov=document.querySelector('#v106Overlay');if(!ov)return;
  const done=v106CompletedCount(),total=V106_ACH.length;
  document.querySelector('#v106BookList').innerHTML=V106_ACH.map(([id,title,desc,get,target])=>{
    let val=0;try{val=Math.max(0,Number(get())||0)}catch(e){}
    const complete=!!s.v106Achievements.done[id];
    const pct=complete?100:Math.min(100,Math.round(val/target*100));
    const display=target>=1000?`${Math.min(val,target).toLocaleString('de-DE')} / ${target.toLocaleString('de-DE')}`:`${Math.min(val,target)} / ${target}`;
    return `<div class="v106-ach ${complete?'done':''}">
      <div class="v106-ach-top"><div class="v106-ach-title">${complete?'✓':'○'} ${title}</div><div class="v106-ach-reward">+1 ${v106MainAttrName()}</div></div>
      <div class="v106-ach-desc">${desc}</div>
      <div class="v106-progress"><i style="width:${pct}%"></i></div>
      <div class="v106-progress-text">${complete?'ABGESCHLOSSEN':display}</div>
    </div>`;
  }).join('');
  document.querySelector('#v106Done').textContent=done;
  document.querySelector('#v106Total').textContent=total;
  document.querySelector('#v106Bonus').textContent=`+${done}`;
  ov.classList.add('show');
}
function v106CloseBook(){document.querySelector('#v106Overlay')?.classList.remove('show')}

function v106InstallBook(){
  if(!document.querySelector('#v106Overlay')){
    const ov=document.createElement('div');ov.id='v106Overlay';ov.className='v106-overlay';
    ov.innerHTML=`<div class="v106-book">
      <div class="v106-head"><div><h2>📕 Illegales Buch</h2><p>Erfolge & Errungenschaften · Jeder Abschluss gibt dauerhaft +1 auf dein Hauptattribut.</p></div><button class="v106-close" onclick="v106CloseBook()">✕</button></div>
      <div class="v106-summary"><div>ERLEDIGT<b id="v106Done">0</b></div><div>GESAMT<b id="v106Total">0</b></div><div>ATTRIBUT-BONUS<b id="v106Bonus">+0</b></div></div>
      <div id="v106BookList" class="v106-list"></div>
    </div>`;
    document.body.appendChild(ov);
  }

  if(document.querySelector('#v106BookBtn'))return;
  const avatar=document.querySelector('.character-avatar')||document.querySelector('.character-stage img')?.parentElement||document.querySelector('.character-stage');
  if(!avatar)return;
  const btn=document.createElement('button');btn.id='v106BookBtn';btn.className='v106-book-btn';
  btn.innerHTML=`<span class="book">📕</span><span class="v523-book-copy"><span class="v523-book-title">Illegales Buch</span><span class="v106-book-info">Erfolge · +1 Hauptattribut je Abschluss</span></span>`;
  btn.onclick=v106OpenBook;
  avatar.insertAdjacentElement('afterend',btn);
}

/* Track plants from now on. */
const v106OldPlant=plantSelectedSeed;
plantSelectedSeed=function(...args){
  const before=(s.grow?.plants||[]).filter(Boolean).length;
  const result=v106OldPlant.apply(this,args);
  const after=(s.grow?.plants||[]).filter(Boolean).length;
  if(after>before){s.v106Achievements.stats.plantsGrown=(s.v106Achievements.stats.plantsGrown||0)+(after-before);v106CheckAchievements();}
  return result;
};

/* Track quest completions and earned gold from now on. */
const v106OldClaimQuest=claimQuest;
claimQuest=function(){
  const q=s.quests?.active;
  const ready=q&&Date.now()>=q.ends;
  const gold=ready?(Number(q.gold)||0):0;
  const result=v106OldClaimQuest.apply(this,arguments);
  if(ready){
    s.v106Achievements.stats.questsDone=(s.v106Achievements.stats.questsDone||0)+1;
    s.v106Achievements.stats.goldEarned=(s.v106Achievements.stats.goldEarned||0)+gold;
    v106CheckAchievements();
  }
  return result;
};

/* Generic checks catch level, dungeon completion, gear/gems/enchants, Harz and power.
   The Illegal Book is mounted only from the Character lifecycle. A global render
   wrapper used to reinsert it during unrelated renders and made the button jump. */
setInterval(()=>{if(document.hidden)return;try{v106CheckAchievements(true)}catch(e){}},12000);

function v106CharacterBookSync(){
  if(!document.getElementById('character'))return;
  try{v106InstallBook();v106CheckAchievements(false)}catch(e){}
}
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')==='character')v106CharacterBookSync();
},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{
  if(document.getElementById('character')?.classList.contains('active'))v106CharacterBookSync();
},{passive:true});
document.addEventListener('DOMContentLoaded',v106CharacterBookSync,{once:true});
if(document.readyState!=='loading')v106CharacterBookSync();
