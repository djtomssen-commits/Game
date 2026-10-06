(function(){
  const V261_ART = [`assets/v7198-base64/02d774b56b143cbcf674.webp`,`assets/v7198-base64/5a8b2b39cd5ec64fa69f.webp`,`assets/v7198-base64/44253100e846dae7e9cf.webp`,`assets/v7198-base64/1d6fbc9be8f9e9a0feaa.webp`,`assets/v7198-base64/556438e88d645b3a87d2.webp`,`assets/v7198-base64/a1fbed0a151655177bb1.webp`,`assets/v7198-base64/aeefb59c372cad6d24ef.webp`,`assets/v7198-base64/602b44f2488b7339542a.webp`,`assets/v7198-base64/dbbcddf3a06abf4d6bd7.webp`,`assets/v7198-base64/76ec141a00b772809289.webp`,`assets/v7198-base64/be92b0dd8663e8c092cd.webp`,`assets/v7198-base64/87aa5562e52ceb430c8e.webp`,`assets/v7198-base64/6fc55da66d387454f59c.webp`,`assets/v7198-base64/a56204d8ddbb27156d4b.webp`,`assets/v7198-base64/b75560d1f53eeb782bd5.webp`,`assets/v7198-base64/0bcec792779dbc187efb.webp`,`assets/v7198-base64/c01d7dd809e5ea5993a3.webp`,`assets/v7198-base64/2bf8a7c381c3345442d1.webp`,`assets/v7198-base64/36a3798264f911719fba.webp`,`assets/v7198-base64/fe53cc431bb65de32c4b.webp`];
  const V261_BOSS_ART = [`assets/v7198-base64/38e5e692b68bf258ff0e.webp`,`assets/v7198-base64/07ee5601d3e0c333316c.webp`,`assets/v7198-base64/be248af926b6984dc187.webp`,`assets/v7198-base64/3bca63a1256edce30a0f.webp`,`assets/v7198-base64/4b41bceda1eb24495fe0.webp`,`assets/v7198-base64/5871ba50ab98bede1da0.webp`,`assets/v7198-base64/f5e1a4f160d407fc3485.webp`,`assets/v7198-base64/1305aa503f0d98969490.webp`,`assets/v7198-base64/033c66286a73fea960e1.webp`,`assets/v7198-base64/ad155680a725b0309b84.webp`,`assets/v7198-base64/a2551cb612ee94ece46f.webp`,`assets/v7198-base64/de7fba5cc5543fe1ecba.webp`,`assets/v7198-base64/46ea20e47929662ecf86.webp`,`assets/v7198-base64/a5df799e8a105af626a8.webp`,`assets/v7198-base64/b21f25647a19dcc1c270.webp`,`assets/v7198-base64/31b94f09a201962458ec.webp`,`assets/v7198-base64/df46f98efb792e98fd85.webp`,`assets/v7198-base64/ca313f47657a46e5cdbb.webp`,`assets/v7198-base64/99748426acea2379c637.webp`,`assets/v7198-base64/5a9f741e03ae01f12f54.webp`];
  const V261_POS = [{x:11,y:22},{x:34,y:24},{x:59,y:28},{x:86,y:33},{x:11,y:48},{x:33,y:62},{x:52,y:69},{x:71,y:62},{x:88,y:50},{x:88,y:80,boss:true}];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const stageArt=di=>V261_ART[di]||V261_ART[0];
  const roomLevel=(di,ri)=> typeof v244DungeonRoomLevel==='function' ? v244DungeonRoomLevel(di,ri) : Math.max(1,Number(dungeons?.[di]?.minLevel||1)+(ri||0));
  const roomName=(di,ri)=> typeof v244DungeonRoomName==='function' ? v244DungeonRoomName(di,ri) : (dungeons?.[di]?.enemies?.[ri]?.name || `Gegner ${ri+1}`);
  const enemyStats=(di,ri,e)=> typeof v025EnemyStats==='function' ? v025EnemyStats(di,ri,e) : {rec:roomLevel(di,ri),hp:Number(e?.hp)||0};
  const progressIndex=di=>Math.max(0,Math.min(9, typeof v048RoomIndex==='function' ? v048RoomIndex(di) : Number(s?.dungeon?.progress?.[di]||0)||0));
  const roomState=(di,ri)=>{
    const cur=progressIndex(di);
    if(typeof dungeonCompleted==='function' && dungeonCompleted(di))return 'done';
    if(ri<cur)return 'done';
    if(ri===cur)return 'current';
    return 'locked';
  };
  const goWorld=()=>{
    try{s.dungeon.layer='world';s.dungeon.view='map';persist(false)}catch(_ ){}
    try{renderDungeon()}catch(e){console.error('V261 world',e)}
    try{window.scrollTo({top:0,behavior:'smooth'})}catch(_ ){}
  };
  const nodeHtml=(di,ri)=>{
    const e=dungeons?.[di]?.enemies?.[ri]||{};
    const pos=V261_POS[ri]||{x:50,y:50};
    const state=roomState(di,ri);
    const boss=ri===9;
    const lv=roomLevel(di,ri);
    return `<button type="button" class="v261-node ${state} ${boss?'boss':''}" data-v261-room="${ri}" style="--x:${pos.x};--y:${pos.y}" ${state==='current'?'':'disabled'}>
      <div class="v261-ring">${boss?`<span class="v261-bossart" style="background-image:url('${V261_BOSS_ART[di]||''}')"></span>`:esc(e.icon||'👹')}<span class="v261-num">${ri+1}</span>${state==='done' ? '<span class="v261-check">✓</span>' : (state==='locked' ? '<span class="v261-lock">🔒</span>' : '')}</div>
      <div class="v261-panel"><div class="v261-name">${esc(roomName(di,ri))}</div><div class="v261-lv">${boss?'BOSS · ':''}Lv. ${lv}</div></div>
    </button>`;
  };
  window.v261RenderDetail=function(){
    try{v243RepairAndSaveDungeonKeys?.()}catch(_ ){}
    const di=typeof v048DungeonIndex==='function' ? v048DungeonIndex() : Math.max(0,Math.min(19,Number(s?.dungeon?.selected||0)||0));
    const d=dungeons?.[di]; if(!d)return false;
    const current=progressIndex(di);
    const completed=typeof dungeonCompleted==='function' ? dungeonCompleted(di) : false;
    const ri=completed?9:current;
    const e=d.enemies?.[ri]||d.enemies?.[0]||{};
    const bal=enemyStats(di,ri,e); const boss=ri===9; const progress=completed?10:current;
    const xp=Number(e?.xp)||0; const gold=Number(e?.gold)||0;
    const card=document.querySelector('#dungeonMapCard') || document.querySelector('#dungeon > .card:first-of-type');
    if(!card)return false;
    const battle=document.querySelector('#dungeonBattleCard'); if(battle)battle.style.display='none';
    card.id='dungeonMapCard'; card.className='card v261-detail-card'; card.style.display='';
    const title=String(d.name||'Dungeon').toUpperCase();
    card.innerHTML=`<div class="v261-shell">
      <div class="v261-top">
        <button type="button" class="v261-back" id="v261BackWorld"><i>‹</i><span>Zurück zur<br>Dungeon-Weltkarte</span></button>
        <div class="v261-sign"><div class="v261-kicker">Dungeon ${di+1}</div><div class="v261-title">${esc(title)}</div><div class="v261-sub">Besiege alle 10 Gegner der Reihe nach · Fortschritt ${progress}/10</div></div>
        <div class="v261-ticket"><b>🎟️ Dungeon-Versuch</b><span id="dungeonTicketText">${esc(typeof dungeonWaitText==='function'?dungeonWaitText():'Gratisversuch prüfen …')}</span></div>
      </div>
      <div class="v261-stage">
        <div class="v261-bg" style="background-image:url('${stageArt(di)}')"></div>
        <div class="v261-fx"></div>
        <svg class="v261-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline class="bg" points="16,16 26,18 41,22 55,24 69,27 79,31 85,42 76,45 60,47 40,48 16,49 27,55 40,60 50,66 62,72 73,68 84,64 69,72 49,76 22,79 38,81 57,82 79,84"></polyline><polyline class="dots" points="16,16 26,18 41,22 55,24 69,27 79,31 85,42 76,45 60,47 40,48 16,49 27,55 40,60 50,66 62,72 73,68 84,64 69,72 49,76 22,79 38,81 57,82 79,84"></polyline></svg>
        ${d.enemies.map((_,idx)=>nodeHtml(di,idx)).join('')}
        <div class="v261-signboard">ACHTUNG<br>${esc(title.slice(4, title.length>23?23:title.length) || 'DUNGEON')}<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small></div>
      </div>
      <div class="v261-bottom">
        <div><div class="v261-head"><div class="v261-thumb">${esc(e.icon||'👹')}</div><div><div class="v261-line1">${completed ? 'DUNGEON ABGESCHLOSSEN' : `${ri+1} · ${esc(e.name||roomName(di,ri))}${boss?' – BOSS':''}`}</div><div class="v261-line2">${completed ? 'Alle 10 Gegner wurden besiegt.' : `${boss?'BOSS':'Gegner'} · Empfohlen Level ${bal?.rec||roomLevel(di,ri)} · ${bal?.hp||0} HP`}</div></div></div><div class="v261-label">Mögliche Belohnungen</div></div>
        <div class="v261-rewards"><div class="v261-r ${boss?'legendary':''}">${boss?'LEGENDÄR':'ITEM'}<span class="big">${boss?'🟠':'🎁'}</span></div><div class="v261-r">EXP<span class="big">${xp}</span></div><div class="v261-r">GOLD<span class="big">${gold}</span></div><div class="v261-r">HARZ<span class="big">🟢</span></div></div>
        <div><div class="v261-stats"><div class="v261-stat"><span>Deine Stärke</span><b>${Math.round(typeof combatPower==='function' ? combatPower() : 0)}</b></div><div class="v261-stat"><span>Gegner</span><b>${completed ? '—' : `Lv. ${bal?.rec||1}`}</b></div></div><button type="button" class="v261-enter ${boss&&!completed?'danger':''}" id="v261EnterCurrent" ${completed?'disabled':''}>${completed ? '✓ DUNGEON ABGESCHLOSSEN' : (boss ? '⚔️ BOSS ANGREIFEN' : '⚔️ GEGNER ANGREIFEN')}</button></div>
      </div>
    </div>`;
    card.querySelector('#v261BackWorld')?.addEventListener('click',ev=>{ev.preventDefault();goWorld();});
    card.querySelectorAll('[data-v261-room]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation(); if(completed)return; const r=Number(btn.dataset.v261Room); if(r!==current)return; if(typeof v251StartCurrentDungeonFight==='function')return v251StartCurrentDungeonFight(di); s.dungeon.selected=di; s.dungeon.room=current; s.dungeon.layer='dungeon'; s.dungeon.view='battle'; try{persist(false)}catch(_ ){} renderDungeon?.(); }));
    card.querySelector('#v261EnterCurrent')?.addEventListener('click',ev=>{ev.preventDefault(); if(completed)return; if(typeof v251StartCurrentDungeonFight==='function')return v251StartCurrentDungeonFight(di); s.dungeon.selected=di; s.dungeon.room=current; s.dungeon.layer='dungeon'; s.dungeon.view='battle'; try{persist(false)}catch(_ ){} renderDungeon?.(); });
    try{ if(typeof renderDungeonTicket==='function')renderDungeonTicket(); if(typeof updateDungeonTicket==='function')updateDungeonTicket(); }catch(_ ){}
    try{window.v8144GameplayI18n?.apply?.('dungeon')}catch(_){}
    return true;
  };
  window.v251RenderDetail=window.v261RenderDetail;
  window.v244RenderSelectedDungeonMap=window.v261RenderDetail;
  window.v064RenderMap=window.v261RenderDetail;
  try{ v251RenderDetail=window.v261RenderDetail; v244RenderSelectedDungeonMap=window.v261RenderDetail; v064RenderMap=window.v261RenderDetail; }catch(_ ){}
})();
