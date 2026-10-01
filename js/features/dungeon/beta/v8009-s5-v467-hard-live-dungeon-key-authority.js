(function(){
  const VERSION='V4.68 Stable',SHORT='V4.68';
  let lastSig='';
  let repainting=false;

  function stamp(){}

  function ensure(){
    s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
    s.dungeon.keys=(s.dungeon.keys&&typeof s.dungeon.keys==='object')?s.dungeon.keys:{};
    s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?s.dungeon.unlocked.map(Number).filter(Number.isInteger):[];
    s.dungeon.completed=Array.isArray(s.dungeon.completed)?s.dungeon.completed.map(Number).filter(Number.isInteger):[];
    s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
    if(!s.dungeon.unlocked.includes(0))s.dungeon.unlocked.push(0);
    for(let i=1;i<(Array.isArray(dungeons)?dungeons.length:20);i++){
      const key=!!s.dungeon.keys[i]||!!s.dungeon.keys[String(i)];
      const unlocked=s.dungeon.unlocked.includes(i);
      if(key&&!unlocked)s.dungeon.unlocked.push(i);
      if(unlocked&&!key)s.dungeon.keys[i]=true;
      if((key||unlocked)&&s.dungeon.progress[i]==null)s.dungeon.progress[i]=0;
    }
    s.dungeon.unlocked=[...new Set(s.dungeon.unlocked.map(Number).filter(Number.isInteger))].sort((a,b)=>a-b);
    return s.dungeon;
  }

  function has(i){
    i=Number(i);
    if(i===0)return true;
    ensure();
    return !!s.dungeon.keys[i]||!!s.dungeon.keys[String(i)]||s.dungeon.unlocked.includes(i);
  }
  window.v467HasDungeonKey=has;

  /* Final availability authority: never depend on a stale unlocked[] snapshot. */
  try{
    dungeonUnlocked=function(i){return has(i)};
    window.dungeonUnlocked=dungeonUnlocked;
  }catch(e){}
  try{
    if(typeof v243HasDungeonKey==='function'){
      v243HasDungeonKey=function(i){return has(i)};
      window.v243HasDungeonKey=v243HasDungeonKey;
    }
  }catch(e){}
  try{
    if(typeof v250HasKey==='function'){
      v250HasKey=function(i){return has(i)};
      window.v250HasKey=v250HasKey;
    }
  }catch(e){}

  function signature(){
    ensure();
    const keys=Object.keys(s.dungeon.keys).filter(k=>s.dungeon.keys[k]).map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
    return JSON.stringify({keys,unlocked:s.dungeon.unlocked.slice().sort((a,b)=>a-b)});
  }

  function persistKeyState(){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
    try{if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal()}catch(e){}
    try{if(typeof v145SaveScopedLocal==='function')v145SaveScopedLocal()}catch(e){}
    try{if(typeof v213LocalCheckpoint==='function')v213LocalCheckpoint('v467-dungeon-key')}catch(e){}
  }

  function worldCard(){return document.querySelector('#dungeonMapCard')||document.querySelector('#dungeon > .card:first-of-type')}

  function rebuildWorld(reason='key-live'){
    if(repainting)return false;
    repainting=true;
    try{
      ensure();
      const screen=document.querySelector('#dungeon');
      if(!screen)return false;
      const battle=document.querySelector('#dungeonBattleCard');
      if(battle&&screen.classList.contains('active'))battle.style.display='none';
      s.dungeon.layer='world';
      s.dungeon.view='map';

      let ok=false;
      try{
        if(typeof v251RenderWorld==='function')ok=!!v251RenderWorld();
        else if(typeof v230ShowDungeonWorld==='function')ok=!!v230ShowDungeonWorld();
        else if(typeof v065RenderWorld==='function'){v065RenderWorld();ok=true}
        else if(typeof renderDungeon==='function'){renderDungeon();ok=true}
      }catch(e){console.warn('V4.68 dungeon world rebuild',reason,e)}

      try{if(typeof v242PaintDungeonWorldStatus==='function')v242PaintDungeonWorldStatus()}catch(e){}
      try{if(typeof v250PaintKeyProgress==='function')v250PaintKeyProgress()}catch(e){}
      try{if(typeof v067BindWorldMap==='function')v067BindWorldMap()}catch(e){}
      stamp();
      return ok;
    }finally{repainting=false}
  }
  window.v467RebuildDungeonWorld=rebuildWorld;

  function afterKeyChange(reason='key-change'){
    ensure();
    persistKeyState();
    lastSig=signature();
    const active=!!document.querySelector('#dungeon')?.classList.contains('active');
    const inside=active&&String(s.dungeon?.layer||'world')==='dungeon';
    /* V7.214: canonical/key synchronization is allowed to update progression while
       the 10er map is open, but it may not replace that active navigation layer. */
    if(!inside){
      rebuildWorld(reason+'-now');
      try{queueMicrotask(()=>rebuildWorld(reason+'-micro'))}catch(e){}
      try{requestAnimationFrame(()=>rebuildWorld(reason+'-raf'))}catch(e){}
      setTimeout(()=>rebuildWorld(reason+'-80'),80);
      setTimeout(()=>rebuildWorld(reason+'-300'),300);
    }
    try{document.dispatchEvent(new CustomEvent('growlegends:dungeon-key-live',{detail:{reason,keepDungeonLayer:inside}}))}catch(e){}
  }

  /* Wrap the canonical grant owner at EOF, after all old versions. */
  try{
    if(typeof v250GrantKey==='function'&&!window.__v467GrantWrapped){
      const base=v250GrantKey;
      v250GrantKey=function(i){
        const before=signature();
        const r=base.apply(this,arguments);
        ensure();
        if(r&&signature()!==before)afterKeyChange('grant-'+Number(i));
        return r;
      };
      window.v250GrantKey=v250GrantKey;window.__v467GrantWrapped=true;
    }
  }catch(e){console.warn('V4.68 grant wrap',e)}

  function wrapClaim(name){
    try{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__v467KeyWrapped)return;
      const wrapped=function(){
        const before=signature();
        let r;
        try{r=fn.apply(this,arguments)}catch(err){
          ensure();if(signature()!==before)afterKeyChange(name+'-throw');throw err;
        }
        const done=x=>{ensure();if(signature()!==before)afterKeyChange(name);return x};
        if(r&&typeof r.then==='function')return r.then(done,err=>{done();throw err});
        return done(r);
      };
      wrapped.__v467KeyWrapped=true;
      window[name]=wrapped;
      try{if(name==='claimQuest')claimQuest=wrapped;if(name==='v233ClaimQuest')v233ClaimQuest=wrapped}catch(e){}
    }catch(e){console.warn('V4.68 claim wrap',name,e)}
  }
  wrapClaim('claimQuest');
  wrapClaim('v233ClaimQuest');

  /* Final navigation authority through the shared navigation event. */
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')!=='dungeon')return;
    ensure();
    s.dungeon.layer='world';
    s.dungeon.view='map';
    rebuildWorld('v7119');
    try{requestAnimationFrame(()=>rebuildWorld('v7119-raf'))}catch(_){}
    setTimeout(()=>rebuildWorld('v7119-100'),100);
  },{passive:true});
  window.__v467DungeonGoWrapped='v7119-event';

  /* Every opener re-checks the live key state before old guards run. */
  ['v067OpenDungeon','v066OpenDungeon','selectDungeon'].forEach(name=>{
    try{
      const fn=window[name];if(typeof fn!=='function'||fn.__v467KeyWrapped)return;
      const wrapped=async function(i){
        const self=this,args=[...arguments];ensure();
        try{
          const guard=window.v7051EnsureDungeonState;
          if(typeof guard==='function'){
            const g=await guard(Number(i),{force:true,paint:true,reason:name});ensure();
            if(!g?.ok)return false;
            const di=Math.max(0,Number(i)||0),sealed=Array.isArray(s.dungeon.completed)&&s.dungeon.completed.map(Number).includes(di)&&Number(s.dungeon.progress?.[di])>=9;
            if(g.completed||sealed){
              try{window.v467RebuildDungeonWorld?.('server-sealed-'+di)}catch(_){}
              try{window.v115Alert?.('Dieser Dungeon ist bereits abgeschlossen und dauerhaft versiegelt.')}catch(_){}
              return false;
            }
          }
        }catch(e){console.warn('V7.199 dungeon entry guard',name,e);return false}
        return fn.apply(self,args);
      };
      wrapped.__v467KeyWrapped=true;window[name]=wrapped;
      try{if(name==='v067OpenDungeon')v067OpenDungeon=wrapped;if(name==='v066OpenDungeon')v066OpenDungeon=wrapped;if(name==='selectDungeon')selectDungeon=wrapped}catch(e){}
    }catch(e){}
  });

  /* Capture even if a future menu bypasses the wrapped v032Go reference. */
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('[data-screen="dungeon"],[data-go="dungeon"],[data-v032-go="dungeon"]');
    if(!b)return;
    ensure();s.dungeon.layer='world';s.dungeon.view='map';
    setTimeout(()=>rebuildWorld('captured-dungeon-nav'),0);
    setTimeout(()=>rebuildWorld('captured-dungeon-nav-120'),120);
  },true);

  document.addEventListener('growlegends:dungeon-key-changed',()=>afterKeyChange('legacy-event'));

  /* V4.159: the old 250 ms key watcher is retired. The final live-key authority
     hooks the actual quest claim, canonical key grant and Dungeon navigation instead. */
  ensure();lastSig=signature();
  try{if(window.__V467_KEY_WATCHER__)clearInterval(window.__V467_KEY_WATCHER__)}catch(e){}
  window.__V467_KEY_WATCHER__=0;

  stamp();
  document.addEventListener('DOMContentLoaded',()=>{ensure();lastSig=signature();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{ensure();lastSig=signature();stamp()},{passive:true});
})();
