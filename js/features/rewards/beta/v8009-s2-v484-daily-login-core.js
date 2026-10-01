(function(){
  const VERSION='V4.86',SHORT='V4.86';
  let openedKey='',claimBusy=false;

  function stamp(){}
  function uid(){try{return typeof v073User!=='undefined'&&v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return ''}}
  function accountReady(){
    const id=uid();if(!id)return false;
    try{if(typeof v452AccountVerified==='function'&&!v452AccountVerified(id))return false}catch(e){return false}
    try{if(window.__V200_AUTH_READY__!==true)return false}catch(e){return false}
    return !!s?.playerClass;
  }
  function berlinDay(){
    try{
      const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
      const m={};parts.forEach(p=>{if(p.type!=='literal')m[p.type]=p.value});
      const y=Number(m.year),mo=Number(m.month),d=Number(m.day);
      return {key:`${m.year}-${m.month}-${m.day}`,ord:Math.floor(Date.UTC(y,mo-1,d)/86400000)};
    }catch(e){
      const x=new Date(),y=x.getFullYear(),mo=x.getMonth()+1,d=x.getDate();
      return {key:`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,ord:Math.floor(Date.UTC(y,mo-1,d)/86400000)};
    }
  }
  function state(){
    s.v484DailyLogin=(s.v484DailyLogin&&typeof s.v484DailyLogin==='object')?s.v484DailyLogin:{};
    const z=s.v484DailyLogin;
    z.streak=Math.max(0,Math.min(7,Math.floor(Number(z.streak)||0)));
    /* V6.235: lifetime login claims for long-term achievements.
       Existing saves start with at least their current 7-day streak. */
    z.totalClaims=Math.max(Math.floor(Number(z.totalClaims)||0),z.streak);
    z.lastClaimKey=String(z.lastClaimKey||'');
    z.lastClaimOrd=Math.floor(Number(z.lastClaimOrd)||0);
    z.cycleRewards=(z.cycleRewards&&typeof z.cycleRewards==='object')?z.cycleRewards:{};
    return z;
  }
  function normalizeCycle(){
    const z=state(),today=berlinDay();
    if(z.lastClaimOrd>0&&z.lastClaimOrd<today.ord-1){z.streak=0;z.cycleRewards={}}
    if(z.streak>=7&&z.lastClaimOrd>0&&z.lastClaimOrd<today.ord){z.streak=0;z.cycleRewards={}}
    return {z,today};
  }
  function claimLockKey(todayKey){
    const id=uid();
    return id&&todayKey?`growlegends_daily_claim_${id}_${todayKey}`:'';
  }
  function hasLocalClaimLock(todayKey){
    const k=claimLockKey(todayKey);if(!k)return false;
    try{return localStorage.getItem(k)==='1'}catch(e){return false}
  }
  function setLocalClaimLock(todayKey){
    const k=claimLockKey(todayKey);if(!k)return false;
    try{localStorage.setItem(k,'1');return true}catch(e){return false}
  }
  function clearLocalClaimLock(todayKey){
    const k=claimLockKey(todayKey);if(!k)return;
    try{localStorage.removeItem(k)}catch(e){}
  }
  function due(){
    const {z,today}=normalizeCycle();
    if(hasLocalClaimLock(today.key))return false;
    return z.lastClaimKey!==today.key;
  }
  function nextDay(){const {z}=normalizeCycle();return Math.max(1,Math.min(7,z.streak+1))}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function ri(a,b){a=Math.ceil(a);b=Math.floor(b);return a+Math.floor(Math.random()*Math.max(1,b-a+1))}
  function weighted(){
    const r=Math.random()*100;
    if(r<25)return'gold';
    if(r<50)return'xp';
    if(r<65)return'harz';
    if(r<80)return'time';
    if(r<95)return'seed';
    return'seed';
  }
  function cleanItemName(x){return String(x||'Ausrüstung').replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/i,'').replace(/\s*\[Lv\.\d+\]\s*$/i,'')}
  function day7Item(){
    const cls=s.playerClass||'grower',pool=(typeof classGear!=='undefined'&&Array.isArray(classGear?.[cls]))?classGear[cls]:[];
    const base=pool.length?pool[Math.floor(Math.random()*pool.length)]:{id:'daily_ring',name:'Ring des Grünhains',slot:'ring',icon:'💍',bonus:{[cls==='scout'?'geschick':(cls==='bruiser'||cls==='summoner')?'intelligenz':'staerke']:3},classId:cls};
    /* V6.122: Tag 7 is always EPISCH. No gray/green/blue roll anymore. */
    const q='purple';
    const meta=typeof qualityMeta==='function'?qualityMeta(q):{label:'Episch',cls:'epic'};
    const lvl=Math.min(300,Math.max(1,Math.floor(Number(s.level)||1)));
    const it={...base,id:`v484_daily_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,baseId:base.id,classId:base.classId||cls,price:0,quality:q,rarity:meta.cls,dropLevel:lvl,name:`${meta.label}: ${cleanItemName(base.name)} [Lv.${lvl}]`,bonus:{...(base.bonus||{})}};
    try{if(typeof v447ApplyItemCurve==='function')v447ApplyItemCurve(it);else if(typeof v024Bonus==='function')it.bonus=v024Bonus(base.bonus||{},q,lvl)}catch(e){}
    try{if(typeof v456ClampItemLevel==='function')v456ClampItemLevel(it)}catch(e){}
    return it;
  }
  function makeReward(day){
    if(day===7){
      const item=day7Item();
      return {type:'item',icon:item.icon||'🎁',title:item.name,detail:typeof itemBonus==='function'?itemBonus(item):'Item für dein aktuelles Level',item};
    }
    const lvl=Math.max(1,Math.floor(Number(s.level)||1)),type=weighted();
    if(type==='gold'){
      const n=Math.round(120+lvl*28+ri(0,Math.max(40,lvl*8)));
      return {type,icon:'🪙',title:`+${n.toLocaleString('de-DE')} Gold`,detail:'Direkt deinem Goldbestand gutgeschrieben.',amount:n};
    }
    if(type==='xp'){
      const need=Math.max(100,100*lvl); /* V4.167: bonus XP stays on legacy reward scale, not on long-term level requirement */
      const n=Math.max(50,Math.round(need*(.22+Math.random()*.13)));
      return {type,icon:'⭐',title:`+${n.toLocaleString('de-DE')} EXP`,detail:'Erfahrung für deinen aktuellen Charakter.',amount:n};
    }
    if(type==='harz'){
      const n=ri(1,3);return {type,icon:'💎',title:`+${n} Harz-Taler`,detail:'Premium-Währung für deine nächsten Abenteuer.',amount:n};
    }
    if(type==='time'){
      const n=ri(1,2);return {type,icon:'🌱',title:`+${n} Zeit-Samen`,detail:'Zum Überspringen laufender Questzeit.',amount:n};
    }
    if(type==='seed'){
      const allowed=['moss','lime','jack','violet','blue','critical','nebula','lemon','gorilla','greencrack','amnesia'],ids=typeof seedTypes!=='undefined'?allowed.filter(id=>seedTypes[id]):allowed;
      const id=ids.length?ids[Math.floor(Math.random()*ids.length)]:'moss',seed=typeof seedTypes!=='undefined'?seedTypes[id]:null,n=ri(2,4);
      return {type,icon:seed?.icon||'🌰',title:`+${n} ${seed?.name||'Samen'}`,detail:'Neue Samen für deinen Growroom.',amount:n,seedId:id};
    }
    const ids=['nebula','lemon','gorilla','greencrack','amnesia'],id=ids[Math.floor(Math.random()*ids.length)],seed=typeof seedTypes!=='undefined'?seedTypes[id]:null;return {type:'seed',icon:seed?.icon||'🌰',title:`+1 ${seed?.name||'epischer Grow-Samen'}`,detail:'Epischer Samen für deinen Growroom.',amount:1,seedId:id};
  }
  function applyReward(r){
    if(!r)return false;
    if(r.type==='gold')s.gold=(Number(s.gold)||0)+r.amount;
    else if(r.type==='xp'){if(typeof addXp==='function')addXp(r.amount);else s.xp=(Number(s.xp)||0)+r.amount}
    else if(r.type==='harz')s.harzTaler=(Number(s.harzTaler)||0)+r.amount;
    else if(r.type==='time')s.timeSeeds=Math.max(0,Number(s.timeSeeds)||0)+r.amount;
    else if(r.type==='seed'){
      s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
      s.grow.seeds[r.seedId]=(Number(s.grow.seeds[r.seedId])||0)+r.amount;
    }else if(r.type==='og'){
      const ids=['nebula','lemon','gorilla','greencrack','amnesia'],id=ids[Math.floor(Math.random()*ids.length)];
      s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};s.grow.seeds[id]=(Number(s.grow.seeds[id])||0)+1;
      r.type='seed';r.seedId=id;r.icon='🌰';r.title='+1 epischer Grow-Samen';r.detail='Ersatz für die entfernte Wundertüte OG.';
    }else if(r.type==='item'){
      s.inventory=Array.isArray(s.inventory)?s.inventory:[];s.inventory.push(r.item);
    }else return false;
    return true;
  }
  function iconForSummary(x){return x?.icon||'✅'}
  function ensureOverlay(){
    let ov=document.getElementById('v484DailyLogin');if(ov)return ov;
    ov=document.createElement('div');ov.id='v484DailyLogin';
    ov.innerHTML=`<div class="v484-panel" role="dialog" aria-modal="true" aria-label="Täglicher Login-Bonus"><div id="v484DailyBody"></div><div class="v484-reveal" id="v484Reveal"></div><button type="button" class="btn v484-close" id="v484Close">Weiter spielen</button><div class="v484-note">Ein Bonus pro Kalendertag · Tageswechsel nach deutscher Zeit · verpasst du einen ganzen Tag, startet die 7-Tage-Serie neu.</div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{if(e.target===ov&&document.getElementById('v484Close')?.classList.contains('show'))close()});
    document.getElementById('v484Close').onclick=close;
    return ov;
  }
  function renderPopup(reward=null){
    const {z}=normalizeCycle(),day=Math.max(1,Math.min(7,z.streak+1));
    const body=ensureOverlay().querySelector('#v484DailyBody');if(!body)return;
    const cards=[];
    for(let i=1;i<=7;i++){
      const prev=i<=z.streak,cur=i===day&&due(),future=!prev&&!cur,entry=z.cycleRewards?.[i];
      const cls=`v484-day ${prev?'claimed':cur?'current':'future'} ${i===7?'day7':''}`;
      const middle=prev?`<div class="v484-claimed-icon">${esc(iconForSummary(entry))}</div>`:`<div class="v484-gift"></div>${future?'<span class="v484-lock">🔒</span>':''}`;
      const title=prev?(entry?.title||'Abgeholt'):cur?'GESCHENK ÖFFNEN':i===7?'LEVEL-ITEM':'Überraschung';
      const sub=prev?'Abgeholt ✓':cur?(i===7?`Lv.${Math.max(1,Number(s.level)||1)} · Garantiert Episch`:'Heute verfügbar'):i===7?'Garantiert Episch':'Noch gesperrt';
      cards.push(`<div class="${cls}" data-v484-day="${i}" ${cur?'role="button" tabindex="0"':''}><div class="v484-day-label">Tag ${i}</div><div class="v484-gift-wrap">${middle}</div><div class="v484-day-title">${esc(title)}</div><div class="v484-day-sub">${esc(sub)}</div></div>`);
    }
    body.innerHTML=`<div class="v484-head"><div class="v484-kicker">Tägliche Belohnung</div><h2>🎁 7-Tage Login-Bonus</h2><p>Öffne jeden Tag ein Geschenk. Am siebten Tag erhältst du garantiert ein episches Ausrüstungsitem für dein aktuelles Level.</p><div class="v484-streak">Serie: ${z.streak}/7 · Heute Tag ${day}</div></div><div class="v484-days">${cards.join('')}</div>`;
    body.querySelectorAll('.v484-day.current').forEach(el=>{
      el.onclick=()=>claim(Number(el.dataset.v484Day));
      el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();claim(Number(el.dataset.v484Day))}};
    });
    const reveal=document.getElementById('v484Reveal'),closeBtn=document.getElementById('v484Close');
    if(reward){
      reveal.innerHTML=`<div class="ico">${esc(reward.icon)}</div><h3>${esc(reward.title)}</h3><p>${esc(reward.detail)}</p>`;reveal.classList.add('show');closeBtn.classList.add('show');
    }else{reveal.classList.remove('show');closeBtn.classList.remove('show')}
  }
  function saveClaim(){
    try{if(typeof persist==='function')persist(false);else localStorage.setItem(KEY,JSON.stringify(s))}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
    try{if(typeof v441PaintResources==='function')v441PaintResources()}catch(e){}
    try{if(typeof v446PaintCombatPower==='function')v446PaintCombatPower()}catch(e){}
    try{if(typeof render==='function')render()}catch(e){}
    const id=uid();setTimeout(async()=>{try{if(id&&typeof v452AccountVerified==='function'&&v452AccountVerified(id)&&typeof v075WriteCloudSave==='function')await v075WriteCloudSave(true)}catch(e){console.warn('V4.86 login reward cloud save',e)}},50);
  }
  async function claim(day){
    if(claimBusy||!accountReady()||!due()||day!==nextDay())return;
    claimBusy=true;
    let lockedToday='',rewardApplied=false;
    try{
      const before=normalizeCycle(),today=before.today;
      if(before.z.lastClaimKey===today.key||hasLocalClaimLock(today.key))return;
      lockedToday=today.key;
      if(!setLocalClaimLock(today.key)){
        console.warn('V4.86 daily reward: local claim lock unavailable');
        lockedToday='';
      }
      /* The lock is written BEFORE any reward is granted. A reload or stale cloud save
         therefore cannot expose today's gift a second time on this device/account. */
      const r=makeReward(day);
      if(!applyReward(r)){if(lockedToday)clearLocalClaimLock(lockedToday);return}
      rewardApplied=true;
      const {z}=normalizeCycle();
      z.streak=day;
       z.totalClaims=Math.max(0,Math.floor(Number(z.totalClaims)||0))+1;
       z.lastClaimKey=today.key;z.lastClaimOrd=today.ord;z.cycleRewards[day]={icon:r.icon,title:r.type==='item'?cleanItemName(r.title):r.title,type:r.type};
       try{v106CheckAchievements?.(true)}catch(_){}
      saveClaim();renderPopup(r);
      try{if(typeof v063Toast==='function')v063Toast('🎁 Login-Bonus erhalten','success',r.title)}catch(e){}
    }catch(e){
      /* Release the pre-lock only if nothing was granted. Once the reward changed the
         account, keeping the lock is safer than risking a duplicate after a reload. */
      if(!rewardApplied&&lockedToday)clearLocalClaimLock(lockedToday);
      console.warn('V4.86 daily reward claim failed',e);
    }finally{claimBusy=false}
  }
  function open(){
    const today=berlinDay();
    if(openedKey===today.key||!accountReady()||!due())return false;
    openedKey=today.key;ensureOverlay().classList.add('show');renderPopup();return true;
  }
  function close(){
    const ov=document.getElementById('v484DailyLogin');if(ov)ov.classList.remove('show');
  }
  function tryOpen(){stamp();if(open())return true;return false}
  window.v484OpenDailyLogin=()=>{openedKey='';return tryOpen()};

  /* Finalizer hook covers slow sign-ins; the one-shot checks cover already-hydrated reloads. */
  try{
    if(typeof v200FinalizeUser==='function'&&!window.__v484FinalizeWrapped){
      const base=v200FinalizeUser;
      v200FinalizeUser=async function(){const r=await base.apply(this,arguments);setTimeout(tryOpen,120);return r};
      try{window.v200FinalizeUser=v200FinalizeUser}catch(e){}window.__v484FinalizeWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof v032Go==='function'&&!window.__v484GoWrapped){
      const base=v032Go;v032Go=function(id){const r=base.apply(this,arguments);if(id==='world')setTimeout(tryOpen,80);return r};
      try{window.v032Go=v032Go}catch(e){}window.__v484GoWrapped=true;
    }
  }catch(e){}
  stamp();
  document.addEventListener('DOMContentLoaded',()=>setTimeout(tryOpen,120),{once:true});
  window.addEventListener('pageshow',()=>setTimeout(tryOpen,160),{passive:true});
  [250,700,1400,2600,4500,7500,11000].forEach(ms=>setTimeout(tryOpen,ms));
})();
