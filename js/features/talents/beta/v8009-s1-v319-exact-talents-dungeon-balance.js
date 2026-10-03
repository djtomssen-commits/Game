/* ===== V4.02 Exact Talent Mechanics + Dungeon Rebalance =====
   Every visible normal node and milestone has a mechanical effect.
   Dungeon enemies scale by their RECOMMENDED LEVEL, never by the player's
   actually spent points. Talents therefore remain a real advantage.
*/

const V319_SEG_DESC={
 wucht:[
  'Pro Rang +0,6 % direkter Schaden.',
  'Pro Rang +0,6 % Stärke.',
  'Pro Rang +2 % Wuchtschlag-Schaden.',
  'Nach einem Wuchtschlag erhält der nächste Angriff pro Rang +0,6 % Schaden.',
  'Gegner unter 30 % Leben erleiden pro Rang +1 % Schaden.',
  'Pro Rang +0,5 % Stärke.',
  'Durchdringt pro Rang 0,55 % der gegnerischen Widerstandskraft.'
 ],
 tank:[
  'Pro Rang +1 % maximale Lebenspunkte.',
  'Pro Rang 0,5 % weniger erlittener Schaden.',
  'Pro Rang +0,7 % maximale Lebenspunkte durch Ausdauertraining.',
  'Alle 3 gegnerischen Angriffe regenerierst du pro Rang 0,2 % deiner maximalen LP.',
  'Wirft pro Rang 0,4 % des erlittenen Schadens auf den Gegner zurück.',
  'Pro Rang 0,18 % weniger erlittener Schaden.',
  'Pro Rang +0,6 % maximale Lebenspunkte.'
 ],
 rage:[
  'Pro Rang +0,5 % Chance auf einen zusätzlichen Angriff.',
  'Pro Rang +0,3 % Lebensraub.',
  'Jede Kampfrunde erhöht deinen Schaden pro Rang um 0,15 %, bis zum Cap.',
  'Gegner unter 30 % Leben erleiden pro Rang +0,4 % Schaden.',
  'Unter 50 % Leben erhältst du pro Rang +0,2 % zusätzlichen Lebensraub.',
  'Pro Rang +0,3 % Chance auf einen 40-%-Folgetreffer nach Crit oder Wucht.',
  'Jeder 5. Angriff heilt pro Rang 0,15 % deiner maximalen LP.'
 ],
 precision:[
  'Pro Rang +0,6 % Geschick.',
  'Pro Rang +0,5 % Crit-Chance.',
  'Pro Rang +2 % Crit-Schaden.',
  'Pro Rang 0,6 % Verteidigungsdurchdringung.',
  'Pro Rang +0,4 % Chance, dass ein Crit nochmals 50 % Zusatzschaden verursacht.',
  'Pro Rang +0,3 % Crit-Chance.',
  'Gegner unter 30 % Leben erleiden pro Rang +0,4 % Schaden.'
 ],
 dodge:[
  'Pro Rang +0,5 % Ausweichchance.',
  'Nach Ausweichen erhält der nächste Angriff pro Rang +0,4 % Schaden.',
  'Der erste gegnerische Angriff erhält pro Rang +0,3 % zusätzliche Ausweichchance.',
  'Nach Ausweichen pro Rang +0,3 % Chance auf einen Konter.',
  'Nach mehreren Ausweichmanövern erhältst du pro Rang +0,3 % Schaden für den nächsten Angriff.',
  'Nach einem Crit erhältst du für den nächsten Gegnerangriff pro Rang +0,3 % Ausweichchance.',
  'Pro Rang +0,2 % dauerhafte Ausweichchance.'
 ],
 salvo:[
  'Pro Rang +0,5 % Doppeltreffer-Chance.',
  'Der zweite Treffer einer Salve verursacht pro Rang +2 % Grundschaden.',
  'Pro Rang +0,4 % Chance, dass Folgetreffer ebenfalls kritisch treffen.',
  'Pro Rang +0,4 % Chance auf einen dritten Treffer.',
  'Jeder weitere Treffer einer Salve wird pro Rang um 0,3 % stärker.',
  'Crits haben pro Rang +0,3 % Chance auf einen zusätzlichen 40-%-Treffer.',
  'Folgetreffer haben pro Rang +0,2 % Chance auf einen weiteren Kettentreffer.'
 ],
 magic:[
  'Pro Rang +0,6 % Intelligenz.',
  'Pro Rang +0,6 % Zauberschaden.',
  'Jeder 6. Zauber erhält pro Rang +0,4 % zusätzlichen Schaden.',
  'Pro Rang +0,3 % Chance auf eine Rauchdetonation.',
  'Pro Rang +0,3 % Zauberschaden.',
  'Pro Rang +0,3 % Intelligenz.',
  'Pro Rang 0,4 % magische Durchdringung.'
 ],
 critmagic:[
  'Pro Rang +0,5 % Crit-Chance.',
  'Pro Rang +2 % Crit-Schaden.',
  'Nach einem Crit erhält der nächste Zauber pro Rang +0,4 % Schaden.',
  'Pro Rang +0,3 % Chance auf einen Kettenfunken.',
  'Nicht-Crits erhöhen die nächste Crit-Chance pro Rang stärker.',
  'Crits haben pro Rang +0,3 % Chance auf eine zusätzliche Explosion.',
  'Pro Rang steigt die Chaos-Crit-Aufladung schneller.'
 ],
 smoke:[
  'Pro Rang 0,5 % weniger erlittener Schaden.',
  'Pro Rang +0,3 % Chance auf Rauch-DOT.',
  'Der erste gegnerische Treffer wird pro Rang um weitere 0,3 % reduziert.',
  'Pro Rang +0,2 % zusätzliche DOT-Chance.',
  'Pro Rang verursacht Rauch-DOT +0,3 % Grundschaden.',
  'Die Rauchbarriere erhält pro Rang +0,3 % deiner maximalen LP.',
  'Pro Rang werden 0,25 % des DOT-Schadens zusätzlich als Leben geheilt.'
 ],
 summon:[
  'Pro Rang +0,3 Prozentpunkte Beschwörungschance.',
  'Pro Rang +0,8 % Begleiterschaden.',
  'Pro Rang +0,4 Prozentpunkte Crit-Chance deiner Begleiter.',
  'Pro Rang +0,5 % Begleiterschaden.',
  'Pro Rang +0,25 Prozentpunkte Chance auf einen zweiten Begleiter.',
  'Pro Rang +0,25 Prozentpunkte Beschwörungschance und +0,2 % Intelligenz.',
  'Pro Rang +0,5 % Begleiterschaden.'
 ],
 soul:[
  'Pro Rang +0,2 % Lebensraub.',
  'Pro Rang +0,6 % maximale Lebenspunkte.',
  'Pro Rang 0,3 % weniger erlittener Schaden.',
  'Pro Rang +0,15 % Lebensraub.',
  'Pro Rang +0,25 % Begleiterschaden.',
  'Pro Rang 0,25 % weniger erlittener Schaden.',
  'Pro Rang +0,5 % maximale Lebenspunkte.'
 ],
 curse:[
  'Pro Rang +0,3 Prozentpunkte Fluch-/DOT-Chance.',
  'Pro Rang +0,4 % DOT-Schaden.',
  'Pro Rang +0,25 % Rüstungsdurchdringung.',
  'Pro Rang +0,25 % direkter Schaden.',
  'Pro Rang +0,2 Prozentpunkte Fluchchance und +0,2 % Schaden gegen verfluchte Ziele.',
  'Pro Rang +0,3 % DOT-Schaden.',
  'Pro Rang +0,25 % direkter Schaden.'
 ]
};

const v319BaseTalentDesc=v314Desc;
v314Desc=function(branch,kind,i){
 if(kind==='s'&&V319_SEG_DESC[branch]?.[i])return V319_SEG_DESC[branch][i];
 return v319BaseTalentDesc(branch,kind,i);
};

function v319ExactTalentStats(){
 const o={
  primaryPct:0,hpPct:0,damagePct:0,critChance:0,critDamage:0,damageReduce:0,
  wuchtChance:0,doubleChance:0,dodgeChance:0,lifeSteal:0,armorPen:0,
  wuchtDamage:0,afterWucht:0,executeDamage:0,regenEvery3:0,reflectPct:0,
  rampPerAttack:0,lowHpLife:0,followChance:0,healEvery5:0,
  postDodgeDamage:0,firstDodge:0,counterChance:0,dodgeStreakDamage:0,postCritDodge:0,
  secondHitDamage:0,multiCritChance:0,tripleChance:0,multiRamp:0,precisionCritExtraChance:0,salvoCritExtraChance:0,chainChance:0,
  overloadEvery6:0,detonationChance:0,postCritDamage:0,critChainChance:0,
  chaosStep:0,explosionChance:0,dotChance:0,dotDamagePct:0,firstHitReduce:0,
  shieldPct:0,dotHealPct:0
 };
 const a=(b,i,k,p)=>{o[k]+=v318Seg(b,i)*p};

 if((s.playerClass==='grower'||s.playerClass==='frost')){
  a('wucht',0,'damagePct',.006);a('wucht',1,'primaryPct',.006);a('wucht',2,'wuchtDamage',.02);
  a('wucht',3,'afterWucht',.006);a('wucht',4,'executeDamage',.01);a('wucht',5,'primaryPct',.005);a('wucht',6,'armorPen',.0055);
  a('tank',0,'hpPct',.01);a('tank',1,'damageReduce',.005);a('tank',2,'hpPct',.007);
  a('tank',3,'regenEvery3',.002);a('tank',4,'reflectPct',.004);a('tank',5,'damageReduce',.0018);a('tank',6,'hpPct',.006);
  a('rage',0,'doubleChance',.005);a('rage',1,'lifeSteal',.003);a('rage',2,'rampPerAttack',.0015);
  a('rage',3,'executeDamage',.004);a('rage',4,'lowHpLife',.002);a('rage',5,'followChance',.003);a('rage',6,'healEvery5',.0015);
 }else if(s.playerClass==='scout'){
  a('precision',0,'primaryPct',.006);a('precision',1,'critChance',.005);a('precision',2,'critDamage',.02);
  a('precision',3,'armorPen',.006);a('precision',4,'precisionCritExtraChance',.004);a('precision',5,'critChance',.003);a('precision',6,'executeDamage',.004);
  a('dodge',0,'dodgeChance',.005);a('dodge',1,'postDodgeDamage',.004);a('dodge',2,'firstDodge',.003);
  a('dodge',3,'counterChance',.003);a('dodge',4,'dodgeStreakDamage',.003);a('dodge',5,'postCritDodge',.003);a('dodge',6,'dodgeChance',.002);
  a('salvo',0,'doubleChance',.005);a('salvo',1,'secondHitDamage',.02);a('salvo',2,'multiCritChance',.004);
  a('salvo',3,'tripleChance',.004);a('salvo',4,'multiRamp',.003);a('salvo',5,'salvoCritExtraChance',.003);a('salvo',6,'chainChance',.002);
 }else if(s.playerClass==='bruiser'){
  a('magic',0,'primaryPct',.006);a('magic',1,'damagePct',.006);a('magic',2,'overloadEvery6',.004);
  a('magic',3,'detonationChance',.003);a('magic',4,'damagePct',.003);a('magic',5,'primaryPct',.003);a('magic',6,'armorPen',.004);
  a('critmagic',0,'critChance',.005);a('critmagic',1,'critDamage',.02);a('critmagic',2,'postCritDamage',.004);
  a('critmagic',3,'critChainChance',.003);a('critmagic',4,'chaosStep',.0015);a('critmagic',5,'explosionChance',.003);a('critmagic',6,'chaosStep',.001);
  a('smoke',0,'damageReduce',.005);a('smoke',1,'dotChance',.003);a('smoke',2,'firstHitReduce',.003);
  a('smoke',3,'dotChance',.002);a('smoke',4,'dotDamagePct',.003);a('smoke',5,'shieldPct',.003);a('smoke',6,'dotHealPct',.0025);
 }

 /* Passive milestone bonuses that are not proc-only. */
 if(s.playerClass==='scout'&&v318Has('precision',4)){o.critChance+=.05;o.critDamage+=.10}
 if(s.playerClass==='bruiser'&&v318Has('magic',2))o.damagePct+=.10;
 if(s.playerClass==='bruiser'&&v318Has('magic',4))o.primaryPct+=.08;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',0))o.doubleChance+=.03;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('tank',1))o.hpPct+=.07;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('tank',5))o.hpPct+=.10;

 o.critChance=v318Clamp(o.critChance,0,.40);
 o.doubleChance=v318Clamp(o.doubleChance,0,.25);
 o.dodgeChance=v318Clamp(o.dodgeChance,0,.35);
 o.lifeSteal=v318Clamp(o.lifeSteal,0,.10);
 o.damageReduce=v318Clamp(o.damageReduce,0,.35);
 o.armorPen=v318Clamp(o.armorPen,0,.30);
 o.critDamage=v318Clamp(o.critDamage,0,.80);
 o.damagePct=v318Clamp(o.damagePct,0,.55);
 o.hpPct=v318Clamp(o.hpPct,0,.55);
 o.primaryPct=v318Clamp(o.primaryPct,0,.35);
 o.reflectPct=v318Clamp(o.reflectPct,0,.05);
 return o;
}
window.v319ExactTalentStats=v319ExactTalentStats;

/* Make all global stat consumers use the exact passive mapping. */
v314Summary=function(){
 const x=v319ExactTalentStats();
 return {
  primaryPct:x.primaryPct,hpPct:x.hpPct,damagePct:x.damagePct,
  critChance:x.critChance,critDamage:x.critDamage,damageReduce:x.damageReduce,
  wuchtChance:x.wuchtChance,doubleChance:x.doubleChance
 };
};

/* V4.02's old compatibility reducer would double-apply talent defense.
   Keep only non-talent enchant reduction here; exact talent defense is below. */
v060EnemyDamageFactor=function(rec){
 let factor=Number(v249BaseEnemyDamageFactor(rec))||1;
 let reduction=0;
 try{
  if(typeof v030EnchantSum==='function'){
   reduction+=(Math.max(0,Number(v030EnchantSum('damageReduce'))||0)/100);
  }
 }catch(e){}
 return factor*(1-Math.min(.30,reduction));
};

v318NewCombatState=function(mode='dungeon',maxHpValue=1){
 return {
  mode,maxHp:Math.max(1,Number(maxHpValue)||1),
  attackCount:0,enemyAttackCount:0,crits:0,dodges:0,
  firstWucht:true,masterUsed:false,lethalSaveUsed:false,secondWindUsed:false,
  shieldUsed:false,salvoChainUsed:false,precisionExecuteUsed:false,
  chaosCrit:0,nextDamagePct:0,nextDodge:0,guaranteedDodge:false,
  nextGuaranteedCounter:false,lastBaseDamage:1,dot:[],smokeMasterApplied:false
 };
};

v318ResolvePlayerAttack=function(st,ctx){
 const x=v319ExactTalentStats();
 const damp=st.mode==='worldboss'?.45:1;
 const pr=v318Clamp((Number(ctx.playerHp)||1)/(Number(ctx.playerMax)||1),0,1);
 const er=v318Clamp((Number(ctx.enemyHp)||1)/(Number(ctx.enemyMax)||1),0,1);
 st.attackCount++;
 st.lastBaseDamage=Math.max(1,Number(ctx.baseDamage)||1);

 let base=st.lastBaseDamage;
 let damagePct=x.damagePct*damp+st.nextDamagePct;
 st.nextDamagePct=0;

 /* Real ramping/execute/penetration nodes. */
 damagePct+=Math.min(.15,st.attackCount*x.rampPerAttack)*damp;
 if(er<.30)damagePct+=Math.min(.16,x.executeDamage)*damp;
 damagePct+=x.armorPen*.50*damp;

 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('wucht',0)&&st.attackCount%6===0)damagePct+=.35*damp;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('wucht',2)&&pr<.35)damagePct+=.15*damp;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('wucht',4))damagePct+=Math.min(.14,(1-pr)*.20)*damp;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',6)&&pr<.30)damagePct+=.20*damp;
 if(s.playerClass==='scout'&&v318Has('precision',2)&&er<.30)damagePct+=.12*damp;
 if(s.playerClass==='bruiser'&&v318Has('magic',3)&&er>.70)damagePct+=.12*damp;
 if(s.playerClass==='bruiser'&&v318Has('magic',0)&&st.attackCount%6===0)damagePct+=.30*damp;
 if(s.playerClass==='bruiser'&&st.attackCount%6===0)damagePct+=x.overloadEvery6*damp;
 if(s.playerClass==='bruiser'&&v318Has('magic',5)&&st.attackCount%5===0)damagePct+=.12*damp;

 base*=1+v318Clamp(damagePct,0,st.mode==='worldboss'?.38:.62);

 let critChance=(Number(ctx.baseCrit)||0)+(Number(ctx.setCrit)||0)+x.critChance*damp+st.chaosCrit;
 if(s.playerClass==='scout'&&v318Has('precision',0)&&st.attackCount%6===0)critChance=1;
 critChance=v318Clamp(critChance,0,st.mode==='worldboss'?.24:.40);
 let crit=Math.random()<critChance;

 if(crit){
  st.crits++;st.chaosCrit=0;
  if(s.playerClass==='scout'){
   st.nextDodge+=x.postCritDodge*damp;
   if(v318Has('dodge',4))st.nextDodge+=.05*damp;
  }
 }else if(s.playerClass==='bruiser'&&(x.chaosStep>0||v318Has('critmagic',4))){
  st.chaosCrit=v318Clamp(st.chaosCrit+Math.max(.01,x.chaosStep),0,.10);
 }

 let damage=base;
 let tags=[];
 if(crit){
  /* V6.224: Schütze · Präzision Lv50 "Gezielter Schuss" = +10 Prozentpunkte Crit-Multiplikator.
     This restores the exact behavior of the earlier resolver without changing any other talent. */
  const aimedCritBonus=(s.playerClass==='scout'&&v318Has('precision',1))?.10*damp:0;
  damage*=1.75+x.critDamage*damp+aimedCritBonus;
  tags.push('KRIT');
  const precisionHeadshotChance=x.precisionCritExtraChance+(v318Has('precision',3)?.10:0);
  const dmgExtra=Math.random()<v318Clamp(precisionHeadshotChance,0,.25)?.50:0;
  if(dmgExtra){damage+=base*dmgExtra*damp;tags.push('KOPFSCHUSS')} 
  if(s.playerClass==='bruiser'){
   st.nextDamagePct+=x.postCritDamage*damp;
   if(v318Has('critmagic',0))st.nextDamagePct+=.08*damp;
   if(v318Has('critmagic',2)&&st.crits%2===0)st.nextDamagePct+=.10*damp;
   if(Math.random()<x.critChainChance){damage+=base*.40*damp;tags.push('KETTENFUNKE')}
   if(v318Has('critmagic',1)&&Math.random()<.15){damage+=base*.40*damp;tags.push('KETTENFUNKE')}
   if(Math.random()<x.explosionChance){damage+=base*.50*damp;tags.push('EXPLOSION')}
   if(v318Has('critmagic',3)&&Math.random()<.10){damage+=base*.50*damp;tags.push('EXPLOSION')}
   if(v318Has('critmagic',5)&&!st.salvoChainUsed&&Math.random()<.25){
    damage+=base*.40*damp;st.salvoChainUsed=true;tags.push('FOLGETREFFER');
   }
   if(v318Has('critmagic',6)&&!st.masterUsed&&Math.random()<(st.mode==='worldboss'?.10:.20)){
    damage+=base;st.masterUsed=true;tags.push('KETTENREAKTION');
   }
  }
 }

 let wucht=false,multi=false;
 if((s.playerClass==='grower'||s.playerClass==='frost')){
  const wc=v318Clamp((Number(ctx.baseWucht)||0)+x.wuchtChance,0,.40);
  wucht=Math.random()<wc;
  if(wucht){
   damage*=1.55+x.wuchtDamage*damp;
   if(v318Has('wucht',1))damage*=1+.10*damp;
   if(v318Has('wucht',5)&&st.firstWucht){damage*=1+.50*damp;st.firstWucht=false;tags.push('UNAUFHALTSAM')}
   if(v318Has('wucht',3)&&Math.random()<.15){damage+=base*.50*damp;tags.push('BLUTBAD')}
   st.nextDamagePct+=x.afterWucht*damp;
   tags.push('WUCHT');
  }
  if((crit||wucht)&&Math.random()<x.followChance){damage+=base*.40*damp;tags.push('FOLGETREFFER')}
  if(v318Has('rage',4)&&(crit||wucht)&&Math.random()<.12){damage+=base*.40*damp;tags.push('FOLGETREFFER')}
  if(v318Has('rage',2)&&st.attackCount%5===0){damage+=base*.50*damp;tags.push('ZUSATZTREFFER')}

  /* Raserei normal nodes are real multiattack mechanics. */
  let rageMultiChance=x.doubleChance;
  if(v318Has('rage',6)&&pr<.30)rageMultiChance+=.08;
  rageMultiChance=v318Clamp(rageMultiChance,0,.25);
  if(Math.random()<rageMultiChance){
   multi=true;
   damage+=base*.55*damp;
   tags.push('RASEREI');
  }
 }

 if(s.playerClass==='scout'){
  let mc=v318Clamp((Number(ctx.baseDouble)||0)+x.doubleChance,0,.40);
  if(v318Has('salvo',0)&&st.attackCount%10===0)mc=1;
  multi=Math.random()<mc;
  if(multi){
   let second=base*(.42+(Number(ctx.setDoubleDamage)||0)+x.secondHitDamage);
   if(v318Has('salvo',3))second*=1+.05*damp;
   const followCrit=v318Has('salvo',1)&&Math.random()<v318Clamp(critChance+x.multiCritChance,0,.40);
   if(followCrit){second*=1.75+x.critDamage*damp;tags.push('SCHNELLFEUER+')}
   second*=1+x.multiRamp*damp;
   damage+=second;
   tags.push('SALVE');
   if(Math.random()<x.tripleChance || (v318Has('salvo',2)&&Math.random()<.12)){
    damage+=base*.45*(1+x.multiRamp*2+(v318Has('salvo',3)?.05:0))*damp;tags.push('DRITTTREFFER');
   }
   if(!st.salvoChainUsed && (Math.random()<x.chainChance || (v318Has('salvo',5)&&Math.random()<.35))){
    damage+=base*.35*damp;st.salvoChainUsed=true;tags.push('KETTENTREFFER');
   }
  }
  if(crit && (Math.random()<x.salvoCritExtraChance || (v318Has('salvo',4)&&Math.random()<.15))){
   damage+=base*.40*damp;tags.push('FOLGETREFFER');
  }
 }

 if(s.playerClass==='bruiser'){
  if(Math.random()<x.detonationChance || (v318Has('magic',1)&&Math.random()<.12)){
   damage+=base*.35*damp;tags.push('DETONATION');
  }
 }

 /* Level-300 masteries: one per fight; worldboss versions remain damped. */
 if(!st.masterUsed){
  if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('wucht',6)){
   damage*=st.mode==='worldboss'?1.90:3;st.masterUsed=true;tags.push('BRUTALE ERNTE');
  }else if(s.playerClass==='scout'&&v318Has('precision',6)){
   damage=Math.max(damage,base*2.5*(st.mode==='worldboss'?.78:1));
   crit=true;if(!tags.includes('KRIT'))tags.unshift('KRIT');
   st.masterUsed=true;tags.push('PERFEKTER SCHUSS');
  }else if(s.playerClass==='scout'&&v318Has('salvo',6)){
   damage=Math.max(damage,base*2.75*(st.mode==='worldboss'?.78:1));
   st.masterUsed=true;tags.push('GRÜNER HAGEL');
  }else if(s.playerClass==='bruiser'&&v318Has('magic',6)){
   damage*=st.mode==='worldboss'?1.90:3;st.masterUsed=true;tags.push('SUPERNOVA');
  }
 }

 if(s.playerClass==='scout'&&v318Has('precision',5)&&er<.20&&!st.precisionExecuteUsed){
  damage*=1+.50*damp;st.precisionExecuteUsed=true;tags.push('HINRICHTUNG');
 }

 /* Smoke DOT nodes + milestones. */
 if(s.playerClass==='bruiser'){
  const dotProc=v318Clamp(x.dotChance+(v318Has('smoke',1)?.20:0)+(v318Has('smoke',2)?.06:0),0,.55);
  if(Math.random()<dotProc){
   const maxStacks=v318Has('smoke',2)?2:1;
   const rounds=v318Has('smoke',5)?3:2;
   const dotPct=.05+x.dotDamagePct+(v318Has('smoke',2)?.02:0);
   if(st.dot.length<maxStacks)st.dot.push({rounds,damage:Math.max(1,Math.round(base*dotPct*damp))});
  }
  if(v318Has('smoke',6)&&!st.smokeMasterApplied){
   st.dot=[{rounds:3,damage:Math.max(1,Math.round(base*.12*damp)),master:true}];
   st.smokeMasterApplied=true;tags.push('TODESNEBEL');
  }
 }

 let dotDamage=0;
 st.dot.forEach(d=>{dotDamage+=d.damage;d.rounds--});
 st.dot=st.dot.filter(d=>d.rounds>0);
 damage+=dotDamage;
 if(dotDamage)tags.push('DOT');

 damage=Math.max(1,Math.round(damage));

 let life=x.lifeSteal;
 /* Blutrausch milestone: the extra Raserei hit also feeds life steal. */
 if((s.playerClass==='grower'||s.playerClass==='frost')&&multi&&v318Has('rage',1))life+=.01;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&pr<.50)life+=x.lowHpLife;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',3)&&pr<.50)life+=.03;
 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('rage',6)&&pr<.30)life+=.05;
 life=v318Clamp(life,0,.10);

 let heal=Math.round(damage*life*(st.mode==='worldboss'?.60:1));
 if((s.playerClass==='grower'||s.playerClass==='frost')&&st.attackCount%5===0){
  heal+=Math.round(st.maxHp*Math.min(.04,x.healEvery5)*(st.mode==='worldboss'?.65:1));
  if(v318Has('rage',5))heal+=Math.round(st.maxHp*.05*(st.mode==='worldboss'?.65:1));
 }
 if(dotDamage&&s.playerClass==='bruiser'){
  let dotHeal=x.dotHealPct+(v318Has('smoke',4)?.25:0);
  heal+=Math.round(dotDamage*v318Clamp(dotHeal,0,.35)*(st.mode==='worldboss'?.60:1));
 }

 return {damage,heal,crit,wucht,multi,text:tags.length?tags.join(' + '):'TREFFER',v6336SmokeDotTick:dotDamage,v6336SmokeDots:Array.isArray(st.dot)?st.dot.map(d=>({rounds:Number(d.rounds)||0,damage:Number(d.damage)||0})):[]};
};

v318ResolveEnemyAttack=function(st,ctx){
 const x=v319ExactTalentStats();
 const damp=st.mode==='worldboss'?.45:1;
 st.enemyAttackCount++;

 let damage=Math.max(0,Number(ctx.damage)||0);
 const ratio=v318Clamp((Number(ctx.playerHp)||1)/(Number(ctx.playerMax)||1),0,1);
 let heal=0,counterDamage=0,preventLethal=false,text='Gegner trifft';

 if(s.playerClass==='scout'){
  let dodge=x.dodgeChance+x.firstDodge*(st.enemyAttackCount===1?1:0)+st.nextDodge;
  if(v318Has('dodge',0)&&st.enemyAttackCount===1)dodge+=.10;
  st.nextDodge=0;
  dodge=v318Clamp(dodge,0,st.mode==='worldboss'?.20:.35);

  const lethal=damage>=Number(ctx.playerHp||0);
  if(v318Has('dodge',5)&&lethal&&!st.lethalSaveUsed){
   st.guaranteedDodge=true;st.lethalSaveUsed=true;
  }

  if(st.guaranteedDodge||Math.random()<dodge){
   damage=0;text='AUSGEWICHEN';st.dodges++;
   st.nextDamagePct+=x.postDodgeDamage*damp;
   if(st.dodges>=2){
    st.nextDamagePct+=x.dodgeStreakDamage*damp;
    if(v318Has('dodge',2))st.nextDamagePct+=.15*damp;
   }

   let counterChance=x.counterChance+(v318Has('dodge',1)?.30:0);
   if(st.nextGuaranteedCounter){counterChance=1;st.nextGuaranteedCounter=false}
   if(Math.random()<v318Clamp(counterChance,0,.55)){
    counterDamage=Math.round(st.lastBaseDamage*.60*damp);
   }
   if(v318Has('dodge',3))heal+=Math.round(st.maxHp*.02*(st.mode==='worldboss'?.60:1));

   /* Exact L300 rule: AFTER the third dodge, the NEXT enemy attack is guaranteed
      to miss and counter. */
   if(v318Has('dodge',6)&&st.dodges>=3){
    st.guaranteedDodge=true;st.nextGuaranteedCounter=true;st.dodges=0;
   }else st.guaranteedDodge=false;

   return {damage:0,heal,counterDamage,preventLethal:false,text};
  }
 }

 let reduce=x.damageReduce;
 if((s.playerClass==='grower'||s.playerClass==='frost')){
  if(v318Has('tank',0)&&ratio<.50)reduce+=.05;
  if(v318Has('tank',4)&&st.enemyAttackCount<=2)reduce+=.10;
  if(v318Has('tank',3)&&damage>st.maxHp*.20)reduce+=.15;
 }
 if(s.playerClass==='bruiser'){
  reduce+=x.firstHitReduce*(st.enemyAttackCount===1?1:0);
  if(v318Has('smoke',0)&&st.enemyAttackCount===1)reduce+=.15;
  if(v318Has('smoke',6)&&st.smokeMasterApplied)reduce+=.10;
 }
 reduce=v318Clamp(reduce,0,st.mode==='worldboss'?.25:.35);
 damage=Math.round(damage*(1-reduce*damp));

 /* Regeneration and thorns are now actual mechanics. */
 if((s.playerClass==='grower'||s.playerClass==='frost')){
  if(st.enemyAttackCount%3===0 && x.regenEvery3>0){
   heal+=Math.round(st.maxHp*Math.min(.04,x.regenEvery3)*(st.mode==='worldboss'?.65:1));
  }
  if(x.reflectPct>0){
   counterDamage+=Math.round(damage*x.reflectPct*damp);
  }
  if(v318Has('tank',2)&&ratio<.25&&!st.secondWindUsed){
   heal+=Math.round(st.maxHp*.15*(st.mode==='worldboss'?.65:1));
   st.secondWindUsed=true;text+=' · ZWEITE LUFT';
  }
 }
 if(s.playerClass==='bruiser'&&ratio<.35&&!st.shieldUsed&&(x.shieldPct>0||v318Has('smoke',3))){
  const pct=Math.min(.20,x.shieldPct+(v318Has('smoke',3)?.15:0));
  damage=Math.max(0,damage-Math.round(st.maxHp*pct*(st.mode==='worldboss'?.65:1)));
  st.shieldUsed=true;text+=' · RAUCHBARRIERE';
 }

 if((s.playerClass==='grower'||s.playerClass==='frost')&&v318Has('tank',6)&&damage>=Number(ctx.playerHp||0)+heal&&!st.lethalSaveUsed){
  preventLethal=true;st.lethalSaveUsed=true;text+=' · UNKRAUT VERGEHT NICHT';
 }

 return {damage,heal,counterDamage,preventLethal,text};
};

/* ---------- Dungeon balance after talents ----------
   Scale by RECOMMENDED LEVEL, not player talent spending.
   At Lv. 210 (current dungeon end): ~+15.4 % HP and +9.8 % attack before the small boss premium.
   This offsets part of the talent power but still rewards a good build.
*/
const v319BaseEnemyStats=v025EnemyStats;
v025EnemyStats=function(dungeonIndex,roomIndex,enemy){
 const b=v319BaseEnemyStats(dungeonIndex,roomIndex,enemy);
 const expectedPoints=Math.min(150,Math.floor(Math.max(1,b.rec)/2));
 const progress=expectedPoints/150;
 const boss=!!enemy?.boss || Number(roomIndex)===9;
 const hpMult=1+progress*.22+(boss?progress*.020:0);
 const atkMult=1+progress*.14+(boss?progress*.015:0);
 return {
  rec:b.rec,
  hp:Math.round(b.hp*hpMult),
  attack:Math.round(b.attack*atkMult),
  v319TalentScale:{hpMult,atkMult,expectedPoints}
 };
};

/* Repaint canonical dungeon after the balance override. */
setTimeout(()=>{
 try{
  if(document.querySelector('#dungeon')?.classList.contains('active')){
   if(s.dungeon?.layer==='world')v230ShowDungeonWorld();
   else if(s.dungeon?.view==='map')v244RenderSelectedDungeonMap();
   else if(s.dungeon?.view==='battle')renderDungeon();
  }
 }catch(e){console.error('V4.02 dungeon repaint',e)}
},500);

/* V8.009: no-op global render wrapper retired. */;
