
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

  const rows=[...host.querySelectorAll('.v394-skip-row')];
  let row=rows[0]||null;
  rows.slice(1).forEach(x=>x.remove());
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
  const skipHtml='⏩ Questzeit überspringen · 1 Zeit-Samen<small>Danach startet direkt der Quest-Kampf.</small>';
  if(btn.innerHTML!==skipHtml)btn.innerHTML=skipHtml;
  if(btn.dataset.v4127Busy!=='1'&&btn.disabled)btn.disabled=false;

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

  const stocks=[...host.querySelectorAll('.v394-time-seed-stock')];
  let stock=stocks[0]||null;
  stocks.slice(1).forEach(x=>x.remove());
  if(!stock){stock=document.createElement('div');stock.className='v394-time-seed-stock'}
  if(stock.parentElement!==row)row.appendChild(stock);
  const count=seedCount();
  if(stock.dataset.v4127Count!==String(count)){
   stock.dataset.v4127Count=String(count);
   stock.innerHTML=`🌱 <b>${count}</b><span>Zeit-Samen</span>`;
  }
  return true;
 }
 window.v4127EnsureQuestSkip=ensureSkip;

 /* V392 paints the active card one frame after startQuest. Our second frame runs after it,
    so the skip button cannot lose the race against the active-view rebuild anymore. */
 function scheduleSkip(){
  if(scheduled)return;
  scheduled=true;
  try{
   if(ensureSkip()){scheduled=false;return}
  }catch(_){}
  requestAnimationFrame(()=>{
   try{ensureSkip()}finally{scheduled=false}
  });
 }
 window.v4127ScheduleQuestSkip=scheduleSkip;

 /* V8.009: shared navigation owner v7119 dispatches one post-navigation
    event. Listen there instead of adding another v032Go wrapper. */
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')==='quests')scheduleSkip();
 },{passive:true});

 function stamp(){}

 /* V8.009: no unconditional delayed startup repaint. The canonical
    Quest render/start hooks call ensureSkip directly. Navigation/focus only
    repairs the row when the Quest page is actually visible. */
 if(document.getElementById('quests')?.classList.contains('active'))scheduleSkip();stamp();
 window.addEventListener('pageshow',()=>{if(document.getElementById('quests')?.classList.contains('active'))scheduleSkip();stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.getElementById('quests')?.classList.contains('active')){scheduleSkip();stamp()}},{passive:true});
})();
