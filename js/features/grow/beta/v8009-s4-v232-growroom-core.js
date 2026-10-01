/* ===== V4.02 Growroom consolidated interaction path ===== */

function v232EnsureGrowState(){
  s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};

  s.grow.roomLevel=Math.min(4,Math.max(1,Number(s.grow.roomLevel)||1));
  s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')
    ?s.grow.seeds
    :{moss:2};

  Object.keys(seedTypes||{}).forEach(id=>{
    s.grow.seeds[id]=Math.max(0,Number(s.grow.seeds[id])||0);
  });

  s.grow.selectedSeed=seedTypes?.[s.grow.selectedSeed]
    ?s.grow.selectedSeed
    :'moss';

  s.grow.plants=Array.isArray(s.grow.plants)?s.grow.plants:[];

  s.grow.equipment=(s.grow.equipment&&typeof s.grow.equipment==='object')
    ?s.grow.equipment
    :{lamp:0,pots:0};

  s.grow.equipment.lamp=Math.min(5,Math.max(0,Number(s.grow.equipment.lamp)||0));
  s.grow.equipment.pots=Math.min(5,Math.max(0,Number(s.grow.equipment.pots)||0));
}


function v232SyncGold(){
  const value=Math.max(0,Number(s.gold)||0);

  document.querySelectorAll(
    '#gold,#shopGold,[data-gold],.gold-value'
  ).forEach(el=>{
    el.textContent=value;
  });
}


function v232PersistGrow(){
  try{
    persist(false);
  }catch(e){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  }

  try{
    if(typeof v075WriteCloudSave==='function'){
      void v075WriteCloudSave(false);
    }
  }catch(e){}
}


function v232GrowNotice(title,detail,type='success'){
  try{
    if(typeof v063Toast==='function'){
      v063Toast(title,type,detail);
      return;
    }
  }catch(e){}

  try{
    growMessage(`${title} ${detail||''}`.trim());
  }catch(e){}
}


/* ---------- Seed shop ---------- */

function v232BuySeed(id){
  v232EnsureGrowState();

  const seed=seedTypes?.[id];
  if(!seed)return false;

  const price=Math.max(0,Number(seed.buy)||0);
  const gold=Math.max(0,Number(s.gold)||0);

  if(gold<price){
    v232GrowNotice(
      'Nicht genug Gold',
      `${seed.name} kostet ${price} Gold. Du hast ${gold} Gold.`,
      'warn'
    );
    return false;
  }

  s.gold=gold-price;
  s.grow.seeds[id]=(Number(s.grow.seeds[id])||0)+1;

  v232PersistGrow();
  v232SyncGold();

  try{renderGrow()}catch(e){}

  v232GrowNotice(
    `🌰 ${seed.name} gekauft`,
    `Vorrat: ${s.grow.seeds[id]} · -${price} Gold`
  );

  return true;
}


function v232SelectSeed(id){
  v232EnsureGrowState();

  if(!seedTypes?.[id])return false;

  s.grow.selectedSeed=id;
  v232PersistGrow();

  try{renderGrow()}catch(e){}

  v232GrowNotice(
    'Samen ausgewählt',
    seedTypes[id].name
  );

  return true;
}


/* Make ALL historical call sites use the same implementation. */
buySeedAction=v232BuySeed;
selectSeedAction=v232SelectSeed;
window.buySeed=v232BuySeed;
window.selectSeed=v232SelectSeed;


/* ---------- Equipment upgrades ---------- */

function v232UpgradeGrow(k){
  v232EnsureGrowState();

  if(!['lamp','pots'].includes(k))return false;

  const level=Math.min(5,Math.max(0,Number(s.grow.equipment[k])||0));
  s.grow.equipment[k]=level;
  if(level>=5){
    v232GrowNotice(
      'Maximum erreicht',
      `${k==='lamp'?'Lampe':'Töpfe'} ist bereits auf Level 5.`,
      'warn'
    );
    return false;
  }
  const price=(k==='lamp'?120:130)+level*(k==='lamp'?140:150);

  if((Number(s.gold)||0)<price){
    v232GrowNotice(
      'Nicht genug Gold',
      `${k==='lamp'?'Lampen':'Topf'}-Upgrade kostet ${price} Gold.`,
      'warn'
    );
    return false;
  }

  s.gold-=price;
  s.grow.equipment[k]=level+1;

  v232PersistGrow();
  v232SyncGold();

  try{renderGrow()}catch(e){}

  v232GrowNotice(
    k==='lamp'?'💡 Lampe verbessert':'🪴 Töpfe verbessert',
    `Jetzt Level ${level+1}`
  );

  return true;
}


upgradeGrowAction=v232UpgradeGrow;
window.upgradeGrowEquip=v232UpgradeGrow;


/* ---------- Room upgrade ---------- */

function v232UpgradeRoom(){
  v232EnsureGrowState();

  s.grow.roomLevel=Math.min(4,Math.max(1,Number(s.grow.roomLevel)||1));
  if(s.grow.roomLevel>=4){
    v232GrowNotice('Maximum erreicht','Der Growroom ist bereits auf Level 4.','warn');
    return false;
  }
  const price=150*s.grow.roomLevel;

  if((Number(s.gold)||0)<price){
    v232GrowNotice(
      'Nicht genug Gold',
      `Das Raum-Upgrade kostet ${price} Gold.`,
      'warn'
    );
    return false;
  }

  s.gold-=price;
  s.grow.roomLevel++;

  v232PersistGrow();
  v232SyncGold();

  try{renderGrow()}catch(e){}

  v232GrowNotice(
    '🏗️ Growroom erweitert',
    `Raum-Level ${s.grow.roomLevel} · ${growCapacity()} Pflanzenplätze`
  );

  return true;
}


upgradeRoomAction=v232UpgradeRoom;


/* ---------- Planting ---------- */

const v232BasePlantSelectedSeed=plantSelectedSeed;

plantSelectedSeed=function(targetSlot=null){
  v232EnsureGrowState();

  const id=s.grow.selectedSeed||'moss';
  const seed=seedTypes?.[id];

  if(!seed){
    v232GrowNotice('Kein Samen ausgewählt','Wähle zuerst einen Samen aus.','warn');
    return false;
  }

  if((Number(s.grow.seeds[id])||0)<1){
    v232GrowNotice(
      'Keine Samen vorhanden',
      `Kaufe zuerst ${seed.name} im Samen-Shop.`,
      'warn'
    );
    return false;
  }

  const result=v232BasePlantSelectedSeed(targetSlot);

  /*
    Base function already modifies state and persists.
    Repaint state explicitly because some historical persist() wrappers
    do not redraw the growroom immediately.
  */
  v232SyncGold();
  try{renderGrow()}catch(e){}

  return result;
};


/* ---------- Harvest ---------- */

const v232BaseHarvest=harvestReadyPlants;

harvestReadyPlants=function(){
  v232EnsureGrowState();

  const beforeGold=Number(s.gold)||0;
  const ready=s.grow.plants.filter(
    p=>p && Date.now()-(Number(p.start)||0)>=(Number(p.duration)||0)
  ).length;

  if(!ready){
    v232GrowNotice(
      'Noch nichts erntereif',
      'Lass deine Pflanzen noch etwas wachsen.',
      'warn'
    );
    return false;
  }

  const result=v232BaseHarvest();

  v232SyncGold();

  const gained=Math.max(0,(Number(s.gold)||0)-beforeGold);

  v232GrowNotice(
    '🌿 Ernte verkauft',
    `${ready} Pflanze${ready===1?'':'n'} · +${gained} Gold`
  );

  return result;
};


/* ---------- Current renderer ---------- */

renderSeedShop=function(){
  v232EnsureGrowState();

  const box=document.querySelector('#seedShop');
  if(!box)return;

  box.innerHTML=Object.entries(seedTypes).map(([id,x])=>{
    const selected=s.grow.selectedSeed===id;
    const stock=Number(s.grow.seeds[id])||0;
    const seconds=Math.max(
      1,
      Math.round(Number(x.growMs)*lampSpeed()/1000)
    );

    return `
      <div class="seed-card ${selected?'selected':''}" data-seed="${id}">
        <div class="big">${x.icon}</div>
        <h4>${x.name}</h4>

        <div class="tiny">
          ${x.quality} · ${seconds}s Wachstum<br>
          Verkauf: ${x.sell} Gold
        </div>

        <div class="seed-stock">
          <span>Vorrat</span>
          <b>${stock}</b>
        </div>

        <button
          type="button"
          class="btn seed-buy"
          data-v232-seed-buy="${id}">
          💰 Kaufen · ${x.buy} Gold
        </button>

        <button
          type="button"
          class="btn seed-select"
          data-v232-seed-select="${id}">
          ${selected?'✓ Ausgewählt':'Auswählen'}
        </button>
      </div>
    `;
  }).join('');
};


renderGrowEquipment=function(){
  v232EnsureGrowState();

  const box=document.querySelector('#growEquipment');
  if(!box)return;

  const lamp=Number(s.grow.equipment.lamp)||0;
  const pots=Number(s.grow.equipment.pots)||0;

  box.innerHTML=`
    <div class="equip-card">
      <div class="big">💡</div>
      <h4>Lampen-Level ${lamp}</h4>
      <div class="tiny">
        -8 % Wachstumszeit pro Level
      </div>
      <button
        type="button"
        class="btn grow-upgrade"
        data-v232-grow-upgrade="lamp">
        Upgrade · ${120+lamp*140} Gold
      </button>
    </div>

    <div class="equip-card">
      <div class="big">🪴</div>
      <h4>Topf-Level ${pots}</h4>
      <div class="tiny">
        +10 % Verkaufsertrag pro Level
      </div>
      <button
        type="button"
        class="btn grow-upgrade"
        data-v232-grow-upgrade="pots">
        Upgrade · ${130+pots*150} Gold
      </button>
    </div>
  `;
};


/*
  Capture phase is intentional:
  old V0.x delegated click listeners still exist lower in the file.
  For Growroom controls we stop those old handlers and run exactly one
  V4.02 action.
*/
document.addEventListener('click',e=>{
  const target=e.target;
  if(!(target instanceof Element))return;

  const root=target.closest('#grow');
  if(!root)return;

  const buy=target.closest('[data-v232-seed-buy]');
  if(buy){
    e.preventDefault();
    e.stopImmediatePropagation();
    v232BuySeed(buy.dataset.v232SeedBuy);
    return;
  }

  const select=target.closest('[data-v232-seed-select]');
  if(select){
    e.preventDefault();
    e.stopImmediatePropagation();
    v232SelectSeed(select.dataset.v232SeedSelect);
    return;
  }

  const upgrade=target.closest('[data-v232-grow-upgrade]');
  if(upgrade){
    e.preventDefault();
    e.stopImmediatePropagation();
    v232UpgradeGrow(upgrade.dataset.v232GrowUpgrade);
    return;
  }

  const room=target.closest('#upgradeRoom');
  if(room){
    e.preventDefault();
    e.stopImmediatePropagation();
    v232UpgradeRoom();
    return;
  }

  const plant=target.closest('#plantBtn');
  if(plant){
    e.preventDefault();
    e.stopImmediatePropagation();
    plantSelectedSeed();
    return;
  }

  const harvest=target.closest('#harvestBtn');
  if(harvest){
    e.preventDefault();
    e.stopImmediatePropagation();
    harvestReadyPlants();
    return;
  }

  const slotButton=target.closest('.slot-plant-btn[data-grow-slot]');
  if(slotButton){
    e.preventDefault();
    e.stopImmediatePropagation();
    plantSelectedSeed(Number(slotButton.dataset.growSlot));
    return;
  }
},true);


/*
  Character/cloud state can replace the grow object after login.
  Normalize and repaint whenever Growroom is opened.
*/
/* V6.319: keep V232 buy/select/upgrade/persist helpers, but retire its old
   Growroom-open wrapper and startup repaint. V4.92 is the active renderGrow owner,
   and fast navigation calls that owner directly. */
