(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  let refreshQueued=false;

  function stamp(){}

  function normalizeKeys(){
    try{
      if(typeof v243EnsureDungeonKeyState==='function'){
        v243EnsureDungeonKeyState();
        return;
      }
    }catch(e){}

    s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
    s.dungeon.keys=(s.dungeon.keys&&typeof s.dungeon.keys==='object')?s.dungeon.keys:{};
    s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?s.dungeon.unlocked.map(Number):[0];
    if(!s.dungeon.unlocked.includes(0))s.dungeon.unlocked.push(0);
    Object.keys(s.dungeon.keys).forEach(raw=>{
      const i=Number(raw);
      if(s.dungeon.keys[raw]&&Number.isInteger(i)&&i>0&&!s.dungeon.unlocked.includes(i))s.dungeon.unlocked.push(i);
    });
    s.dungeon.unlocked=[...new Set(s.dungeon.unlocked.filter(Number.isInteger))].sort((a,b)=>a-b);
  }

  function keySignature(){
    normalizeKeys();
    const keys=Object.keys(s.dungeon?.keys||{}).filter(k=>s.dungeon.keys[k]).map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
    const unlocked=(s.dungeon?.unlocked||[]).map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
    return JSON.stringify({keys,unlocked});
  }

  function repaintDungeon(reason='key-change'){
    normalizeKeys();

    const screen=document.querySelector('#dungeon');
    const active=!!screen?.classList?.contains('active');
    const layer=String(s.dungeon?.layer||'world');
    const view=String(s.dungeon?.view||'map');

    /* Never replace an active battle DOM. A key can only be earned from quests,
       but this keeps the live refresh safe against future reward sources. */
    if(active && layer==='dungeon' && view==='battle')return false;

    let painted=false;
    try{
      /* Rebuild the hidden world card too. This is important: when the player finds
         the stone on the quest screen, the Dungeon page is already fresh BEFORE the
         next navigation and cannot retain an old lock icon. */
      if(!active || layer==='world'){
        if(typeof v251RenderWorld==='function')painted=!!v251RenderWorld();
        else if(typeof v230ShowDungeonWorld==='function')painted=!!v230ShowDungeonWorld();
        else if(typeof v065RenderWorld==='function'){v065RenderWorld();painted=true;}
      }else if(layer==='dungeon' && view==='map'){
        if(typeof v251RenderDetail==='function')painted=!!v251RenderDetail();
        else if(typeof renderDungeon==='function'){renderDungeon();painted=true;}
      }
    }catch(e){console.warn('V4.58 Dungeon live refresh',reason,e)}

    try{if(typeof v242PaintDungeonWorldStatus==='function')v242PaintDungeonWorldStatus()}catch(e){}
    try{if(typeof v250PaintKeyProgress==='function')v250PaintKeyProgress()}catch(e){}
    try{if(typeof v067BindWorldMap==='function')v067BindWorldMap()}catch(e){}
    stamp();
    return painted;
  }

  function scheduleRefresh(reason='key-change'){
    if(!refreshQueued){
      refreshQueued=true;
      queueMicrotask(()=>{
        refreshQueued=false;
        repaintDungeon(reason);
      });
    }
    requestAnimationFrame(()=>repaintDungeon(reason+'-raf'));
    setTimeout(()=>repaintDungeon(reason+'-50'),50);
    setTimeout(()=>repaintDungeon(reason+'-220'),220);
  }
  window.v458RefreshDungeonUnlocks=scheduleRefresh;

  /* The canonical pity system grants every Dungeon-2..20 stone here. Repaint in
     the SAME transaction instead of waiting for a page reload. */
  try{
    if(typeof v250GrantKey==='function'&&!window.__v458GrantKeyWrapped){
      const baseGrant=v250GrantKey;
      v250GrantKey=function(i){
        const before=keySignature();
        const ok=baseGrant.apply(this,arguments);
        normalizeKeys();
        const after=keySignature();
        if(ok && after!==before){
          scheduleRefresh('grant-'+Number(i));
          try{document.dispatchEvent(new CustomEvent('growlegends:dungeon-key-changed',{detail:{index:Number(i)}}))}catch(e){}
        }
        return ok;
      };
      try{window.v250GrantKey=v250GrantKey}catch(e){}
      window.__v458GrantKeyWrapped=true;
    }
  }catch(e){console.warn('V4.58 key grant wrapper',e)}

  /* Defense in depth: the visible quest-claim owner has accumulated many historical
     wrappers. Compare the actual key state before/after a claim so ANY legitimate
     key source gets an immediate repaint, even if it bypasses v250GrantKey later. */
  try{
    if(typeof v233ClaimQuest==='function'&&!window.__v458QuestKeyLiveWrapped){
      const baseClaim=v233ClaimQuest;
      v233ClaimQuest=function(){
        const before=keySignature();
        let result;
        try{result=baseClaim.apply(this,arguments)}catch(err){
          if(keySignature()!==before)scheduleRefresh('quest-claim-error');
          throw err;
        }
        const finish=()=>{if(keySignature()!==before)scheduleRefresh('quest-claim')};
        if(result&&typeof result.then==='function'){
          return result.then(x=>{finish();return x},err=>{finish();throw err});
        }
        finish();
        return result;
      };
      try{window.v233ClaimQuest=v233ClaimQuest}catch(e){}
      window.__v458QuestKeyLiveWrapped=true;
    }
  }catch(e){console.warn('V4.58 quest key wrapper',e)}

  /* Always normalize/repaint again when Dungeon is opened. This makes navigation
     independent from whichever old renderer happened to own the previous DOM. */
  /* V7.121: V458 navigation wrapper retired; V467 supersedes its normalize/repaint
     responsibility. Actual key-grant/claim/event hooks in this block remain active. */
  window.__v458DungeonGoWrapped='retired-v7121-v467';

  document.addEventListener('growlegends:dungeon-key-changed',()=>scheduleRefresh('event'));
  stamp();
  document.addEventListener('DOMContentLoaded',()=>{normalizeKeys();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{normalizeKeys();stamp()},{passive:true}); /* V4.123: removed useless late clear of already-fired one-shot timeout. */
})();
