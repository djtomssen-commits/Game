/* ===== V4.02 redesigned world page ===== */

function v085Greeting(){
  const h=new Date().getHours();
  if(h<11)return 'Guten Morgen';
  if(h<17)return 'Guten Tag';
  if(h<22)return 'Guten Abend';
  return 'Willkommen zurück';
}

function v085PlayerName(){
  return String(s.characterName||s.character_name||'Legende').trim()||'Legende';
}

function v085ReturnText(){
  const key='growLegendsLastVisit:' + String((typeof v073User!=='undefined'&&v073User?.id)||s?.__accountOwnerId||'local');
  const now=Date.now();
  const last=Number(localStorage.getItem(key)||0);
  localStorage.setItem(key,String(now));

  if(!last)return 'Schön, dass du da bist.';
  const mins=Math.floor((now-last)/60000);
  if(mins<5)return 'Willkommen zurück.';
  if(mins<60)return `Zurück nach ${mins} Minuten.`;
  const hrs=Math.floor(mins/60);
  if(hrs<24)return `Zurück nach ${hrs} Stunde${hrs===1?'':'n'}.`;
  const days=Math.floor(hrs/24);
  return `Zurück nach ${days} Tag${days===1?'':'en'}.`;
}

function v085ActiveEvents(){
  /* Future event system can populate s.events.active.
     Until then, show a clean "none active" state instead of fake content. */
  const active=Array.isArray(s.events?.active)?s.events.active:[];
  if(active.length){
    return active.map(ev=>`
      <div class="v085-event-card">
        <div class="v085-event-title">${v073Escape(ev.name||'Event')}</div>
        <div class="v085-event-sub">${v073Escape(ev.description||'Zeitlich begrenztes Event.')}</div>
        <div class="v085-event-status">AKTIV</div>
      </div>`).join('');
  }
  return `
    <div class="v085-event-card">
      <div class="v085-event-title">Aktuell kein Event aktiv</div>
      <div class="v085-event-sub">Sobald ein Event startet, erscheint es hier direkt auf der Startseite.</div>
      <div class="v085-event-status">KEIN EVENT</div>
    </div>`;
}

function v085NewsHtml(){
  const news=[
    {
      v:'V4.02',
      title:'Händler-Vergleich',
      text:'Ausrüstungsitems beim Händler zeigen jetzt direkt, ob sie besser, schlechter oder gleichwertig zum aktuell angelegten Item sind.'
    },
    {
      v:'V4.02',
      title:'Charakteranzeige verbessert',
      text:'Die Hauptattribut-Anzeige im Charakterprofil wurde neu positioniert und übersichtlicher dargestellt.'
    },
    {
      v:'V4.02',
      title:'Neue Welt-Startseite',
      text:'Neue Begrüßung nach Tageszeit, aktive Events, Update-News, Schnellzugriffe und ein vollständigeres Menü.'
    },
    {
      v:'V4.02',
      title:'Hall of Haze verbessert',
      text:'Dungeon und Boss-Fortschritt anderer Spieler werden jetzt genauer angezeigt.'
    },
    {
      v:'V4.02',
      title:'Dungeon 1 neu ausbalanciert',
      text:'Der verseuchte Keller soll jetzt deutlich länger beschäftigen und bis etwa Level 22–25 fordern.'
    }
  ];
  return news.map(n=>`
    <div class="v085-news">
      <div class="v085-news-top">
        <div class="v085-news-title">${n.title}</div>
        <div class="v085-news-version">${n.v}</div>
      </div>
      <div class="v085-news-text">${n.text}</div>
    </div>`).join('');
}

function v085WorldHtml(){
  return `
    <div class="v085-dashboard">
      <div class="v085-welcome">
        <div class="v085-greeting">${v085Greeting()}, ${v073Escape(v085PlayerName())}</div>
        <div class="v085-sub">
          Dein Held wartet auf den nächsten Auftrag. Prüfe Events, Neuigkeiten und deinen Fortschritt.
        </div>
        <div class="v085-return">${v085ReturnText()}</div>
      </div>

      <div class="v085-section">
        <div class="v085-head">
          <h2>🎪 Aktive Events</h2>
          <span class="pill">LIVE</span>
        </div>
        ${v085ActiveEvents()}
      </div>

      <div class="v085-section">
        <div class="v085-head">
          <h2>📰 Update-News</h2>
          <span class="pill">NEU</span>
        </div>
        <div class="v085-news-list">${v085NewsHtml()}</div>
      </div>

      <div class="v085-section">
        <div class="v085-head"><h2>⚡ Schnellzugriff</h2></div>
        <div class="v085-quick-grid">
          <button class="v085-quick" data-v085-go="quests"><div class="ico">🍺</div><b>Quests</b><span>Aufträge starten</span></button>
          <button class="v085-quick" data-v085-go="dungeon"><div class="ico">👹</div><b>Dungeons</b><span>Gegner besiegen</span></button>
          <button class="v085-quick" data-v085-go="grow"><div class="ico">🌱</div><b>Growroom</b><span>Pflanzen & ernten</span></button>
          <button class="v085-quick" data-v085-go="shop"><div class="ico">🛒</div><b>Händler</b><span>Ausrüstung kaufen</span></button>
          <button class="v085-quick" data-v085-go="character"><div class="ico">🧙</div><b>Charakter</b><span>Werte & Ausrüstung</span></button>
          <button class="v085-quick" data-v085-go="hall"><div class="ico">🏆</div><b>Hall of Haze</b><span>Spieler & PvP</span></button>
        </div>
      </div>
    </div>`;
}

function v085InstallWorld(){
  if(window.__V483_MODERN_WORLD_ONLY__)return;
  const world=document.querySelector('#world');
  if(!world)return;

  /* Replace prior map/dashboard content only. */
  world.innerHTML=v085WorldHtml();
  world.classList.add('v146-world-ready');

  world.querySelectorAll('[data-v085-go]').forEach(btn=>{
    btn.onclick=()=>v032Go(btn.dataset.v085Go);
  });
}

/* Stop V4.02 from reinstalling its old world map. */
v032InstallWorldMap=function(){};

/* Make world navigation always use the new dashboard. */
/* V6.319: V085 world dashboard is historical only. Since MODERN_WORLD_ONLY is
   authoritative from preboot, its global navigation/render wrappers were inert
   compatibility hops. Keep helper functions for old callers, but do not extend
   v032Go/render and do not force an extra global startup render. */
