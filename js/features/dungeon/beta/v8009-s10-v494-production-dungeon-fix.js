(function(){
  'use strict';
  if(window.__V494_PRODUCTION_DUNGEON_FIX__) return;
  window.__V494_PRODUCTION_DUNGEON_FIX__=true;

  function toast(msg,type='warn'){
    try{ if(typeof window.v063Toast==='function') return window.v063Toast(msg,type); }catch(e){}
    try{ if(typeof v115Alert==='function') return v115Alert(msg); }catch(e){}
  }

  function previewOff(){
    /* These preview state objects are UI-only. They are never part of game progress. */
    try{ if(window.__v453AllDungeonPreview) window.__v453AllDungeonPreview.active=false; }catch(e){}
    try{ if(window.__v435DungeonPreview) window.__v435DungeonPreview.active=false; }catch(e){}
    try{ if(window.__v441Dungeon9Preview) window.__v441Dungeon9Preview.active=false; }catch(e){}

    /* Old preview observers are not needed in production. */
    try{ document.getElementById('dungeon')?.__v441PreviewObserver?.disconnect?.(); }catch(e){}
    try{ document.getElementById('dungeon')?.__v443D9LaunchObserver?.disconnect?.(); }catch(e){}
    try{ window.__V470_DUNGEON_PREVIEW_OBSERVER__?.disconnect?.(); }catch(e){}

    const card=document.getElementById('dungeonMapCard');
    if(card){
      card.classList.remove('v453-all-preview','v435-preview-mode','v441-preview-mode');
      card.querySelectorAll(
        '.v435-preview-launch,.v441-preview-launch,.v447-d9-preview-launch,'+
        '.v435-preview-banner,.v441-preview-banner,.v453-preview-banner,.v453-preview-nav'
      ).forEach(el=>el.remove());
    }
    try{ document.getElementById('v453PreviewHub')?.remove(); }catch(e){}
    try{ document.getElementById('v453PreviewPicker')?.remove(); }catch(e){}
  }

  function restoreLiveControls(){
    previewOff();
    const card=document.getElementById('dungeonMapCard');
    if(!card || !card.classList.contains('v261-detail-card')) return;

    let di=0, current=0, completed=false;
    try{
      di=typeof v048DungeonIndex==='function'
        ? Number(v048DungeonIndex())
        : Math.max(0,Number(s?.dungeon?.selected)||0);
      current=typeof v048RoomIndex==='function'
        ? Number(v048RoomIndex(di))
        : Math.max(0,Math.min(9,Number(s?.dungeon?.progress?.[di] ?? s?.dungeon?.room ?? 0)||0));
      completed=typeof dungeonCompleted==='function' ? !!dungeonCompleted(di) : false;
    }catch(e){}

    card.querySelectorAll('[data-v261-room]').forEach(node=>{
      const ri=Number(node.dataset.v261Room);
      if(!completed && ri===current){
        node.disabled=false;
        node.removeAttribute('aria-disabled');
        node.style.removeProperty('pointer-events');
      }
    });

    const enter=card.querySelector('#v261EnterCurrent');
    if(enter && !completed){
      enter.disabled=false;
      enter.removeAttribute('aria-disabled');
      enter.style.removeProperty('pointer-events');
      const isBoss=current===9;
      enter.textContent=isBoss?'⚔️ BOSS ANGREIFEN':'⚔️ GEGNER ANGREIFEN';
    }
  }

  /* Neutralize all old preview openers AFTER their scripts have loaded. */
  try{ window.v435OpenDungeon8Preview=function(){}; }catch(e){}
  try{ window.v441OpenDungeon9Preview=function(){}; }catch(e){}
  try{ window.v453OpenDungeonPreview=function(){}; }catch(e){}

  /* Sprint 2: called directly by the canonical D2 renderer after each
     Dungeon render. No global renderDungeon wrapper is needed anymore. */
  window.v494DungeonProductionSync=function(){
    previewOff();
    restoreLiveControls();
  };

  /* One delegated live-map handler. This also repairs a button that was cloned
     by an old preview and therefore lost its original click listener. */
  document.addEventListener('click',function(ev){
    const trigger=ev.target?.closest?.(
      '#dungeonMapCard #v261EnterCurrent, #dungeonMapCard .v261-node.current'
    );
    if(!trigger) return;
    if(!document.getElementById('dungeon')?.classList.contains('active')) return;

    previewOff();

    let di=0, current=0;
    try{
      di=typeof v048DungeonIndex==='function'
        ? Number(v048DungeonIndex())
        : Math.max(0,Number(s?.dungeon?.selected)||0);
      current=typeof v048RoomIndex==='function'
        ? Number(v048RoomIndex(di))
        : Math.max(0,Math.min(9,Number(s?.dungeon?.progress?.[di] ?? s?.dungeon?.room ?? 0)||0));
    }catch(e){return;}

    if(typeof dungeonCompleted==='function' && dungeonCompleted(di)) return;
    if(trigger.matches?.('[data-v261-room]') && Number(trigger.dataset.v261Room)!==current) return;

    if(typeof dungeonAvailable==='function' && !dungeonAvailable(di)){
      ev.preventDefault();
      ev.stopImmediatePropagation();
      toast('Dieser Dungeon ist noch nicht betretbar.');
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();

    try{
      s.dungeon.selected=di;
      s.dungeon.room=current;
      s.dungeon.layer='dungeon';
      s.dungeon.view='battle';
      if(typeof persist==='function') persist(false);
      else if(typeof KEY!=='undefined') localStorage.setItem(KEY,JSON.stringify(s));
    }catch(e){console.error('V4.494 battle state',e);}

    try{
      const r=window.renderDungeon || renderDungeon;
      if(typeof r==='function') r();
    }catch(e){console.error('V4.494 battle render',e);}

    requestAnimationFrame(()=>{
      try{window.v246RefreshDungeonOpponent?.();}catch(e){}
      try{window.v246InstallFight?.();}catch(e){}
      try{document.getElementById('dungeonBattleCard')?.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}
    });
  },true);

  /* Keep preview flags/classes false before the final V4.246 fight capture sees them. */
  previewOff();
  restoreLiveControls();
  document.addEventListener('DOMContentLoaded',()=>{previewOff();restoreLiveControls();},{once:true});
  window.addEventListener('pageshow',()=>setTimeout(()=>{previewOff();restoreLiveControls();},0),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(()=>{previewOff();restoreLiveControls();},0);
  },{passive:true});
})();
