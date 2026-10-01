(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  let ownProfileOpenId='', syncTimer=0, syncBusy=false, lastSyncedPower=null, painting=false;

  /* ONE combat-power source for the whole game: exactly the same global function
     that paints #charPower on the character page. */
  function livePower(){
    try{return Math.max(0,Math.round(Number(combatPower())||0))}catch(e){return 0}
  }
  window.v446CombatPower=livePower;

  /* Remove the last historical second formula. Any old profile code that still
     calls v074CombatPower now receives the character-page value too. */
  try{
    v074CombatPower=function(){return livePower()};
    window.v074CombatPower=v074CombatPower;
  }catch(e){}

  /* Every profile write, regardless of which historical wrapper owns it, carries
     the exact current combatPower(). */
  if(typeof v073ProfilePayload==='function'&&!window.__v446ProfilePayloadWrapped){
    const basePayload=v073ProfilePayload;
    v073ProfilePayload=function(){
      const p=basePayload.apply(this,arguments)||{};
      p.combat_power=livePower();
      return p;
    };
    try{window.v073ProfilePayload=v073ProfilePayload}catch(e){}
    window.__v446ProfilePayloadWrapped=true;
  }

  function ownUserId(){
    try{return typeof v073User!=='undefined'&&v073User?.id?String(v073User.id):''}catch(e){return ''}
  }
  function setText(el,value){
    if(!el)return;
    const v=String(value);
    if(el.textContent!==v)el.textContent=v;
  }
  function replacePowerText(el,cp){
    if(!el)return;
    const txt=String(el.textContent||'');
    if(/Kampfkraft\s*[\d.]+/i.test(txt)){
      const next=txt.replace(/Kampfkraft\s*[\d.]+/i,`Kampfkraft ${cp}`);
      if(next!==txt)el.textContent=next;
    }
  }
  function paintProfileStat(root,cp){
    if(!root)return;
    [...root.querySelectorAll('.v326-profile-stat,.v072-profile-stat,.v074-power')].forEach(box=>{
      if(!/Kampf(?:kraft|wert)/i.test(box.textContent||''))return;
      const b=box.querySelector('b');
      if(b)setText(b,cp);
    });
  }

  function paintLocalPower(){
    if(painting)return;
    painting=true;
    try{
      const cp=livePower();

      /* Character / legacy header / global header / worldboss. */
      ['#power','#charPower','#v358Power','#v110Cp'].forEach(sel=>setText(document.querySelector(sel),cp));

      /* World layouts that already intend to show the player's own power. */
      document.querySelectorAll('.v349-power b,.v366-power b,.v251-detail-bottom .v251-mini-stat:first-child b')
        .forEach(el=>setText(el,cp));

      /* PvP: only the local/player side. Enemy power remains the opponent's synced value. */
      replacePowerText(document.querySelector('#v209PlayerSub'),cp);

      const uid=ownUserId();
      if(uid){
        /* Hall/search rows for the logged-in user. Closed-over historical row renderers
           are corrected at DOM level, so they cannot reintroduce a cached DB value. */
        document.querySelectorAll('.v072-player-row[data-profile-id]').forEach(row=>{
          if(String(row.getAttribute('data-profile-id')||'')!==uid)return;
          const sub=row.querySelector('.v072-player-sub');
          if(sub)replacePowerText(sub,cp);
        });

        paintProfileStat(document.querySelector('#v072OwnProfile'),cp);
        if(String(ownProfileOpenId||'')===uid)paintProfileStat(document.querySelector('#v074ProfileContent'),cp);

        /* Guild boss participant/test rows may contain the local player as a server
           snapshot. Repaint only when the participant object can be tied to our user id. */
        try{
          if(Array.isArray(v255BossParticipants))v255BossParticipants.forEach(x=>{
            if(String(x?.user_id||x?.id||'')===uid)x.combat_power=cp;
          });
        }catch(e){}
        try{
          if(Array.isArray(v254Members))v254Members.forEach(m=>{
            if(String(m?.user_id||'')===uid&&m.profile)m.profile.combat_power=cp;
          });
        }catch(e){}
      }
    }finally{painting=false}
  }
  window.v446PaintCombatPower=paintLocalPower;

  /* Direct server repair. This is independent of legacy sync return values and makes
     Hall/PvP/Guild reads use the same formula for this player. */
  async function writeLivePower(force=false){
    if(syncBusy)return true;
    try{
      if(typeof v073Init==='function')await v073Init();
      if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User||v073User.is_anonymous)return false;
      if(!s?.characterNameSet)return false;
      if(typeof v071NameValid==='function'&&!v071NameValid(s.characterName))return false;
      const cp=livePower();
      if(!force&&lastSyncedPower===cp)return true;
      syncBusy=true;
      const {error}=await window.v7101ProfileUpdate({combat_power:cp,updated_at:new Date().toISOString()}).eq('id',v073User.id);
      if(error)throw error;
      lastSyncedPower=cp;
      return true;
    }catch(e){
      console.warn('V4.46 combat power sync',e);
      return false;
    }finally{syncBusy=false}
  }
  window.v446SyncCombatPower=writeLivePower;

  function scheduleSync(force=false){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(async()=>{
      await writeLivePower(force);
      paintLocalPower();
    },force?0:450);
  }

  /* Ensure profile sync itself cannot finish with another combat-power value. */
  if(typeof v073SyncProfile==='function'&&!window.__v446ProfileSyncWrapped){
    const baseSync=v073SyncProfile;
    v073SyncProfile=async function(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
      let ok=false;
      try{ok=!!(await baseSync.apply(this,arguments))}catch(e){console.warn('V4.46 base profile sync',e)}
      const powerOk=await writeLivePower(!!force);
      paintLocalPower();
      return ok||powerOk;
    };
    try{window.v073SyncProfile=v073SyncProfile}catch(e){}
    window.__v446ProfileSyncWrapped=true;
  }

  /* Public profile modal: own profile is live; other players keep their own synced DB value. */
  if(typeof v074OpenProfile==='function'&&!window.__v446OpenProfileWrapped){
    const baseOpen=v074OpenProfile;
    v074OpenProfile=async function(id){
      ownProfileOpenId=String(id||'');
      const own=ownUserId()&&ownProfileOpenId===ownUserId();
      if(own)await writeLivePower(true);
      const r=await baseOpen.apply(this,arguments);
      if(own){paintLocalPower();requestAnimationFrame(paintLocalPower);setTimeout(paintLocalPower,80)}
      return r;
    };
    try{window.v074OpenProfile=v074OpenProfile}catch(e){}
    window.__v446OpenProfileWrapped=true;
  }

  /* Existing own-row renderer, if called directly, gets the same value before HTML is built. */
  if(typeof v073PlayerRow==='function'&&!window.__v446PlayerRowWrapped){
    const baseRow=v073PlayerRow;
    v073PlayerRow=function(p,i,actions){
      const uid=ownUserId();
      if(p&&uid&&String(p.id||'')===uid)p={...p,combat_power:livePower()};
      return baseRow.call(this,p,i,actions);
    };
    try{window.v073PlayerRow=v073PlayerRow}catch(e){}
    window.__v446PlayerRowWrapped=true;
  }

  /* Local changes (level, attributes, equipment, gems/scrolls, talents) all persist.
     Repaint instantly and debounce one server write. */
  if(typeof persist==='function'&&!window.__v446PersistWrapped){
    const basePersist=persist;
    persist=function(){
      const r=basePersist.apply(this,arguments);
      paintLocalPower();
      requestAnimationFrame(paintLocalPower);
      scheduleSync(false);
      stamp();
      return r;
    };
    try{window.persist=persist}catch(e){}
    window.__v446PersistWrapped=true;
  }

  if(typeof render==='function'&&!window.__v446RenderWrapped){
    const baseRender=render;
    render=function(){
      const r=baseRender.apply(this,arguments);
      paintLocalPower();
      requestAnimationFrame(paintLocalPower);
      stamp();
      return r;
    };
    try{window.render=render}catch(e){}
    window.__v446RenderWrapped=true;
  }

  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    paintLocalPower();
    if(['hall','pvp','guild','friends','character','world'].includes(id))scheduleSync(false);
  },{passive:true});
  window.__v446GoWrapped='v7119-event';

  if(typeof v110Refresh==='function'&&!window.__v446WorldbossWrapped){
    const baseRefresh=v110Refresh;
    v110Refresh=function(){
      const r=baseRefresh.apply(this,arguments);
      paintLocalPower();
      return r;
    };
    try{window.v110Refresh=v110Refresh}catch(e){}
    window.__v446WorldbossWrapped=true;
  }

  if(typeof v255RenderBoss==='function'&&!window.__v446GuildBossRenderWrapped){
    const baseBoss=v255RenderBoss;
    v255RenderBoss=function(){paintLocalPower();const r=baseBoss.apply(this,arguments);paintLocalPower();return r};
    try{window.v255RenderBoss=v255RenderBoss}catch(e){}
    window.__v446GuildBossRenderWrapped=true;
  }

  function stamp(){}

  paintLocalPower();stamp();scheduleSync(true);
  document.addEventListener('DOMContentLoaded',()=>{paintLocalPower();stamp();scheduleSync(true)},{once:true});
  window.addEventListener('pageshow',()=>{paintLocalPower();stamp();scheduleSync(true)},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{paintLocalPower();stamp();scheduleSync(true)},{passive:true});
  document.addEventListener('click',()=>{requestAnimationFrame(paintLocalPower);setTimeout(paintLocalPower,60)},true);
  /* V4.86: retired 18 s combat-power polling guard. Event/render hooks above are authoritative. */
})();
