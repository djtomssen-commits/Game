(function(){
  const V260_ART = [`assets/v7198-base64/8c3e04bc526d42ac5914.webp`,`assets/v7198-base64/0d89a3b963e1ca86bc21.webp`,`assets/v7198-base64/d246d937a5d82314543f.webp`,`assets/v7198-base64/cc11bcba34fc743c370f.webp`,`assets/v7198-base64/e1a4ecc62cdb158d592e.webp`,`assets/v7198-base64/ee033f1b317183e2d5b6.webp`,`assets/v7198-base64/350c924c1cec38605294.webp`,`assets/v7198-base64/2a96c4e3c803b4daecf8.webp`,`assets/v7198-base64/a513718dbaf352701eed.webp`,`assets/v7198-base64/ed31f7e1abd342950c04.webp`,`assets/v7198-base64/58a360bce2349f1690aa.webp`,`assets/v7198-base64/217c853ac998baafae27.webp`,`assets/v7198-base64/1c46681ff73d3b03f380.webp`,`assets/v7198-base64/96e1a33fbd2bb647d18e.webp`,`assets/v7198-base64/575de571a9b10bdaae7c.webp`,`assets/v7198-base64/6eb2e52d62a5bab79414.webp`,`assets/v7198-base64/7a148e912c51dcfbd11a.webp`,`assets/v7198-base64/a6fff5e7c8e600d112d6.webp`,`assets/v7198-base64/e822614cb976435a67c6.webp`,`assets/v7198-base64/ffe514520f0a9ef78db6.webp`];
  const V260_NODE_POS = [
    {x:11,y:24},{x:37,y:22},{x:63,y:25},{x:89,y:26},
    {x:10,y:49},{x:32,y:61},{x:52,y:68},{x:72,y:60},{x:89,y:50},
    {x:89,y:80,boss:true}
  ];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const roomState=(di,ri)=>{
    const cur=Math.max(0,Math.min(9, typeof v048RoomIndex==='function' ? v048RoomIndex(di) : Number(s?.dungeon?.progress?.[di]||0)||0));
    if(typeof dungeonCompleted==='function' && dungeonCompleted(di))return 'done';
    if(ri<cur)return 'done';
    if(ri===cur)return 'current';
    return 'locked';
  };
  const goWorld=()=>{
    try{s.dungeon.layer='world';s.dungeon.view='map';persist(false)}catch(_){ }
    try{renderDungeon()}catch(e){console.error('V260 world',e)}
    try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){ }
  };
  const stageArt=di=>V260_ART[di]||V260_ART[0];
  const roomLevel=(di,ri)=> typeof v244DungeonRoomLevel==='function' ? v244DungeonRoomLevel(di,ri) : Math.max(1,Number(dungeons?.[di]?.minLevel||1)+(ri||0));
  const roomName=(di,ri)=> typeof v244DungeonRoomName==='function' ? v244DungeonRoomName(di,ri) : (dungeons?.[di]?.enemies?.[ri]?.name || `Gegner ${ri+1}`);
  const enemyStats=(di,ri,e)=> typeof v025EnemyStats==='function' ? v025EnemyStats(di,ri,e) : {rec:roomLevel(di,ri),hp:Number(e?.hp)||0};
  const nodeHtml=(di,ri)=>{
    const e=dungeons?.[di]?.enemies?.[ri]||{};
    const pos=V260_NODE_POS[ri]||{x:50,y:50};
    const state=roomState(di,ri);
    const boss=ri===9;
    const lv=roomLevel(di,ri);
    const classes=['v260d-node',`v260d-${state}`,boss?'v260d-boss':''].filter(Boolean).join(' ');
    return `<button type="button" class="${classes}" data-v260-room="${ri}" style="--x:${pos.x};--y:${pos.y}" ${state==='current'?'':'disabled'}>
      <div class="v260d-ring">
        ${esc(e.icon||'👹')}
        <span class="v260d-num">${ri+1}</span>
        ${state==='done' ? '<span class="v260d-check">✓</span>' : (state==='locked' ? '<span class="v260d-lock">🔒</span>' : '')}
      </div>
      <div class="v260d-panel">
        <div class="v260d-name">${esc(roomName(di,ri))}</div>
        <div class="v260d-lv">${boss?'BOSS · ':''}Lv. ${lv}</div>
      </div>
    </button>`;
  };
  window.v260RenderDetail=function(){
    try{v243RepairAndSaveDungeonKeys?.()}catch(_){ }
    const di=typeof v048DungeonIndex==='function' ? v048DungeonIndex() : Math.max(0,Math.min(19,Number(s?.dungeon?.selected||0)||0));
    const d=dungeons?.[di];
    if(!d)return false;
    const current=Math.max(0,Math.min(9, typeof v048RoomIndex==='function' ? v048RoomIndex(di) : Number(s?.dungeon?.progress?.[di]||0)||0));
    const completed=typeof dungeonCompleted==='function' ? dungeonCompleted(di) : false;
    const ri = completed ? 9 : current;
    const e=d.enemies?.[ri]||d.enemies?.[0]||{};
    const bal=enemyStats(di,ri,e);
    const boss=ri===9;
    const progress=completed?10:current;
    const xp=Number(e?.xp)||0;
    const gold=Number(e?.gold)||0;
    const card=document.querySelector('#dungeonMapCard') || document.querySelector('#dungeon > .card:first-of-type');
    if(!card)return false;
    const battle=document.querySelector('#dungeonBattleCard');
    if(battle)battle.style.display='none';
    card.id='dungeonMapCard';
    card.className='card v260-detail-card';
    card.style.display='';
    const title=String(d.name||'Dungeon').toUpperCase();
    const art=stageArt(di);
    card.innerHTML=`
      <div class="v260d-shell">
        <div class="v260d-top">
          <button type="button" class="v260d-back" id="v260BackWorld"><i>‹</i><span>Zurück zur<br>Dungeon-Weltkarte</span></button>
          <div class="v260d-sign">
            <div class="v260d-kicker">Dungeon ${di+1}</div>
            <div class="v260d-title">${esc(title)}</div>
            <div class="v260d-sub">Besiege alle 10 Gegner der Reihe nach · Fortschritt ${progress}/10</div>
          </div>
          <div class="v260d-ticket"><b>🎟️ Dungeon-Versuch</b><span id="dungeonTicketText">${esc(typeof dungeonWaitText==='function'?dungeonWaitText():'Gratisversuch prüfen …')}</span></div>
        </div>
        <div class="v260d-stage">
          <div class="v260d-stagebg" style="background-image:url('${art}')"></div>
          <div class="v260d-stagefx"></div>
          <svg class="v260d-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="v260d-road-bg" points="11,24 21,30 29,35 20,44 10,49 20,56 32,61 41,65 52,68 62,65 72,60 80,55 89,50 90,63 89,80"></polyline>
            <polyline class="v260d-road" points="11,24 21,30 29,35 20,44 10,49 20,56 32,61 41,65 52,68 62,65 72,60 80,55 89,50 90,63 89,80"></polyline>
          </svg>
          ${d.enemies.map((_,idx)=>nodeHtml(di,idx)).join('')}
          <div class="v260d-signboard">ACHTUNG<br>${esc(title.slice(4, title.length>23?23:title.length) || 'DUNGEON')}<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small></div>
        </div>
        <div class="v260d-panel">
          <div>
            <div class="v260d-enemy-head">
              <div class="v260d-thumb">${esc(e.icon||'👹')}</div>
              <div>
                <div class="v260d-titleline">${completed ? 'DUNGEON ABGESCHLOSSEN' : `${ri+1} · ${esc(e.name||roomName(di,ri))}${boss?' – BOSS':''}`}</div>
                <div class="v260d-bossline">${completed ? 'Alle 10 Gegner wurden besiegt.' : `${boss?'BOSS':'Gegner'} · Empfohlen Level ${bal?.rec||roomLevel(di,ri)} · ${bal?.hp||0} HP`}</div>
              </div>
            </div>
            <div class="v260d-sectionlabel">Mögliche Belohnungen</div>
          </div>
          <div class="v260d-rewards">
            <div class="v260d-reward ${boss?'legendary':''}">${boss?'LEGENDÄR':'ITEM'}<span class="big">${boss?'🟠':'🎁'}</span></div>
            <div class="v260d-reward">EXP<span class="big">${xp}</span></div>
            <div class="v260d-reward">GOLD<span class="big">${gold}</span></div>
            <div class="v260d-reward">HARZ<span class="big">🟢</span></div>
          </div>
          <div>
            <div class="v260d-stats">
              <div class="v260d-stat"><span>Deine Stärke</span><b>${Math.round(typeof combatPower==='function' ? combatPower() : 0)}</b></div>
              <div class="v260d-stat"><span>Gegner</span><b>${completed ? '—' : `Lv. ${bal?.rec||1}`}</b></div>
            </div>
            <button type="button" class="v260d-enter ${boss&&!completed?'danger':''}" id="v260EnterCurrent" ${completed?'disabled':''}>${completed ? '✓ DUNGEON ABGESCHLOSSEN' : (boss ? '⚔️ BOSS ANGREIFEN' : '⚔️ GEGNER ANGREIFEN')}</button>
          </div>
        </div>
      </div>`;
    card.querySelector('#v260BackWorld')?.addEventListener('click',ev=>{ev.preventDefault();goWorld();});
    card.querySelectorAll('[data-v260-room]').forEach(btn=>{
      btn.addEventListener('click',ev=>{
        ev.preventDefault();ev.stopPropagation();
        const r=Number(btn.dataset.v260Room);
        if(r!==current || completed)return;
        if(typeof v251StartCurrentDungeonFight==='function')return v251StartCurrentDungeonFight(di);
        s.dungeon.selected=di;s.dungeon.room=current;s.dungeon.layer='dungeon';s.dungeon.view='battle';
        try{persist(false)}catch(_){ }
        renderDungeon?.();
      });
    });
    card.querySelector('#v260EnterCurrent')?.addEventListener('click',ev=>{
      ev.preventDefault();
      if(completed)return;
      if(typeof v251StartCurrentDungeonFight==='function')return v251StartCurrentDungeonFight(di);
      s.dungeon.selected=di;s.dungeon.room=current;s.dungeon.layer='dungeon';s.dungeon.view='battle';
      try{persist(false)}catch(_){ }
      renderDungeon?.();
    });
    try{if(typeof renderDungeonTicket==='function')renderDungeonTicket(); if(typeof updateDungeonTicket==='function')updateDungeonTicket();}catch(_){ }
    return true;
  };
  window.v244RenderSelectedDungeonMap=window.v260RenderDetail;
  window.v064RenderMap=window.v260RenderDetail;
  try{v244RenderSelectedDungeonMap=window.v260RenderDetail;v064RenderMap=window.v260RenderDetail;}catch(_){ }
})();
