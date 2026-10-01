/* ===== V4.02 Central daily reset at local midnight =====
   Resets once when the local calendar day changes:
   - Dampf -> exactly 100
   - Smaragd-Koloss free attempt -> available again
   - Both merchant inventories -> fresh offers
*/
function v127LocalDayKey(){
  const d=new Date();
  return [
    d.getFullYear(),
    String(d.getMonth()+1).padStart(2,'0'),
    String(d.getDate()).padStart(2,'0')
  ].join('-');
}

function v127EnsureWorldBoss(){
  if(typeof v112EnsureWorldBossState==='function'){
    return v112EnsureWorldBossState();
  }
  if(!s.v110WorldBoss || typeof s.v110WorldBoss!=='object'){
    s.v110WorldBoss={day:'',freeUsed:false,wins:0,attempts:0};
  }
  return s.v110WorldBoss;
}

function v127FreshShop(){
  s.weaponShop=[];
  s.magicShop=[];

  if(typeof v057FillShops==='function'){
    v057FillShops(true);
    return true;
  }

  if(typeof v030FillShops==='function'){
    v030FillShops(true);
    return true;
  }

  if(typeof v030Fill==='function'){
    v030Fill(true);
    return true;
  }

  if(typeof refreshShop==='function'){
    try{
      s.shop=[];
      refreshShop(true);
      return true;
    }catch(e){}
  }
  return false;
}

function v127ServerOwned(){try{return !!(typeof v073User!=='undefined'&&v073User?.id&&(window.v7081UseAuthority?.('quest')||window.v7081UseAuthority?.('shop')||window.v7081UseAuthority?.('worldboss')))}catch(_){return false}}
function v127ApplyDailyReset(options={}){
  if(v127ServerOwned()){v7173LegacyBlock('midnightResetBlocks');return false;}
  const today=v127LocalDayKey();
  const previous=String(s.v127DailyResetDay||'');
  const firstRun=!previous;
  const changed=previous!==today;

  if(!changed)return false;

  /*
    On upgrade/first V4.02 load, use today's date as the starting boundary.
    Dampf already has its own old daily system, so normalize it to the new rule.
  */
  s.v127DailyResetDay=today;

  /* DAMPF: every new local day starts at exactly 100. */
  s.energy=100;
  s.v026DampfDay=today;
  s.lastEnergy=Date.now();

  /* WORLD BOSS: only daily free-use flag resets. Lifetime/event attempts & wins stay intact. */
  const wb=v127EnsureWorldBoss();
  wb.day=today;
  wb.freeUsed=false;

  /* SHOP: all current offers are replaced without charging Harz-Taler. */
  const shopRefreshed=v127FreshShop();

  try{
    localStorage.setItem(KEY,JSON.stringify(s));
  }catch(e){
    console.error('V4.02 daily save',e);
  }

  if(!firstRun && options.notify!==false && typeof v063Toast==='function'){
    v063Toast(
      '🌙 Tagesreset 00:00',
      'success',
      '100 Dampf · kostenloser Smaragd-Koloss-Versuch · neue Händlerangebote'
    );
  }

  /* Refresh visible data without recursively triggering another reset. */
  if(options.render===true){
    try{render()}catch(e){console.error('V4.02 render after reset',e)}
  }

  return {today,firstRun,shopRefreshed};
}
v127ApplyDailyReset.__v7173ServerGuard=true;

/* Make the old Dampf daily reset obey the exact same local-midnight boundary. */
v026DayKey=function(){
  return v127LocalDayKey();
};

v026DailyReset=function(forceRender=false){
  if(v127ServerOwned())return false;
  const today=v127LocalDayKey();

  if(String(s.v127DailyResetDay||'')!==today){
    v127ApplyDailyReset({render:forceRender,notify:true});
    return true;
  }

  /* Keep old state fields synchronized so no old wrapper resets at another time. */
  s.v026DampfDay=today;
  return false;
};
v026DailyReset.__v7173ServerGuard=true;

/* Worldboss code can keep calling v110ResetDay; it now uses the shared midnight boundary. */
v110ResetDay=function(){
  const wb=v127EnsureWorldBoss();
  if(v127ServerOwned())return wb;
  const today=v127LocalDayKey();

  if(String(s.v127DailyResetDay||'')!==today){
    v127ApplyDailyReset({render:false,notify:true});
  }

  wb.day=today;
  return wb;
};
v110ResetDay.__v7173ServerGuard=true;

function v127AddResetInfo(){
  /* Shop note */
  const shop=document.querySelector('#shop');
  if(shop && !document.querySelector('#v127ShopResetInfo')){
    const note=document.createElement('div');
    note.id='v127ShopResetInfo';
    note.className='v127-daily-reset-note';
    note.textContent='🌙 Händler: tägliche automatische Aktualisierung um 00:00 Uhr.';
    const firstCard=shop.querySelector('.card');
    if(firstCard)firstCard.insertAdjacentElement('beforebegin',note);
    else shop.prepend(note);
  }

  /* Worldboss meta note is intentionally compact. */
  const hero=document.querySelector('#v118WorldBossHero');
  if(hero && !hero.querySelector('#v127BossResetInfo')){
    const meta=hero.querySelector('.v118-boss-meta');
    if(meta){
      const note=document.createElement('div');
      note.id='v127BossResetInfo';
      note.className='v127-daily-reset-note';
      note.textContent='🌙 Gratisversuch erneuert sich täglich um 00:00 Uhr.';
      meta.insertAdjacentElement('afterend',note);
    }
  }
}

/* Run before final UI painting. */
const v127BaseRender=render;
render=function(){
  v127ApplyDailyReset({render:false,notify:false});
  const result=v127BaseRender();

  /* Old wrappers may repaint Dampf, force the exact current value after them. */
  const energyEl=document.querySelector('#energy');
  if(energyEl)energyEl.textContent=`${Math.floor(Number(s.energy)||0)}/300`;

  
  requestAnimationFrame(v127AddResetInfo);
  return result;
};

/* While the game is open, catch midnight quickly. */
const v127LegacyMidnightTimer=setInterval(()=>{
  try{
    if(v127ServerOwned()){clearInterval(v127LegacyMidnightTimer);const g=window.__V7173_LEGACY_LOCAL_GUARD__;if(g){g.v127TimerActive=false;g.retiredTimers++;}v7173LegacyBlock('midnightResetBlocks');return;}
    const reset=v127ApplyDailyReset({render:false,notify:true});
    if(reset){render();}else{v127AddResetInfo();}
  }catch(e){console.error('V4.02 midnight watcher',e);}
},10000);
if(window.__V7173_LEGACY_LOCAL_GUARD__)window.__V7173_LEGACY_LOCAL_GUARD__.v127TimerActive=true;
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{if(v127ServerOwned()&&window.__V7173_LEGACY_LOCAL_GUARD__?.v127TimerActive){clearInterval(v127LegacyMidnightTimer);window.__V7173_LEGACY_LOCAL_GUARD__.v127TimerActive=false;window.__V7173_LEGACY_LOCAL_GUARD__.retiredTimers++;}},1000),{passive:true});

/* If browser/app was sleeping in background at midnight, catch it immediately on return. */
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'){
    if(v127ServerOwned())return;
    try{
      const reset=v127ApplyDailyReset({render:false,notify:true});
      if(reset)render();
    }catch(e){}
  }
});
window.addEventListener('focus',()=>{
  if(v127ServerOwned())return;
  try{
    const reset=v127ApplyDailyReset({render:false,notify:true});
    if(reset)render();
  }catch(e){}
});

/* Install today's boundary immediately. */
setTimeout(()=>{
  try{
    v127ApplyDailyReset({render:false,notify:false});
    render();
  }catch(e){
    console.error('V4.02 init',e);
  }
},180);
