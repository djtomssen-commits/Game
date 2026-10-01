
(function(){
  const V349_VERSION='V4.29 Stable';
  const esc=v=>typeof v073Escape==='function'?v073Escape(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function name(){return String(s?.characterName||s?.playerName||s?.name||'Legende').trim()||'Legende'}
  function cls(){
    const c=String(s?.playerClass||'grower').toLowerCase();
    if(c==='scout'||c==='ranger')return ['SCHÜTZE','scout'];
    if(c==='bruiser'||c==='mage')return ['MAGIER','mage'];
    return ['BARBAR','barbar'];
  }
  function avatarMarkup(kind){
    /* Use the exact same real class artwork as the Character screen (V4.02/V4.02),
       not the old generated V4.02 SVG portrait. */
    try{
      if(typeof v080AvatarFor==='function'){
        const src=v080AvatarFor(s.playerClass);
        const alt=classes?.[s.playerClass]?.name || 'Grow Legends Charakter';
        if(src){
          return `<img class="v356-home-real-avatar" src="${src}" alt="${alt}" loading="eager" decoding="sync" fetchpriority="high">`;
        }
      }
    }catch(e){}

    /* Fallback only if the real avatar system is unavailable. */
    try{
      if(typeof v41ClassPortrait==='function')return v41ClassPortrait();
    }catch(e){}

    return kind==='scout'?'🏹':kind==='mage'?'🧙‍♂️':'🧔‍♂️';
  }
  function n(x){return Math.round(Number(x)||0).toLocaleString('de-DE')}
  function power(){try{return n(combatPower())}catch(e){return '0'}}
  function xpNeedSafe(){try{return Math.max(1,Number(xpNeed())||100)}catch(e){return Math.max(100,(Number(s?.level)||1)*100)}}
  function cap(){try{return typeof v271DampfCap==='function'?v271DampfCap():100}catch(e){return 100}}
  function dungeon(){
    try{
      if(typeof v081DungeonPosition==='function'){
        /* V4.02: v081DungeonPosition expects a dungeon-progress object.
           V4.02 called it without arguments, so it always fell back to Dungeon 1 / Gegner 1. */
        const localDp={
          completed:Array.isArray(s?.dungeon?.completed)?[...s.dungeon.completed]:[],
          progress:{...(s?.dungeon?.progress||{})}
        };
        const p=v081DungeonPosition(localDp,localDp.completed.length);
        return {d:Number(p.dungeonNumber)||1,e:Number(p.enemyNumber)||1};
      }
    }catch(e){}
    /* Safe canonical fallback: first unfinished dungeon, then its stored room. */
    const completed=new Set(
      (Array.isArray(s?.dungeon?.completed)?s.dungeon.completed:[])
        .map(Number)
        .filter(n=>Number.isInteger(n)&&n>=0&&n<20)
    );
    let d=0;
    while(d<20&&completed.has(d))d++;
    if(d>=20)return {d:20,e:10};
    const r=Math.max(0,Math.min(9,Number(s?.dungeon?.progress?.[d])||0));
    return {d:d+1,e:r+1};
  }
  function growReady(){
    const now=Date.now(), list=s?.grow?.plants||[];
    return list.filter(p=>{
      if(!p)return false;
      const end=Number(p.readyAt||p.endsAt||p.endAt)||((Number(p.start)||0)+(Number(p.duration)||0));
      return end>0&&now>=end;
    }).length;
  }
  function firstQuestDue(){return !s?.v109HarzDaily?.firstQuest}
  function dungeonFree(){try{return typeof freeDungeonReady==='function'?!!freeDungeonReady():true}catch(e){return true}}
  function bossFree(){try{if(typeof v110ResetDay==='function')v110ResetDay();return !s?.v110WorldBoss?.freeUsed}catch(e){return true}}
  function achievements(){
    let done=0,total=0;
    try{done=Object.keys(s?.v106Achievements?.done||{}).length}catch(e){}
    try{total=Array.isArray(V106_ACH)?V106_ACH.length:0}catch(e){}
    return {done,total};
  }
  function activeEvents(){
    const out=[];

    /* Use the established gameplay event helpers, not raw event-array inspection.
       These are the same functions that actually control the reward multipliers. */
    try{
      if(typeof v094XpEventActive==='function' && v094XpEventActive()){
        out.push({type:'purple',title:'⚡ 2× EXP EVENT',sub:'Doppelte Erfahrung aktiv'});
      }
    }catch(e){}

    try{
      if(typeof v274GoldEventActive==='function' && v274GoldEventActive()){
        out.push({type:'gold',title:'💰 2× GOLD EVENT',sub:'Doppelte Gold-Belohnungen aktiv'});
      }
    }catch(e){}

    try{
      if(typeof v271DampfEventActive==='function' && v271DampfEventActive()){
        out.push({type:'green',title:'🔥 300 DAMPF EVENT',sub:'300 Dampf Maximum aktiv'});
      }
    }catch(e){}

    try{
      if(typeof v110MysticEventActive==='function' && v110MysticEventActive()){
        out.push({type:'cyan',title:'💠 SMARAGD KOLOSS',sub:'Weltboss aktiv!'});
      }
    }catch(e){}

    return out.slice(0,4);
  }
  function eventHtml(){
    const ev=activeEvents();
    if(!ev.length)return '<div class="v349-event"><b>🌿 Keine Events</b><span>Aktuell kein Event aktiv</span></div>';
    return ev.map(x=>`<div class="v349-event ${x.type}"><b>${esc(x.title)}</b><span>${esc(x.sub)}</span></div>`).join('');
  }
  function html(){
    const c=cls(),need=xpNeedSafe(),xp=Math.max(0,Number(s?.xp)||0),pct=Math.max(0,Math.min(100,xp/need*100));
    const dg=dungeon(), gr=growReady(), ac=achievements();
    return `
    <div class="v349-home">
      <section class="v349-hero">
        <div class="v349-warrior" aria-hidden="true"></div>
        <div class="v349-profile">
          <div class="v349-profile-row"><div class="v349-avatar">${avatarMarkup(c[1])}</div><div><div class="v349-name">${esc(name())}</div><div class="v349-level">Stufe ${n(s?.level||1)} · <span class="v349-class">${c[0]}</span></div></div></div>
          <div class="v349-xptrack"><div class="v349-xpfill" style="width:${pct}%"></div></div>
          <div class="v349-xptext">${n(xp)} / ${n(need)} EXP</div>
          <div class="v349-power">⚔️ Kampfkraft <b>${power()}</b></div>
        </div>
        <div class="v349-events">${eventHtml()}</div>
        <div class="v349-welcome"><small>Willkommen zurück,</small><h1>${esc(name())}!</h1><p>Die Legende wächst weiter.</p></div>
      </section>

      <section class="v349-primary">
        <article class="v349-card quest"><div class="v349-art"></div><div class="v349-cardbody"><h2>Quests</h2><p>Dampf verbrauchen,<br>Belohnungen sichern!</p><div class="v349-status">🌿 <b>${n(s?.energy||0)} / ${cap()} Dampf</b></div><button class="v349-btn" data-go="quests">Zu den Quests</button></div></article>
        <article class="v349-card dungeon"><div class="v349-art"></div><div class="v349-cardbody"><h2>Dungeon</h2><p>Kämpfe dich durch<br>epische Dungeons!</p><div class="v349-status">⚔️ <b>Dungeon ${dg.d}<br>Gegner ${dg.e} / 10</b></div><button class="v349-btn" data-go="dungeon">Zum Dungeon</button></div></article>
        <article class="v349-card grow"><div class="v349-art"></div><div class="v349-cardbody"><h2>Growroom</h2><p>Ziehe mächtige Pflanzen<br>und ernte Erträge!</p><div class="v349-status">🌿 <b>${gr} Pflanze${gr===1?'':'n'}<br>erntereif</b></div><button class="v349-btn" data-go="grow">Zum Growroom</button></div></article>
      </section>

      <section class="v349-lower">
        <article class="v349-panel"><div class="v349-goals-title">Tagesziele</div><div class="v349-goals">
          <div class="v349-goal"><i>📜</i><div><b>Erste Quest des Tages</b><span>${firstQuestDue()?'+2 Harz-Taler':'Erledigt ✓'}</span></div></div>
          <div class="v349-goal"><i>⚔️</i><div><b>Dungeon-Versuch</b><span>${dungeonFree()?'kostenlos bereit':'Cooldown läuft'}</span></div></div>
          <div class="v349-goal"><i>💎</i><div><b>Smaragd Koloss</b><span>${bossFree()?'Gratisversuch verfügbar':'Versuch verbraucht'}</span></div></div>
          <div class="v349-goal"><i>⭐</i><div><b>Nächster Erfolg</b><span>${ac.done} / ${ac.total||'—'} Erfolge</span></div></div>
        </div></article>
        <article class="v349-panel v349-feature boss"><div class="v349-feature-art"></div><h2>Smaragd Koloss</h2><p>Weltboss aktiv!</p><div class="v349-status">${bossFree()?'Gratisversuch verfügbar':'Gratisversuch verbraucht'}</div><button class="v349-btn" data-boss="1">Zum Weltboss</button></article>
        <article class="v349-panel v349-feature book"><div class="v349-feature-art"></div><h2>Illegales Buch</h2><p>Erfolge sammeln,<br>Attribute verdienen!</p><div class="v349-status">⭐ <b>${ac.done} / ${ac.total||'—'} Erfolge</b></div><button class="v349-btn" data-book="1">Zum Buch</button></article>
      </section>

      <nav class="v349-dock">
        <button class="active" data-go="world"><span class="ico">🌿</span>Welt</button>
        <button data-go="character"><span class="ico">🎒</span>Inventar</button>
        <button data-go="character"><span class="ico">🛡️</span>Charakter</button>
        <button data-go="shop"><span class="ico">🏪</span>Händler</button>
        <button data-go="guild"><span class="ico">⚜️</span>Gilde</button>
        <button data-go="friends"><span class="ico">👥</span>Freunde</button>
        <button data-book="1"><span class="ico">📖</span>Illegales Buch</button>
      </nav>
    </div>`;
  }
  function signature(){
    const dg=dungeon(),a=achievements();
    return [name(),s?.level,s?.xp,s?.energy,s?.gold,s?.harzTaler,dg.d,dg.e,growReady(),a.done,dungeonFree(),bossFree(),firstQuestDue(),activeEvents().map(x=>x.title).join(',')].join('|');
  }
  function bind(world){
    world.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.go;
      if(id==='world')return;
      if(document.querySelector('#'+id))v032Go(id);
    });
    world.querySelectorAll('[data-boss]').forEach(b=>b.onclick=()=>{try{if(typeof v110Open==='function')v110Open()}catch(e){}});
    world.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>{try{if(typeof v106OpenBook==='function')v106OpenBook()}catch(e){}});
  }

  v085WorldHtml=function(){return html()};
  v085InstallWorld=function(force){
    const world=document.querySelector('#world');
    if(!world)return;
    const sig=signature();
    if(!force&&world.dataset.v349Signature===sig)return;
    world.dataset.v349Signature=sig;
    world.innerHTML=html();
    world.classList.add('v349-world-ready');
    bind(world);
  };

  try{v085InstallWorld(false)}catch(e){console.error('V4.02 world install',e)}
  function version(){document.querySelectorAll('.version').forEach(el=>el.textContent=V349_VERSION)}
  version();
  setTimeout(version,500);
})();
