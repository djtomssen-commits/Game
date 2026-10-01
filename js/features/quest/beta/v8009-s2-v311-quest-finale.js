/* ===== V4.02 Quest finale fight =====
   The quest is already completed. This is a short guaranteed-win presentation;
   payout happens only AFTER the animation finishes.
*/
let v311FightBusy=false;
const v311QuestBosses=[
 ['🪲','Panzer-Blattlaus'],['🪰','Trauerfliegen-Brut'],['🧟','Labor-Mutant'],
 ['🍄','Sporenwächter'],['🌵','Dornenbestie'],['🕷️','Milbenjäger'],
 ['🪨','Keller-Golem'],['👹','Nebel-Unhold']
];
function v311BossForQuest(q){
 const txt=`${q?.name||''} ${q?.text||''}`.toLowerCase();
 if(txt.includes('fliege'))return ['🪰','Riesentrauerfliege'];
 if(txt.includes('labor'))return ['🧟','Mutierter Laborwächter'];
 if(txt.includes('ungeziefer'))return ['🪲','Panzer-Blattlaus'];
 if(txt.includes('zwerg'))return ['🧙','Verfluchter Gartenwächter'];
 if(txt.includes('nebel'))return ['👹','Nebel-Unhold'];
 const n=Math.abs(Math.floor(Number(q?.id)||Date.now()))%v311QuestBosses.length;
 return v311QuestBosses[n];
}
function v311EnsureFight(){
 let o=document.querySelector('#v311QuestFight');if(o)return o;
 o=document.createElement('div');o.id='v311QuestFight';
 o.innerHTML=`<div class="v311-panel">
  <div class="v311-head"><div class="v311-kicker">⚔️ QUEST-FINALE</div><div class="v311-title">Der Weg zur Belohnung ist noch nicht frei!</div></div>
  <div class="v311-arena">
   <div class="v311-fighter"><div class="v311-avatar" id="v311PlayerAvatar"></div><div class="v311-name" id="v311PlayerName">Deine Legende</div><div class="v311-hp"><i id="v311PlayerHp"></i></div></div>
   <div class="v311-vs">VS</div>
   <div class="v311-fighter"><div class="v311-avatar v311-boss" id="v311BossAvatar">👹</div><div class="v311-name" id="v311BossName">Quest-Gegner</div><div class="v311-hp v311-enemy-hp"><i id="v311BossHp"></i></div></div>
  </div>
  <div class="v311-log" id="v311FightLog">Der Gegner stellt sich dir in den Weg …</div>
 </div>`;
 document.body.appendChild(o);return o;
}
function v311Sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function v311PlayFight(q){
 const o=v311EnsureFight(), [icon,boss]=v311BossForQuest(q);
 o.classList.toggle('elite',!!q.v310Elite);
 document.querySelector('#v311BossAvatar').textContent=q.v310Elite?'👹':icon;
 document.querySelector('#v311BossName').textContent=q.v310Elite?`ELITE · ${boss}`:boss;
 document.querySelector('#v311PlayerName').textContent=s.characterName||classes?.[s.playerClass]?.name||'Deine Legende';
 const pa=document.querySelector('#v311PlayerAvatar');
 try{
  const src=v080AvatarFor(s.playerClass);
  pa.innerHTML=`<img src="${src}" alt="Spielcharakter">`;
 }catch(e){pa.textContent=classes?.[s.playerClass]?.icon||'🧙'}
 const php=document.querySelector('#v311PlayerHp'),ehp=document.querySelector('#v311BossHp'),log=document.querySelector('#v311FightLog'),enemy=document.querySelector('#v311BossAvatar');
 php.style.width='100%';ehp.style.width='100%';enemy.classList.remove('v311-defeated');try{window.v6111Sfx?.('battleStart')}catch(e){}
 o.classList.add('show');
 const reduced=matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const wait=reduced?90:430;
 const enemyHp=[78,55,29,0], playerHp=[91,79,68];
 for(let i=0;i<4;i++){
   log.textContent=i===3?'💥 Finisher!':`⚔️ Treffer ${i+1} gegen ${boss}!`;
   pa.classList.add('v311-hit-player');await v311Sleep(wait/2);ehp.style.width=`${enemyHp[i]}%`;try{window.v6111Sfx?.(i===3?'crit':'hit')}catch(e){}pa.classList.remove('v311-hit-player');await v311Sleep(wait/2);
   if(i<3){
     log.textContent=`${q.v310Elite?'🔴':'☠️'} ${boss} schlägt zurück!`;
     enemy.classList.add('v311-hit-enemy');await v311Sleep(wait/2);php.style.width=`${playerHp[i]}%`;try{window.v6111Sfx?.('enemyHit')}catch(e){}enemy.classList.remove('v311-hit-enemy');await v311Sleep(wait/2);
   }
 }
 enemy.classList.add('v311-defeated');
 log.textContent=q.v310Elite?'🏆 ELITE-GEGNER BESIEGT!':'🏆 Gegner besiegt! Belohnung wird geöffnet …';try{window.v6111Sfx?.('win')}catch(e){}
 await v311Sleep(reduced?120:650);
 o.classList.remove('show');
}

/* Replace the final V4.02 click owner. We delay the EXISTING payout function,
   so Harz, Elite rewards, items, keys, achievements and reward modal stay canonical. */
const v311Base233ClaimQuest=v233ClaimQuest;
v233ClaimQuest=async function(){
 if(v311FightBusy)return;
 const q=s.quests?.active;
 if(!q||Date.now()<Number(q.ends||0))return;
 v311FightBusy=true;
 try{
   const won=await v311PlayFight({...q});
   if(won===false){
     try{v063Toast?.('Quest-Kampf verloren. Du kannst den Kampf erneut versuchen.','warn','Quest-Finale')}catch(_){}
     return false;
   }
   return v311Base233ClaimQuest();
 }catch(e){
   console.error('V4.02 quest finale',e);
   /* Animation failure must never steal an earned quest reward. */
   return v311Base233ClaimQuest();
 }finally{
   v311FightBusy=false;
 }
};
