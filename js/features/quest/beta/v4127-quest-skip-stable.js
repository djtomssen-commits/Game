
(()=>{
 'use strict';
 const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159';
 let scheduled=false;

 function seedCount(){
  try{return Math.max(0,Math.floor(Number(s?.timeSeeds)||0))}catch(e){return 0}
 }

 function ensureSkip(){
  scheduled=false;
  let q=null;
  try{q=s?.quests?.active||null}catch(e){}
  const root=document.getElementById('quests');
  const host=root?.querySelector('.v392-active-view .v386-card-body');
  if(!host)return false;

  /* Finished/no quest: the claim button owns the area. Never leave a stale skip button. */
  if(!q || Date.now()>=Number(q.ends||0)){
   host.querySelectorAll('.v394-skip-row[data-v4127-skip-row="1"],.v393-skip[data-v4127-skip="1"]').forEach(x=>x.remove());
   return true;
  }

  /* Normalize historical V393/V394 output to exactly one row + one button. */
  const buttons=[...host.querySelectorAll('.v393-skip')];
  let btn=buttons[0]||null;
  buttons.slice(1).forEach(x=>x.remove());

  let row=host.querySelector('.v394-skip-row');
  if(!row){
   row=document.createElement('div');
   row.className='v394-skip-row';
   const note=host.querySelector('.v392-running-note');
   if(note)note.before(row); else host.appendChild(row);
  }
  row.dataset.v4127SkipRow='1';

  if(!btn){
   btn=document.createElement('button');
   btn.type='button';
   btn.className='v393-skip';
  }
  btn.dataset.v4127Skip='1';
  if(btn.parentElement!==row)row.prepend(btn);
  btn.innerHTML='⏩ Questzeit überspringen · 1 Zeit-Samen<small>Danach startet direkt der Quest-Kampf.</small>';
  if(btn.dataset.v4127Busy!=='1')btn.disabled=false;

  btn.onclick=async e=>{
   e.preventDefault();e.stopPropagation();
   if(btn.dataset.v4127Busy==='1')return;
   btn.dataset.v4127Busy='1';btn.disabled=true;
   try{
    if(typeof window.v316SkipActiveQuest==='function')await window.v316SkipActiveQuest();
   }catch(err){
    try{console.error('V4.127 quest skip',err)}catch(_){}
   }finally{
    if(btn.isConnected){btn.dataset.v4127Busy='0';btn.disabled=false}
    scheduleSkip();
   }
  };

  let stock=row.querySelector('.v394-time-seed-stock');
  if(!stock){stock=document.createElement('div');stock.className='v394-time-seed-stock';row.appendChild(stock)}
  stock.innerHTML=`🌱 <b>${seedCount()}</b><span>Zeit-Samen</span>`;
  return true;
 }
 window.v4127EnsureQuestSkip=ensureSkip;

 /* V392 paints the active card one frame after startQuest. Our second frame runs after it,
    so the skip button cannot lose the race against the active-view rebuild anymore. */
 function scheduleSkip(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{try{ensureSkip()}catch(e){scheduled=false}}));
 }
 window.v4127ScheduleQuestSkip=scheduleSkip;

 try{
  if(typeof window.startQuest==='function'&&!window.startQuest.__v4127Skip){
   const base=window.startQuest;
   const wrapped=function(){
    const had=!!s?.quests?.active;
    const r=base.apply(this,arguments);
    if(!had&&s?.quests?.active)scheduleSkip();
    else if(s?.quests?.active)scheduleSkip();
    if(r&&typeof r.then==='function')r.finally(scheduleSkip);
    return r;
   };
   wrapped.__v4127Skip=true;window.startQuest=wrapped;
   try{startQuest=wrapped}catch(e){}
  }
 }catch(e){}

 try{
  if(typeof renderQuests==='function'&&!renderQuests.__v4127Skip){
   const base=renderQuests;
   const wrapped=function(){const r=base.apply(this,arguments);scheduleSkip();return r};
   wrapped.__v4127Skip=true;renderQuests=wrapped;try{window.renderQuests=wrapped}catch(e){}
  }
 }catch(e){}

 try{
  if(typeof v032Go==='function'&&!v032Go.__v4127Skip){
   const base=v032Go;
   const wrapped=function(id){const r=base.apply(this,arguments);if(id==='quests')scheduleSkip();return r};
   wrapped.__v4127Skip=true;v032Go=wrapped;try{window.v032Go=wrapped}catch(e){}
  }
 }catch(e){}

 function stamp(){}

 scheduleSkip();stamp();
 window.addEventListener('pageshow',()=>{scheduleSkip();stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){scheduleSkip();stamp()}},{passive:true});
})();
