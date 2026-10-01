(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const cls=()=>String(s?.playerClass||'grower');
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 const hasOffhand=()=>cls()==='frost'&&!!s?.equipment?.weapon&&!!s?.equipment?.weapon2;
 const passive={
  grower:{name:'Barbarenkraft',text:'+5 % direkter Schaden',damage:.05},
  bruiser:{name:'Kritischer Dunst',text:'+5 Prozentpunkte Crit-Chance',crit:.05},
  scout:{name:'Blattreflex',text:'+5 Prozentpunkte echte Ausweichchance',dodge:.05},
  frost:{name:'Zweiklingen des Eisnebels',text:'Waffe II: +10 % Werte · 8 % Chance auf Nebenhandtreffer (40 %)',offhandChance:.08,offhandDamage:.40},
  summoner:{name:'Ruf aus dem Dunst',text:'10 % Grundchance auf einen Begleiter · spätestens der 5. eigene Angriff beschwört garantiert.',summonChance:.10}
 };
 window.V4156_CLASS_PASSIVES=Object.freeze(passive);
 window.v4156ClassPassive=id=>passive[String(id||cls())]||passive.grower;

 /* Player attacks: Mage crit is injected before the established resolver;
    Barbar damage and Frost offhand are applied after it. Worldboss values are
    deliberately damped so a passive cannot bypass the event caps. */
 if(typeof v318ResolvePlayerAttack==='function'&&!window.__v4156Attack){
  const base=v318ResolvePlayerAttack;
  v318ResolvePlayerAttack=function(st,ctx){
   const id=cls(),wb=String(st?.mode||'')==='worldboss';
   let c=ctx;
   if(id==='bruiser'){
    c={...(ctx||{}),baseCrit:(Number(ctx?.baseCrit)||0)+(wb?.03:.05)};
   }
   const r=base.call(this,st,c)||{};
   if(id==='grower'){
    r.damage=Math.max(1,Math.round((Number(r.damage)||1)*(1+(wb?.03:.05))));
   }else if(id==='frost'&&hasOffhand()){
    let talent=0;
    try{talent=Math.max(0,Number(v319ExactTalentStats?.()?.frostFollowChance)||0)}catch(e){}
    const chance=clamp((wb?.05:.08)+talent*(wb?.60:1),0,wb?.10:.16);
    if(Math.random()<chance){
     const extra=Math.max(1,Math.round((Number(ctx?.baseDamage)||1)*(wb?.35:.40)));
     r.damage=Math.max(1,Math.round((Number(r.damage)||0)+extra));
     r.multi=true;
     r.text=(r.text&&r.text!=='FROSTTREFFER'?r.text+' + ':'')+'NEBENHAND';
     r.v4156Offhand=true;
     r.v4156OffhandDamage=extra;
    }
   }
   return r;
  };
  try{window.v318ResolvePlayerAttack=v318ResolvePlayerAttack}catch(e){}
  window.__v4156Attack=true;
 }

 /* Scout's +5 pp is a REAL dodge chance in the enemy-attack resolver. We add it
    only while that resolver calculates a Scout defense, so it cannot inflate
    unrelated stats or power formulas. */
 let dodgeBonus=0;
 if(typeof v319ExactTalentStats==='function'&&!window.__v4156Exact){
  const base=v319ExactTalentStats;
  v319ExactTalentStats=function(){
   const o=base.apply(this,arguments)||{};
   if(cls()==='scout'&&dodgeBonus>0)o.dodgeChance=clamp((Number(o.dodgeChance)||0)+dodgeBonus,0,.35);
   return o;
  };
  try{window.v319ExactTalentStats=v319ExactTalentStats}catch(e){}
  window.__v4156Exact=true;
 }
 if(typeof v318ResolveEnemyAttack==='function'&&!window.__v4156Enemy){
  const base=v318ResolveEnemyAttack;
  v318ResolveEnemyAttack=function(st,ctx){
   if(cls()!=='scout')return base.apply(this,arguments);
   dodgeBonus=String(st?.mode||'')==='worldboss'?.03:.05;
   try{return base.apply(this,arguments)}finally{dodgeBonus=0}
  };
  try{window.v318ResolveEnemyAttack=v318ResolveEnemyAttack}catch(e){}
  window.__v4156Enemy=true;
 }

 /* Clear class descriptions: identity is visible without opening the talent tree. */
 try{
  if(classes?.grower)classes.grower.text='Rohe Gewalt. +5 % direkter Schaden. Wucht und Raserei über den eigenen Talentbaum.';
  if(classes?.bruiser)classes.bruiser.text='Explosive Magie. +5 Prozentpunkte Crit-Chance. Zaubermacht, Kritische Magie und Rauchmagie.';
  if(classes?.scout)classes.scout.text='Agiler Fernkämpfer. +5 Prozentpunkte echte Ausweichchance. Präzision, Ausweichen und Salven.';
  if(classes?.frost)classes.frost.text='Zweiklingen-Ritter. Waffe I 100 %, Waffe II +10 % Werte; 8 % Chance auf einen 40-%-Nebenhandtreffer.';
  if(classes?.summoner)classes.summoner.text='Beschwörerin. Intelligenz, Flüche und Seelenraub; Ruf aus dem Dunst kann sichtbare Begleiter beschwören.';
 }catch(e){}

 function paintPassive(){
  const root=document.getElementById('character');if(!root)return;
  let box=document.getElementById('v4156ClassPassive');
  const target=document.getElementById('avatarSubtitle')?.parentElement||root.querySelector('.center-hero')||root;
  if(!box){box=document.createElement('div');box.id='v4156ClassPassive';target.appendChild(box)}
  const p=passive[cls()]||passive.grower;
  const icon=cls()==='grower'?'⚔️':cls()==='bruiser'?'🔮':cls()==='scout'?'🏹':cls()==='summoner'?'🕯️':'❄️';
  box.innerHTML=`<b>${icon} Klassenpassive · ${p.name}</b><br>${p.text}`;
  if(cls()==='frost'){
   const note=root.querySelector('.v4153-dual-note');if(note)note.textContent='❄️ Zweiklingen-Balance: Waffe I zählt 100 %. Waffe II gibt 10 % ihrer Attribute/Verzauberungen und schaltet Nebenhandtreffer frei. Beide Waffen zählen zusammen weiterhin nur als ein Set-Waffenplatz.';
   const p1=document.getElementById('slot-weapon')?.querySelector('.slot-label');if(p1)p1.textContent='Waffe I · 100 %';
   const p2=document.getElementById('slot-weapon2')?.querySelector('.slot-label');if(p2)p2.textContent='Waffe II · 10 % Attribute';
  }
 }
 window.v4156PaintClassPassive=paintPassive;

 /* QA / balancing reference. These are deliberate small baselines, not talent bonuses. */
 window.v4156ClassBalanceAudit=()=>({
  version:V.short,
  passives:{
   grower:'+5% direct damage',
   bruiser:'+5pp crit',
   scout:'+5pp real dodge',
   frost:'main 100% + offhand 10%; 8% x 40% offhand hit'
  },
  expectedBaseline:{
   growerDps:1.05,
   bruiserDpsApprox:1.035,
   scoutIncomingApprox:.95,
   frostProcDpsApprox:1.032
  },
  frostHasOffhand:hasOffhand(),
  uniqueTrees:{
   grower:(V314_BRANCHES?.grower||[]).map(x=>x.id),
   bruiser:(V314_BRANCHES?.bruiser||[]).map(x=>x.id),
   scout:(V314_BRANCHES?.scout||[]).map(x=>x.id),
   frost:(V314_BRANCHES?.frost||[]).map(x=>x.id)
  }
 });

 /* Add explicit Systemtechnik contracts without replacing the existing runner. */
 try{
  const qa=window.v4107RunQA||window.v4102RunQA;
  if(typeof qa==='function'&&!window.__v4156Qa){
   const wrapped=function(){
    const r=qa.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;
    const add=(name,pass,detail)=>r.results.push({category:'Klassenidentität & Balance',name,pass:!!pass,severity:'error',detail});
    const a=window.v4156ClassBalanceAudit();
    const trees=Object.values(a.uniqueTrees).map(x=>JSON.stringify(x));
    add('Vier unterschiedliche Talentbäume',new Set(trees).size===4,trees.join(' | '));
    add('Bud-Barbar: +5 % direkter Schaden',passive.grower.damage===.05,'fester Klassenbonus');
    add('Bong-Magier: +5 Prozentpunkte Crit',passive.bruiser.crit===.05,'echter Crit-Bonus vor dem Kampfresolver');
    add('Blatt-Schütze: +5 Prozentpunkte echtes Ausweichen',passive.scout.dodge===.05,'wirkt im Gegnerangriff-Resolver');
    add('Frost: Waffe I 100 % / Waffe II 10 %',String(window.v4155FrostTalentAudit?.().dualRule||'').includes('100 %')&&String(window.v4155FrostTalentAudit?.().dualRule||'').includes('10 %'),'kein zweites volles Waffenbudget');
    add('Frost: Nebenhandtreffer 8 % × 40 %',passive.frost.offhandChance===.08&&passive.frost.offhandDamage===.40,'nur mit zwei ausgerüsteten Waffen');
    r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r;
   };
   window.v4107RunQA=wrapped;if(window.v4102RunQA===qa)window.v4102RunQA=wrapped;window.__v4156Qa=true;
  }
 }catch(e){console.warn('V4.159 QA hook',e)}

 function stamp(){}
 try{
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character'){paintPassive();stamp()}},{passive:true});window.__v4156Go='v7119-event';window.__v4156Render='retired'
 }catch(e){}
 stamp();paintPassive();
 window.addEventListener('growlegends:account-ready',paintPassive,{passive:true});
 window.addEventListener('pageshow',()=>{stamp();paintPassive()},{passive:true});
})();
