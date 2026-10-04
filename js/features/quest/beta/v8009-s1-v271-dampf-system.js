/* ===== V4.02 canonical Dampf system =====
   Normal: 100/100
   Dampf event: 200 free daily, refillable with Harz up to 300
   Quest costs: 7-8 Dampf, last quest consumes the remainder
   Refill: +20 for 1 Harz, maximum 10 refills/day, never above current cap
*/
let v271EventDataReady=false;

function v271DayKey(){
  if(typeof v127LocalDayKey==='function')return v127LocalDayKey();
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function v271DampfEventActive(){
  if(!v271EventDataReady)return !!s.v271DampfEventWasActive;
  const now=Date.now();
  return (v093Events||[]).some(ev=>{
    if(!ev?.is_active)return false;
    const name=String(ev.name||'').toLowerCase();
    if(!name.includes('dampf'))return false;
    const start=ev.starts_at?new Date(ev.starts_at).getTime():0;
    const end=ev.ends_at?new Date(ev.ends_at).getTime():Infinity;
    return now>=start && now<=end;
  });
}
function v271ActiveDampfEvent(){
  if(!v271EventDataReady)return null;
  const now=Date.now();
  return (v093Events||[]).find(ev=>{
    if(!ev?.is_active)return false;
    if(!String(ev.name||'').toLowerCase().includes('dampf'))return false;
    const start=ev.starts_at?new Date(ev.starts_at).getTime():0;
    const end=ev.ends_at?new Date(ev.ends_at).getTime():Infinity;
    return now>=start && now<=end;
  })||null;
}
function v271DampfCap(){return v271DampfEventActive()?300:100}

function v271EnsureRefillState(){
  const day=v271DayKey();
  s.v271DampfRefill??={day,count:0};
  if(s.v271DampfRefill.day!==day){
    s.v271DampfRefill={day,count:0};
  }
  s.v271DampfRefill.count=Math.max(0,Math.min(10,Number(s.v271DampfRefill.count)||0));
  return s.v271DampfRefill;
}

function v271SyncDampfEvent(){
 if(!v271EventDataReady)return false;
 const ev=v271ActiveDampfEvent(), active=!!ev;
 const owner=String(v073User?.id||s.social?.playerId||s.characterName||'local');
 const eventKey=ev?`${ev.id||ev.name}|${ev.starts_at||''}`:'';
 const grantKey=active?`${owner}|${eventKey}`:'';
 if(active){
  if(String(s.v271DampfEventGrantKey||'')!==grantKey){
   s.energy=Math.max(Number(s.energy)||0,200);s.v271DampfEventGrantKey=grantKey;s.v271DampfEventWasActive=true;
   try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
   try{v063Toast?.('💨 Dampf-Event aktiv!','success','Du erhältst heute 200 Dampf. Mit Harz kannst du bis 300 auffüllen.')}catch(e){}
   return true;
  }
  s.v271DampfEventWasActive=true;return false;
 }
 if(s.v271DampfEventWasActive)s.energy=Math.min(100,Math.max(0,Number(s.energy)||0));
 s.v271DampfEventWasActive=false;s.v271DampfEventGrantKey='';return false;
}

function v271PaintDampf(){
  v271EnsureRefillState();
  const cap=v271DampfCap();
  const e=Math.max(0,Math.min(cap,Math.floor(Number(s.energy)||0)));
  if(Number(s.energy)!==e)s.energy=e;

  const energyEl=document.querySelector('#energy');
  if(energyEl)energyEl.textContent=`💨 ${e}/${cap}`;

  const host=energyEl?.parentElement;
  if(host){
    let info=document.querySelector('#v271DampfInfo');
    if(!info){
      info=document.createElement('div');
      info.id='v271DampfInfo';
      host.appendChild(info);
    }
    const used=Number(s.v271DampfRefill?.count)||0;
    info.innerHTML=`<span>Auffüllen: <b>${used}/10</b></span>${v271DampfEventActive()?'<span id="v271DampfEventBadge">💨 EVENT 200 GRATIS · MAX 300</span>':''}`;
  }

  const refill=document.querySelector('#v026RefillBtn');
  if(refill){
    const used=Number(s.v271DampfRefill?.count)||0;
    refill.textContent=`🟢 +20 💨 Dampf (${used}/10)`;
    refill.disabled=used>=10 || e>=cap;
  }
}

async function v271RefillDampf(){
  v271EnsureRefillState();
  const cap=v271DampfCap();
  const state=s.v271DampfRefill;
  const current=Math.max(0,Number(s.energy)||0);

  if(state.count>=10)return v115Alert('Du hast heute bereits 10× Dampf aufgefüllt.');
  if(current>=cap)return v115Alert(`Dein Dampf ist bereits voll: ${cap}/${cap}.`);
  if((Number(s.harzTaler)||0)<1)return v115Alert('Du hast keinen Harz-Taler mehr.');

  const add=Math.min(20,cap-current);
  if(!confirm(`1 Harz-Taler einsetzen und +${add} Dampf erhalten?\n\nAuffüllungen heute: ${state.count}/10`))return;

  s.harzTaler=(Number(s.harzTaler)||0)-1;
  s.energy=Math.min(cap,current+20);
  state.count++;
  try{persist(false)}catch(e){localStorage.setItem(KEY,JSON.stringify(s))}
  try{render()}catch(e){}
  v271PaintDampf();
}

v026PaintDampf=v271PaintDampf;
/* V8.009: v271 no longer creates refill DOM.
   v284 is the sole card/button producer; this compatibility entry only repaints. */
v026AddRefill=function(){v271PaintDampf()};

/* Daily reset: keep the established shared midnight reset, add refill reset. */
const v271BaseDailyReset=typeof v127ApplyDailyReset==='function'?v127ApplyDailyReset:null;
if(v271BaseDailyReset){
  v127ApplyDailyReset=function(options={}){
    /* V7.177: keep the shared reset fail-closed after this later Dampf wrapper. */
    try{
      if(typeof v127ServerOwned==='function'&&v127ServerOwned()){
        try{v7173LegacyBlock?.('midnightResetBlocks')}catch(_){}
        return false;
      }
    }catch(_){}
    const before=String(s.v127DailyResetDay||'');
    const r=v271BaseDailyReset(options);
    const today=v271DayKey();
    if(before!==today){
      s.v271DampfRefill={day:today,count:0};
 if(v271EventDataReady&&v271DampfEventActive()){
  s.energy=200;
  const ev=v271ActiveDampfEvent();
  const owner=String(v073User?.id||s.social?.playerId||s.characterName||'local');
  s.v271DampfEventGrantKey=ev?`${owner}|${ev.id||ev.name}|${ev.starts_at||''}`:'';
  s.v271DampfEventWasActive=true;
 }else{
  s.energy=100;s.v271DampfEventGrantKey='';s.v271DampfEventWasActive=false;
 }
      try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    }
    return r;
  };
  v127ApplyDailyReset.__v7173ServerGuard=true;
  try{window.v127ApplyDailyReset=v127ApplyDailyReset}catch(_){}
}
v026DailyReset=function(forceRender=false){
  try{
    if(typeof v127ServerOwned==='function'&&v127ServerOwned()){
      try{v7173LegacyBlock?.('dampfResetBlocks')}catch(_){}
      return false;
    }
  }catch(_){}
  const today=v271DayKey();
  if(String(s.v127DailyResetDay||'')!==today && typeof v127ApplyDailyReset==='function'){
    v127ApplyDailyReset({render:forceRender,notify:true});
    return true;
  }
  v271EnsureRefillState();
  return false;
};
v026DailyReset.__v7173ServerGuard=true;
try{window.v026DailyReset=v026DailyReset}catch(_){}

/* Quest economy: 7-8 Dampf means roughly 12-15 quests from 100.
   If paying the normal cost would leave an unusable 1-6 remainder,
   the final quest consumes the full remaining Dampf instead. */
const v271BaseMakeQuest=makeQuest;
makeQuest=function(){
  const q=v271BaseMakeQuest();
  q.energy=7+(Math.random()<.55?1:0);
  q.v271DampfCost=true;
  return q;
};
function v271NormalizeQuestOffers(){
  if(!Array.isArray(s.quests?.offers))return;
  s.quests.offers.forEach((q,i)=>{
    if(!q)return;
    if(!q.v271DampfCost || Number(q.energy)<7 || Number(q.energy)>8){
      q.energy=7+((i+(Number(q.tier)||0))%2);
      q.v271DampfCost=true;
    }
  });
}
function v271EffectiveQuestCost(q){
  const current=Math.max(0,Math.floor(Number(s.energy)||0));
  if(current<=0)return 0;
  const base=Math.max(7,Math.min(8,Math.floor(Number(q?.energy)||7)));
  if(current<=base+6)return current;
  return base;
}

/* Preserve every existing startQuest wrapper (Harz tracking, quest timer, etc.). */
const v271BaseStartQuest=window.startQuest;
window.startQuest=function(i){
  v271NormalizeQuestOffers();
  const q=s.quests?.offers?.[i];
  if(!q)return v271BaseStartQuest(i);
  const cost=v271EffectiveQuestCost(q);
  if(cost<=0)return v115Alert('Dein Dampf ist leer.');
  q.energy=cost;
  q.v271ActualDampfCost=cost;
  window.v109PendingQuestEnergy=cost;
  return v271BaseStartQuest(i);
};

/* Quest Cleanup Phase 2: the old V271 render-only Dampf painter is retired.
   V321 is the later canonical quest-cost presentation layer and already performs
   v271NormalizeQuestOffers(), exact Dampf text and final button-state painting.
   V271 economy/start/event logic above remains active. */

/* Load event data first, then apply the event cap/grant. */
const v271BaseLoadPublic=v093LoadPublicContent;
v093LoadPublicContent=async function(){
  const r=await v271BaseLoadPublic();
  v271EventDataReady=true;
  const changed=v271SyncDampfEvent();
  if(changed)try{render()}catch(e){}
  else v271PaintDampf();
  return r;
};

/* Admin helper: loads a ready-to-save Dampf event preset into the existing event form. */
function v271InstallAdminDampf(){
  const root=document.querySelector('#v093AdminContent');
  if(!root||document.querySelector('#v271AdminDampfCard'))return;
  const card=document.createElement('div');
  card.id='v271AdminDampfCard';
  card.className='card';
  card.style.margin='0 0 12px';
  card.innerHTML=`
    <div class="section-title">
      <div><h3>💨 Dampf-Event</h3><div class="muted">Während eines aktiven Dampf-Events erhalten alle Spieler 200 Dampf und können mit Harz bis 300 auffüllen.</div></div>
      <span class="pill" id="v271AdminDampfState">AUS</span>
    </div>
    <div class="v271-admin-dampf-state">
      Erstelle das Event über das vorhandene Event-System. Der Name <b>Dampf-Event</b> aktiviert automatisch die 300-Dampf-Regel.
    </div>
    <button class="btn" id="v271DampfPreset" style="width:100%">💨 Dampf-Event ins Formular laden</button>`;
  root.insertBefore(card,root.firstChild);
  document.querySelector('#v271DampfPreset')?.addEventListener('click',()=>{
    const name=document.querySelector('#v093EventName');
    const desc=document.querySelector('#v093EventDesc');
    const start=document.querySelector('#v093EventStart');
    const end=document.querySelector('#v093EventEnd');
    const active=document.querySelector('#v093EventActive');
    const now=new Date(),later=new Date(Date.now()+24*3600000);
    const localInput=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
    if(name)name.value='Dampf-Event';
    if(desc)desc.value='Alle Spieler erhalten während des Events 200 Dampf und können mit Harz bis 300 auffüllen.';
    if(start)start.value=localInput(now);
    if(end)end.value=localInput(later);
    if(active)active.checked=true;
    document.querySelector('#v093EventName')?.scrollIntoView({behavior:'smooth',block:'center'});
    v063Toast?.('Dampf-Event vorbereitet','success','Zeitraum prüfen und anschließend „Event speichern“ drücken.');
  });
}
function v271PaintAdminDampf(){
  v271InstallAdminDampf();
  const el=document.querySelector('#v271AdminDampfState');
  if(el)el.textContent=v271DampfEventActive()?'AKTIV':'AUS';
}
const v271BaseAdminCheck=v093CheckAdmin;
v093CheckAdmin=async function(){
  const r=await v271BaseAdminCheck();
  if(r){v271InstallAdminDampf();v271PaintAdminDampf()}
  return r;
};
const v271BaseAdminLists=v093AdminLoadLists;
v093AdminLoadLists=async function(){
  const r=await v271BaseAdminLists();
  if(v093IsAdmin)v271PaintAdminDampf();
  return r;
};

/* V8.009: v271 no longer owns global rendering.
   It keeps Dampf state/refill/admin normalization; v294 owns final painting. */

/* Migration from old 300-cap system. Do not let old surplus survive the new normal cap. */
v271EnsureRefillState();
v271NormalizeQuestOffers();
if(!s.v271DampfMigration){
  if(!s.v271DampfEventWasActive)s.energy=Math.min(100,Math.max(0,Number(s.energy)||0));
  s.v271DampfMigration=true;
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
}

queueMicrotask(()=>{try{v271NormalizeQuestOffers()}catch(e){}});
