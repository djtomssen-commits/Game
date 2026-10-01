(function(){
  'use strict';
  if(window.__v497DungeonKeyLiveFix)return;
  window.__v497DungeonKeyLiveFix=true;

  let repaintQueued=false;

  function ensureDungeonKeyState(){
    try{
      s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
      s.dungeon.keys=(s.dungeon.keys&&typeof s.dungeon.keys==='object')?s.dungeon.keys:{};
      s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)
        ? s.dungeon.unlocked.map(Number).filter(Number.isInteger)
        : [];
      s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
      if(!s.dungeon.unlocked.includes(0))s.dungeon.unlocked.push(0);

      const max=Array.isArray(window.dungeons||((typeof dungeons!=='undefined')?dungeons:null))
        ? (window.dungeons||dungeons).length
        : 20;

      for(let i=1;i<max;i++){
        const key=!!s.dungeon.keys[i]||!!s.dungeon.keys[String(i)];
        const unlocked=s.dungeon.unlocked.includes(i);
        if(key&&!unlocked)s.dungeon.unlocked.push(i);
        if(unlocked&&!key)s.dungeon.keys[i]=true;
        if((key||unlocked)&&s.dungeon.progress[i]==null)s.dungeon.progress[i]=0;
      }
      s.dungeon.unlocked=[...new Set(s.dungeon.unlocked.map(Number).filter(Number.isInteger))].sort((a,b)=>a-b);
    }catch(e){console.warn('V4.497 key normalize',e)}
  }

  function signature(){
    ensureDungeonKeyState();
    try{
      const keys=Object.keys(s.dungeon.keys||{})
        .filter(k=>s.dungeon.keys[k])
        .map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
      return JSON.stringify({keys,unlocked:[...(s.dungeon.unlocked||[])].map(Number).sort((a,b)=>a-b)});
    }catch(e){return ''}
  }

  function saveKeyState(){
    try{if(typeof KEY!=='undefined')localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal()}catch(e){}
    try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
  }

  function paintWorld(reason){
    try{
      ensureDungeonKeyState();
      s.dungeon.layer='world';
      s.dungeon.view='map';

      const screen=document.getElementById('dungeon');
      if(!screen?.classList.contains('active'))return false;

      let ok=false;
      try{if(typeof window.gl20RenderWorld==='function')ok=window.gl20RenderWorld()!==false}catch(e){}
      if(!ok)try{if(typeof window.v251RenderWorld==='function')ok=window.v251RenderWorld()!==false}catch(e){}
      if(!ok)try{if(typeof window.v065RenderWorld==='function')ok=window.v065RenderWorld()!==false}catch(e){}
      if(!ok)try{if(typeof v230ShowDungeonWorld==='function')ok=v230ShowDungeonWorld()!==false}catch(e){}

      try{if(typeof v242PaintDungeonWorldStatus==='function')v242PaintDungeonWorldStatus()}catch(e){}
      try{if(typeof v250PaintKeyProgress==='function')v250PaintKeyProgress()}catch(e){}
      try{if(typeof v067BindWorldMap==='function')v067BindWorldMap()}catch(e){}
      return ok;
    }catch(e){console.warn('V4.497 dungeon repaint',reason,e);return false}
  }

  function applyUnlock(before,reason){
    ensureDungeonKeyState();
    const after=signature();
    if(before===after)return false;

    /* A quest-found key is an overworld progression event. Do not leave the
       renderer trapped in an old dungeon-detail layer after the reward. */
    s.dungeon.layer='world';
    s.dungeon.view='map';
    saveKeyState();

    if(!repaintQueued){
      repaintQueued=true;
      queueMicrotask(()=>{repaintQueued=false;paintWorld(reason+'-micro')});
    }
    paintWorld(reason+'-now');
    requestAnimationFrame(()=>paintWorld(reason+'-raf'));
    setTimeout(()=>paintWorld(reason+'-80'),80);
    setTimeout(()=>paintWorld(reason+'-240'),240);

    try{document.dispatchEvent(new CustomEvent('growlegends:dungeon-key-live-unlocked',{detail:{reason}}))}catch(e){}
    return true;
  }

  function wrap(name){
    try{
      const fn=window[name] || ((typeof globalThis[name]==='function')?globalThis[name]:null);
      if(typeof fn!=='function'||fn.__v497DungeonKeyLive)return;
      const wrapped=function(){
        const before=signature();
        let out;
        try{out=fn.apply(this,arguments)}catch(err){applyUnlock(before,name+'-throw');throw err}
        const done=x=>{applyUnlock(before,name);return x};
        if(out&&typeof out.then==='function')return out.then(done,err=>{applyUnlock(before,name+'-reject');throw err});
        return done(out);
      };
      wrapped.__v497DungeonKeyLive=true;
      window[name]=wrapped;
      try{
        if(name==='claimQuest')claimQuest=wrapped;
        if(name==='v233ClaimQuest')v233ClaimQuest=wrapped;
        if(name==='v250GrantKey')v250GrantKey=wrapped;
      }catch(e){}
    }catch(e){console.warn('V4.497 wrap',name,e)}
  }

  wrap('v250GrantKey');
  wrap('claimQuest');
  wrap('v233ClaimQuest');

  /* Also catches any historical direct mutation that still dispatches one of
     the existing key events. */
  ['growlegends:dungeon-key-changed','growlegends:dungeon-key-live'].forEach(ev=>{
    document.addEventListener(ev,e=>{
      ensureDungeonKeyState();
      const active=!!document.getElementById('dungeon')?.classList.contains('active');
      const inside=active&&String(s.dungeon?.layer||'world')==='dungeon';
      saveKeyState();
      /* V7.214: never convert an active 10-room detail/battle layer into world-map
         navigation merely because a delayed server/key event arrived. */
      if(inside||e?.detail?.keepDungeonLayer)return;
      s.dungeon.layer='world';s.dungeon.view='map';
      paintWorld(ev+'-now');requestAnimationFrame(()=>paintWorld(ev+'-raf'));
    });
  });

  /* Opening the Dungeon page must always use the current key truth immediately. */
  try{
    const fn=window.v032Go || ((typeof v032Go==='function')?v032Go:null);
    if(typeof fn==='function'&&!fn.__v497DungeonKeyLive){
      const wrappedGo=function(id){
        if(id==='dungeon'){
          ensureDungeonKeyState();
          s.dungeon.layer='world';s.dungeon.view='map';
        }
        const r=fn.apply(this,arguments);
        if(id==='dungeon'){
          paintWorld('nav-now');
          requestAnimationFrame(()=>paintWorld('nav-raf'));
          setTimeout(()=>paintWorld('nav-80'),80);
        }
        return r;
      };
      wrappedGo.__v497DungeonKeyLive=true;
      window.v032Go=wrappedGo;
      try{v032Go=wrappedGo}catch(e){}
    }
  }catch(e){}

  ensureDungeonKeyState();
})();
