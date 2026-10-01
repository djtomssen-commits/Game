(()=>{
 'use strict';
 if(window.__V7144_RESPONSIVENESS__)return;window.__V7144_RESPONSIVENESS__=true;
 const VERSION='V7.145';
 const now=()=>Date.now();

 /* V4.02 legacy Hall repair used to query 100 profiles after EVERY global render.
    Modern Hall renderers already own these values; retire the network repair entirely. */
 try{if(typeof v083FixHallList==='function'){v083FixHallList=()=>{};window.v083FixHallList=v083FixHallList}}catch(_){}

 /* Coalesce Social reads and never refresh a hidden social page. Old timers and
    wrappers may still call these names, but they can no longer fan out requests. */
 function govern(name,screen,minGap){
  try{
   const base=window[name]||globalThis[name];if(typeof base!=='function'||base.__v7144Governed)return;
   let flight=null,last=0,lastResult=null;
   const wrapped=async function(...args){
    const active=!!document.querySelector(`#${screen}`)?.classList.contains('active');
    if(!active)return lastResult;
    if(flight)return flight;
    if(now()-last<minGap)return lastResult;
    flight=Promise.resolve(base.apply(this,args)).then(r=>{last=now();lastResult=r;return r}).finally(()=>{flight=null});
    return flight;
   };
   wrapped.__v7144Governed=true;wrapped.__v7144Base=base;
   window[name]=wrapped;try{globalThis[name]=wrapped}catch(_){}
  }catch(e){console.warn('[V7144] governor',name,e)}
 }
 govern('v073LoadRanking','hall',12000);
 govern('v073LoadFriends','friends',15000);
 try{if(typeof v072RenderRanking==='function')v072RenderRanking=()=>window.v073LoadRanking?.()}catch(_){}
 try{if(typeof v072RenderFriends==='function')v072RenderFriends=()=>window.v073LoadFriends?.()}catch(_){}

 /* Immediate client mirror of the authoritative attempt timestamp. This painter
    does not decide availability; it only renders the last server-confirmed anchor. */
 function fmt(ms){
  const t=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),sec=t%60;
  return h>0?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${m}:${String(sec).padStart(2,'0')}`;
 }
 function paintDungeonTimer(force=false){
  try{
   const last=Math.max(0,Number(s?.dungeonPass?.lastFree)||0),left=Math.max(0,3600000-(Date.now()-last));
   const ticket=left<=0?'Kostenloser Versuch bereit':`Timer ${fmt(left)}`;
   document.querySelectorAll('[id="dungeonTicketText"]').forEach(el=>{if(force||el.textContent!==ticket)el.textContent=ticket});
   const box=document.getElementById('v324DungeonCountdown');
   if(box){
    const di=Math.max(0,Math.min((typeof dungeons!=='undefined'?dungeons.length:1)-1,Number(s?.dungeon?.selected)||0));
    const done=typeof dungeonCompleted==='function'&&dungeonCompleted(di);
    if(done)box.style.display='none';else{
     box.style.display='block';
     if(left<=0){box.className='ready';box.textContent='✅ Nächster Dungeon-Kampf kostenlos bereit'}
     else{box.className='wait';box.textContent=`⏳ Nächster kostenloser Kampf in ${fmt(left)} · oder sofort für 1 Harz-Taler`}
    }
   }
  }catch(_){}
 }
 window.v7144PaintDungeonTimer=paintDungeonTimer;

 /* Strip only retired full-stage layers. Nodes, road and current detail panel stay. */
 function cleanMap(){
  const card=document.getElementById('dungeonMapCard');if(!card||card.style.display==='none')return;
  const stage=card.querySelector('.v261-stage');if(!stage)return;
  const imgs=[...stage.querySelectorAll(':scope>.gl-dungeon-map-bg-img')];
  const bg=imgs[0];
  const canonicalReady=!!bg&&!bg.hidden&&(!bg.complete||bg.naturalWidth>0);
  /* V8.009 D5: never destroy the visible fallback before the canonical
     background has actually loaded. This was the source of the black map. */
  stage.querySelectorAll(':scope>.v261-fx').forEach(n=>n.remove());
  if(canonicalReady){
    stage.querySelectorAll(':scope>.v261-bg').forEach(n=>n.remove());
    stage.style.setProperty('background-image','none','important');
  }
  imgs.slice(1).forEach(n=>n.remove());
  paintDungeonTimer(true);
 }
 window.v7144CleanDungeonMap=cleanMap;

 /* V7.156: canonical dungeon renderer calls cleanMap/timer directly; no extra renderDungeon wrapper. */
 document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-screen="dungeon"],[data-go="dungeon"],#dungeonMapCard,#v247DungeonRewardOk'))requestAnimationFrame(()=>{cleanMap();paintDungeonTimer(true)});
 },true);
 window.addEventListener('pageshow',()=>requestAnimationFrame(()=>paintDungeonTimer(true)),{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestAnimationFrame(()=>paintDungeonTimer(true))},{passive:true});


 /* V7.214: Hall and Nebel-Crew are two of the heaviest DOM surfaces. Keep only
    the active social result tree mounted; reopening the other page reloads its
    canonical server data through the governed loader. This prevents 700-900
    stale nodes from accumulating across a normal page tour. */
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  if(id==='hall'){
   requestAnimationFrame(()=>{const f=document.getElementById('v072FriendsList'),r=document.getElementById('v072RequestsList');if(f)f.innerHTML='';if(r)r.innerHTML=''});
  }else if(id==='friends'){
   requestAnimationFrame(()=>{const h=document.getElementById('v072HallRanking');if(h)h.innerHTML=''});
  }
 },{passive:true});
 window.v7144PerformanceDiagnostics=()=>({version:VERSION,legacyHallNetworkRepairRetired:typeof v083FixHallList==='function',socialGoverned:{hall:!!window.v073LoadRanking?.__v7144Governed,friends:!!window.v073LoadFriends?.__v7144Governed},dungeonTimerAnchor:Number(s?.dungeonPass?.lastFree)||0});
 requestAnimationFrame(()=>{cleanMap();paintDungeonTimer(true)});
})();
