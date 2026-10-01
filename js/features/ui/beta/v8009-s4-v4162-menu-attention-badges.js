(()=>{
 'use strict';
 if(window.__v4162MenuAttentionInstalled)return;
 window.__v4162MenuAttentionInstalled=true;

 const remote={friends:0,mail:0,guild:0,pvpMs:null,pvpKnown:false,lastAt:0,busy:false};
 let observer=null,paintQueued=false;

 function num(v){v=Number(v);return Number.isFinite(v)?v:0}
 function menu(){return document.getElementById('v032MenuPanel')}
 function userId(){try{return String(v073User?.id||'')}catch(e){return ''}}
 function durable(){try{return !!userId()&&!v073User?.is_anonymous&&!!v073Db}catch(e){return false}}
 function badgeText(v){
  if(v===true||v==='!')return '!';
  const n=Math.max(0,Math.floor(num(v)));
  return n>99?'99+':n>0?String(n):'!';
 }
 function setBadge(id,value,reason='',social=false){
  const b=menu()?.querySelector(`:scope > .top-menu-item[data-screen="${id}"]`);
  if(!b)return;
  const on=value===true || value==='!' || num(value)>0;
  b.classList.toggle('v4162-attn',on);
  b.classList.toggle('v4162-social',on&&!!social);
  if(on){
   b.dataset.v4162Badge=badgeText(value);
   if(reason)b.setAttribute('title',reason);
  }else{
   delete b.dataset.v4162Badge;
   if(b.getAttribute('title')===b.dataset.v4162Reason)b.removeAttribute('title');
  }
  b.dataset.v4162Reason=reason||'';
 }

 function berlinKey(){
  try{
   const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
   const m={};for(const p of parts)if(p.type!=='literal')m[p.type]=p.value;
   return `${m.year}-${m.month}-${m.day}`;
  }catch(e){
   const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
 }
 function dailyDue(){
  try{
   const id=userId(),key=berlinKey(),z=s?.v484DailyLogin;
   if(!id||!z)return false;
   if(localStorage.getItem(`growlegends_daily_claim_${id}_${key}`)==='1')return false;
   return String(z.lastClaimKey||'')!==key;
  }catch(e){return false}
 }
 function worldBossReady(){
  try{
   if(typeof v110MysticEventActive!=='function'||!v110MysticEventActive())return false;
   const wb=s?.v110WorldBoss||{},d=new Date(),key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
   /* Pure read: a new calendar day means the free try is ready even before the
      worldboss screen performs its normal daily reset. */
   return String(wb.day||'')!==key || !wb.freeUsed;
  }catch(e){return false}
 }
 function questReady(){
  try{const q=s?.quests?.active;return !!q&&num(q.ends)>0&&Date.now()>=num(q.ends)}catch(e){return false}
 }
 function growAttention(){
  try{
   const plants=Array.isArray(s?.grow?.plants)?s.grow.plants.filter(Boolean):[];
   const now=Date.now(),marks=[.20,.45,.70,.88];
   let ready=0,care=0;
   for(const p of plants){
    const start=num(p.start),duration=Math.max(1,num(p.duration)||1);
    const x=Math.max(0,Math.min(1,(now-start)/duration));
    if(x>=1){ready++;continue}
    const done=Array.isArray(p.care)?p.care:[];
    for(let i=0;i<marks.length;i++){
     if(done[i])continue;
     const end=i===marks.length-1?1:marks[i+1];
     if(x>=marks[i]&&x<end){care++;break}
    }
   }
   return {on:ready>0||care>0,ready,care};
  }catch(e){return {on:false,ready:0,care:0}}
 }
 function dungeonReady(){
  try{
   const free=typeof freeDungeonReady==='function'?!!freeDungeonReady():(Date.now()-num(s?.dungeonPass?.lastFree)>=3600000);
   if(!free)return false;
   if(typeof dungeons==='undefined'||!Array.isArray(dungeons))return true;
   for(let i=0;i<dungeons.length;i++){
    try{if(typeof dungeonAvailable==='function'&&dungeonAvailable(i))return true}catch(e){}
    const d=dungeons[i],completed=Array.isArray(s?.dungeon?.completed)&&s.dungeon.completed.includes(i);
    const unlocked=i===0||(Array.isArray(s?.dungeon?.unlocked)&&s.dungeon.unlocked.includes(i));
    if(!completed&&unlocked&&num(s?.level)>=num(d?.minLevel||1))return true;
   }
   return false;
  }catch(e){return false}
 }
 function characterAttention(){
  try{return Math.max(0,Math.floor(num(s?.points)))}catch(e){return 0}
 }
 function pvpReady(){
  try{
   if(typeof v204CooldownLeft!=='undefined'&&num(v204CooldownLeft)>0)return false;
   if(remote.pvpKnown)return num(remote.pvpMs)<=0;
   if(typeof v210NotifyState!=='undefined'&&v210NotifyState?.pvpKnown)return num(v210NotifyState.pvpRemaining)<=0;
  }catch(e){}
  return false;
 }
 function guildDomAttention(){
  try{
   const chat=!!document.getElementById('v4144GuildChatTab')?.classList.contains('v4145-unread');
   const war=!!document.querySelector('#v254GuildWar .v4159-war-alert.on,#v254GuildWar .v4159-war-new,.v254-tab[data-v254-tab="war"].v4159-war-new');
   const c=Math.max(0,Math.floor(num(document.getElementById('v257RequestCount')?.textContent)));
   return {on:chat||war||c>0,count:c,chat,war};
  }catch(e){return {on:false,count:0,chat:false,war:false}}
 }
 function friendsDomCount(){
  try{return document.querySelectorAll('#v072RequestsList [data-v073-accept]').length}catch(e){return 0}
 }
 function mailDomCount(){
  try{
   const b=document.getElementById('v381MailBadge');
   if(!b||b.style.display==='none')return 0;
   return Math.max(0,Math.floor(num(String(b.textContent||'').replace(/\D/g,''))));
  }catch(e){return 0}
 }

 function paint(){
  paintQueued=false;
  const panel=menu();if(!panel)return;
  const grow=growAttention();
  const gd=guildDomAttention();
  const friendCount=Math.max(remote.friends,friendsDomCount());
  const mailCount=Math.max(remote.mail,mailDomCount());
  const guildCount=Math.max(remote.guild,gd.count);

  const charPts=characterAttention();
  setBadge('character',charPts,charPts?`${charPts} Attributpunkt${charPts===1?'':'e'} verfügbar`:'' ,false);
  setBadge('grow',grow.on,'Growroom: '+(grow.ready?`${grow.ready} Ernte${grow.ready===1?'':'n'} bereit`:grow.care?`${grow.care} Pflegeaktion${grow.care===1?'':'en'} verfügbar`:''),false);
  setBadge('quests',questReady(),'Quest abgeschlossen – Belohnung abholen',false);
  setBadge('dungeon',dungeonReady(),'Kostenloser Dungeon-Versuch bereit',false);
  setBadge('pvp',pvpReady(),'PvP-Kampf wieder bereit',false);
  setBadge('friends',friendCount,friendCount?`${friendCount} neue Freundschaftsanfrage${friendCount===1?'':'n'}`:'',true);
  setBadge('mail',mailCount,mailCount?`${mailCount} ungelesene Nachricht${mailCount===1?'':'en'}`:'',true);
  setBadge('guild',guildCount||gd.on,guildCount?`${guildCount} offene Gildenanfrage${guildCount===1?'':'n'}`:gd.chat?'Neue Gildenchat-Nachricht':gd.war?'Neue Gildenkrieg-Aktion':'',true);
  setBadge('world',dailyDue()||worldBossReady(),dailyDue()?'Tagesbelohnung verfügbar':worldBossReady()?'Kostenloser Eventboss-Versuch bereit':'',false);
 }
 function queuePaint(){
  if(paintQueued)return;paintQueued=true;
  requestAnimationFrame(()=>requestAnimationFrame(paint));
 }
 function observeMenu(){
  const panel=menu();if(!panel||panel.dataset.v4162Observed==='1')return;
  panel.dataset.v4162Observed='1';
  observer?.disconnect();observer=new MutationObserver(()=>queuePaint());
  observer.observe(panel,{childList:true});
 }

 async function ensureOnline(){
  try{if(typeof v073Init==='function')await v073Init()}catch(e){}
  return durable();
 }
 async function remoteRefresh(force=false){
  if(remote.busy)return;
  if(!force&&Date.now()-remote.lastAt<90000)return;
  remote.busy=true;
  try{
   if(!(await ensureOnline())){
    remote.friends=0;remote.mail=0;remote.guild=0;remote.pvpKnown=false;return;
   }
   const uid=userId();
   const jobs=[];
   jobs.push((async()=>{
    try{
     const {count,error}=await v073Db.from('friend_requests').select('id',{count:'exact',head:true}).eq('receiver_id',uid).eq('status','pending');
     if(!error)remote.friends=Math.max(0,num(count));
    }catch(e){}
   })());
   jobs.push((async()=>{
    try{
     const {count,error}=await v073Db.from('player_messages').select('id',{count:'exact',head:true}).eq('receiver_id',uid).eq('is_read',false).is('deleted_by_receiver',false);
     if(!error)remote.mail=Math.max(0,num(count));
    }catch(e){}
   })());
   jobs.push((async()=>{
    try{
     let role='';
     try{if(typeof v254Membership!=='undefined')role=String(v254Membership?.role||'')}catch(e){}
     if(!role){
      const {data,error}=await v073Db.from('guild_members').select('role').eq('user_id',uid).limit(1);
      if(!error&&Array.isArray(data)&&data[0])role=String(data[0].role||'');
     }
     if(!['leader','officer'].includes(role)){remote.guild=0;return}
     const {data,error}=await v073Db.rpc('v257_get_guild_requests');
     if(!error)remote.guild=Array.isArray(data)?data.length:0;
    }catch(e){}
   })());
   jobs.push((async()=>{
    try{
     /* V7.193: share the canonical PvP notification cache instead of issuing a
        second pvp_attacks lookup from the menu badge system. */
     if(typeof v210PvpCheck==='function')await v210PvpCheck();
     if(typeof v210NotifyState!=='undefined'&&v210NotifyState?.pvpKnown){
      const at=Number(v210NotifyState.pvpLocalAt)||Date.now();
      const base=Math.max(0,num(v210NotifyState.pvpRemaining));
      remote.pvpMs=Math.max(0,base-(Date.now()-at));remote.pvpKnown=true;
     }else if(typeof v204LoadCooldown==='function'){
      remote.pvpMs=Math.max(0,num(await v204LoadCooldown()));remote.pvpKnown=true;
     }
    }catch(e){}
   })());
   await Promise.allSettled(jobs);
  }finally{
   remote.lastAt=Date.now();remote.busy=false;paint();
  }
 }

 /* Opening the hamburger must immediately paint local truth and refresh online
    counters. A double RAF runs after the historical final menu builder. */
 document.addEventListener('click',e=>{
  try{
   if(e.target instanceof Element&&e.target.closest('#v032MenuBtn,#v032MenuToggle')){
    observeMenu();queuePaint();setTimeout(()=>remoteRefresh(false),0);
   }
   if(e.target instanceof Element&&e.target.closest('[data-v073-accept],[data-v073-decline],[data-v257-accept],[data-v257-decline],[data-v381-open],[data-v381-delete]')){
    setTimeout(()=>remoteRefresh(true),700);
   }
  }catch(err){}
 },true);

 /* V7.193: remote social counters are refreshed only when they can matter.
    Gameplay events repaint local badges but no longer fan out into unrelated
    friend/mail/guild/PvP requests. */
 window.addEventListener('growlegends:account-ready',()=>{observeMenu();queuePaint()},{passive:true});
 window.addEventListener('growlegends:first-playable',()=>setTimeout(()=>remoteRefresh(true),1400),{passive:true});
 window.addEventListener('growlegends:foreground-ready',()=>{observeMenu();queuePaint();setTimeout(()=>remoteRefresh(false),150)},{passive:true});
 ['growlegends:extras-ready','growlegends:dungeon-key-live-unlocked'].forEach(ev=>{
  window.addEventListener(ev,()=>{observeMenu();queuePaint()},{passive:true});
 });
 window.addEventListener('pageshow',()=>{observeMenu();queuePaint();setTimeout(()=>remoteRefresh(false),200)},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){observeMenu();queuePaint();setTimeout(()=>remoteRefresh(false),250)}},{passive:true});

 /* One cheap fallback while the hamburger is actually open. Opening the menu
    already paints immediately, so closed menus need no 5 s repaint loop. */
 setInterval(()=>{
  if(document.hidden)return;
  const panel=menu();
  if(!panel?.classList.contains('open'))return;
  observeMenu();paint();void remoteRefresh(false);
 },15000);

 observeMenu();queuePaint();setTimeout(()=>{if(!window.v7206StartupBusy?.())void remoteRefresh(false)},1800);
 window.v4162PaintMenuAttentionLocal=()=>{observeMenu();paint();return true};
 window.v4162RefreshMenuAttention=()=>{observeMenu();paint();return remoteRefresh(true)};
 window.__V7192_UI_LATENCY__=Object.freeze({menuRemoteFanout:'scoped',menuFallbackMs:15000,pvpCooldownSource:'shared-v210-cache',combatQaOwner:'v7175',growLegacyTick:'ui-only-on-authority',shiftTicker:'visible-only',towerTicker:'active-only',guildFirstPaint:'core-first',guildMetaRefresh:'deferred-parallel',persistWholeSave:'single-checkpoint-write'});
})();
