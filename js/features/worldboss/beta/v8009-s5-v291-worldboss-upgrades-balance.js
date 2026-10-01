/* ===== V4.02 Smaragd-Koloss: Edelsteine + Verzauberungen =====
   Upgrades now improve worldboss equipment readiness, but crit-related
   upgrade bonuses still do NOT increase the normalized worldboss crit rate.
*/

function v291UpgradeScoreForItem(it){
  if(!it)return 0;

  let score=0;

  const gem=
    it.gem ??
    it.socketGem ??
    it.socket ??
    it.edelstein ??
    it.gemItem ??
    null;

  if(gem){
    const q=String(gem.quality||gem.rarity||'').toLowerCase();
    const gemQuality={
      gray:.45,grey:.45,
      green:.60,
      blue:.75,
      purple:.90,
      orange:1.00,
      cyan:1.00,
      mystic:1.00,
      legendary:1.00
    }[q] ?? .70;
    score+=.55*gemQuality;
  }

  const ench=
    it.enchant ??
    it.enchantment ??
    it.scroll ??
    it.roll ??
    it.verzauberung ??
    it.rolle ??
    null;

  if(ench){
    const q=String(ench.quality||ench.rarity||'').toLowerCase();
    const enchQuality={
      gray:.45,grey:.45,
      green:.60,
      blue:.75,
      purple:.90,
      orange:1.00,
      cyan:1.00,
      mystic:1.00,
      legendary:1.00
    }[q] ?? .70;
    score+=.45*enchQuality;
  }

  return Math.max(0,Math.min(1,score));
}

function v291GearReadiness(){
  const level=Math.max(1,Number(s.level)||1);
  const slots=['weapon','head','body','boots','ring','amulet'];
  const eq=s.equipment||{};

  const quality={
    gray:.55,
    green:.68,
    blue:.82,
    purple:.95,
    orange:1.00,
    cyan:1.00
  };

  let total=0;
  let equipped=0;
  let upgradeTotal=0;
  let gemCount=0;
  let enchantCount=0;

  slots.forEach(slot=>{
    const it=eq[slot];
    if(!it)return;

    equipped++;

    const q=quality[String(it.quality||'').toLowerCase()] ?? quality.gray;
    const itemLevel=Math.max(1,Number(it.dropLevel)||level);
    const age=Math.max(0,level-itemLevel);
    const freshness=Math.max(.72,1-age*.028);

    const upgrade=v291UpgradeScoreForItem(it);

    const upgraded=q*freshness*(1+.15*upgrade);
    total+=Math.min(1,upgraded);
    upgradeTotal+=upgrade;

    const gem=
      it.gem ?? it.socketGem ?? it.socket ?? it.edelstein ?? it.gemItem ?? null;
    const ench=
      it.enchant ?? it.enchantment ?? it.scroll ?? it.roll ??
      it.verzauberung ?? it.rolle ?? null;

    if(gem)gemCount++;
    if(ench)enchantCount++;
  });

  return {
    ratio:Math.max(0,Math.min(1,total/slots.length)),
    equipped,
    slots:slots.length,
    upgradeRatio:Math.max(0,Math.min(1,upgradeTotal/slots.length)),
    gemCount,
    enchantCount
  };
}

v290GearReadiness=v291GearReadiness;

const v291BaseWorldBossModel=v290WorldBossModel;
v290WorldBossModel=function(){
  const m=v291BaseWorldBossModel();
  const gear=v291GearReadiness();

  const level=Math.max(1,Number(s.level)||1);
  const idealDamage=245+level*3.75;

  m.gear=gear;
  m.readiness=gear.ratio;
  m.playerBaseDamage=Math.round(
    idealDamage*(.72+.38*m.readiness)
  );

  /* Crit remains fully normalized for the Koloss. */
  m.critChance=.12;
  m.critMultiplier=1.65;

  return m;
};

const v291BaseRefresh=v110Refresh;
v110Refresh=function(){
  const r=v291BaseRefresh();

  try{
    const m=v290WorldBossModel();
    const box=document.querySelector('#v290BossBalance');
    if(box){
      const [label,cls]=v290ReadinessLabel(m.readiness);
      box.innerHTML=
        `Ausrüstung für Level ${m.level}: <b class="${cls}">${label}</b> · `+
        `${m.gear.equipped}/${m.gear.slots} Slots<br>`+
        `💎 Edelsteine: <b>${m.gear.gemCount}/${m.gear.slots}</b> · `+
        `✨ Verzauberungen: <b>${m.gear.enchantCount}/${m.gear.slots}</b><br>`+
        `Der Koloss normalisiert kritische Treffer. Crit-Boni aus Skills, `+
        `Edelsteinen oder Verzauberungen erhöhen die Koloss-Critchance nicht.`+
        (m.pitySteps>=3
          ?`<br><b>Der Koloss zeigt nach deinen Niederlagen erste Schwächen.</b>`
          :'');
    }
  }catch(e){}

  return r;
};

const v291BaseRender=render;
render=function(){
  const r=v291BaseRender();
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(()=>{
  try{
    if(document.querySelector('#v110Overlay.show'))v110Refresh();
  }catch(e){}
},350);


const v291Line=document.querySelector('#v141VersionLine');
