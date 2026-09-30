
(function(){
  if(String(window.GROW_RELEASE_CHANNEL||'stable')!=='beta')return;
  const diagnostics={fullRenders:0,eventPanelPatches:0};
  const V366_VERSION='V4.29 Stable';
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
  function growReady(){
    const now=Date.now();
    return (s?.grow?.plants||[]).filter(p=>{
      if(!p)return false;
      const end=Number(p.readyAt||p.endsAt||p.endAt)||((Number(p.start)||0)+(Number(p.duration)||0));
      return end>0&&now>=end;
    }).length;
  }
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

  function events(){
    const a=[];
    try{const tw=window.vTowerWednesdayEventInfo?.();if(tw?.active)a.push({c:'green',t:'🗼 TURM-ANOMALIE',s:`${tw.icon||'🗼'} ${tw.name} aktiv`})}catch(e){}
    try{if(typeof v094XpEventActive==='function'&&v094XpEventActive())a.push({c:'purple',t:'⚡ EXP EVENT',s:'2× Erfahrung aktiv'})}catch(e){}
    try{if(typeof v274GoldEventActive==='function'&&v274GoldEventActive())a.push({c:'gold',t:'💰 GOLD EVENT',s:'2× Gold-Belohnungen aktiv'})}catch(e){}
    try{if(typeof v271DampfEventActive==='function'&&v271DampfEventActive())a.push({c:'',t:'🔥 300 DAMPF EVENT',s:'300 Dampf Maximum aktiv'})}catch(e){}
    try{if(typeof v110MysticEventActive==='function'&&v110MysticEventActive())a.push({c:'cyan',t:'💠 SMARAGD KOLOSS',s:'Weltboss aktiv!'})}catch(e){}
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

  function bossCardHtml(bossActive){
    return `        <article class="v366-panel v366-feature boss ${bossActive?'v6115-boss-open':'v6115-boss-closed'}">
          <h2>Weltboss</h2>
          <div class="v366-feature-art v6118-boss-art">
            ${bossActive?`<span class="v6118-boss-live"><i></i> EVENT AKTIV</span>
            <div class="v6123-boss-overlay"><small>Mystischer Weltboss</small><b>Smaragd-Koloss</b></div>`:`<div class="v6123-boss-overlay v6123-boss-overlay-closed"><small>Der Slot ruht</small><b>Kein Weltboss aktiv</b></div>`}
          </div>
          <div class="v6118-boss-name">${bossActive?(bossFree()?'Gratisversuch verfügbar':'Mystischer Boss ist offen'):'Das nächste Boss-Event abwarten'}</div>
          <div class="v690-mini-status v6115-boss-status">${bossActive?(bossFree()?'1 Gratisversuch bereit':'Nächster Versuch · 10 Harz-Taler'):'Sobald das Event aktiv ist, kannst du den Koloss herausfordern'}</div>
          <button class="v366-go" data-boss="1" ${bossActive?'':'disabled'}>${bossActive?(bossFree()?'Öffnen':'Herausfordern'):'Geschlossen'}</button>
        </article>`;
  }

  function eventCardHtml(ev){
    const ev0=ev[0]||null;
    return `        <article class="v366-panel v366-feature v690-events-card ${ev0?esc(ev0.c):''}">
          <h2>Events</h2>
          <div class="v6115-events-list">
            ${ev.length
              ? ev.map(x=>`<div class="v6115-event-row ${esc(x.c||'')}"><span class="v6115-event-icon">${eventIcon(x)}</span><div><b>${esc(x.t.replace(/^[^\s]+\s*/,''))}</b><small>${esc(x.s)}</small></div></div>`).join('')
              : `<div class="v6115-no-events"><span>📅</span><b>Keine Events</b><small>Aktuell kein Event aktiv</small></div>`
            }
          </div>
        </article>`;
  }

  function bindBossButtons(root){
    root.querySelectorAll('[data-boss]').forEach(b=>b.onclick=()=>{if(b.disabled)return;try{if(typeof v110Open==='function')v110Open()}catch(e){}});
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
      template.innerHTML=bossCardHtml(bossActive);
      const next=template.content.firstElementChild;
      boss.replaceWith(next);
      bindBossButtons(next);
      goal.textContent=bossActive?(bossFree()?'Offen · Gratis':'Offen · 10 Harz'):'Geschlossen';
    }
    diagnostics.eventPanelPatches++;
    return true;
  }

  function buildHeader(){
    const h=document.querySelector('.app > header');
    if(!h)return;
    h.querySelectorAll(':scope > :not(.v366-topbar)').forEach(el=>el.style.setProperty('display','none','important'));
    let bar=h.querySelector('.v366-topbar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='v366-topbar';
      bar.innerHTML=`
        <button class="v366-menu" type="button">☰</button>
        <div class="v366-logo"><strong>🌿 GROW</strong><span>LEGENDS</span><i class="v366-ver">${window.GROW_LEGENDS_VERSION?.short||'V4.159'}</i></div>
        <div class="v366-res"><span class="ico">🪙</span><div><small>Gold</small><span class="val" id="v366Gold"></span></div><button class="v366-plus" data-plus="gold">+</button></div>
        <div class="v366-res"><span class="ico">💎</span><div><small>Harz</small><span class="val" id="v366Harz"></span></div><button class="v366-plus" data-plus="harz">+</button></div>
        <div class="v366-res"><span class="ico">💨</span><div><small>Dampf</small><span class="val" id="v366Dampf"></span></div><button class="v366-plus" data-plus="dampf">+</button></div>
        <button class="v366-iconbtn" data-head="mail">✉️</button>
        <button class="v366-iconbtn" data-head="friends">👥</button>
        <button class="v366-iconbtn" data-head="settings">⚙️</button>`;
      h.appendChild(bar);

      bar.querySelector('.v366-menu').onclick=e=>{e.preventDefault();e.stopPropagation();document.querySelector('#v032MenuPanel')?.classList.toggle('open')};
      bar.querySelector('[data-plus="harz"]').onclick=()=>{try{v032Go('harzDealer')}catch(e){}};
      bar.querySelector('[data-plus="gold"]').onclick=()=>{try{v032Go('shop')}catch(e){}};
      bar.querySelector('[data-plus="dampf"]').onclick=()=>{
        const b=document.querySelector('#v026RefillBtn'); if(b){try{b.click()}catch(e){}}
      };
      bar.querySelector('[data-head="friends"]').onclick=()=>{try{v032Go('friends')}catch(e){}};
      bar.querySelector('[data-head="mail"]').onclick=()=>{try{v032Go('friends')}catch(e){}};
      bar.querySelector('[data-head="settings"]').onclick=()=>{
        const b=document.querySelector('[data-settings],#settingsBtn,.settings-btn'); if(b){try{b.click()}catch(e){}}
      };
    }
    const g=bar.querySelector('#v366Gold'),hr=bar.querySelector('#v366Harz'),d=bar.querySelector('#v366Dampf');
    if(g)g.textContent=num(s?.gold);
    if(hr)hr.textContent=num(s?.harzTaler);
    if(d)d.textContent=num(s?.energy)+'/'+num(cap());
  }

  function homeChecklist(){
    const talentFree=(()=>{try{return typeof v314Available==='function'?Math.max(0,Number(v314Available())||0):Math.max(0,Number(s?.skillPoints)||0)}catch(e){return Math.max(0,Number(s?.skillPoints)||0)}})();
    const skillFree=Math.max(0,Number(s?.points)||0);
    const slots=['head','weapon','ring','body','boots','amulet'];
    const gear=slots.map(k=>s?.equipment?.[k]).filter(Boolean);
    const hasGem=it=>!!(it?.gem||it?.socketGem||it?.socket||it?.edelstein||it?.gemItem);
    const hasEnchant=it=>!!(it?.enchant||(Array.isArray(it?.enchants)&&it.enchants.length)||it?.verzauberung||it?.rolle);
    const gemmed=gear.filter(hasGem).length;
    const enchanted=gear.filter(hasEnchant).length;
    const fullGear=gear.length===slots.length;
    const cls=String(s?.playerClass||'');
    let setPieces=0;
    try{setPieces=cls&&typeof equippedSetCount==='function'?Math.max(0,Number(equippedSetCount(cls))||0):gear.filter(it=>it?.setId===cls).length}catch(e){setPieces=gear.filter(it=>it?.setId===cls).length}
    let thresholds=[];
    try{thresholds=Object.keys((typeof classSets!=='undefined'&&classSets?.[cls]?.bonuses)||{}).map(Number).filter(Number.isFinite).sort((a,b)=>a-b)}catch(e){}
    if(!thresholds.length)thresholds=[2,4,6];
    const setActive=thresholds.filter(n=>setPieces>=n).length;
    const setTotal=thresholds.length;
    return {
      talentFree,skillFree,gearCount:gear.length,gemmed,enchanted,fullGear,setPieces,setActive,setTotal,
      talentDone:talentFree===0,skillDone:skillFree===0,
      enchantDone:fullGear&&enchanted===slots.length,
      gemDone:fullGear&&gemmed===slots.length,
      signature:[talentFree,skillFree,gear.length,gemmed,enchanted,setPieces,setActive,setTotal].join(':')
    };
  }

  function worldHtml(){
    const xp=Math.max(0,Number(s?.xp)||0),need=xpNeedSafe(),pct=Math.max(0,Math.min(100,xp/need*100));
    const dg=dungeonPos(),gr=growReady(),ac=ach(),ev=events();
    const hc=homeChecklist();
    const bossActive=worldBossEventActive();
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
            <div class="v366-avatar">${avatarSrc()?`<img src="${avatarSrc()}" alt="Charakter">`:''}</div>
            <div><div class="v366-pname">${esc(playerName())}</div><div class="v366-plevel">Stufe ${num(s?.level||1)} · <span class="v366-class">${className()}</span></div></div>
          </div>
          <div class="v366-xpbar"><div class="v366-xpfill" style="width:${pct}%"></div></div>
          <div class="v366-xptxt">${num(xp)} / ${num(need)} EXP</div>
          <div class="v366-power">⚔️ Kampfkraft <b>${cp()}</b></div>
          <div class="vHome-checklist" aria-label="Charakter-Checkliste">
            <div class="vHome-check-head"><span>CHARAKTER-CHECK</span><small>Was noch zu tun ist</small></div>
            <button type="button" class="vHome-check-row ${hc.talentDone?'ok':'warn'}" data-char-tab="talents"><i>${hc.talentDone?'✓':'!'}</i><span>Talentpunkte</span><b>${hc.talentDone?'Alle vergeben':`${num(hc.talentFree)} zu verteilen`}</b></button>
            <button type="button" class="vHome-check-row ${hc.skillDone?'ok':'warn'}" data-char-tab="attributes"><i>${hc.skillDone?'✓':'!'}</i><span>Skillpunkte</span><b>${hc.skillDone?'Alle vergeben':`${num(hc.skillFree)} zu verteilen`}</b></button>
            <button type="button" class="vHome-check-row ${hc.enchantDone?'ok':'warn'}" data-char-tab="materials"><i>${hc.enchantDone?'✓':'!'}</i><span>Ausrüstung verzaubert</span><b>${hc.enchantDone?'Komplett':`${hc.enchanted}/6`}</b></button>
            <button type="button" class="vHome-check-row ${hc.gemDone?'ok':'warn'}" data-char-tab="materials"><i>${hc.gemDone?'✓':'!'}</i><span>Mit Steinen gesockelt</span><b>${hc.gemDone?'Komplett':`${hc.gemmed}/6`}</b></button>
            <button type="button" class="vHome-check-row set" data-char-tab="inventory"><i>◆</i><span>Aktive Klassenset-Boni</span><b>${hc.setActive}/${hc.setTotal} aktiv</b></button>
          </div>
        </div>
        <div class="v366-welcome"><small>Willkommen zurück,</small><h1>${esc(playerName())}!</h1><p>Die Legende wächst weiter.</p></div>
        <div class="v6103-motto" aria-hidden="true"><b>GOOD</b><b>WEED</b><b>BETTER</b><b>LEGENDS.</b></div>
        ${typeof window.v6239WeeklyChestHomeHtml==='function'?window.v6239WeeklyChestHomeHtml():''}
      </section>

      <nav class="v6103-quickbar" aria-label="Schnellzugriff">
        <button type="button" data-char-tab="inventory"><span class="v6103-qicon">🎒</span><span>Inventar</span></button>
        <button type="button" data-char-tab="attributes"><span class="v6103-qicon">💪</span><span>Attribute</span></button>
        <button type="button" data-char-tab="talents"><span class="v6103-qicon">🌳</span><span>Talente</span></button>
        <button type="button" data-pets="1"><span class="v6103-qicon">🐾</span><span>Pets</span>${petUnseen()?`<i class="v6103-badge">${petUnseen()}</i>`:''}</button>
        <button type="button" data-book="1"><span class="v6103-qicon">🏆</span><span>Erfolge</span></button>
        <button type="button" data-go="guild"><span class="v6103-qicon">🏰</span><span>Gilde</span></button>
      </nav>

      ${(()=>{const w=window.GL_WEATHER||{icon:'🌤️',label:'Server-Wetter',temp:null,bonus:{text:'Wetter wird geladen …'}};const temp=Number.isFinite(Number(w.temp))?`${Math.round(Number(w.temp))} °C`:'';return `<section class="glw-home-slot" aria-label="Live-Wetter"><div class="glw-home-icon">${w.icon||'🌤️'}</div><div class="glw-home-copy"><small>LIVE-SERVER-WETTER</small><b>${esc(w.label||'Server-Wetter')}</b><span>${esc(w?.bonus?.text||'Kein Wetterbonus')}</span></div><div class="glw-home-temp">${temp}</div></section>`})()}

      <div class="v690-section-title v690-adventure-title"><span>Deine Abenteuer</span><i>🌿</i></div>

      <section class="v366-main">
        <article class="v366-card quest"><h2>Quests</h2><div class="v366-card-art"></div><div class="v366-cardbody"><p>Dampf verbrauchen,<br>Belohnungen sichern!</p><div class="v366-status">💨 <b>${num(s?.energy)}/${num(cap())} Dampf</b></div><button class="v366-go" data-go="quests">Zu den Quests</button></div></article>
        <article class="v366-card dungeon"><h2>Dungeon</h2><div class="v366-card-art"></div><div class="v366-cardbody"><p>Kämpfe dich durch<br>epische Dungeons!</p><div class="v366-status">⚔️ <b>Dungeon ${dg.d}<br>Gegner ${dg.e}/10</b></div><button class="v366-go" data-go="dungeon">Zum Dungeon</button></div></article>
        <article class="v366-card tower v4166-tower-card"><h2>Anbauturm</h2><div class="v366-card-art v4166-tower-art"><span class="v4166-tower-emblem">🗼</span></div><div class="v366-cardbody"><p>Steig Etage für Etage<br>und riskiere deinen Run!</p><div class="v366-status">🏆 <b>${tw.active?`Aktiver Run · Etage ${tw.floor}`:`Bestwert · Etage ${tw.bestFloor}`}<br>${tw.bestScore?`${num(tw.bestScore)} Punkte`:'Saison-Rangliste'}</b></div><button class="v366-go" data-go="tower">Zum Anbauturm</button></div></article>
        <article class="v366-card grow"><h2>Growroom</h2><div class="v366-card-art"></div><div class="v366-cardbody"><p>Ziehe mächtige Pflanzen<br>und ernte Erträge!</p><div class="v366-status">🌿 <b>${gr} Pflanze${gr===1?'':'n'} erntereif</b></div><button class="v366-go" data-go="grow">Zum Growroom</button></div></article>
      </section>

      <div class="v690-section-title v690-current-title"><span>Aktuelles</span><small>${ev.length?`${ev.length} aktiv`:'Alles ruhig'}</small></div>

      <section class="v366-lower">
        <article class="v366-panel v690-goals-panel"><div class="v366-goals-title">Tagesziele</div><div class="v366-goals">
          <div class="v366-goal"><i>📜</i><div><b>Erste Quest</b><span>${firstQuest()?'+2 Harz':'Erledigt ✓'}</span></div></div>
          <div class="v366-goal"><i>⚔️</i><div><b>Dungeon</b><span>${dungeonFree()?'Bereit':'Cooldown'}</span></div></div>
          <div class="v366-goal"><i>💎</i><div><b>Koloss</b><span>${bossActive?(bossFree()?'Offen · Gratis':'Offen · 10 Harz'):'Geschlossen'}</span></div></div>
          <div class="v366-goal"><i>⭐</i><div><b>Erfolge</b><span>${ac.done}/${ac.total||'—'}</span></div></div>
        </div></article>

        ${bossCardHtml(bossActive)}

        <article class="v366-panel v366-feature book"><h2>Illegales Buch</h2><div class="v366-feature-art"></div><div class="v690-mini-status">⭐ ${ac.done}/${ac.total||'—'} Erfolge</div><button class="v366-go" data-book="1">Öffnen</button></article>

        <article class="v366-panel v366-feature forge vForge-home-card"><h2>Harzschmiede</h2><div class="v366-feature-art vForge-home-art"><span class="vForge-home-icon">🔨🌿</span></div><div class="v690-mini-status">Ausrüstung zerlegen · prismatisch schmieden</div><button class="v366-go" data-go="forge">Öffnen</button></article>

        ${eventCardHtml(ev)}

        <article class="v366-panel v366-feature v7129-referral-home-card">
          <h2>Freund werben</h2>
          <div class="v7129-referral-home-art" aria-hidden="true"><span>🤝</span><i>🌿</i></div>
          <div class="v690-mini-status">${Math.min(10,Number(window.__V7129_REFERRAL_STATE__?.qualified_count)||0)}/10 Freunde · je 25 Harz</div>
          <button class="v366-go" data-referral-open="1">Einladungen</button>
        </article>

        <article class="v366-panel v366-feature v6103-shop-card">
          <h2>Shop</h2>
          <div class="v6103-shop-art"><span>🧰</span></div>
          <div class="v690-mini-status">Händler & Ausrüstung</div>
          <button class="v366-go" data-go="shop">Öffnen</button>
        </article>
      </section>

      <div id="v492HomeGrowStatus" class="v492-home-grow" data-go="grow">
        <b>🌱 Growroom · ${gr} Pflanze${gr===1?'':'n'} wachsen</b>
        <small>Deine Pflanzen wachsen weiter, auch wenn du offline bist.</small>
      </div>

      <div class="v690-footer">
        <span>GOOD PLANTS<br>BETTER PLAYERS</span>
        <b>🌿 GROW LEGENDS 🌿</b>
        <span>STAY HIGH<br>PLAY LEGENDARY</span>
      </div>
    </div>`;
  }

  function finalizeOwnedWorld(world){
    if(!world)return false;
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
      const src=avatarSrc();
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

  function installWorld(force){
    const world=document.querySelector('#world');
    if(!world)return;
    const ev=events(),bossActive=worldBossEventActive();
    const sigParts=[
      playerName(),s?.playerClass,s?.level,s?.xp,s?.energy,s?.gold,s?.harzTaler,
      attr('staerke'),attr('ausdauer'),attr('geschick'),attr('intelligenz'),attr('glueck'),cp(),
      dungeonPos().d,dungeonPos().e,growReady(),petUnseen(),bossActive,ev.map(x=>`${x.t}:${x.s}`).join('|'),ach().done,homeChecklist().signature,Number(s?.tower?.season?.bestFloor)||0,Number(s?.tower?.season?.bestScore)||0,(s?.tower?.run?.active?Number(s.tower.run.floor)||1:0),window.v6239WeeklyChestSignature?.()||'',window.GL_WEATHER?.kind||'',window.GL_WEATHER?.label||'',Math.round(Number(window.GL_WEATHER?.temp)||0),window.GL_WEATHER?.bonus?.text||'',Number(window.__V7129_REFERRAL_STATE__?.qualified_count)||0,!!window.__V7129_REFERRAL_STATE__?.grand_claimed
    ];
    const sig=sigParts.join('~');

    /* V6.94: "force" is intentionally ignored when the visible world is already current.
       Even on a signature hit, finalize ownership so no historic sibling can survive. */
    const current=world.querySelector(':scope > .v366-world.v690-world');
    if(current && world.dataset.v366Sig===sig){finalizeOwnedWorld(world);return}
    /* HOME-14: an event-only change updates its two panels and counter without
       replacing the hero, navigation, weather or adventure cards. V366 remains
       the sole renderer and uses the same event functions for both paths. */
    const previous=String(world.dataset.v366Sig||'').split('~');
    if(current&&previous.length===sigParts.length&&sigParts.every((value,i)=>i===17||i===18||String(value??'')===previous[i])&&patchEventPanels(world,ev,bossActive,previous[17]==='true')){
      world.dataset.v366Sig=sig;
      finalizeOwnedWorld(world);
      return;
    }
    world.dataset.v366Sig=sig;
    diagnostics.fullRenders++;
    world.innerHTML=worldHtml();
    world.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const id=b.dataset.go;if(id!=='world')try{v032Go(id)}catch(e){}});
    world.querySelectorAll('[data-char-tab]').forEach(b=>b.onclick=()=>openCharacterTab(b.dataset.charTab));
    world.querySelectorAll('[data-pets]').forEach(b=>b.onclick=()=>{try{window.v686OpenPetAlbum?.()}catch(e){}});
    bindBossButtons(world);
    world.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>{try{if(typeof v106OpenBook==='function')v106OpenBook()}catch(e){}});
    world.querySelectorAll('[data-weekly-chest]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();try{window.v6239OpenWeeklyChest?.()}catch(err){console.warn('V6.239 weekly chest open',err)}});
    finalizeOwnedWorld(world);
  }

  window.v8009HomeEventDiagnostics=()=>({version:'V8.009-HOME-14',...diagnostics,events:events().map(x=>({...x})),worldBossActive:worldBossEventActive()});

  /* Re-own only the world installer; do not touch core game render/persist. */
  v085WorldHtml=worldHtml;
  v085InstallWorld=function(force){installWorld(!!force)};

  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    buildHeader();
    if(id==='world')requestAnimationFrame(()=>requestAnimationFrame(()=>installWorld(false)));
    return r;
  };

  function version(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version').forEach(el=>{if(el)el.textContent=V366_VERSION});
  }

  buildHeader();
  installWorld(false);
  version();
  document.addEventListener('DOMContentLoaded',()=>{buildHeader();installWorld(false);version()},{once:true});
  /* V7.156: delayed 400ms full home repaint retired; initial/DOMContentLoaded owner is sufficient. */
})();
