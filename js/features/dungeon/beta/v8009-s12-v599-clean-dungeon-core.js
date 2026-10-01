(function(){
  'use strict';
  if(window.__V599_CLEAN_DUNGEON__)return;
  window.__V599_CLEAN_DUNGEON__=true;

  const clean=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  let fxTimer=0,impactTimer=0,lastBattleLog='';

  function ensure(){
    const card=document.getElementById('dungeonBattleCard');
    const stage=document.getElementById('battleStage');
    if(!card||!stage)return;
    card.classList.add('v575-combat','v599-clean');

    /* Phase 2C: V5.99 is layout/FX only. It no longer creates a background
       layer and no longer injects any opponent artwork. */
    stage.querySelectorAll(':scope > .v599-template-bg').forEach(n=>n.remove());
    if(!stage.querySelector(':scope > .v599-canopy')){const n=document.createElement('div');n.className='v599-canopy';stage.appendChild(n)}
    if(!stage.querySelector(':scope > .v599-floor')){const n=document.createElement('div');n.className='v599-floor';stage.appendChild(n)}
    if(!stage.querySelector(':scope > .v599-impact')){const n=document.createElement('div');n.className='v599-impact';stage.appendChild(n)}

    const title=stage.querySelector('.v575-stage-title');
    if(title&&title.textContent!=='DUNGEON DUELL')title.textContent='DUNGEON DUELL';

    let strip=stage.querySelector('.v575-proc-strip');
    if(!strip){strip=document.createElement('div');strip.className='v575-proc-strip';stage.appendChild(strip)}
    let fx=strip.querySelector('.v599-fx');
    if(!fx){strip.innerHTML='';fx=document.createElement('span');fx.className='v599-fx';strip.appendChild(fx)}

    document.querySelectorAll('#enemyFighter .v599-treant-art').forEach(n=>n.remove());
    document.getElementById('enemyFighter')?.classList.remove('v599-treant');
  }

  function showFx(text){
    const stage=document.getElementById('battleStage');
    const fx=stage?.querySelector('.v599-fx');
    if(!fx)return;
    const t=String(text||'');
    let label='',kind='';
    if(/KRIT/i.test(t)){label='KRITISCHER TREFFER';kind='crit'}
    else if(/WUCHT/i.test(t)){label='WUCHT';kind='wucht'}
    else if(/RASEREI/i.test(t)){label='RASEREI';kind='rage'}
    else if(/AUSGEWICHEN/i.test(t)){label='AUSGEWICHEN';kind='dodge'}
    else if(/GEBLOCKT|BLOCK/i.test(t)){label='GEBLOCKT';kind='guard'}
    else {const m=t.match(/\+(\d+)\s*(?:LP|HP)/i);if(m){label='LEBENSRAUB +'+m[1]+' LP';kind='heal'}}
    clearTimeout(fxTimer);
    fx.className='v599-fx';
    if(!label){fx.textContent='';return}
    fx.textContent=label;fx.classList.add(kind,'show');
    fxTimer=setTimeout(()=>{try{fx.className='v599-fx'}catch(_){}},760);
  }

  function flashImpact(){
    const impact=document.querySelector('#battleStage .v599-impact');if(!impact)return;
    clearTimeout(impactTimer);impact.classList.remove('show');void impact.offsetWidth;impact.classList.add('show');
    impactTimer=setTimeout(()=>impact.classList.remove('show'),390);
  }

  function onBattleLog(){
    const log=document.getElementById('battleLog');if(!log)return;
    const t=clean(log.textContent);if(!t||t===lastBattleLog)return;lastBattleLog=t;
    if(/Runde\s+\d+/i.test(t)){showFx(t);flashImpact()}
  }

  function bind(){
    ensure();
    const title=document.querySelector('#battleStage .v575-stage-title');
    if(title&&title.textContent!=='DUNGEON DUELL')title.textContent='DUNGEON DUELL';
    /* V6.215: old V5.99 title/log observers retired. V6.04 owns live skill FX,
       while the final dungeon visual owner owns the stage. */
  }

  /* No render wrapper and no opponent-name observer here anymore. The final
     Phase 2C owner performs the post-render visual sync exactly once. */
  document.addEventListener('click',ev=>{if(ev.target?.closest?.('#dungeon'))setTimeout(bind,0)},true);
  window.addEventListener('pageshow',bind,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)bind()},{passive:true});
  setTimeout(bind,0);
})();
