(function(){
  const VERSION='V4.30 Stable', SHORT='V4.30';
  const MAX_LAMP=5, MAX_POTS=5, MAX_ROOM=4;

  function clampInt(v,min,max){
    v=Math.floor(Number(v)||0);
    return Math.min(max,Math.max(min,v));
  }
  function clampGrow(save=false){
    s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
    s.grow.equipment=(s.grow.equipment&&typeof s.grow.equipment==='object')?s.grow.equipment:{lamp:0,pots:0};
    const before=`${s.grow.roomLevel}|${s.grow.equipment.lamp}|${s.grow.equipment.pots}`;
    s.grow.roomLevel=clampInt(s.grow.roomLevel||1,1,MAX_ROOM);
    s.grow.equipment.lamp=clampInt(s.grow.equipment.lamp,0,MAX_LAMP);
    s.grow.equipment.pots=clampInt(s.grow.equipment.pots,0,MAX_POTS);
    const changed=before!==`${s.grow.roomLevel}|${s.grow.equipment.lamp}|${s.grow.equipment.pots}`;
    if(changed&&save){
      try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
    }
    return changed;
  }

  /* Cloud/legacy saves can contain old over-level values. Every Growroom entry
     point clamps them before any calculation or UI is allowed to use them. */
  const baseEnsure=typeof v232EnsureGrowState==='function'?v232EnsureGrowState:null;
  if(baseEnsure){
    v232EnsureGrowState=function(){
      baseEnsure.apply(this,arguments);
      clampGrow(false);
    };
  }

  lampSpeed=function(){
    clampGrow(false);
    return Math.max(.60,1-s.grow.equipment.lamp*.08);
  };
  potYield=function(){
    clampGrow(false);
    return 1+s.grow.equipment.pots*.10;
  };
  growCapacity=function(){
    clampGrow(false);
    return Math.min(6,1+(s.grow.roomLevel-1)*2);
  };

  function maxNotice(label,max){
    try{v232GrowNotice('Maximum erreicht',`${label} ist bereits auf Level ${max}.`,'warn')}
    catch(e){try{growMessage(`${label}: Maximum Level ${max} erreicht.`)}catch(_){}}
  }

  const safeUpgrade=function(k){
    clampGrow(false);
    if(!['lamp','pots'].includes(k))return false;
    const max=k==='lamp'?MAX_LAMP:MAX_POTS;
    const level=s.grow.equipment[k];
    if(level>=max){maxNotice(k==='lamp'?'Lampe':'Töpfe',max);return false;}
    const price=(k==='lamp'?120:130)+level*(k==='lamp'?140:150);
    if((Number(s.gold)||0)<price){
      try{v232GrowNotice('Nicht genug Gold',`${k==='lamp'?'Lampen':'Topf'}-Upgrade kostet ${price} Gold.`,'warn')}
      catch(e){try{growMessage('Nicht genug Gold für das Upgrade.')}catch(_){}}
      return false;
    }
    s.gold-=price;
    s.grow.equipment[k]=level+1;
    clampGrow(false);
    try{persist(false)}catch(e){}
    try{v232SyncGold()}catch(e){document.querySelector('#gold')&&(document.querySelector('#gold').textContent=s.gold)}
    try{renderGrow()}catch(e){}
    try{v232GrowNotice(k==='lamp'?'💡 Lampe verbessert':'🪴 Töpfe verbessert',`Jetzt Level ${s.grow.equipment[k]}`)}catch(e){}
    return true;
  };
  v232UpgradeGrow=safeUpgrade;
  upgradeGrowAction=safeUpgrade;
  window.upgradeGrowEquip=safeUpgrade;

  const safeRoomUpgrade=function(){
    clampGrow(false);
    if(s.grow.roomLevel>=MAX_ROOM){maxNotice('Growroom',MAX_ROOM);return false;}
    const price=150*s.grow.roomLevel;
    if((Number(s.gold)||0)<price){
      try{v232GrowNotice('Nicht genug Gold',`Das Raum-Upgrade kostet ${price} Gold.`,'warn')}
      catch(e){try{growMessage('Nicht genug Gold für das Raum-Upgrade.')}catch(_){}}
      return false;
    }
    s.gold-=price;s.grow.roomLevel++;
    clampGrow(false);
    try{persist(false)}catch(e){}
    try{v232SyncGold()}catch(e){document.querySelector('#gold')&&(document.querySelector('#gold').textContent=s.gold)}
    try{renderGrow()}catch(e){}
    try{v232GrowNotice('🏗️ Growroom erweitert',`Raum-Level ${s.grow.roomLevel} · ${growCapacity()} Pflanzenplätze`)}catch(e){}
    return true;
  };
  v232UpgradeRoom=safeRoomUpgrade;
  upgradeRoomAction=safeRoomUpgrade;

  renderGrowEquipment=function(){
    clampGrow(false);
    const box=document.querySelector('#growEquipment');if(!box)return;
    const lamp=s.grow.equipment.lamp,pots=s.grow.equipment.pots;
    const lampMax=lamp>=MAX_LAMP,potsMax=pots>=MAX_POTS;
    const lampCost=120+lamp*140,potsCost=130+pots*150;
    const currentLamp=lamp*8,nextLamp=Math.min(MAX_LAMP,lamp+1)*8;
    const currentPots=pots*10,nextPots=Math.min(MAX_POTS,pots+1)*10;
    box.innerHTML=`
      <div class="equip-card">
        <div class="big">💡</div>
        <h4>Lampe · Lv. ${lamp}/${MAX_LAMP}</h4>
        <div class="v237-equip-effect">
          <b>Schneller wachsen</b><br>
          Jede Stufe verkürzt die Wachstumszeit um 8 %.<br>
          Aktuell −${currentLamp} %${lampMax?' · Maximum erreicht':` · danach −${nextLamp} %`}.
        </div>
        <button type="button" class="btn grow-upgrade" data-v232-grow-upgrade="lamp" ${lampMax?'disabled':''}>
          ${lampMax?'MAXIMUM':`Upgrade · ${lampCost} G`}
        </button>
      </div>
      <div class="equip-card">
        <div class="big">🪴</div>
        <h4>Töpfe · Lv. ${pots}/${MAX_POTS}</h4>
        <div class="v237-equip-effect">
          <b>Mehr Ertrag</b><br>
          Jede Stufe erhöht den Verkaufsertrag um 10 %.<br>
          Aktuell +${currentPots} %${potsMax?' · Maximum erreicht':` · danach +${nextPots} %`}.
        </div>
        <button type="button" class="btn grow-upgrade" data-v232-grow-upgrade="pots" ${potsMax?'disabled':''}>
          ${potsMax?'MAXIMUM':`Upgrade · ${potsCost} G`}
        </button>
      </div>`;
  };

  /* Growroom cleanup Phase 1: retire the historical V430 render wrapper.
     The modern V4.92 ensure() clamps roomLevel/lamp/pots before every current
     Growroom render, while V430 still owns the guarded upgrade functions below. */

  function stamp(){}

  const corrected=clampGrow(false);
  if(corrected){try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}}
  try{if(document.querySelector('#grow'))renderGrow()}catch(e){console.error('V4.30 Growroom max-level repair',e)}
  stamp();
  document.addEventListener('DOMContentLoaded',()=>{clampGrow(true);stamp()},{once:true});
  setTimeout(()=>{clampGrow(true);stamp()},900);
  setTimeout(()=>{clampGrow(true);stamp()},3200);
})();
