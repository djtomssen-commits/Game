function v239PlantProgress(p,now=Date.now()){
  if(!p)return 0;
  const start=Number(p.start)||0;
  const duration=Math.max(1,Number(p.duration)||1);
  return Math.max(0,Math.min(100,((now-start)/duration)*100));
}

function v239PlantStage(pct){
  if(pct<25)return '🌱';
  if(pct<65)return '🌿';
  if(pct<100)return '🌳';
  return '✨🌳';
}

function v239UpdateGrowLive(){
  const screen=document.querySelector('#grow');
  if(!screen || !screen.classList.contains('active'))return;

  try{v232EnsureGrowState()}catch(e){}

  const g=s.grow;
  if(!g || !Array.isArray(g.plants))return;

  const now=Date.now();
  const cap=typeof growCapacity==='function'
    ?growCapacity()
    :Math.max(1,Number(g.roomLevel)||1);

  const plants=g.plants.filter(Boolean);
  const occupied=plants.length;
  const ready=plants.filter(p=>v239PlantProgress(p,now)>=100).length;

  const avg=occupied
    ?plants.reduce((sum,p)=>sum+v239PlantProgress(p,now),0)/occupied
    :0;

  const bar=document.querySelector('#growBar');
  if(bar)bar.style.width=`${avg}%`;

  const plantName=document.querySelector('#plantName');
  if(plantName){
    plantName.textContent=
      !occupied
        ?'Leere Pflanzenplätze'
        :ready
          ?`${ready} Ernte(n) bereit`
          :`${occupied} Pflanze(n) wachsen`;
  }

  const growText=document.querySelector('#growText');
  if(growText){
    growText.textContent=
      `${occupied}/${cap} Plätze belegt · ${ready} bereit · Auswahl: `+
      `${seedTypes?.[g.selectedSeed]?.name||'Moos-Mix'}`;
  }

  const harvest=document.querySelector('#harvestBtn');
  if(harvest)harvest.disabled=ready===0;

  const plantBtn=document.querySelector('#plantBtn');
  if(plantBtn)plantBtn.disabled=occupied>=cap;

  const slots=[...document.querySelectorAll('#growShelf > .grow-slot')];

  for(let i=0;i<slots.length;i++){
    const slot=slots[i];
    const p=g.plants[i];
    if(!p)continue;

    const pct=v239PlantProgress(p,now);
    const seed=seedTypes?.[p.seed]||seedTypes?.moss;
    const label=slot.querySelector('.grow-slot-label');
    const visual=slot.querySelector('.plant-visual');

    if(label){
      label.textContent=
        `${seed?.icon||'🌱'} ${pct>=100?'Bereit':Math.floor(pct)+'%'}`;
    }

    if(visual){
      const stage=v239PlantStage(pct);
      if(visual.textContent!==stage)visual.textContent=stage;
    }

    slot.classList.toggle('v239-ready',pct>=100);
  }
}

/* Growroom cleanup Phase 1: V239's historical live owner is retired.
   V4.92 owns the active Growroom with its own 1s livePaint + 5s state tick.
   Keep v239UpdateGrowLive available for old one-shot compatibility calls, but
   do not run a second interval or wrap plantSelectedSeed/v032Go anymore. */

/* V6.319: no V239 startup paint. The function stays callable by legacy
   one-shot hooks; V4.92 owns live grow updates. */
