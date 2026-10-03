/* ===== V4.02 Talentbaum: echte Kampffähigkeiten + Balance =====
   One combat ruleset is used by normal dungeons and the Smaragd-Koloss.
   Existing talent state remains V4.02; this layer gives the named milestone
   talents their actual combat behavior.
*/

function v318Has(branch,i){return typeof v314Rank==='function'&&v314Rank(branch,'m',i)>0}
function v318Seg(branch,i){return typeof v314Rank==='function'?v314Rank(branch,'s',i):0}
function v318SpentTotal(){return typeof v314Spent==='function'?v314Spent():0}
function v318MaxBranchSpent(){
 const a=V314_BRANCHES?.[s.playerClass]||[];
 return a.reduce((m,b)=>Math.max(m,v314BranchSpent(b.id)),0);
}
function v318AnyMilestone(i){
 return (V314_BRANCHES?.[s.playerClass]||[]).some(b=>v318Has(b.id,i));
}
function v318Clamp(x,a,b){return Math.max(a,Math.min(b,x))}

function v318NewCombatState(mode='dungeon',maxHpValue=1){
 return {
   mode,maxHp:Math.max(1,Number(maxHpValue)||1),
   attackCount:0,enemyAttackCount:0,crits:0,dodges:0,
   firstWucht:true,masterUsed:false,lethalSaveUsed:false,secondWindUsed:false,
   shieldUsed:false,salvoChainUsed:false,precisionExecuteUsed:false,
   chaosCrit:0,nextDamagePct:0,nextDodge:0,guaranteedDodge:false,
   dot:[],smokeMasterApplied:false
 };
}

/* Exact player-facing descriptions for milestone talents. */
const V318_MILESTONE_DESC={
 wucht:[
  'Jeder 6. eigene Angriff verursacht +35 % Schaden.',
  'Wuchtschläge verursachen zusätzlich +10 % Schaden.',
  'Unter 35 % Leben verursachst du +15 % Schaden.',
  'Wuchtschläge haben 15 % Chance auf einen zusätzlichen Treffer mit 50 % Schaden.',
  'Fehlendes Leben erhöht deinen Schaden bis maximal +14 %.',
  'Der erste Wuchtschlag eines Kampfes verursacht +50 % Zusatzschaden.',
  'Einmal pro Kampf wird ein Angriff zu BRUTALE ERNTE: 3× Schaden.'
 ],
 tank:[
  'Unter 50 % Leben erhältst du 5 % weniger Schaden.',
  '+5 % maximale Lebenspunkte.',
  'Einmal pro Kampf: unter 25 % Leben heilst du 15 % deiner maximalen LP.',
  'Sehr schwere Treffer werden zusätzlich um 15 % reduziert.',
  'Die ersten 2 gegnerischen Angriffe verursachen 10 % weniger Schaden.',
  '+8 % maximale Lebenspunkte.',
  'Einmal pro Kampf überlebst du einen tödlichen Treffer mit 1 LP.'
 ],
 rage:[
  'Zu Kampfbeginn +3 % zusätzliche Mehrfachtreffer-Chance.',
  'Mehrfachtreffer können Lebensraub auslösen.',
  'Jeder 5. Angriff erhält einen zusätzlichen Treffer mit 50 % Schaden.',
  'Unter 50 % Leben erhältst du +3 % Lebensraub.',
  'Crit/Wucht kann einen sofortigen Folgetreffer mit 40 % Schaden auslösen.',
  'Jeder 5. Angriff heilt 5 % deiner maximalen LP.',
  'Unter 30 % Leben: +20 % Schaden, +5 % Lebensraub und +8 % Mehrfachtreffer.'
 ],
 precision:[
  'Jeder 6. Angriff ist garantiert kritisch.',
  'Kritische Treffer verursachen +10 % Schaden.',
  'Gegner unter 30 % Leben erleiden +12 % Schaden.',
  'Kritische Treffer haben 10 % Chance auf +50 % Zusatzschaden.',
  '+5 % Crit-Chance und +10 % Crit-Schaden.',
  'Der erste Treffer gegen ein Ziel unter 20 % Leben verursacht +50 % Schaden.',
  'Einmal pro Kampf: PERFEKTER SCHUSS als garantierter 2,5× Crit.'
 ],
 dodge:[
  'Der erste gegnerische Angriff erhält +10 % Ausweichchance.',
  'Nach Ausweichen: 30 % Chance auf einen Konter mit 60 % deines Grundschadens.',
  'Nach 2 Ausweichmanövern verursacht dein nächster Angriff +15 % Schaden.',
  'Ausweichen heilt 2 % deiner maximalen Lebenspunkte.',
  'Nach einem Crit erhältst du für den nächsten Angriff +5 % Ausweichen.',
  'Einmal pro Kampf wird ein sonst tödlicher Treffer garantiert ausgewichen.',
  'Nach 3 Ausweichmanövern wird der nächste Angriff garantiert ausgewichen und gekontert.'
 ],
 salvo:[
  'Jeder 10. Angriff ist garantiert ein Doppeltreffer.',
  'Doppeltreffer können kritisch treffen.',
  'Doppeltreffer haben 12 % Chance auf einen dritten Treffer mit 45 % Schaden.',
  'Mehrfachtreffer werden innerhalb der Salve leicht stärker.',
  'Crits haben 15 % Chance auf einen zusätzlichen Treffer mit 40 % Schaden.',
  'Ein Folgetreffer kann einmal pro Kampf einen weiteren Folgetreffer erzeugen.',
  'Einmal pro Kampf: GRÜNER HAGEL mit 5 Treffern à 55 % Schaden.'
 ],
 magic:[
  'Jeder 6. Zauber verursacht +30 % Schaden.',
  '12 % Chance auf eine Rauchdetonation mit +35 % Zusatzschaden.',
  'Zauberschaden dauerhaft +10 %.',
  'Gegner über 70 % Leben erleiden +12 % Schaden.',
  'Intelligenz erhält einen zusätzlichen Talentbonus.',
  'Jeder 5. Zauber erhält +12 % Schaden.',
  'Einmal pro Kampf: SUPERNOVA mit 3× Schaden.'
 ],
 critmagic:[
  'Nach einem Crit verursacht der nächste Zauber +8 % Schaden.',
  'Crits haben 15 % Chance auf einen Kettenfunken mit 40 % Zusatzschaden.',
  'Nach 2 Crits erhält der nächste Zauber +10 % Schaden.',
  'Crits haben 10 % Chance auf +50 % Explosionsschaden.',
  'Nicht-Crits erhöhen die nächste Crit-Chance schrittweise.',
  'Eine Crit-Kette kann einmal pro Kampf um einen 40-%-Treffer verlängert werden.',
  'Bei einem Crit: 20 % Chance (Weltboss 10 %), einmal pro Kampf +100 % Grundschaden als KETTENREAKTION.'
 ],
 smoke:[
  'Der erste gegnerische Angriff verursacht 15 % weniger Schaden.',
  'Angriffe können einen kurzen Schaden-über-Zeit-Effekt auslösen.',
  'Rauch-DOT wird stärker und kann bis zu 2-mal stapeln.',
  'Unter 35 % Leben entsteht einmal pro Kampf ein Schild in Höhe von 15 % deiner LP.',
  '25 % des Rauch-DOT-Schadens heilt dich.',
  'Rauch-DOT hält eine Runde länger.',
  'Einmal pro Kampf: TODESNEBEL verursacht 3 Runden starken DOT und senkt Gegnerschaden.'
 ]
};

const v318OldTalentDesc=v314Desc;
v314Desc=function(branch,kind,i){
 if(kind==='m'&&V318_MILESTONE_DESC[branch]?.[i])return V318_MILESTONE_DESC[branch][i];
 return v318OldTalentDesc(branch,kind,i);
};

function v318ResolvePlayerAttack(st,ctx){
 const t=v314Summary();
 const mode=st.mode;
 const damp=mode==='worldboss'?.45:1;
 const playerRatio=v318Clamp((Number(ctx.playerHp)||1)/(Number(ctx.playerMax)||1),0,1);
 const enemyRatio=v318Clamp((Number(ctx.enemyHp)||1)/(Number(ctx.enemyMax)||1),0,1);
 st.attackCount++;

 let base=Math.max(1,Number(ctx.baseDamage)||1);
 let damagePct=t.damagePct*damp+st.nextDamagePct;
 st.nextDamagePct=0;

 let critChance=v318Clamp(
   (Number(ctx.baseCrit)||0)+(Number(ctx.setCrit)||0)+t.critChance*damp+st.chaosCrit,
   0,mode==='worldboss'?.24:.40
 );
 let forcedCrit=false;

 if(s.playerClass==='scout'&&v318Has('precision',0)&&st.attackCount%6===0)forcedCrit=true;
 if(s.playerClass==='scout'&&v318Has('precision',4)){
   critChance+=mode==='worldboss'?.025:.05;
 }
 if(s.playerClass==='bruiser'&&v318Has('critmagic',4)){
   critChance=v318Clamp(critChance+st.chaosCrit,0,mode==='worldboss'?.24:.40);
 }

 let crit=forcedCrit||Math.random()<critChance;
 if(crit){st.crits++;st.chaosCrit=0}else if(s.playerClass==='bruiser'&&v318Has('critmagic',4)){
   st.chaosCrit=v318Clamp(st.chaosCrit+.02,0,.10);
 }

 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('wucht',2)&&playerRatio<.35)damagePct+=.15*damp;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('wucht',4))damagePct+=Math.min(.14,(1-playerRatio)*.20)*damp;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',6)&&playerRatio<.30)damagePct+=.20*damp;
 if(s.playerClass==='scout'&&v318Has('precision',2)&&enemyRatio<.30)damagePct+=.12*damp;
 if(s.playerClass==='bruiser'&&v318Has('magic',2))damagePct+=.10*damp;
 if(s.playerClass==='bruiser'&&v318Has('magic',3)&&enemyRatio>.70)damagePct+=.12*damp;
 if(s.playerClass==='bruiser'&&v318Has('magic',0)&&st.attackCount%6===0)damagePct+=.30*damp;
 if(s.playerClass==='bruiser'&&v318Has('magic',5)&&st.attackCount%5===0)damagePct+=.12*damp;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('wucht',0)&&st.attackCount%6===0)damagePct+=.35*damp;
 if(s.playerClass==='scout'&&v318Has('dodge',2)&&st.dodges>=2){
   damagePct+=.15*damp;st.dodges=0;
 }

 base*=1+v318Clamp(damagePct,0,mode==='worldboss'?.38:.60);

 let critMult=1.75+t.critDamage*damp;
 if(s.playerClass==='scout'&&v318Has('precision',1))critMult+=.10*damp;
 if(s.playerClass==='scout'&&v318Has('precision',4))critMult+=.10*damp;
 if(crit)base*=critMult;

 let tags=[];
 if(crit)tags.push('KRIT');

 /* Grower Wucht */
 let wucht=false;
 if((s.playerClass==='grower'||s.playerClass==='frost')){
   const chance=v318Clamp((Number(ctx.baseWucht)||0)+t.wuchtChance+(v318Has('rage',6)&&playerRatio<.30?.08:0),0,.40);
   wucht=Math.random()<chance;
   if(wucht){
     base*=1.55;
     if(v318Has('wucht',1))base*=1+.10*damp;
     if(v318Has('wucht',5)&&st.firstWucht){base*=1+.50*damp;st.firstWucht=false}
     tags.push('WUCHT');
     if(v318Has('wucht',3)&&Math.random()<.15)base+=base*.50*damp;
   }
 }

 /* Scout multi-hit */
 let multi=false;
 if(s.playerClass==='scout'){
   let chance=v318Clamp((Number(ctx.baseDouble)||0)+t.doubleChance,0,.40);
   if(v318Has('salvo',0)&&st.attackCount%10===0)chance=1;
   multi=Math.random()<chance;
   if(multi){
     let second=.42+(Number(ctx.setDoubleDamage)||0);
     if(v318Has('salvo',3))second+=.05;
     base*=1+second;
     tags.push('SALVE');
     if(v318Has('salvo',2)&&Math.random()<.12)base+=base*.45*damp;
     if(v318Has('salvo',5)&&!st.salvoChainUsed&&Math.random()<.35){
       base+=base*.35*damp;st.salvoChainUsed=true;
     }
   }
   if(crit&&v318Has('salvo',4)&&Math.random()<.15)base+=base*.40*damp;
 }

 /* Mage crit chains */
 if(s.playerClass==='bruiser'&&crit){
   if(v318Has('critmagic',0))st.nextDamagePct+=.08*damp;
   if(v318Has('critmagic',1)&&Math.random()<.15)base+=base*.40*damp;
   if(v318Has('critmagic',2)&&st.crits%2===0)st.nextDamagePct+=.10*damp;
   if(v318Has('critmagic',3)&&Math.random()<.10)base+=base*.50*damp;
   if(v318Has('critmagic',5)&&!st.salvoChainUsed&&Math.random()<.25){
     base+=base*.40*damp;st.salvoChainUsed=true;
   }
   if(v318Has('critmagic',6)&&!st.masterUsed&&Math.random()<(mode==='worldboss'?.10:.20)){
     base*=2;st.masterUsed=true;tags.push('KETTENREAKTION');
   }
 }
 if(s.playerClass==='bruiser'&&v318Has('magic',1)&&Math.random()<.12)base+=base*.35*damp;

 /* Once-per-fight masteries. They intentionally do not stack with each other. */
 if(!st.masterUsed){
   if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('wucht',6)){
     base*=mode==='worldboss'?1.90:3;st.masterUsed=true;tags.push('BRUTALE ERNTE');
   }else if(s.playerClass==='scout'&&v318Has('precision',6)){
     forcedCrit=true;crit=true;base=Math.max(base,ctx.baseDamage*2.5*(mode==='worldboss'?.78:1));
     st.masterUsed=true;tags.push('PERFEKTER SCHUSS');
   }else if(s.playerClass==='scout'&&v318Has('salvo',6)){
     base=ctx.baseDamage*2.75*(mode==='worldboss'?.78:1);
     st.masterUsed=true;tags.push('GRÜNER HAGEL');
   }else if(s.playerClass==='bruiser'&&v318Has('magic',6)){
     base*=mode==='worldboss'?1.90:3;st.masterUsed=true;tags.push('SUPERNOVA');
   }
 }

 if(s.playerClass==='scout'&&v318Has('precision',5)&&enemyRatio<.20&&!st.precisionExecuteUsed){
   base*=1+.50*damp;st.precisionExecuteUsed=true;tags.push('HINRICHTUNG');
 }

 /* Rage extra hits and lifesteal. */
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',2)&&st.attackCount%5===0)base+=ctx.baseDamage*.50*damp;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',4)&&(crit||wucht)&&Math.random()<.12)base+=ctx.baseDamage*.40*damp;

 let lifeSteal=(s.playerClass==='grower'||s.playerClass==='frost')?v318Seg('rage',1)*.003:0;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',3)&&playerRatio<.50)lifeSteal+=.03;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',6)&&playerRatio<.30)lifeSteal+=.05;
 lifeSteal=v318Clamp(lifeSteal,0,.10);

 let damage=Math.max(1,Math.round(base));
 let heal=Math.round(damage*lifeSteal*(mode==='worldboss'?.60:1));
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',5)&&st.attackCount%5===0){
   heal+=Math.round(st.maxHp*.05*(mode==='worldboss'?.65:1));
 }

 /* Smoke DoT. */
 if(s.playerClass==='bruiser'&&(v318Has('smoke',1)||v318Has('smoke',2))){
   const proc=v318Has('smoke',2)?.26:.20;
   if(Math.random()<proc){
     const stacks=v318Has('smoke',2)?2:1;
     const rounds=v318Has('smoke',5)?3:2;
     const pct=v318Has('smoke',2)?.07:.05;
     if(st.dot.length<stacks)st.dot.push({rounds,damage:Math.max(1,Math.round(ctx.baseDamage*pct*damp))});
   }
 }
 if(s.playerClass==='bruiser'&&v318Has('smoke',6)&&!st.smokeMasterApplied){
   st.dot=[{rounds:3,damage:Math.max(1,Math.round(ctx.baseDamage*.12*damp)),master:true}];
   st.smokeMasterApplied=true;tags.push('TODESNEBEL');
 }

 let dotDamage=0;
 st.dot.forEach(d=>{dotDamage+=d.damage;d.rounds--});
 st.dot=st.dot.filter(d=>d.rounds>0);
 if(dotDamage){
   damage+=dotDamage;
   if(s.playerClass==='bruiser'&&v318Has('smoke',4)){
     heal+=Math.round(dotDamage*.25*(mode==='worldboss'?.60:1));
   }
   tags.push('DOT');
 }

 return {
   damage,heal,crit,wucht,multi,
   text:tags.length?tags.join(' + '):'TREFFER'
 };
}

function v318ResolveEnemyAttack(st,ctx){
 const t=v314Summary();
 const mode=st.mode;
 const damp=mode==='worldboss'?.45:1;
 st.enemyAttackCount++;

 let damage=Math.max(0,Number(ctx.damage)||0);
 const ratio=v318Clamp((Number(ctx.playerHp)||1)/(Number(ctx.playerMax)||1),0,1);
 let heal=0,counterDamage=0,preventLethal=false,text='Gegner trifft';

 /* Scout: real dodge mechanics, hard capped. */
 if(s.playerClass==='scout'){
   let dodge=Math.min(.22,totalAttr('geschick')*.008);
   dodge+=v318Seg('dodge',0)*.005;
   if(v318Has('dodge',0)&&st.enemyAttackCount===1)dodge+=.10;
   dodge+=st.nextDodge;st.nextDodge=0;
   if(v318Has('dodge',6)&&st.dodges>=3)st.guaranteedDodge=true;
   if(mode==='worldboss')dodge=Math.min(.20,dodge);
   else dodge=Math.min(.35,dodge);

   const lethal=damage>=Number(ctx.playerHp||0);
   if(v318Has('dodge',5)&&lethal&&!st.lethalSaveUsed){
     st.guaranteedDodge=true;st.lethalSaveUsed=true;
   }

   if(st.guaranteedDodge||Math.random()<dodge){
     damage=0;text='AUSGEWICHEN';st.dodges++;
     st.guaranteedDodge=false;
     if(v318Has('dodge',1)&&Math.random()<.30)counterDamage=Math.round((st.maxHp*.035+10)*.60*damp);
     if(v318Has('dodge',3))heal+=Math.round(st.maxHp*.02*(mode==='worldboss'?.60:1));
     if(v318Has('dodge',6)&&st.dodges>=3){
       counterDamage=Math.max(counterDamage,Math.round((st.maxHp*.035+10)*.60*damp));
       st.dodges=0;
     }
     return {damage:0,heal,counterDamage,preventLethal:false,text};
   }
 }

 /* Passive reductions are capped globally. V249 already applies the basic
    class reduction in eFactor; milestone reductions are added here. */
 let reduce=0;
 if((s.playerClass==='grower'||s.playerClass==='frost')){
   if(v318Has('tank',0)&&ratio<.50)reduce+=.05;
   if(v318Has('tank',4)&&st.enemyAttackCount<=2)reduce+=.10;
   if(v318Has('tank',3)&&damage>st.maxHp*.20)reduce+=.15;
 }
 if(s.playerClass==='bruiser'){
   if(v318Has('smoke',0)&&st.enemyAttackCount===1)reduce+=.15;
   if(v318Has('smoke',6)&&st.smokeMasterApplied)reduce+=.10;
 }
 reduce=v318Clamp(reduce,0,mode==='worldboss'?.22:.35);
 damage=Math.round(damage*(1-reduce*damp));

 /* Tank second wind / smoke shield. */
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('tank',2)&&ratio<.25&&!st.secondWindUsed){
   heal+=Math.round(st.maxHp*.15*(mode==='worldboss'?.65:1));
   st.secondWindUsed=true;text+=' · ZWEITE LUFT';
 }
 if(s.playerClass==='bruiser'&&v318Has('smoke',3)&&ratio<.35&&!st.shieldUsed){
   const shield=Math.round(st.maxHp*.15*(mode==='worldboss'?.65:1));
   damage=Math.max(0,damage-shield);
   st.shieldUsed=true;text+=' · RAUCHBARRIERE';
 }

 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('tank',6)&&damage>=Number(ctx.playerHp||0)+heal&&!st.lethalSaveUsed){
   preventLethal=true;st.lethalSaveUsed=true;text+=' · UNKRAUT VERGEHT NICHT';
 }
 return {damage,heal,counterDamage,preventLethal,text};
}

/* Additional HP milestones that are discrete abilities, not normal nodes. */
const v318BaseMaxHp=maxHp;
maxHp=function(){
 /* V4.87: Tank-Meilensteine +10 % / +15 % LP sind bereits in
    v319ExactTalentStats().hpPct enthalten. Hier nicht erneut multiplizieren. */
 return Math.round(Number(v318BaseMaxHp())||1);
};

/* Five new Illegales-Buch achievements around the talent tree. */
(function(){
 const ids=new Set(V106_ACH.map(x=>x[0]));
 const add=row=>{if(!ids.has(row[0])){V106_ACH.push(row);ids.add(row[0])}};
 add(['talent10','Verbotene Neugier','Verteile 10 Talentpunkte.',()=>v318SpentTotal(),10]);
 add(['talent50','Tiefer im Unterholz','Verteile 50 Talentpunkte.',()=>v318SpentTotal(),50]);
 add(['talent100branch','Schwarzmarkt-Spezialist','Investiere 100 Punkte in einen Talentast.',()=>v318MaxBranchSpent(),100]);
 add(['talent250','Fast nicht mehr legal','Schalte ein Level-250-Schlüsseltalent frei.',()=>v318AnyMilestone(5)?1:0,1]);
 add(['talent300','König des verbotenen Wissens','Erlerne ein Level-300-Meistertalent.',()=>v318AnyMilestone(6)?1:0,1]);
})();

/* Smaragd-Koloss: talent-aware but still normalized.
   The boss receives modest scaling from total invested points so a complete
   Level-300 build is useful without turning the event into a guaranteed win.
   Pity remains disabled by the existing V4.02 layer and is reasserted here. */
const v318BaseWorldBossModel=v290WorldBossModel;
v290WorldBossModel=function(){
 const m=v318BaseWorldBossModel();
 const t=v314Summary();
 const spent=v318SpentTotal();
 const progression=v318Clamp(spent/150,0,1);

 m.playerHp=Math.round(m.playerHp*(1+Math.min(.15,t.hpPct*.50)));
 m.playerBaseDamage=Math.round(m.playerBaseDamage*(1+Math.min(.10,t.primaryPct*.40)));
 m.bossHp=Math.round(m.bossHp*(1+progression*.18));
 m.bossAtk=Math.round(m.bossAtk*(1+progression*.15));

 m.pitySteps=0;
 m.pityDamage=1;
 m.v318TalentBalanced=true;
 return m;
};

/* Replace the worldboss fight owner with the same talent resolver used by dungeon. */
v110Fight=function(){
 if(!v110MysticEventActive())return v110Close();

 v110ResetDay();
 const wb=v290EnsureWorldBossState();

 if(wb.freeUsed){
   if((s.harzTaler||0)<10){
     return v063Toast('Zu wenig Harz-Taler','warn','Ein weiterer Weltboss-Versuch kostet 10 Harz-Taler.');
   }
   s.harzTaler-=10;
 }else wb.freeUsed=true;

 wb.attempts=(Number(wb.attempts)||0)+1;

 const m=v290WorldBossModel();
 let p=m.playerHp,e=m.bossHp,round=0,crits=0;
 const log=[];
 const talentFight=v318NewCombatState('worldboss',m.playerHp);
 const btn=document.querySelector('#v110Fight');
 if(btn)btn.disabled=true;

 const timer=(window.__V477_NATIVE_SET_INTERVAL__||window.setInterval)(()=>{
   round++;
   const phase=e/m.bossHp<=.25?3:e/m.bossHp<=.60?2:1;
   const phaseMult=phase===3?1.48:phase===2?1.25:1;
   const phaseEl=document.querySelector('#v110Phase');
   if(phaseEl)phaseEl.textContent=phase===3?'☠️ LETZTE BLÜTE':phase===2?'💚 SMARAGD-RASEREI':'MYSTISCHES EVENT';

   const base=Math.max(5,Math.round(m.playerBaseDamage*(.90+Math.random()*.20)));
   const a=v318ResolvePlayerAttack(talentFight,{
     baseDamage:base,enemyHp:e,enemyMax:m.bossHp,playerHp:p,playerMax:m.playerHp,
     baseCrit:m.critChance,setCrit:0,baseWucht:0,baseDouble:0,setDoubleDamage:0
   });
   if(a.crit)crits++;
   p=Math.min(m.playerHp,p+a.heal);
   e=Math.max(0,e-a.damage);
   log.push(`⚔️ ${a.text}: ${a.damage}${a.heal?` · +${a.heal} LP`:''}`);
   try{window.v6225ExtraHitVisual?.('worldboss',a.text,{round})}catch(_){}
    try{window.v6232CombatParityFx?.('worldboss',{phase:'player',raw:a.text,damage:a.damage,heal:a.heal,crit:a.crit,wucht:a.wucht,round})}catch(_){}

   if(e>0){
     const raw=Math.max(5,Math.round(m.bossAtk*phaseMult*(.90+Math.random()*.20)));
     const d=v318ResolveEnemyAttack(talentFight,{damage:raw,playerHp:p,playerMax:m.playerHp});
     p=Math.min(m.playerHp,p+d.heal);
     p=Math.max(0,p-d.damage);
     if(d.preventLethal&&p<=0)p=1;
     if(d.counterDamage)e=Math.max(0,e-d.counterDamage);
     log.push(`${phase===3?'☠️':phase===2?'💚':'🗿'} ${d.text}: ${d.damage}${d.counterDamage?` · Konter ${d.counterDamage}`:''}`);
     try{window.v6225ExtraHitVisual?.('worldboss',d.text,{round,actor:'defender'})}catch(_){}
      try{window.v6232CombatParityFx?.('worldboss',{phase:'enemy',raw:d.text,damage:d.damage,heal:d.heal,counter:d.counterDamage,prevent:d.preventLethal,round})}catch(_){}
   }

   const bossBar=document.querySelector('#v110BossHp'),playerBar=document.querySelector('#v110PlayerHp');
   const bossTxt=document.querySelector('#v110BossHpTxt'),playerTxt=document.querySelector('#v110PlayerHpTxt');
   const logEl=document.querySelector('#v110Log');
   if(bossBar)bossBar.style.width=`${Math.max(0,e/m.bossHp*100)}%`;
   if(playerBar)playerBar.style.width=`${Math.max(0,p/m.playerHp*100)}%`;
   if(bossTxt)bossTxt.textContent=`${e}/${m.bossHp}`;
   if(playerTxt)playerTxt.textContent=`${p}/${m.playerHp}`;
   if(logEl)logEl.textContent=log.slice(-8).join('\n');

   const scene=document.querySelector('#v111BossScene');
   if(scene){scene.classList.toggle('phase2',phase===2);scene.classList.toggle('phase3',phase===3)}

   if(e<=0||p<=0||round>=60){
     clearInterval(timer);if(btn)btn.disabled=false;
     const win=e<=0 || (round>=60 && p/m.playerHp>e/m.bossHp);
     if(win){
       wb.wins=(Number(wb.wins)||0)+1;wb.lossStreak=0;
       const item=Math.random()<.06?v110MakeRareMysticSet():v110MakeMysticItem();
       s.inventory.push(item);
       if(logEl)logEl.textContent=
         `🏆 DER SMARAGD-KOLOSS IST GEFALLEN!\n\n`+
         `Level ${m.level} · Talentpunkte ${v318SpentTotal()}/150 · ${crits} Crits\n\n`+
         `🔷 Garantierte mystische Beute:\n${item.name}\n${itemBonus(item)}\n✨ ${item.mysticSpecial?.label||''}`;
       v063Toast('🔷 MYSTISCHER SIEG!','success',`${item.name} erhalten!`);
     }else{
       wb.lossStreak=0;
       if(logEl)logEl.textContent=
         `☠️ Der Smaragd-Koloss hat dich besiegt.\nRestleben: ${Math.round(e/m.bossHp*100)} % · `+
         `Talentpunkte: ${v318SpentTotal()}/150.\nVerbessere Ausrüstung oder Talent-Build und fordere ihn erneut heraus.`;
       v063Toast('Weltboss nicht bezwungen','warn','Der Smaragd-Koloss bleibt bei jedem Versuch gleich stark.');
     }
     persist();v110Refresh();
   }
 },430); /* V4.86: native combat cadence; never pass through UI interval throttling. */
};

/* Refresh text must match the real no-pity + talent model. */
const v318BaseBossRefresh=v110Refresh;
v110Refresh=function(){
 const r=v318BaseBossRefresh();
 const box=document.querySelector('#v290BossBalance');
 if(box){
   box.innerHTML=box.innerHTML
     .replace(/Der Koloss normalisiert kritische Treffer\. Crit-Skill kann ihn nicht umgehen\./g,
              'Talentfähigkeiten wirken hier in abgeschwächter, für den Weltboss balancierter Form.')
     .replace(/<br><b>Der Koloss zeigt nach deinen Niederlagen erste Schwächen\.<\/b>/g,'');
 }
 return r;
};

const v318BaseRender=render;
render=function(){
 const r=v318BaseRender();
 try{v106CheckAchievements(true)}catch(e){}
 
 const line=document.querySelector('#v141VersionLine');
 return r;
};
