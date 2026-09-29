/* === v561-guild-first-open-gate-js === */
(function(){
  'use strict';
  const root=document.getElementById('guild');
  if(!root)return;
  let resolvedKey='';
  let activeLoads=0;

  function userKey(){
    try{
      const u=(typeof v073User!=='undefined'&&v073User)?v073User:null;
      if(!u)return 'unknown';
      return u.is_anonymous?'anonymous':String(u.id||'anonymous');
    }catch(e){return 'unknown'}
  }
  function ensureLoader(){
    const shell=root.querySelector('.v254-guild-shell');
    if(!shell)return null;
    let box=document.getElementById('v561GuildLoading');
    if(!box){
      box=document.createElement('div');
      box.id='v561GuildLoading';
      box.setAttribute('role','status');
      box.setAttribute('aria-live','polite');
      box.innerHTML='<div class="v561-guild-load-title">🌿 Gildendaten werden geladen</div><div class="v561-guild-load-sub">Mitgliedschaft und Gildenstatus werden vom Server geprüft.</div><div class="v561-guild-load-bar" aria-hidden="true"></div>';
      const title=shell.querySelector(':scope > .v554-guild-title');
      if(title)title.insertAdjacentElement('afterend',box); else shell.prepend(box);
    }
    return box;
  }
  function pending(on){
    ensureLoader();
    root.classList.toggle('v561-guild-pending',!!on);
    root.setAttribute('aria-busy',on?'true':'false');
  }
  function needsGate(){
    const k=userKey();
    return !resolvedKey || k==='unknown' || resolvedKey!==k;
  }

  /* The static HTML contains the create/search card. Keep it hidden until a
     real membership result explicitly tells v254RenderGuild to show it. */
  const no=document.getElementById('v254GuildNoGuild');
  if(no && !no.dataset.v561Init){no.dataset.v561Init='1';no.style.display='none'}
  pending(true);

  if(typeof v254LoadGuild==='function'&&!window.__v561GuildLoadGate){
    const base=v254LoadGuild;
    const wrapped=async function(){
      const gate=needsGate();
      if(gate)pending(true);
      activeLoads++;
      try{
        return await base.apply(this,arguments);
      }finally{
        activeLoads=Math.max(0,activeLoads-1);
        if(activeLoads===0){
          resolvedKey=userKey();
          pending(false);
        }
      }
    };
    try{v254LoadGuild=wrapped}catch(e){}
    window.v254LoadGuild=wrapped;
    window.__v561GuildLoadGate=true;
  }

  if(typeof v032Go==='function'&&!window.__v561GuildGoGate){
    const baseGo=v032Go;
    const go=function(id){
      if(id==='guild'&&needsGate())pending(true);
      return baseGo.apply(this,arguments);
    };
    try{v032Go=go}catch(e){}
    window.v032Go=go;
    window.__v561GuildGoGate=true;
  }

  /* If another startup hook already finished the guild query before this patch
     got control, resolve the gate from the authoritative in-memory state. */
  setTimeout(()=>{
    try{
      const known=(typeof v254Membership!=='undefined'&&v254Membership!==null) ||
                  (typeof v254Guild!=='undefined'&&v254Guild!==null);
      if(known && activeLoads===0){resolvedKey=userKey();pending(false)}
    }catch(e){}
  },700);
})();

