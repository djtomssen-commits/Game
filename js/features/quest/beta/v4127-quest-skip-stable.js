
(()=>{
 'use strict';
 const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159';

 function seedCount(){
  try{return Math.max(0,Math.floor(Number(s?.timeSeeds)||0))}catch(e){return 0}
 }

 const v8188PendingRuns=new Map();
 const v8188Sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const v8188RunId=q=>String(q?.serverRunId||'');
 const v8188Enabled=()=>String(window.GROW_RELEASE_CHANNEL||'beta')!=='server1';
 const v8188Ads=()=>{try{return window.Capacitor?.Plugins?.GrowLegendsAds||null}catch(_){return null}};
 const v8188UserId=()=>{try{return (!v073User?.is_anonymous&&v073User?.id)?String(v073User.id):''}catch(_){return''}};
 const v8188CustomData=()=>String(window.GROW_RELEASE_CHANNEL||'beta')==='server1'
   ?'growlegends_quest25_v1:server1'
   :'growlegends_quest25_v1';

 function v8188Toast(title,type='info',detail=''){
  try{return window.v063Toast?.(title,type,detail)}catch(_){}
 }

 function v8188ApplyActive(active){
  if(!active||typeof active!=='object')return false;
  try{
   s.quests=(s?.quests&&typeof s.quests==='object')?s.quests:{offers:[],active:null,eliteOffer:null};
   s.quests.active=JSON.parse(JSON.stringify(active));
   try{persist(false)}catch(_){}
   try{window.v392PaintActive?.()}catch(_){}
   try{if(Number(active.ends)>Date.now())window.glSyncQuestPushJob?.(Number(active.ends));else window.glCancelQuestPushJob?.()}catch(_){}
   return true;
  }catch(_){return false}
 }

 async function v8188QuestState(){
  try{
   if(typeof window.v7045QuestCanonicalState==='function'){
    const r=await window.v7045QuestCanonicalState(true);
    return r&&typeof r==='object'?r:null;
   }
  }catch(_){}
  try{
   if(!v073Db)return null;
   const {data,error}=await v073Db.rpc('v7044_get_quest_state');
   if(error)throw error;
   const r=Array.isArray(data)?data[0]:data;
   if(r?.active)v8188ApplyActive(r.active);
   return r||null;
  }catch(_){return null}
 }

 async function v8188WaitForVerified(runId){
  for(let i=0;i<24;i++){
   const st=await v8188QuestState();
   const active=st?.active||s?.quests?.active||null;
   if(active&&v8188RunId(active)===String(runId)&&active.v8188RewardedSkipApplied){
    v8188ApplyActive(active);
    return active;
   }
   if(!active||v8188RunId(active)!==String(runId))return null;
   await v8188Sleep(500);
  }
  return null;
 }

 async function v8188WatchQuestVideo(q){
  const runId=v8188RunId(q);
  if(!v8188Enabled()||!runId||v8188PendingRuns.has(runId))return false;
  const live=s?.quests?.active;
  if(!live||v8188RunId(live)!==runId||Date.now()>=Number(live.ends||0))return false;
  if(live.v8188RewardedSkipApplied)return false;

  const ads=v8188Ads();
  if(!ads?.showRewarded){
   v8188Toast('Video nicht verfügbar','info','Rewarded Videos sind nur in der Android-App verfügbar.');
   return false;
  }
  const userId=v8188UserId();
  if(!userId){
   v8188Toast('Account erforderlich','warn','Für den Video-Zeitbonus musst du eingeloggt sein.');
   return false;
  }

  v8188PendingRuns.set(runId,Date.now());
  let rewardedFinished=false;
  ensureSkip();
  try{
   const result=await ads.showRewarded({
    placement:'quest_time_25',
    userId,
    customData:v8188CustomData()
   });
   const rewarded=String(result?.status||'').toLowerCase()==='rewarded'
     || result?.rewarded===true
     || result?.completed===true;
   if(!rewarded){
    v8188Toast('Keine Zeit übersprungen','info','Nur ein vollständig angesehenes Video gibt den 25-%-Zeitbonus.');
    return false;
   }
   rewardedFinished=true;
   v8188PendingRuns.set(runId,Date.now());

   const active=await v8188WaitForVerified(runId);
   if(active?.v8188RewardedSkipApplied){
    const sec=Math.max(1,Number(active.v8188RewardedSkipSeconds)||0);
    v8188Toast('25 % Questzeit übersprungen','success',`${sec} Sekunden wurden serverseitig von der Questzeit abgezogen.`);
    return true;
   }

   v8188Toast('Bestätigung wird verarbeitet','info','Das Video wurde vollständig angesehen. Google bestätigt den Zeitbonus noch serverseitig.');
   return false;
  }catch(err){
   const m=String(err?.message||err);
   if(/closed|dismiss|not.completed|abgebrochen/i.test(m)){
    v8188Toast('Keine Zeit übersprungen','info','Das Video wurde nicht vollständig abgeschlossen.');
   }else{
    console.error('V8.188 quest rewarded video',err);
    v8188Toast('Video nicht verfügbar','warn','Das Rewarded Video konnte gerade nicht abgeschlossen werden.');
   }
   return false;
  }finally{
   /* After a completed ad keep this run guarded while Google's SSV may still
      be in flight. Server authority remains the final one-use protection. */
   if(rewardedFinished){
    v8188PendingRuns.set(runId,Date.now());
    setTimeout(()=>{v8188PendingRuns.delete(runId);try{ensureSkip()}catch(_){}},60000);
   }else{
    v8188PendingRuns.delete(runId);
   }
   try{ensureSkip()}catch(_){}
  }
 }

 function v8188EnsureVideo(host,q,seedRow){
  if(!v8188Enabled()){
   host.querySelectorAll('.v8188-video-row').forEach(x=>x.remove());
   return;
  }
  const runId=v8188RunId(q);
  let row=host.querySelector('.v8188-video-row');
  if(!row){
   row=document.createElement('div');
   row.className='v8188-video-row';
  }
  if(seedRow?.nextElementSibling!==row)seedRow?.insertAdjacentElement('afterend',row);

  let btn=row.querySelector('.v8188-video-skip');
  if(!btn){
   btn=document.createElement('button');
   btn.type='button';
   btn.className='v8188-video-skip';
   row.appendChild(btn);
  }

  const used=!!q?.v8188RewardedSkipApplied;
  const pending=!!runId&&v8188PendingRuns.has(runId);
  const native=!!v8188Ads()?.showRewarded;
  if(used){
   btn.disabled=true;
   btn.innerHTML='✓ Video-Bonus genutzt<small>25 % der Questzeit wurden bereits übersprungen.</small>';
  }else if(pending){
   btn.disabled=true;
   btn.innerHTML='🎬 Video wird bestätigt …<small>Serverseitige AdMob-Bestätigung läuft.</small>';
  }else if(!native){
   btn.disabled=true;
   btn.innerHTML='🎬 Video · 25 % Questzeit<small>Nur in der Android-App verfügbar.</small>';
  }else{
   btn.disabled=false;
   btn.innerHTML='🎬 Video ansehen · 25 % Questzeit überspringen<small>1× pro Quest · nur bei vollständig angesehenem Video.</small>';
  }
  btn.onclick=e=>{e.preventDefault();e.stopPropagation();void v8188WatchQuestVideo(s?.quests?.active||q)};
  try{window.v8144GameplayI18n?.apply?.('quests')}catch(_){}
 }

 function ensureSkip(){
  let q=null;
  try{q=s?.quests?.active||null}catch(e){}
  const root=document.getElementById('quests');
  const host=root?.querySelector('.v392-active-view .v386-card-body');
  if(!host)return false;

  /* Finished/no quest: the claim button owns the area. Never leave a stale skip button. */
  if(!q || Date.now()>=Number(q.ends||0)){
   host.querySelectorAll('.v394-skip-row[data-v4127-skip-row="1"],.v393-skip[data-v4127-skip="1"],.v8188-video-row').forEach(x=>x.remove());
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

  v8188EnsureVideo(host,q,row);
  return true;
 }
 window.v4127EnsureQuestSkip=ensureSkip;

 /* V8.009: canonical owners paint the active card before invoking this hook.
    Repair the skip row synchronously; no frame retry is required. */
 function scheduleSkip(){
  try{return ensureSkip()}catch(_){return false}
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
