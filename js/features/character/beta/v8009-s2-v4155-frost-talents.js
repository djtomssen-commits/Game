(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const FROST='frost';
 const BRANCHES=['frostblade','iceguard','deathpact'];
 const oldToNew={wucht:'frostblade',tank:'iceguard',rage:'deathpact'};
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 const rank=(b,i)=>typeof v318Seg==='function'?Math.max(0,Number(v318Seg(b,i))||0):0;
 const has=(b,i)=>typeof v318Has==='function'&&v318Has(b,i);
 const isFrost=()=>String(s?.playerClass||'')===FROST;

 /* Frost now has its own three branches. None reuses Bud-Barbar branch IDs. */
 try{
  if(typeof V314_BRANCHES==='object')V314_BRANCHES.frost=[
   {id:'frostblade',title:'❄️ FROSTKLINGE',icon:'❄️',theme:'Kältemarken, Eisbruch und präzise Zweiklingen-Kombos',
    seg:['Reifenschliff','Runenstahl','Kältemarke','Eisbruch','Gefrierpunkt','Zweiklingenrhythmus','Schwarzeis'],
    mile:['Reifschlag','Doppelte Rune','Eisbruch+','Gefrorenes Herz','Klingensturm','Schwarzeis+','ABSOLUTER NULLPUNKT']},
   {id:'iceguard',title:'🧊 EISPANZER',icon:'🧊',theme:'Barrieren, Schadensreduktion und Eissplitter-Konter',
    seg:['Runenreif','Gefrorene Platte','Frostschild','Eisrückstoß','Grabeskälte','Eisblut','Ewiger Panzer'],
    mile:['Reifbarriere','Knochenfrost','Splitterpanzer','Totenstarre','Eiskern','Grabwacht','EWIGES EIS']},
   {id:'deathpact',title:'☠️ TODESPAKT',icon:'☠️',theme:'Seelenschnitte, Lebensraub und kontrollierte Hinrichtungen',
    seg:['Seelenschnitt','Blutreif','Runenwechsel','Seelenhunger','Todesurteil','Grabgriff','Dunkler Pakt'],
    mile:['Zwillingsschnitt','Seelendurst','Runenkreuz','Paktblut','Todesurteil+','Grabgriff+','SEELENERNTE']}
  ];
 }catch(e){console.error('V4.159 Frost tree definition',e)}

 /* Old three-card compatibility text is also Frost-specific if an old UI path appears. */
 try{
  if(typeof skillDefs==='object')skillDefs.frost=[
   {id:'frostmark',icon:'❄️',name:'Kältemarke',unlock:2,desc:'Treffer können den Gegner mit Kältemarken belegen.',perRank:'Frost-Talentbaum'},
   {id:'icebarrier',icon:'🧊',name:'Reifbarriere',unlock:5,desc:'Eispanzer-Talente erzeugen Barrieren und reduzieren Schaden.',perRank:'Frost-Talentbaum'},
   {id:'soulcut',icon:'☠️',name:'Seelenschnitt',unlock:8,desc:'Todespakt-Talente verbinden Folgetreffer mit Lebensraub.',perRank:'Frost-Talentbaum'}
  ];
 }catch(e){}

 try{
  if(typeof classSets==='object'&&classSets.frost){
   classSets.frost.name='Frostgruft';
   classSets.frost.className='Bekiffter Frost-Todesritter';
   classSets.frost.bonuses={2:'2 Teile: +5 Stärke',4:'4 Teile: +10 % Lebenspunkte',6:'6 Teile: +8 % Kältemarken-Chance'};
  }
 }catch(e){}

 /* Set bonus: the old Wuchtschlag bonus is disabled for Frost and becomes mark chance. */
 try{
  if(typeof setBonusValue==='function'&&!window.__v4155SetBonus){
   const base=setBonusValue;
   setBonusValue=function(kind){
    if(!isFrost())return base.apply(this,arguments);
    const n=typeof equippedSetCount==='function'?Number(equippedSetCount('frost'))||0:0;
    if(kind==='staerke'&&n>=2)return 5;
    if(kind==='hpPct'&&n>=4)return .10;
    if(kind==='frostMarkChance'&&n>=6)return .08;
    if(kind==='wuchtChance'||kind==='doubleChance'||kind==='critChance'||kind==='critDamage'||kind==='doubleDamage')return 0;
    return base.apply(this,arguments);
   };
   try{window.setBonusValue=setBonusValue}catch(e){}
   window.__v4155SetBonus=true;
  }
 }catch(e){console.error('V4.159 Frost set bonus',e)}

 /* Exact per-point descriptions. */
 try{
  if(typeof V319_SEG_DESC==='object'){
   V319_SEG_DESC.frostblade=[
    'Pro Rang +0,6 % direkter Schaden.',
    'Pro Rang +0,5 % Stärke.',
    'Pro Rang +0,35 % Chance, eine Kältemarke aufzubauen.',
    'Pro Rang verursacht jede aktive Kältemarke +0,25 % Schaden.',
    'Gegner unter 30 % Leben erleiden pro Rang +0,4 % Schaden.',
    'Pro Rang +0,25 Prozentpunkte Chance auf einen zusätzlichen Nebenhandtreffer.',
    'Pro Rang 0,45 % Widerstandsdurchdringung.'
   ];
   V319_SEG_DESC.iceguard=[
    'Pro Rang +0,8 % maximale Lebenspunkte.',
    'Pro Rang 0,45 % weniger erlittener Schaden.',
    'Jeder 4. Gegnerangriff erzeugt pro Rang 0,2 % deiner maximalen LP als Frostschild.',
    'Pro Rang werden 0,25 % des erlittenen Schadens als Eissplitter zurückgeworfen.',
    'Unter 40 % Leben erhältst du pro Rang 0,2 % zusätzliche Schadensreduktion.',
    'Jeder 4. Gegnerangriff heilt pro Rang 0,12 % deiner maximalen LP.',
    'Pro Rang +0,5 % maximale Lebenspunkte.'
   ];
   V319_SEG_DESC.deathpact=[
    'Pro Rang +0,3 % Chance, nach deinem Angriff einen zusätzlichen Seelenschnitt auszuführen. Der Seelenschnitt verursacht 40 % Grundschaden.',
    'Pro Rang +0,2 % Lebensraub.',
    'Jeder zweite eigene Angriff erhält pro Rang +0,2 % Schaden.',
    'Unter 50 % Leben erhältst du pro Rang +0,15 % zusätzlichen Lebensraub.',
    'Gegner unter 30 % Leben erleiden pro Rang +0,4 % Schaden.',
    'Jeder 6. eigene Angriff heilt pro Rang 0,12 % deiner maximalen LP.',
    'Pro Rang +0,25 % Crit-Chance.'
   ];
  }
 }catch(e){}

 try{
  if(typeof V318_MILESTONE_DESC==='object'){
   V318_MILESTONE_DESC.frostblade=[
    'Jeder 6. eigene Angriff baut garantiert eine Kältemarke auf.',
    'Beim Aufbau einer Kältemarke besteht 20 % Chance, direkt eine zweite Marke zu erzeugen.',
    'Bei 3 Kältemarken zerbricht das Eis: +35 % Grundschaden, danach werden die Marken verbraucht.',
    'Ab 2 Kältemarken erleidet das Ziel +8 % Schaden.',
    'Jeder 5. eigene Angriff löst einen zusätzlichen Frostschnitt mit 30 % Grundschaden aus.',
    'Eisbruch verursacht zusätzlich +10 % Grundschaden.',
    'Beim ersten Eisbruch des Kampfes entfesselt ABSOLUTER NULLPUNKT zusätzlichen +110 % Grundschaden.'
   ];
   V318_MILESTONE_DESC.iceguard=[
    'Der erste gegnerische Angriff trifft zuerst eine Reifbarriere in Höhe von 8 % deiner maximalen LP.',
    'Jeder 4. gegnerische Angriff verursacht zusätzlich 18 % weniger Schaden.',
    'Schaden, den eine Frostbarriere auffängt, wird zu 25 % als Eissplitter zurückgeworfen.',
    'Unter 30 % Leben entsteht einmal pro Kampf ein zusätzlicher Schild in Höhe von 12 % deiner maximalen LP.',
    'Wenn eine Barriere Schaden auffängt, verursacht dein nächster Angriff +10 % Schaden.',
    'Jeder 6. gegnerische Angriff heilt 6 % deiner maximalen LP.',
    'Unter 25 % Leben aktiviert sich einmal pro Kampf EWIGES EIS: 20-%-Barriere und 8 % Heilung.'
   ];
   V318_MILESTONE_DESC.deathpact=[
    'Jeder 5. eigene Angriff erhält einen Zwillingsschnitt mit 40 % Grundschaden.',
    'Seelen-Folgetreffer erhöhen den Lebensraub dieses Angriffs um 1 Prozentpunkt.',
    'Jeder 4. eigene Angriff verursacht +12 % Schaden.',
    'Unter 40 % Leben erhältst du +3 % Lebensraub.',
    'Gegner unter 25 % Leben erleiden zusätzlich +12 % Schaden.',
    'Jeder 6. eigene Angriff heilt zusätzlich 4 % deiner maximalen LP.',
    'Einmal pro Kampf unter 35 % Gegnerleben: SEELENERNTE verursacht +100 % Grundschaden und heilt 8 % deiner maximalen LP.'
   ];
  }
 }catch(e){}

 try{
  if(typeof V320_POINT_INFO==='object'){
   V320_POINT_INFO.frostblade=[
    ['Direkter Schaden',.6,'%'],['Stärke',.5,'%'],['Kältemarken-Chance',.35,'%'],['Schaden je Kältemarke',.25,'%'],['Schaden unter 30 % Gegnerleben',.4,'%'],['Nebenhandtreffer-Chance',.25,'%'],['Widerstandsdurchdringung',.45,'%']
   ];
   V320_POINT_INFO.iceguard=[
    ['Maximale Lebenspunkte',.8,'%'],['Schadensreduktion',.45,'%'],['Frostschild alle 4 Gegnerangriffe',.2,'% max. LP'],['Eissplitter-Rückschaden',.25,'%'],['Zusätzliche Reduktion unter 40 % LP',.2,'%'],['Heilung alle 4 Gegnerangriffe',.12,'% max. LP'],['Maximale Lebenspunkte',.5,'%']
   ];
   V320_POINT_INFO.deathpact=[
    ['Chance auf Seelenschnitt',.3,'%'],['Lebensraub',.2,'%'],['Schaden jedes 2. Angriffs',.2,'%'],['Lebensraub unter 50 % LP',.15,'%'],['Schaden unter 30 % Gegnerleben',.4,'%'],['Heilung jedes 6. Angriffs',.12,'% max. LP'],['Crit-Chance',.25,'%']
   ];
  }
 }catch(e){}

 /* Preserve already-spent Frost points from the previous mirrored tree by mapping old branch positions 1:1. */
 function migrateTalentState(){
  if(window.__V200_AUTH_READY__!==true||!s)return false;
  s.v314Talents=(s.v314Talents&&typeof s.v314Talents==='object')?s.v314Talents:{};
  const st=(s.v314Talents.frost&&typeof s.v314Talents.frost==='object')?s.v314Talents.frost:(s.v314Talents.frost={});
  let changed=false;
  Object.entries(oldToNew).forEach(([oldB,newB])=>{
   for(let i=0;i<7;i++)for(const kind of ['s','m']){
    const oldKey=`${oldB}.${kind}${i}`,newKey=`${newB}.${kind}${i}`;
    const oldVal=Math.max(0,Number(st[oldKey])||0);
    if(oldVal>0&&!(Number(st[newKey])>0)){st[newKey]=oldVal;changed=true}
    if(Object.prototype.hasOwnProperty.call(st,oldKey)){delete st[oldKey];changed=true}
   }
  });
  if(Number(s.v4155FrostTalentTree||0)!==1){s.v4155FrostTalentTree=1;changed=true}
  if(changed){try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}}
  return changed;
 }
 window.v4155MigrateFrostTalents=migrateTalentState;

 /* Frost-specific exact stats. Standard fields stay within the same global caps. */
 try{
  if(typeof v319ExactTalentStats==='function'&&!window.__v4155ExactStats){
   const baseExact=v319ExactTalentStats;
   v319ExactTalentStats=function(){
    if(!isFrost())return baseExact.apply(this,arguments);
    const o=baseExact.apply(this,arguments)||{};
    Object.keys(o).forEach(k=>{if(typeof o[k]==='number')o[k]=0});
    const add=(b,i,k,p)=>{o[k]=(Number(o[k])||0)+rank(b,i)*p};
    add('frostblade',0,'damagePct',.006);add('frostblade',1,'primaryPct',.005);add('frostblade',2,'frostMarkChance',.0035);add('frostblade',3,'frostMarkDamage',.0025);add('frostblade',4,'executeDamage',.004);add('frostblade',5,'frostFollowChance',.0025);add('frostblade',6,'armorPen',.0045);
    add('iceguard',0,'hpPct',.008);add('iceguard',1,'damageReduce',.0045);add('iceguard',2,'iceBarrierPct',.002);add('iceguard',3,'reflectPct',.0025);add('iceguard',4,'iceLowReduce',.002);add('iceguard',5,'iceHealEvery4',.0012);add('iceguard',6,'hpPct',.005);
    add('deathpact',0,'soulFollowChance',.003);add('deathpact',1,'lifeSteal',.002);add('deathpact',2,'soulAltDamage',.002);add('deathpact',3,'soulLowLife',.0015);add('deathpact',4,'executeDamage',.004);add('deathpact',5,'soulHealEvery6',.0012);add('deathpact',6,'critChance',.0025);
    o.primaryPct=clamp(o.primaryPct,0,.35);o.hpPct=clamp(o.hpPct,0,.55);o.damagePct=clamp(o.damagePct,0,.55);o.critChance=clamp(o.critChance,0,.40);o.critDamage=clamp(o.critDamage,0,.80);o.damageReduce=clamp(o.damageReduce,0,.35);o.lifeSteal=clamp(o.lifeSteal,0,.10);o.armorPen=clamp(o.armorPen,0,.30);o.reflectPct=clamp(o.reflectPct,0,.05);
    return o;
   };
   try{window.v319ExactTalentStats=v319ExactTalentStats}catch(e){}
   window.__v4155ExactStats=true;
  }
 }catch(e){console.error('V4.159 Frost stats',e)}

 /* Combat state fields belong only to the Frost resolver and do not touch other classes. */
 try{
  if(typeof v318NewCombatState==='function'&&!window.__v4155CombatState){
   const baseNew=v318NewCombatState;
   v318NewCombatState=function(){
    const st=baseNew.apply(this,arguments)||{};
    st.frostMarks=0;st.frostLowShieldUsed=false;st.frostMasterGuardUsed=false;st.frostBarrierAbsorbed=0;st.frostShatterUsed=false;st.frostSoulHarvestUsed=false;
    return st;
   };
   try{window.v318NewCombatState=v318NewCombatState}catch(e){}
   window.__v4155CombatState=true;
  }
 }catch(e){}

 /* Separate Frost attack engine: no Wuchtschlag, Raserei or Barbar milestone checks. */
 try{
  if(typeof v318ResolvePlayerAttack==='function'&&!window.__v4155PlayerAttack){
   const baseAttack=v318ResolvePlayerAttack;
   v318ResolvePlayerAttack=function(st,ctx){
    if(!isFrost())return baseAttack.apply(this,arguments);
    const x=v319ExactTalentStats();
    const wb=st.mode==='worldboss',damp=wb?.45:1,healDamp=wb?.60:1;
    const pr=clamp((Number(ctx.playerHp)||1)/(Number(ctx.playerMax)||1),0,1),er=clamp((Number(ctx.enemyHp)||1)/(Number(ctx.enemyMax)||1),0,1);
    st.attackCount=(Number(st.attackCount)||0)+1;st.lastBaseDamage=Math.max(1,Number(ctx.baseDamage)||1);
    let base=st.lastBaseDamage,tags=[],damagePct=(Number(x.damagePct)||0)*damp+(Number(st.nextDamagePct)||0);st.nextDamagePct=0;
    if(st.attackCount%2===0)damagePct+=(Number(x.soulAltDamage)||0)*damp;
    if(er<.30)damagePct+=Math.min(.16,Number(x.executeDamage)||0)*damp;
    if(er<.25&&v318Has('deathpact',4))damagePct+=.12*damp;
    damagePct+=(Number(x.armorPen)||0)*.50*damp;
    if((Number(st.frostMarks)||0)>=2&&v318Has('frostblade',3))damagePct+=.08*damp;
    if(v318Has('deathpact',2)&&st.attackCount%4===0)damagePct+=.12*damp;
    base*=1+clamp(damagePct,0,wb?.38:.62);

    let critChance=clamp((Number(ctx.baseCrit)||0)+(Number(ctx.setCrit)||0)+(Number(x.critChance)||0)*damp,0,wb?.24:.40);
    const crit=Math.random()<critChance;if(crit)tags.push('KRIT');
    let damage=base*(crit?(1.75+(Number(x.critDamage)||0)*damp):1);

    /* Kältemarken: identity mechanic. Base 5%, talent + set increase it. */
    let markChance=.05+(Number(x.frostMarkChance)||0)+(Number(setBonusValue?.('frostMarkChance'))||0);
    let marked=v318Has('frostblade',0)&&st.attackCount%6===0;
    if(!marked)marked=Math.random()<clamp(markChance,0,.30);
    if(marked){
     let gain=1;if(v318Has('frostblade',1)&&Math.random()<.20)gain=2;
     st.frostMarks=Math.min(3,(Number(st.frostMarks)||0)+gain);tags.push(gain>1?'DOPPELREIF':'KÄLTEMARKE');
    }
    if(st.frostMarks>0)damage*=1+Math.min(.14,st.frostMarks*(Number(x.frostMarkDamage)||0))*damp;

    if(v318Has('frostblade',4)&&st.attackCount%5===0){damage+=base*.30*damp;tags.push('FROSTSchnitt'.toUpperCase())}

    let soulFollow=false;
    if(v318Has('deathpact',0)&&st.attackCount%5===0){damage+=base*.40*damp;soulFollow=true;tags.push('ZWILLINGSSCHNITT')}
    if(Math.random()<clamp(Number(x.soulFollowChance)||0,0,.12)){damage+=base*.40*damp;soulFollow=true;tags.push('SEELENSCHNITT')}

    /* Three marks can be shattered only by the Frostklinge milestone. */
    if(st.frostMarks>=3&&v318Has('frostblade',2)){
     damage+=base*.35*damp;if(v318Has('frostblade',5))damage+=base*.10*damp;
     if(v318Has('frostblade',6)&&!st.masterUsed){damage+=base*1.10*(wb?.72:1);st.masterUsed=true;st.frostShatterUsed=true;tags.push('ABSOLUTER NULLPUNKT')}
     else tags.push('EISBRUCH');
     st.frostMarks=0;
    }

    let life=Number(x.lifeSteal)||0;
    if(pr<.50)life+=Number(x.soulLowLife)||0;
    if(pr<.40&&v318Has('deathpact',3))life+=.03;
    if(soulFollow&&v318Has('deathpact',1))life+=.01;
    life=clamp(life,0,.10);
    damage=Math.max(1,Math.round(damage));
    let heal=Math.round(damage*life*healDamp);
    if(st.attackCount%6===0)heal+=Math.round(st.maxHp*Math.min(.025,Number(x.soulHealEvery6)||0)*(wb?.65:1));
    if(v318Has('deathpact',5)&&st.attackCount%6===0)heal+=Math.round(st.maxHp*.04*(wb?.65:1));

    if(v318Has('deathpact',6)&&er<.35&&!st.masterUsed&&!st.frostSoulHarvestUsed){
     damage+=Math.round(base*1.00*(wb?.72:1));heal+=Math.round(st.maxHp*.08*(wb?.60:1));st.masterUsed=true;st.frostSoulHarvestUsed=true;tags.push('SEELENERNTE');
    }
    return {damage:Math.max(1,Math.round(damage)),heal:Math.max(0,Math.round(heal)),crit,wucht:false,multi:soulFollow,text:tags.length?tags.join(' + '):'FROSTTREFFER'};
   };
   try{window.v318ResolvePlayerAttack=v318ResolvePlayerAttack}catch(e){}
   window.__v4155PlayerAttack=true;
  }
 }catch(e){console.error('V4.159 Frost player attack',e)}

 /* Separate Frost defense engine: barriers and ice counters instead of Barbar tank skills. */
 try{
  if(typeof v318ResolveEnemyAttack==='function'&&!window.__v4155EnemyAttack){
   const baseEnemy=v318ResolveEnemyAttack;
   v318ResolveEnemyAttack=function(st,ctx){
    if(!isFrost())return baseEnemy.apply(this,arguments);
    const x=v319ExactTalentStats(),wb=st.mode==='worldboss',damp=wb?.45:1,healDamp=wb?.65:1;
    st.enemyAttackCount=(Number(st.enemyAttackCount)||0)+1;
    let damage=Math.max(0,Number(ctx.damage)||0),heal=0,counterDamage=0,text='Gegner trifft',absorbed=0;
    const ratio=clamp((Number(ctx.playerHp)||1)/(Number(ctx.playerMax)||1),0,1);
    let reduce=Number(x.damageReduce)||0;if(ratio<.40)reduce+=Number(x.iceLowReduce)||0;if(v318Has('iceguard',1)&&st.enemyAttackCount%4===0)reduce+=.18;
    reduce=clamp(reduce,0,wb?.25:.35);damage=Math.round(damage*(1-reduce*damp));

    let barrier=0;
    if(v318Has('iceguard',0)&&st.enemyAttackCount===1)barrier+=st.maxHp*.08;
    if(st.enemyAttackCount%4===0)barrier+=st.maxHp*Math.min(.04,Number(x.iceBarrierPct)||0);
    if(ratio<.30&&v318Has('iceguard',3)&&!st.frostLowShieldUsed){barrier+=st.maxHp*.12;st.frostLowShieldUsed=true;text+=' · TOTENSTARRE'}
    if(ratio<.25&&v318Has('iceguard',6)&&!st.masterUsed&&!st.frostMasterGuardUsed){barrier+=st.maxHp*.20;heal+=Math.round(st.maxHp*.08*healDamp);st.masterUsed=true;st.frostMasterGuardUsed=true;text+=' · EWIGES EIS'}
    if(barrier>0){absorbed=Math.min(damage,Math.round(barrier*healDamp));damage=Math.max(0,damage-absorbed);st.frostBarrierAbsorbed=(Number(st.frostBarrierAbsorbed)||0)+absorbed;text+=' · REIFBARRIERE';if(v318Has('iceguard',4))st.nextDamagePct=(Number(st.nextDamagePct)||0)+.10*damp}

    if(st.enemyAttackCount%4===0)heal+=Math.round(st.maxHp*Math.min(.03,Number(x.iceHealEvery4)||0)*healDamp);
    if(v318Has('iceguard',5)&&st.enemyAttackCount%6===0)heal+=Math.round(st.maxHp*.06*healDamp);
    if((Number(x.reflectPct)||0)>0)counterDamage+=Math.round(damage*clamp(x.reflectPct,0,.05)*damp);
    if(absorbed>0&&v318Has('iceguard',2))counterDamage+=Math.round(absorbed*.25*damp);
    return {damage:Math.max(0,Math.round(damage)),heal:Math.max(0,Math.round(heal)),counterDamage:Math.max(0,Math.round(counterDamage)),preventLethal:false,text};
   };
   try{window.v318ResolveEnemyAttack=v318ResolveEnemyAttack}catch(e){}
   window.__v4155EnemyAttack=true;
  }
 }catch(e){console.error('V4.159 Frost enemy attack',e)}

 /* Frost tree UI note. */
 function paintTreeNote(){
  if(!isFrost())return;
  const box=document.getElementById('skillTree');if(!box)return;
  let note=box.querySelector('.v4155-frost-note');if(!note){note=document.createElement('div');note.className='v4155-frost-note';box.prepend(note)}
  note.innerHTML='<b>❄️ Eigener Frost-Todesritter-Talentbaum</b><br>Frostklinge = Kältemarken/Eisbruch · Eispanzer = Barrieren/Eissplitter · Todespakt = Seelenschnitte/Lebensraub. Waffe I zählt voll. Waffe II gibt nur 10 % ihrer Werte und schaltet den Nebenhandtreffer frei; beide bleiben zusammen ein logisch begrenztes Waffenbudget.';
 }
 /* v543 renders the Frost note/tree directly; no renderSkillTree wrapper here. */

 /* Lightweight balance audit: same class baseline/weapon budget, but unique Frost branch IDs. */
 function sumBonus(b){return ['staerke','geschick','intelligenz','ausdauer','glueck'].reduce((n,k)=>n+Math.max(0,Number(b?.[k])||0),0)}
 function weaponBudget(cls){return Math.max(0,...(classGear?.[cls]||[]).filter(x=>x?.slot==='weapon').map(x=>sumBonus(x?.baseBonusV055||x?.bonus)))}
 function audit(){
  const ids=(V314_BRANCHES?.frost||[]).map(x=>x.id),baseBudgets=['grower','scout','bruiser','frost','summoner'].map(c=>sumBonus(classes?.[c]?.bonus));
  return {version:V.short,uniqueTree:JSON.stringify(ids)===JSON.stringify(BRANCHES),noBarbarBranches:!ids.some(x=>['wucht','tank','rage'].includes(x)),baseBudgetParity:baseBudgets.every(x=>x===baseBudgets[0]),frostWeaponBudget:weaponBudget('frost'),barbarWeaponBudget:weaponBudget('grower'),dualRule:'Waffe I 100 % + Waffe II 10 % Attribute + Nebenhandtreffer',masterRule:'maximal ein L300-Ast bei 150 Gesamtpunkten'};
 }
 window.v4155FrostTalentAudit=audit;

 function accountReady(){if(window.__V200_AUTH_READY__!==true)return;migrateTalentState();try{if(isFrost())renderSkillTree?.()}catch(e){}}
 function stamp(){}
 stamp();if(window.__V200_AUTH_READY__===true)setTimeout(accountReady,0);
 window.addEventListener('growlegends:account-ready',()=>setTimeout(accountReady,0));
 window.addEventListener('pageshow',()=>{stamp();if(window.__V200_AUTH_READY__===true)setTimeout(accountReady,0)},{passive:true});
})();
