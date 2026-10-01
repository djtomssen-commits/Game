/* ===== V4.02 three targeted fixes ===== */

/* 1) Harvest reward modal */
function v237EnsureHarvestReward(){
  let ov=document.querySelector('#v237HarvestReward');
  if(ov)return ov;
  ov=document.createElement('div');
  ov.id='v237HarvestReward';
  ov.innerHTML=`
    <div class="v237-box">
      <h3>🌿 Ernte abgeschlossen</h3>
      <div class="v237-sub">Dein Growroom-Ertrag wurde verkauft.</div>
      <div class="v237-gold" id="v237HarvestGold">+0 Gold</div>
      <div class="v237-lines" id="v237HarvestLines"></div>
      <button type="button" class="btn" id="v237HarvestOk">Belohnung einsammeln</button>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('#v237HarvestOk').onclick=()=>ov.classList.remove('show');
  ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('show')});
  return ov;
}
function v237ShowHarvestReward(beforePlants,beforeGold){
  const gained=Math.max(0,(Number(s.gold)||0)-beforeGold);
  const ov=v237EnsureHarvestReward();
  const gold=ov.querySelector('#v237HarvestGold');
  const lines=ov.querySelector('#v237HarvestLines');
  if(gold)gold.textContent=`+${gained} Gold`;
  if(lines){
    const counts={};
    beforePlants.forEach(pl=>{
      const id=pl?.seedId||pl?.seed||pl?.type;
      const def=seedTypes?.[id];
      const name=def?.name||pl?.name||'Pflanze';
      counts[name]=(counts[name]||0)+1;
    });
    const rows=Object.entries(counts);
    lines.innerHTML=rows.length
      ?rows.map(([name,n])=>`<div class="v237-line">🌱 ${n}× ${name} geerntet</div>`).join('')
      :`<div class="v237-line">Ernte erfolgreich abgeschlossen.</div>`;
  }
  ov.classList.add('show');
  requestAnimationFrame(()=>ov.classList.add('show'));
}

/* Replace the V4.02 wrapper, but keep its tested base harvest mechanics. */
const v237BaseHarvest=harvestReadyPlants;
harvestReadyPlants=function(...args){
  v232EnsureGrowState();
  const now=Date.now();
  const ready=(s.grow.plants||[]).filter(pl=>pl&&Number(pl.readyAt||0)<=now);
  if(!ready.length)return v237BaseHarvest.apply(this,args);

  const beforeGold=Number(s.gold)||0;
  const result=v237BaseHarvest.apply(this,args);
  v237ShowHarvestReward(ready,beforeGold);
  return result;
};

/* 2) Dungeon "back to map": always return to the 20-dungeon world map. */
function v237ReturnToDungeonWorld(){
  if(typeof v230ShowDungeonWorld==='function'){
    v230ShowDungeonWorld();
  }else{
    s.dungeon.layer='world';
    s.dungeon.view='map';
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{renderDungeon()}catch(e){}
  }
  requestAnimationFrame(()=>{
    try{
      s.dungeon.layer='world';
      s.dungeon.view='map';
      v065RenderWorld();
      if(typeof v067BindWorldMap==='function')v067BindWorldMap();
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(e){console.error('V4.02 dungeon world return',e)}
  });
}

/* Override all historical map-return helpers used after combat. */
if(typeof v048GoMap==='function')v048GoMap=v237ReturnToDungeonWorld;
if(typeof v065ShowWorld==='function')v065ShowWorld=v237ReturnToDungeonWorld;
if(typeof v067ShowDungeonWorld==='function')v067ShowDungeonWorld=v237ReturnToDungeonWorld;

/* Capture visible back buttons so stale onclick references cannot win. */
document.addEventListener('click',e=>{
  const t=e.target instanceof Element?e.target.closest(
    '#v065BackWorld,.v065-back-world,[data-v237-dungeon-world]'
  ):null;
  if(!t)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  v237ReturnToDungeonWorld();
},true);

/* 3) Equipment cards: restore visible explanation of every upgrade. */
renderGrowEquipment=function(){
  v232EnsureGrowState();
  const box=document.querySelector('#growEquipment');
  if(!box)return;
  const lamp=Number(s.grow.equipment.lamp)||0;
  const pots=Number(s.grow.equipment.pots)||0;
  const lampCost=120+lamp*140;
  const potsCost=130+pots*150;
  const currentLamp=Math.round((1-Math.pow(.92,lamp))*100);
  const nextLamp=Math.round((1-Math.pow(.92,lamp+1))*100);
  const currentPots=lamp>=-999?pots*10:pots*10;
  const nextPots=(pots+1)*10;

  box.innerHTML=`
    <div class="equip-card">
      <div class="big">💡</div>
      <h4>Lampe · Lv. ${lamp}</h4>
      <div class="v237-equip-effect">
        <b>Schneller wachsen</b><br>
        Jede Stufe verkürzt die Wachstumszeit um ca. 8 %.<br>
        Aktuell ca. −${currentLamp} % · danach ca. −${nextLamp} %.
      </div>
      <button type="button" class="btn grow-upgrade" data-v232-grow-upgrade="lamp">
        Upgrade · ${lampCost} G
      </button>
    </div>
    <div class="equip-card">
      <div class="big">🪴</div>
      <h4>Töpfe · Lv. ${pots}</h4>
      <div class="v237-equip-effect">
        <b>Mehr Ertrag</b><br>
        Jede Stufe erhöht den Verkaufsertrag um 10 %.<br>
        Aktuell +${currentPots} % · danach +${nextPots} %.
      </div>
      <button type="button" class="btn grow-upgrade" data-v232-grow-upgrade="pots">
        Upgrade · ${potsCost} G
      </button>
    </div>`;
};

setTimeout(()=>{
  try{
    if(document.querySelector('#grow')?.classList.contains('active'))renderGrow();
  }catch(e){}
  /* V4.123: obsolete version paint retired. */
},380);
