/* ===== V4.02 definitive harvest path =====
   Plants use {start,duration,seed}; there is no readyAt field.
*/

function v241PlantReady(pl,now=Date.now()){
  if(!pl)return false;
  const start=Number(pl.start)||0;
  const duration=Math.max(1,Number(pl.duration)||1);
  return now-start>=duration;
}

function v241HarvestSnapshot(now=Date.now()){
  v232EnsureGrowState();

  return (s.grow.plants||[])
    .map((pl,index)=>({pl,index}))
    .filter(x=>v241PlantReady(x.pl,now));
}

function v241ShowHarvestReward(rows,goldGain,xpGain){
  try{window.v6111Sfx?.('reward')}catch(e){}
  const ov=v237EnsureHarvestReward();

  const gold=ov.querySelector('#v237HarvestGold');
  const lines=ov.querySelector('#v237HarvestLines');
  const box=ov.querySelector('.v237-box');

  if(gold){
    const amount=Math.max(0,Number(goldGain)||0);
    const goldEvent=
      typeof v274GoldEventActive==='function' && v274GoldEventActive();

    gold.textContent=goldEvent
      ?`+${amount} Gold · ×2 EVENT`
      :`+${amount} Gold`;
  }

  if(lines){
    const counts={};

    rows.forEach(({pl})=>{
      const def=seedTypes?.[pl.seed]||seedTypes?.moss;
      const name=def?.name||'Pflanze';
      counts[name]=(counts[name]||0)+1;
    });

    lines.innerHTML=Object.entries(counts)
      .map(([name,n])=>
        `<div class="v237-line">🌿 ${n}× ${name} geerntet</div>`
      )
      .join('');
  }

  let xp=ov.querySelector('#v241HarvestXp');

  if(!xp && box){
    xp=document.createElement('div');
    xp.id='v241HarvestXp';
    xp.className='v241-xp';

    const linesEl=ov.querySelector('#v237HarvestLines');
    if(linesEl){
      linesEl.insertAdjacentElement('afterend',xp);
    }else{
      box.appendChild(xp);
    }
  }

  if(xp){
    xp.textContent=`⭐ +${Math.max(0,Number(xpGain)||0)} EXP`;
  }

  /* V8.009: canonical reward popup is shown once; historical visibility retries retired. */
  ov.classList.add('show');
}


/*
  FINAL canonical harvest function.
  Do not call the historical harvest wrappers: this avoids the broken
  readyAt check and guarantees exactly one payout and one reward popup.
*/
harvestReadyPlants=function(){
  v232EnsureGrowState();

  const now=Date.now();
  const readyRows=v241HarvestSnapshot(now);

  if(!readyRows.length){
    v232GrowNotice(
      'Noch nichts erntereif',
      'Lass deine Pflanzen noch etwas wachsen.',
      'warn'
    );
    return false;
  }

  const beforeGold=Number(s.gold)||0;
  const xpGain=10*readyRows.length;

  let income=0;

  readyRows.forEach(({pl})=>{
    const seed=seedTypes?.[pl.seed]||seedTypes?.moss;
    if(!seed)return;

    income+=Math.round(
      (Number(seed.sell)||0) *
      potYield() *
      (1+totalAttr('growSkill')*.03)
    );
  });

  const v289HarvestBaseGold=income;
  const v289HarvestGoldEvent=
    typeof v274GoldEventActive==='function' && v274GoldEventActive();

  if(v289HarvestGoldEvent){
    income*=2;
  }

  s.gold=beforeGold+income;

  const readyIndexes=new Set(
    readyRows.map(x=>x.index)
  );

  s.grow.plants=(s.grow.plants||[])
    .map((pl,index)=>readyIndexes.has(index)?null:pl);

  while(
    s.grow.plants.length &&
    !s.grow.plants[s.grow.plants.length-1]
  ){
    s.grow.plants.pop();
  }

  addXp(xpGain);

  try{
    v232PersistGrow();
  }catch(e){
    try{persist(false)}catch(_){}
  }

  try{v232SyncGold()}catch(e){}

  /*
    Repaint Growroom once after the state change. The V4.02 live timer
    continues from there.
  */
  try{renderGrow()}catch(e){}

  const actualGold=Math.max(
    0,
    (Number(s.gold)||0)-beforeGold
  );

  v241ShowHarvestReward(
    readyRows,
    actualGold,
    xpGain
  );

  return true;
};


/*
  Capture the harvest button at the very end of the file.
  This guarantees no stale delegated V0.x handler can process the same tap.
*/
document.addEventListener('click',e=>{
  const target=e.target instanceof Element
    ?e.target.closest('#grow #harvestBtn')
    :null;

  if(!target)return;

  e.preventDefault();
  e.stopImmediatePropagation();

  harvestReadyPlants();
},true);


/* V8.009: delayed startup/version repaint retired. */
queueMicrotask(()=>{try{if(document.querySelector('#grow')?.classList.contains('active'))v239UpdateGrowLive()}catch(e){}});
