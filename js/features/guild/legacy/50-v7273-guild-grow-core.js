/* === v7273-guild-grow-core === */
(()=>{'use strict';
 const V={state:null,loading:false,lastLoad:0,timer:0,loadingTimer:0};
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const num=n=>Math.max(0,Number(n)||0).toLocaleString('de-DE');
 function icon(metric){
  const map={
   plant:'<path d="M12 20V9M12 11C8 11 6 9 5 5c4 0 7 2 7 6Zm0 3c4 0 7-2 8-6-4 0-7 2-8 6Z"/>',
   care:'<path d="M5 14c5-1 9-5 12-10 1 5-1 10-6 13M4 20c3-5 6-8 11-11"/>',
   harvest:'<path d="M4 18h16M6 18l2-8h8l2 8M9 10V6m6 4V6M8 6h8"/>',
   high_quality:'<path d="m12 3 2.2 4.5L19 8.2l-3.5 3.4.8 4.8L12 14.2l-4.3 2.2.8-4.8L5 8.2l4.8-.7Z"/>',
   perfect:'<path d="m12 3 2.8 5.2 5.7.8-4.1 4 1 5.7-5.4-2.6-5.4 2.6 1-5.7-4.1-4 5.7-.8Z"/>',
   mutations:'<path d="M7 4c6 2 4 8 10 10M17 4c-6 2-4 8-10 10M7 20c6-2 4-8 10-10"/>',
   prismatic:'<path d="m12 3 7 7-7 11-7-11Z M5 10h14M9 4l3 17 3-17"/>',
   fragments:'<path d="m12 3 6 5-2 9-8 2-3-7Z M8 8l7 7M15 7l-6 9"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${map[metric]||map.harvest}</svg>`;
 }
 function pct(t){return Math.max(0,Math.min(100,((Number(t?.progress)||0)/Math.max(1,Number(t?.target)||1))*100));}
 function taskHtml(t,weekly){
  const done=!!t?.completed, p=pct(t);
  const diff=esc((()=>{const d=String(t?.difficulty||'').replace('_',' ').toUpperCase(); return d==='VERY HARD'?'V.HARD':d==='VERY EASY'?'V.EASY':d||'NORMAL';})());
  return `<div class="v7307-task ${weekly?'week':''} ${done?'done':''}">
    <div class="v7307-task-icon">${icon(String(t?.metric||''))}</div>
    <div class="v7307-task-body">
      <div class="v7307-task-name">${done?'✓ ':''}${esc(t?.title||'Auftrag')}</div>
      <div class="v7307-task-desc">${esc(t?.description||'')}</div>
      <div class="v7307-progress-row">
        <div class="v7307-progress"><i style="width:${p}%"></i></div>
        <b>${num(t?.progress)} / ${num(t?.target)}</b>
      </div>
    </div>
    <div class="v7307-task-reward">
      <b>+${num(t?.guildXp)} EP</b>
      <span>+${num(t?.guildBuds)} Buds</span>
      <em>${done?'ERLEDIGT':diff}</em>
    </div>
  </div>`;
 }
 function countdown(ts){const end=Date.parse(ts||'');if(!Number.isFinite(end))return '—';const ms=Math.max(0,end-Date.now()),s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return `${h}h ${String(m).padStart(2,'0')}m`;}
 function render(){
  const s=V.state,box=document.querySelector('#v7273GrowOverlay'),load=document.querySelector('#v7273GrowLoading');if(!box)return;
  if(load)load.style.display='none';
  if(!s?.guild){box.innerHTML='<div class="v7273-empty">Du bist aktuell in keiner Gilde.</div>';return;}
  const d=Array.isArray(s.daily)?s.daily:[],w=Array.isArray(s.weekly)?s.weekly:[],c=Array.isArray(s.contributors)?s.contributors:[],ch=s.chest||{};
  const chestPoints=Math.max(0,Math.min(100,Number(ch.points)||0));
  const bgSrc=document.querySelector('#v7273GrowStage .v7273-grow-bg')?.getAttribute('src')||'';
  let html=`<div class="v7301-shell">`;
  const trackX=[13.45,25.15,40.30,55.35,70.55],trackW=[4.95,8.45,8.20,8.35,7.40],chestX=[15.71,30.62,45.74,61.18,76.62];
  html+=`<section class="v7307-hero">
    <img class="v7307-hero-art" src="${bgSrc}" alt="">
    <div class="v7307-hero-shade"></div>
    <div class="v7307-title">
      <h2>Gilden-Grow-Aufträge</h2>
      <div>${esc(s.guild.name||'Gilde')} [${esc(s.guild.tag||'')}] · ${num(s.activeMembers)} aktive Mitglieder</div>
    </div>
    <div class="v7307-summary">Wochen-Truhe ${num(ch.points)}/${num(ch.max||100)} · Stufe ${num(ch.level)}/5 · Gilden-Buds ${num(s.guild.guildBuds)}</div>
    ${Array.from({length:5},(_,i)=>{
      const seg=Math.max(0,Math.min(100,((chestPoints-(i*20))/20)*100));
      return `<div class="v7307-track" style="left:${trackX[i]}%;width:${trackW[i]}%"><i style="width:${seg}%"></i></div>`;
    }).join('')}
    ${Array.from({length:5},(_,i)=>{
      const hit=chestPoints>=(i+1)*20,cur=chestPoints>i*20&&chestPoints<(i+1)*20;
      return `<div class="v7307-chest ${hit?'hit':''} ${cur?'current':''}" style="left:${chestX[i]}%"><span>${i+1}</span></div>`;
    }).join('')}
  </section>`;

  html+=`<section class="v7301-block v7303-board">
    <div class="v7301-block-head"><h3>Tagesaufträge</h3><span data-v7273-countdown="daily">Neue Aufträge in ${countdown(s.dailyResetAt)}</span></div>
    <div class="v7301-task-list">`;
  if(d.length) d.slice(0,5).forEach(t=>html+=taskHtml(t,false));
  else html+=`<div class="v7301-empty-card">Keine Tagesaufträge gefunden.</div>`;
  html+=`</div></section>`;

  html+=`<section class="v7301-block v7303-board">
    <div class="v7301-block-head"><h3>Wochenaufträge</h3><span data-v7273-countdown="weekly">Reset in ${countdown(s.weeklyResetAt)}</span></div>
    <div class="v7301-task-list">`;
  if(w.length) w.slice(0,3).forEach(t=>html+=taskHtml(t,true));
  else html+=`<div class="v7301-empty-card">Keine Wochenaufträge gefunden.</div>`;
  html+=`</div></section>`;

  html+=`<section class="v7301-block v7303-board">
    <div class="v7301-block-head"><h3>Gildenbeitrag diese Woche</h3><span>Top 5 Mitglieder</span></div>
    <div class="v7301-contrib-list">`;
  if(c.length){
    c.slice(0,5).forEach((x,i)=>{
      html+=`<div class="v7301-contrib-row" title="Ernten ${num(x.harvested)} · Pflege ${num(x.cared)}">
        <div class="v7301-contrib-rank">${i+1}</div>
        <div class="v7301-contrib-player"><strong>${esc(x.name||'Spieler')}</strong><small>Lv. ${num(x.level)}</small></div>
        <div class="v7301-contrib-actions">${num(x.actions)} Akt.</div>
      </div>`;
    });
  }else{
    html+=`<div class="v7301-empty-card">Diese Woche wurde noch keine Grow-Aktivität für die Gilde gezählt.</div>`;
  }
  html+=`</div></section></div>`;
  box.innerHTML=html;
  ['v254GuildBuds','v254GuildBudsTop'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=num(s.guild.guildBuds)});
 }
 async function load(force=false){
  if(V.loading)return; if(!force&&Date.now()-V.lastLoad<3500)return; if(typeof v073Db==='undefined'||!v073Db)return;
  V.loading=true;
  const loading=document.querySelector('#v7273GrowLoading');
  if(V.loadingTimer){clearTimeout(V.loadingTimer);V.loadingTimer=0;}
  if(loading){loading.style.display='none';loading.textContent='Gilden-Grow-Aufträge werden geladen …';}
  /* Do not flash the loading card for normal fast refreshes. Only show it when the RPC actually takes noticeable time. */
  /* V7.281: no transient loading card. Background refresh stays invisible. */
  try{
    const {data,error}=await v073Db.rpc('v7273_guild_grow_state');
    if(error)throw error;
    V.state=data||null;V.lastLoad=Date.now();render();
  }
  catch(e){
    console.warn('[V7.283] guild grow state',e);
    if(!V.state){const box=document.querySelector('#v7273GrowOverlay');if(box)box.innerHTML='<div class="v7273-empty">Gilden-Grow-Aufträge konnten gerade nicht geladen werden.</div>';}
  }
  finally{
    if(V.loadingTimer){clearTimeout(V.loadingTimer);V.loadingTimer=0;}
    if(loading&&V.state)loading.style.display='none';
    V.loading=false;
  }
 }
 function visible(){const p=document.querySelector('#v7273GuildGrow');return !!p&&p.style.display!=='none'&&document.querySelector('#guild')?.classList.contains('active');}
 document.addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest('[data-v254-tab]'):null;if(!b)return;const tab=b.getAttribute('data-v254-tab');const p=document.querySelector('#v7273GuildGrow');if(p)p.style.display=tab==='growtasks'?'':'none';if(tab==='growtasks')setTimeout(()=>load(true),20);},true);
 V.timer=setInterval(()=>{if(visible()){document.querySelectorAll('[data-v7273-countdown="daily"]').forEach(el=>el.textContent=`Neue Aufträge in ${countdown(V.state?.dailyResetAt)}`);document.querySelectorAll('[data-v7273-countdown="weekly"]').forEach(el=>el.textContent=`Reset in ${countdown(V.state?.weeklyResetAt)}`);if(Date.now()-V.lastLoad>15000)load(false);}},1000);
 window.v7273GuildGrow=Object.freeze({refresh:()=>load(true),version:'V7.308'});
})();

