
(function(){
  if(!['beta','server1'].includes(String(window.GROW_RELEASE_CHANNEL||'stable').toLowerCase()))return;
  const diagnostics={fullRenders:0,eventPanelPatches:0,goldDirectOpens:0,mailDirectOpens:0,versionStyleInstalls:0,ownershipFinalizes:0,cleanSignatureHits:0,dirtySignatureRepairs:0,inactiveWorldSkips:0,headerLegacyHideWrites:0,headerValueWrites:0};
  const BETA_VERSION='V8.009';
  function installBetaVersionStyle(){
    try{
      let style=document.getElementById('v8009-home-beta-version');
      if(style)return true;
      if(!document.head)return false;
      style=document.createElement('style');
      style.id='v8009-home-beta-version';
      style.textContent=`html body .app > header .v358-logo::after{content:"${BETA_VERSION}"!important} html body .app > header .v366-ver::after,html body .app > header .v371-logo em::after,html body .app > header .v372-logo em::after,#v372TopbarShell .v372-logo em::after{content:"${BETA_VERSION}"!important}`;
      document.head.appendChild(style);
      diagnostics.versionStyleInstalls++;
      return true;
    }catch(e){return false}
  }
  const esc=v=>typeof v073Escape==='function'?v073Escape(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');

  function cap(){try{return typeof v271DampfCap==='function'?v271DampfCap():100}catch(e){return 100}}
  function cp(){try{return window.__V483_POWER_READY__===true?(typeof combatPower==='function'?num(combatPower()):'0'):'…'}catch(e){return '…'}}
  function xpNeedSafe(){try{return Math.max(1,Number(xpNeed())||100)}catch(e){return Math.max(100,(Number(s?.level)||1)*100)}}
  function playerName(){return String(s?.characterName||s?.playerName||s?.name||'Legende').trim()||'Legende'}
  function className(){
    const c=String(s?.playerClass||'grower');
    if(c==='scout')return 'BLATT SCHÜTZE';
    if(c==='bruiser')return 'BONG MAGIER';
    if(c==='frost')return 'BEKIFFTER FROST-TODESRITTER';
    if(c==='summoner')return 'HARZRUFERIN';
    return 'BUD BARBAR';
  }
  function avatarSrc(){try{return typeof v080AvatarFor==='function'?v080AvatarFor(s.playerClass):''}catch(e){return ''}}
  function attr(k){try{return num(totalAttr(k))}catch(e){return num(s?.attrs?.[k])}}

  function dungeonPos(){
    try{
      const dp={completed:[...(s?.dungeon?.completed||[])],progress:{...(s?.dungeon?.progress||{})}};
      const p=v081DungeonPosition(dp,dp.completed.length);
      return {d:Number(p.dungeonNumber)||1,e:Number(p.enemyNumber)||1};
    }catch(e){return {d:1,e:1}}
  }
  function growSnapshot(now=Date.now()){
    const plants=Array.isArray(s?.grow?.plants)?s.grow.plants.filter(Boolean):[];
    const weatherMul=Math.max(.80,Math.min(1.30,Number(window.GL_WEATHER?.bonus?.growMul)||1));
    let ready=0,nextAt=0;
    for(const p of plants){
      const start=Number(p?.start)||0;
      const duration=Math.max(0,Number(p?.duration)||0);
      let at=0;
      if(start>0&&duration>0)at=start+Math.round(duration/weatherMul);
      else at=Number(p?.readyAt||p?.endsAt||p?.endAt)||0;
      if(at>0&&now>=at)ready++;
      else if(at>now&&(!nextAt||at<nextAt))nextAt=at;
    }
    return {active:plants.length,ready,nextAt,weatherMul};
  }
  window.v8009HomeGrowSnapshot=growSnapshot;
  function bossFree(){try{if(typeof v110ResetDay==='function')v110ResetDay();return !s?.v110WorldBoss?.freeUsed}catch(e){return true}}
  function dungeonFree(){try{return typeof freeDungeonReady==='function'?!!freeDungeonReady():true}catch(e){return true}}
  function firstQuest(){return !s?.v109HarzDaily?.firstQuest}
  function ach(){
    let done=0,total=0;
    try{done=Object.keys(s?.v106Achievements?.done||{}).length}catch(e){}
    try{total=Array.isArray(V106_ACH)?V106_ACH.length:0}catch(e){}
    return {done,total};
  }

  function petUnseen(){
    try{
      if(typeof window.v6104PetUnseen==='function')return Math.max(0,Number(window.v6104PetUnseen())||0);
      return Math.max(0,Number(s?.v686PetAlbum?.unseen)||0);
    }catch(e){return 0}
  }

  function openCharacterTab(tab){
    try{v032Go('character')}catch(e){}
    const activate=()=>{
      try{
        const proxy=document.querySelector('#v514HeroTabs [data-tab="'+tab+'"]');
        if(proxy){proxy.click();return}
        const real=document.querySelector('#v459CharacterTabs [data-tab="'+tab+'"]');
        if(real){real.click();return}
        window.v459CharacterTab?.(tab,true);
      }catch(e){}
    };
    requestAnimationFrame(()=>{activate();setTimeout(activate,40)});
  }

  function events(bossActive=worldBossEventActive()){
    const a=[];
    try{const tw=window.vTowerWednesdayEventInfo?.();if(tw?.active)a.push({c:'green',t:'🗼 TURM-ANOMALIE',s:`${tw.icon||'🗼'} ${tw.name} aktiv`})}catch(e){}
    try{if(typeof v094XpEventActive==='function'&&v094XpEventActive())a.push({c:'purple',t:'⚡ EXP EVENT',s:'2× Erfahrung aktiv'})}catch(e){}
    try{if(typeof v274GoldEventActive==='function'&&v274GoldEventActive())a.push({c:'gold',t:'💰 GOLD EVENT',s:'2× Gold-Belohnungen aktiv'})}catch(e){}
    try{if(typeof v271DampfEventActive==='function'&&v271DampfEventActive())a.push({c:'',t:'🔥 300 DAMPF EVENT',s:'300 Dampf Maximum aktiv'})}catch(e){}
    if(bossActive)a.push({c:'cyan',t:'💠 SMARAGD KOLOSS',s:'Weltboss aktiv!'});
    return a.slice(0,5);
  }

  function worldBossEventActive(){
    try{return typeof v110MysticEventActive==='function'&&v110MysticEventActive()}catch(e){return false}
  }

  function eventIcon(ev){
    const t=String(ev?.t||'').toLowerCase();
    if(t.includes('exp'))return '⚡';
    if(t.includes('gold'))return '💰';
    if(t.includes('dampf'))return '🔥';
    if(t.includes('smaragd')||t.includes('koloss')||t.includes('weltboss'))return '💠';
    if(t.includes('turm')||t.includes('anomalie'))return '🗼';
    return '✨';
  }

  function bossCardHtml(bossActive,bossFreeReady=true){
    const bossAttrs=bossActive
      ? ' data-boss="1" role="button" tabindex="0" aria-label="Mystischen Weltboss Smaragd-Koloss öffnen"'
      : '';
    return `        <article class="v366-panel v366-feature boss ${bossActive?'v6115-boss-open':'v6115-boss-closed'}"${bossAttrs}>
          <h2>Weltboss</h2>
          <div class="v366-feature-art v6118-boss-art">
            ${bossActive?`<span class="v6118-boss-live"><i></i> EVENT AKTIV</span>
            <div class="v6123-boss-overlay"><small>Mystischer Weltboss</small><b>Smaragd-Koloss</b></div>`:`<div class="v6123-boss-overlay v6123-boss-overlay-closed"><small>Der Slot ruht</small><b>Kein Weltboss aktiv</b></div>`}
          </div>
          <div class="v6118-boss-name">${bossActive?(bossFreeReady?'Gratisversuch verfügbar':'Mystischer Boss ist offen'):'Das nächste Boss-Event abwarten'}</div>
          <div class="v690-mini-status v6115-boss-status">${bossActive?(bossFreeReady?'1 Gratisversuch bereit':'Nächster Versuch · 10 Harz-Taler'):'Sobald das Event aktiv ist, kannst du den Koloss herausfordern'}</div>
          <button class="v366-go" data-boss="1" ${bossActive?'':'disabled'}>${bossActive?(bossFreeReady?'Öffnen':'Herausfordern'):'Geschlossen'}</button>
        </article>`;
  }

  function eventCardHtml(ev){
    const activeText=ev.map(x=>String(x?.t||'').toLowerCase()).join(' | ');
    const on=key=>{
      if(key==='tower')return activeText.includes('turm')||activeText.includes('anomalie');
      if(key==='xp')return activeText.includes('exp');
      if(key==='gold')return activeText.includes('gold');
      if(key==='dampf')return activeText.includes('dampf');
      if(key==='boss')return activeText.includes('smaragd')||activeText.includes('koloss')||activeText.includes('weltboss');
      return false;
    };
    const visible=ev.slice(0,2);
    const more=Math.max(0,ev.length-visible.length);
    const tiles=[
      ['tower','TURM','🗼'],
      ['xp','EXP','⚡'],
      ['gold','GOLD','💰'],
      ['dampf','DAMPF','🔥'],
      ['boss','KOLOSS','💠']
    ];
    return `        <article class="v366-panel v366-feature v690-events-card">
          <h2><span>Events</span><i class="vHome-event-count">${ev.length}</i></h2>
          <div class="vHome-events-collage" aria-label="Event-Übersicht">
            ${tiles.map(([id,label,ico])=>`<div class="vHome-event-tile ${id} ${on(id)?'active':''}" data-event-kind="${id}"><span class="vHome-event-tile-icon">${ico}</span><b>${label}</b>${on(id)?'<i>AKTIV</i>':''}</div>`).join('')}
          </div>
          <div class="v6115-events-list">
            ${visible.length
              ? visible.map(x=>`<div class="v6115-event-row ${esc(x.c||'')}"><span class="v6115-event-icon">${eventIcon(x)}</span><div><b>${esc(x.t.replace(/^[^\\s]+\\s*/,''))}</b><small>${esc(x.s)}</small></div></div>`).join('')
              : `<div class="v6115-no-events"><b>Keine Events aktiv</b><small>Aktive Events leuchten oben auf.</small></div>`
            }
            ${more?`<div class="vHome-event-more">+${more} weitere aktiv</div>`:''}
          </div>
        </article>`;
  }

  function openWorldBoss(){
    try{
      if(typeof window.v111OpenWorldBoss==='function')return window.v111OpenWorldBoss();
      if(typeof window.v110Open==='function')return window.v110Open();
    }catch(e){
      console.error('Startseite Weltboss öffnen fehlgeschlagen',e);
      try{window.v063Toast?.('Weltboss-Fehler','error','Der Weltboss konnte nicht geöffnet werden.')}catch(_){}
    }
  }
  function bindBossButtons(root){
    const cards=[
      ...(root instanceof Element&&root.matches('.v366-feature.boss.v6115-boss-open')?[root]:[]),
      ...root.querySelectorAll('.v366-feature.boss.v6115-boss-open')
    ];
    cards.forEach(card=>{
      card.onclick=e=>{
        if(e.target instanceof Element && e.target.closest('button[data-boss]'))return;
        openWorldBoss();
      };
      card.onkeydown=e=>{
        if(e.key!=='Enter'&&e.key!==' ')return;
        e.preventDefault();
        openWorldBoss();
      };
    });
    const buttons=[
      ...(root instanceof Element&&root.matches('button[data-boss]')?[root]:[]),
      ...root.querySelectorAll('button[data-boss]')
    ];
    buttons.forEach(b=>{
      b.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
        if(!b.disabled)openWorldBoss();
      };
    });
  }

  function patchEventPanels(world,ev,bossActive,previousBossActive){
    const card=world.querySelector('.v690-events-card');
    const boss=world.querySelector('.v366-feature.boss');
    const count=world.querySelector('.v690-current-title small');
    const goal=world.querySelector('.v366-goals .v366-goal:nth-child(3) span');
    if(!card||!boss||!count||!goal)return false;
    const template=document.createElement('template');
    template.innerHTML=eventCardHtml(ev);
    card.replaceWith(template.content.firstElementChild);
    count.textContent=ev.length?`${ev.length} aktiv`:'Alles ruhig';
    if(bossActive!==previousBossActive){
      const bossFreeReady=bossActive?bossFree():true;
      template.innerHTML=bossCardHtml(bossActive,bossFreeReady);
      const next=template.content.firstElementChild;
      boss.replaceWith(next);
      bindBossButtons(next);
      goal.textContent=bossActive?(bossFreeReady?'Offen · Gratis':'Offen · 10 Harz'):'Geschlossen';
    }
    diagnostics.eventPanelPatches++;
    return true;
  }

  function buildHeader(){
    const h=document.querySelector('.app > header');
    if(!h)return;
    h.querySelectorAll(':scope > :not(.v366-topbar)').forEach(el=>{
      if(el.style.getPropertyValue('display')!=='none'||el.style.getPropertyPriority('display')!=='important'){
        el.style.setProperty('display','none','important');
        diagnostics.headerLegacyHideWrites++;
      }
    });
    let bar=h.querySelector('.v366-topbar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='v366-topbar';
      bar.innerHTML=`
        <button class="v366-menu" type="button">☰</button>
        <div class="v366-logo"><strong>🌿 GROW</strong><span>LEGENDS</span><i class="v366-ver">${BETA_VERSION}</i></div>
        <div class="v366-res"><span class="ico">🪙</span><div><small>Gold</small><span class="val" id="v366Gold"></span></div><button class="v366-plus" data-plus="gold">+</button></div>
        <div class="v366-res"><span class="ico">💎</span><div><small>Harz</small><span class="val" id="v366Harz"></span></div><button class="v366-plus" data-plus="harz">+</button></div>
        <div class="v366-res"><span class="ico">💨</span><div><small>Dampf</small><span class="val" id="v366Dampf"></span></div><button class="v366-plus" data-plus="dampf">+</button></div>
        <button class="v366-iconbtn" data-head="mail">✉️</button>
        <button class="v366-iconbtn" data-head="friends">👥</button>
        <button class="v366-iconbtn" data-head="settings">⚙️</button>`;
      h.appendChild(bar);

      bar.querySelector('.v366-menu').onclick=e=>{e.preventDefault();e.stopPropagation();document.querySelector('#v032MenuPanel')?.classList.toggle('open')};
      bar.querySelector('[data-plus="harz"]').onclick=()=>{try{v032Go('harzDealer')}catch(e){}};
      bar.querySelector('[data-plus="gold"]').onclick=()=>{
        diagnostics.goldDirectOpens++;
        try{
          if(typeof window.v7114OpenGoldShop==='function')window.v7114OpenGoldShop();
          else if(typeof window.v7117OpenDealerTab==='function')window.v7117OpenDealerTab('gold');
          else if(typeof v032Go==='function')v032Go('goldShop');
        }catch(e){}
      };
      bar.querySelector('[data-plus="dampf"]').onclick=()=>{
        const b=document.querySelector('#v026RefillBtn'); if(b){try{b.click()}catch(e){}}
      };
      bar.querySelector('[data-head="friends"]').onclick=()=>{try{v032Go('friends')}catch(e){}};
      bar.querySelector('[data-head="mail"]').onclick=()=>{
        diagnostics.mailDirectOpens++;
        try{v032Go('mail')}catch(e){}
      };
      bar.querySelector('[data-head="settings"]').onclick=()=>{
        const b=document.querySelector('[data-settings],#settingsBtn,.settings-btn'); if(b){try{b.click()}catch(e){}}
      };
    }
    const writeHeaderText=(el,value)=>{
      if(!el)return;
      const next=String(value);
      if(el.textContent===next)return;
      el.textContent=next;
      diagnostics.headerValueWrites++;
    };
    const ver=bar.querySelector('.v366-ver');
    writeHeaderText(ver,BETA_VERSION);
    const g=bar.querySelector('#v366Gold'),hr=bar.querySelector('#v366Harz'),d=bar.querySelector('#v366Dampf');
    writeHeaderText(g,num(s?.gold));
    writeHeaderText(hr,num(s?.harzTaler));
    writeHeaderText(d,num(s?.energy)+'/'+num(cap()));
  }

  function homeChecklist(){
    const talentFree=(()=>{try{return typeof v314Available==='function'?Math.max(0,Number(v314Available())||0):Math.max(0,Number(s?.skillPoints)||0)}catch(e){return Math.max(0,Number(s?.skillPoints)||0)}})();
    const skillFree=Math.max(0,Number(s?.points)||0);
    const cls=String(s?.playerClass||'');
    const slots=cls==='frost'
      ? ['head','weapon','weapon2','ring','body','boots','amulet']
      : ['head','weapon','ring','body','boots','amulet'];
    const gear=slots.map(k=>s?.equipment?.[k]).filter(Boolean);
    const hasGem=it=>!!(it?.gem||it?.socketGem||it?.socket||it?.edelstein||it?.gemItem);
    const hasEnchant=it=>!!(it?.enchant||(Array.isArray(it?.enchants)&&it.enchants.length)||it?.verzauberung||it?.rolle);
    const gemmed=gear.filter(hasGem).length;
    const enchanted=gear.filter(hasEnchant).length;
    const fullGear=gear.length===slots.length;
    let setPieces=0;
    try{setPieces=cls&&typeof equippedSetCount==='function'?Math.max(0,Number(equippedSetCount(cls))||0):gear.filter(it=>it?.setId===cls).length}catch(e){setPieces=gear.filter(it=>it?.setId===cls).length}
    let thresholds=[];
    try{thresholds=Object.keys((typeof classSets!=='undefined'&&classSets?.[cls]?.bonuses)||{}).map(Number).filter(Number.isFinite).sort((a,b)=>a-b)}catch(e){}
    if(!thresholds.length)thresholds=[2,4,6];
    const setActive=thresholds.filter(n=>setPieces>=n).length;
    const setTotal=thresholds.length;
    return {
      talentFree,skillFree,gearCount:gear.length,gemmed,enchanted,fullGear,setPieces,setActive,setTotal,slotTotal:slots.length,
      talentDone:talentFree===0,skillDone:skillFree===0,
      enchantDone:fullGear&&enchanted===slots.length,
      gemDone:fullGear&&gemmed===slots.length,
      signature:[talentFree,skillFree,gear.length,gemmed,enchanted,setPieces,setActive,setTotal].join(':')
    };
  }

  function homeViewSnapshot(){
    const bossActive=worldBossEventActive();
    return {
      name:playerName(),
      power:cp(),
      dg:dungeonPos(),
      grow:growSnapshot(),
      ac:ach(),
      ev:events(bossActive),
      hc:homeChecklist(),
      pets:petUnseen(),
      bossActive
    };
  }

  function worldHtml(view=homeViewSnapshot()){
    const {name,power,dg,grow,ac,ev,hc,pets,bossActive}=view;
    const avatar=avatarSrc();
    const firstQuestReady=firstQuest();
    const dungeonFreeReady=dungeonFree();
    const bossFreeReady=bossActive?bossFree():true;
    const xp=Math.max(0,Number(s?.xp)||0),need=xpNeedSafe(),pct=Math.max(0,Math.min(100,xp/need*100));
    const twSeason=(s?.tower?.season&&typeof s.tower.season==='object')?s.tower.season:{};
    const twRun=(s?.tower?.run&&typeof s.tower.run==='object'&&s.tower.run.active)?s.tower.run:null;
    const tw={bestFloor:Math.max(0,Number(twSeason.bestFloor)||0),bestScore:Math.max(0,Number(twSeason.bestScore)||0),active:!!twRun,floor:Math.max(1,Number(twRun?.floor)||1)};
    return `
    <div class="v366-world v690-world">
      <section class="v366-hero v690-hero">
        <a class="v7187-wa-ticket" href="https://chat.whatsapp.com/BTOJbKtozNVEBNQL5ZFoce" target="_blank" rel="noopener noreferrer" aria-label="Grow Legends WhatsApp Community öffnen">
          <span class="v7187-wa-icon" aria-hidden="true">💬</span>
          <span class="v7187-wa-copy"><small>GROW LEGENDS</small><b>WHATSAPP</b><span>Community beitreten</span></span>
        </a>
        <div class="v366-character" aria-hidden="true"></div>
        <div class="v366-profile">
          <div class="v366-profile-row">
            <div class="v366-avatar">${avatar?`<img src="${avatar}" alt="Charakter">`:''}</div>
            <div><div class="v366-pname">${esc(name)}</div><div class="v366-plevel">Stufe ${num(s?.level||1)} · <span class="v366-class">${className()}</span></div></div>
          </div>
          <div class="v366-xpbar"><div class="v366-xpfill" style="width:${pct}%"></div></div>
          <div class="v366-xptxt">${num(xp)} / ${num(need)} EXP</div>
          <div class="v366-power">⚔️ Kampfkraft <b>${power}</b></div>
          <div class="vHome-checklist" aria-label="Charakter-Checkliste">
            <div class="vHome-check-head"><span>CHARAKTER-CHECK</span><small>Was noch zu tun ist</small></div>
            <button type="button" class="vHome-check-row ${hc.talentDone?'ok':'warn'}" data-char-tab="talents"><i>${hc.talentDone?'✓':'!'}</i><span>Talentpunkte</span><b>${hc.talentDone?'Alle vergeben':`${num(hc.talentFree)} zu verteilen`}</b></button>
            <button type="button" class="vHome-check-row ${hc.skillDone?'ok':'warn'}" data-char-tab="attributes"><i>${hc.skillDone?'✓':'!'}</i><span>Skillpunkte</span><b>${hc.skillDone?'Alle vergeben':`${num(hc.skillFree)} zu verteilen`}</b></button>
            <button type="button" class="vHome-check-row ${hc.enchantDone?'ok':'warn'}" data-char-tab="materials"><i>${hc.enchantDone?'✓':'!'}</i><span>Ausrüstung verzaubert</span><b>${hc.enchantDone?'Komplett':`${hc.enchanted}/${hc.slotTotal}`}</b></button>
            <button type="button" class="vHome-check-row ${hc.gemDone?'ok':'warn'}" data-char-tab="materials"><i>${hc.gemDone?'✓':'!'}</i><span>Mit Steinen gesockelt</span><b>${hc.gemDone?'Komplett':`${hc.gemmed}/${hc.slotTotal}`}</b></button>
            <button type="button" class="vHome-check-row set" data-char-tab="inventory"><i>◆</i><span>Aktive Klassenset-Boni</span><b>${hc.setActive}/${hc.setTotal} aktiv</b></button>
          </div>
        </div>
        <div class="v366-welcome"><small>Willkommen zurück,</small><h1>${esc(name)}!</h1><p>Die Legende wächst weiter.</p></div>
        <div class="v6103-motto" aria-hidden="true"><b>GOOD</b><b>WEED</b><b>BETTER</b><b>LEGENDS.</b></div>
        ${typeof window.v6239WeeklyChestHomeHtml==='function'?window.v6239WeeklyChestHomeHtml():''}
      </section>

      <nav class="v6103-quickbar" aria-label="Schnellzugriff">
        <button type="button" data-char-tab="inventory"><span class="v6103-qicon">🎒</span><span>Inventar</span></button>
        <button type="button" data-char-tab="attributes"><span class="v6103-qicon">💪</span><span>Attribute</span></button>
        <button type="button" data-char-tab="talents"><span class="v6103-qicon">🌳</span><span>Talente</span></button>
        <button type="button" data-pets="1"><span class="v6103-qicon">🐾</span><span>Pets</span>${pets?`<i class="v6103-badge">${pets}</i>`:''}</button>
        <button type="button" data-book="1"><span class="v6103-qicon">🏆</span><span>Erfolge</span></button>
        <button type="button" data-go="guild"><span class="v6103-qicon">🏰</span><span>Gilde</span></button>
      </nav>

      ${eventCardHtml(ev)}

      <div class="v690-section-title v690-adventure-title"><span>Deine Abenteuer</span><i>🌿</i></div>

      <section class="v366-main">
        <article class="v366-card quest"><h2>Quests</h2><div class="v366-card-art"></div><div class="v366-cardbody"><p>Dampf verbrauchen,<br>Belohnungen sichern!</p><div class="v366-status">💨 <b>${num(s?.energy)}/${num(cap())} Dampf</b></div><button class="v366-go" data-go="quests">Zu den Quests</button></div></article>
        <article class="v366-card dungeon"><h2>Dungeon</h2><div class="v366-card-art"></div><div class="v366-cardbody"><p>Kämpfe dich durch<br>epische Dungeons!</p><div class="v366-status">⚔️ <b>Dungeon ${dg.d}<br>Gegner ${dg.e}/10</b></div><button class="v366-go" data-go="dungeon">Zum Dungeon</button></div></article>
        <article class="v366-card tower v4166-tower-card"><h2>Anbauturm</h2><div class="v366-card-art v4166-tower-art"><img class="v4166-tower-home-img" src="assets/v8-inline/v4166-anbauturm-home.webp" alt="" aria-hidden="true"></div><div class="v366-cardbody"><p>Steig Etage für Etage<br>und riskiere deinen Run!</p><div class="v366-status">🏆 <b>${tw.active?`Aktiver Run · Etage ${tw.floor}`:`Bestwert · Etage ${tw.bestFloor}`}<br>${tw.bestScore?`${num(tw.bestScore)} Punkte`:'Saison-Rangliste'}</b></div><button class="v366-go" data-go="tower">Zum Anbauturm</button></div></article>
        <article class="v366-card grow"><h2>Growroom</h2><div class="v366-card-art"></div><div class="v366-cardbody"><p>Ziehe mächtige Pflanzen<br>und ernte Erträge!</p><div class="v366-status">🌿 <b>${grow.ready} Pflanze${grow.ready===1?'':'n'} erntereif</b></div><button class="v366-go" data-go="grow">Zum Growroom</button></div></article>
      </section>

      <div class="v690-section-title v690-current-title"><span>Aktuelles</span><small>${ev.length?`${ev.length} aktiv`:'Alles ruhig'}</small></div>

      <section class="v366-lower">
        <article class="v366-panel v690-goals-panel"><div class="v366-goals-title">Tagesziele</div><div class="v366-goals">
          <div class="v366-goal"><i>📜</i><div><b>Erste Quest</b><span>${firstQuestReady?'+2 Harz':'Erledigt ✓'}</span></div></div>
          <div class="v366-goal"><i>⚔️</i><div><b>Dungeon</b><span>${dungeonFreeReady?'Bereit':'Cooldown'}</span></div></div>
          <div class="v366-goal"><i>💎</i><div><b>Koloss</b><span>${bossActive?(bossFreeReady?'Offen · Gratis':'Offen · 10 Harz'):'Geschlossen'}</span></div></div>
          <div class="v366-goal"><i>⭐</i><div><b>Erfolge</b><span>${ac.done}/${ac.total||'—'}</span></div></div>
        </div></article>

        ${bossCardHtml(bossActive,bossFreeReady)}

        <article class="v366-panel v366-feature book"><h2>Illegales Buch</h2><div class="v366-feature-art"></div><div class="v690-mini-status">⭐ ${ac.done}/${ac.total||'—'} Erfolge</div><button class="v366-go" data-book="1">Öffnen</button></article>

        <article class="v366-panel v366-feature forge vForge-home-card"><h2>Harzschmiede</h2><div class="v366-feature-art vForge-home-art" aria-hidden="true"><span class="vForge-home-anvil">◆</span><span class="vForge-home-icon">🔨</span><span class="vForge-home-spark">✦</span></div><div class="v690-mini-status">Zerlegen · Sets bauen · Prismatisch schmieden</div><button class="v366-go" data-go="forge">Zur Schmiede</button></article>

        <article class="v366-panel v366-feature v7129-referral-home-card">
          <h2>Freund werben</h2>
          <div class="v7129-referral-home-art" aria-hidden="true"><img class="v7129-referral-home-img" src="data:image/webp;base64,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" alt=""></div>
          <div class="v690-mini-status">${Math.min(10,Number(window.__V7129_REFERRAL_STATE__?.qualified_count)||0)}/10 Freunde · je 25 Harz</div>
          <button class="v366-go" data-referral-open="1">Einladungen</button>
        </article>

        <article class="v366-panel v366-feature v6103-shop-card">
          <h2>Shop</h2>
          <div class="v6103-shop-art" aria-hidden="true"></div>
          <div class="v690-mini-status">Händler · Ausrüstung · tägliche Angebote</div>
          <button class="v366-go" data-go="shop">Zum Shop</button>
        </article>

        <article class="v366-panel v366-feature vHome-weather-card" aria-label="Live-Wetter">
          ${(()=>{const w=window.GL_WEATHER||{icon:'🌤️',label:'Server-Wetter',temp:null,bonus:{text:'Wetter wird geladen …'}};const temp=Number.isFinite(Number(w.temp))?`${Math.round(Number(w.temp))} °C`:'';return `<h2>Live-Wetter</h2><div class="vHome-weather-card-art"><span class="vHome-weather-card-icon">${w.icon||'🌤️'}</span><b>${esc(w.label||'Server-Wetter')}</b><strong>${temp}</strong></div><div class="v690-mini-status">${esc(w?.bonus?.text||'Kein Wetterbonus')}</div><button class="v366-go" data-go="grow">Zum Growroom</button>`})()}
        </article>
      </section>

      <div id="v492HomeGrowStatus" class="v492-home-grow" data-go="grow">
        <b>${grow.active?`🌱 Growroom · ${grow.active} Pflanze${grow.active===1?'':'n'} aktiv${grow.ready?` · ${grow.ready} erntereif`:''}`:'🌱 Growroom · Keine Pflanzen aktiv'}</b>
        <small>Deine Pflanzen wachsen weiter, auch wenn du offline bist.</small>
      </div>

      <div class="v690-footer">
        <span>GOOD PLANTS<br>BETTER PLAYERS</span>
        <b>🌿 GROW LEGENDS 🌿</b>
        <span>STAY HIGH<br>PLAY LEGENDARY</span>
      </div>
    </div>`;
  }

  function ownedWorldClean(world,modern){
    if(!world||!modern)return false;
    if(world.childElementCount!==1||world.firstElementChild!==modern)return false;
    if(world.classList.contains('v350-isolated')||world.dataset.v368SingleWorld!=='1')return false;
    if(modern.style.getPropertyValue('display')!=='grid'||modern.style.getPropertyPriority('display')!=='important')return false;
    if(modern.style.getPropertyValue('visibility')!=='visible'||modern.style.getPropertyPriority('visibility')!=='important')return false;
    if(modern.style.getPropertyValue('opacity')!=='1'||modern.style.getPropertyPriority('opacity')!=='important')return false;
    return true;
  }

  function finalizeOwnedWorld(world){
    if(!world)return false;
    diagnostics.ownershipFinalizes++;
    let modern=world.querySelector(':scope > .v366-world.v690-world');
    if(!modern){
      modern=world.querySelector('.v366-world.v690-world');
      if(modern)world.insertBefore(modern,world.firstChild);
    }
    if(!modern)return false;

    /* V4.366 is the only visible owner of #world. Historic installers may still
       append old presentation DOM during navigation; remove only those siblings. */
    [...world.children].forEach(el=>{if(el!==modern)el.remove()});
    world.classList.remove('v350-isolated');
    world.dataset.v368SingleWorld='1';
    modern.style.setProperty('display','grid','important');
    modern.style.setProperty('visibility','visible','important');
    modern.style.setProperty('opacity','1','important');

    /* V369 used to wrap the whole installer only to repaint this portrait.
       Keep the exact visual result inside the canonical owner instead. */
    const character=modern.querySelector('.v366-character');
    if(character){
      /* HOME-26: worldHtml already resolved the avatar once for this canonical
         DOM. Reuse the mounted profile image instead of calling v080AvatarFor
         again during ownership finalization. */
      const src=String(modern.querySelector('.v366-avatar img')?.getAttribute('src')||'');
      if(src){
        character.classList.add('v369-real-character');
        character.style.setProperty('background-image',`url("${src}")`,'important');
      }else{
        character.classList.remove('v369-real-character');
        character.style.setProperty('background-image','none','important');
      }
    }
    return true;
  }

  function repairHomeTitles(){
    const world=document.querySelector('#world');
    if(!world||!world.classList.contains('active'))return false;
    const fixes=[
      ['.v690-adventure-title span','Deine Abenteuer'],
      ['.v690-current-title span','Aktuelles'],
      ['.v366-card.quest>h2','Quests'],
      ['.v366-card.dungeon>h2','Dungeon'],
      ['.v366-card.tower>h2','Anbauturm'],
      ['.v366-card.grow>h2','Growroom'],
      ['.v690-goals-panel .v366-goals-title','Tagesziele'],
      ['.v366-feature.boss>h2','Weltboss'],
      ['.v366-feature.book>h2','Illegales Buch'],
      ['.vForge-home-card>h2','Harzschmiede'],
      ['.v7129-referral-home-card>h2','Freund werben'],
      ['.v6103-shop-card>h2','Shop']
    ];
    let writes=0;
    for(const [selector,label] of fixes){
      const el=world.querySelector(selector);
      if(!el)continue;
      if(!String(el.textContent||'').trim()){
        el.textContent=label;
        writes++;
      }
      el.style.setProperty('visibility','visible','important');
      el.style.setProperty('opacity','1','important');
      el.style.setProperty('display',selector.includes('v690-')?'flex':'grid','important');
    }
    return writes>0;
  }

  function notifyWorldRendered(mode){
    try{
      window.dispatchEvent(new CustomEvent('growlegends:home-rendered-v8009',{detail:{mode:String(mode||'render')}}));
    }catch(e){}
  }

  function installWorld(force){
    const world=document.querySelector('#world');
    if(!world)return false;
    /* HOME-27: background activity may still request the legacy home installer
       while another screen is open. Non-forced work can wait until the world
       screen is actually entered; v032Go('world') already schedules a catch-up. */
    if(!force&&!world.classList.contains('active')){
      diagnostics.inactiveWorldSkips++;
      return false;
    }
    const view=homeViewSnapshot();
    const {name,power,dg,grow,ac,ev,hc,pets,bossActive}=view;
    const sigParts=[
      name,s?.playerClass,s?.level,s?.xp,s?.energy,s?.gold,s?.harzTaler,
      attr('staerke'),attr('ausdauer'),attr('geschick'),attr('intelligenz'),attr('glueck'),power,
      dg.d,dg.e,`${grow.active}:${grow.ready}`,pets,bossActive,ev.map(x=>`${x.t}:${x.s}`).join('|'),ac.done,hc.signature,Number(s?.tower?.season?.bestFloor)||0,Number(s?.tower?.season?.bestScore)||0,(s?.tower?.run?.active?Number(s.tower.run.floor)||1:0),window.v6239WeeklyChestSignature?.()||'',window.GL_WEATHER?.kind||'',window.GL_WEATHER?.label||'',Math.round(Number(window.GL_WEATHER?.temp)||0),window.GL_WEATHER?.bonus?.text||'',Number(window.__V7129_REFERRAL_STATE__?.qualified_count)||0,!!window.__V7129_REFERRAL_STATE__?.grand_claimed
    ];
    const sig=sigParts.join('~');

    /* HOME-24: unchanged, already-clean Startseite DOM can return immediately.
       If a historic renderer appended a sibling or disturbed owner styles, retain
       the old repair path and normalize ownership before returning. */
    const current=world.querySelector(':scope > .v366-world.v690-world');
    if(current && world.dataset.v366Sig===sig){
      if(ownedWorldClean(world,current)){diagnostics.cleanSignatureHits++;return}
      diagnostics.dirtySignatureRepairs++;
      finalizeOwnedWorld(world);
      notifyWorldRendered('repair');
      return;
    }
    /* HOME-14: an event-only change updates its two panels and counter without
       replacing the hero, navigation, weather or adventure cards. V366 remains
       the sole renderer and uses the same event functions for both paths. */
    const previous=String(world.dataset.v366Sig||'').split('~');
    if(current&&previous.length===sigParts.length&&sigParts.every((value,i)=>i===17||i===18||String(value??'')===previous[i])&&patchEventPanels(world,ev,bossActive,previous[17]==='true')){
      world.dataset.v366Sig=sig;
      finalizeOwnedWorld(world);
      notifyWorldRendered('events');
      return;
    }
    world.dataset.v366Sig=sig;
    diagnostics.fullRenders++;
    world.innerHTML=worldHtml(view);
    world.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const id=b.dataset.go;if(id!=='world')try{v032Go(id)}catch(e){}});
    world.querySelectorAll('[data-char-tab]').forEach(b=>b.onclick=()=>openCharacterTab(b.dataset.charTab));
    world.querySelectorAll('[data-pets]').forEach(b=>b.onclick=()=>{try{window.v686OpenPetAlbum?.()}catch(e){}});
    bindBossButtons(world);
    world.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>{try{if(typeof v106OpenBook==='function')v106OpenBook()}catch(e){}});
    world.querySelectorAll('[data-weekly-chest]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();try{window.v6239OpenWeeklyChest?.()}catch(err){console.warn('V6.239 weekly chest open',err)}});
    finalizeOwnedWorld(world);
    repairHomeTitles();
    notifyWorldRendered('full');
  }

  window.v8009HomeEventDiagnostics=()=>({version:'V8.009-HOME-31',...diagnostics,events:events().map(x=>({...x})),worldBossActive:worldBossEventActive()});

  /* Re-own only the world installer; do not touch core game render/persist. */
  v085WorldHtml=worldHtml;
  v085InstallWorld=function(force){installWorld(!!force)};

  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    buildHeader();
    if(id==='world')installWorld(false);
  },{passive:true});

  /* HOME-17: the extracted beta header owns its own build label. Historical
     document-wide V4.29 version writes are retired. */
  installBetaVersionStyle();
  buildHeader();
  installWorld(false);
  document.addEventListener('DOMContentLoaded',()=>{
    installBetaVersionStyle();
    buildHeader();
    installWorld(false);
    repairHomeTitles();
    setTimeout(()=>repairHomeTitles(),120);
    setTimeout(()=>repairHomeTitles(),450);
  },{once:true});
  /* Startup title integrity: some Android WebViews repaint the home shell after
     the first synchronous render. Re-assert only the canonical title nodes,
     never the full page, so boot stays stable without reviving legacy renderers. */
  setTimeout(()=>repairHomeTitles(),450);
})();
