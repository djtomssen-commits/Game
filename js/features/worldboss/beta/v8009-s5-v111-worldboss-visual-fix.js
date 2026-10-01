function v111BossArt(){
  return `<div class="v111-boss-scene" id="v111BossScene">
    <div class="v111-mist"></div>
    <div class="v111-ground-glow"></div><div class="v111-rune"></div>
    <div class="v111-colossus">
      <div class="v111-vine v1"></div><div class="v111-vine v2"></div>
      <div class="v111-arm left"><div class="v111-fist"></div></div>
      <div class="v111-arm right"><div class="v111-fist"></div></div>
      <div class="v111-body"></div>
      <div class="v111-head">
        <div class="v111-eye left"></div><div class="v111-eye right"></div><div class="v111-mouth"></div>
      </div>
      <div class="v111-crystal c1"></div><div class="v111-crystal c2"></div><div class="v111-crystal c3"></div>
    </div>
  </div>`;
}

/* Rebuild overlay with the unique artwork. */
v110EnsureOverlay=function(){
  let old=document.querySelector('#v110Overlay');
  if(old)old.remove();

  const ov=document.createElement('div');
  ov.id='v110Overlay';
  ov.className='v110-overlay';
  ov.innerHTML=`<div class="v110-panel">
    <div class="v110-head">
      <span class="v110-phase" id="v110Phase">MYSTISCHES EVENT</span>
      <h2>☠️ Der Smaragd-Koloss</h2>
      <p>Ein uralter Koloss aus schwarzem Gestein, lebenden Ranken und Smaragdkristallen. Seine Stärke wächst mit deinem Charakter.</p>
    </div>
    ${v111BossArt()}
    <div class="v110-bars">
      <div><div class="tiny">Smaragd-Koloss <span id="v110BossHpTxt"></span></div><div class="v110-bar v110-bossbar"><i id="v110BossHp"></i></div></div>
      <div><div class="tiny">Dein Held <span id="v110PlayerHpTxt"></span></div><div class="v110-bar v110-playerbar"><i id="v110PlayerHp"></i></div></div>
    </div>
    <div class="v110-stats">
      <div class="v110-stat">DEINE KAMPFKRAFT<b id="v110Cp">0</b></div>
      <div class="v110-stat">BOSS-STÄRKE<b>EXTREM</b></div>
      <div class="v110-stat">VERSUCHE<b id="v110Attempts">0</b></div>
    </div>
    <div class="v110-log" id="v110Log">Der Boden bebt. Der Smaragd-Koloss erwacht...</div>
    <div class="v110-actions">
      <button type="button" class="btn gold" id="v110Fight">⚔️ Weltboss angreifen</button>
      <button type="button" class="btn secondary" data-v111-closeboss>Zurück</button>
    </div>
    <div class="tiny" id="v110Cost" style="text-align:center;margin-top:8px"></div>
  </div>`;
  document.body.appendChild(ov);
};

/* Strong open path: no inline function dependency. */
function v111OpenWorldBoss(){
  if(!v110MysticEventActive()){
    if(typeof v063Toast==='function')v063Toast('Kein mystisches Event aktiv','warn','Der Weltboss ist derzeit versiegelt.');
    return;
  }

  try{
    v110ResetDay();
    v110EnsureOverlay();
    v110Refresh();

    const overlay=document.querySelector('#v110Overlay');
    if(!overlay)throw new Error('Weltboss-Fenster konnte nicht erstellt werden.');

    overlay.classList.add('show');

    const fight=document.querySelector('#v110Fight');
    if(fight)fight.onclick=v110Fight;
  }catch(e){
    console.error('V4.02 worldboss open',e);
    if(typeof v063Toast==='function')v063Toast('Weltboss-Fehler','error',e.message||'Öffnen fehlgeschlagen');
  }
}

/* Dedicated permanent card on the world page while the event is active. */
function v111InstallWorldBossCard(){
  if(window.__V483_MODERN_WORLD_ONLY__){document.querySelector('#v111WorldBossCard')?.remove();document.querySelector('#v118WorldBossHero')?.remove();return;}
  const world=document.querySelector('#world');
  if(!world)return;

  document.querySelector('#v110WorldBossBtn')?.remove();

  let card=document.querySelector('#v111WorldBossCard');

  if(!v110MysticEventActive()){
    card?.remove();
    return;
  }

  if(!card){
    card=document.createElement('div');
    card.id='v111WorldBossCard';
    card.className='v111-worldboss-card';
    card.innerHTML=`
      <div class="v111-worldboss-title">☠️ Mystischer Weltboss: Smaragd-Koloss</div>
      <div class="v111-worldboss-text">
        Extrem schwer · skaliert mit deinem Charakter · 1 kostenloser Versuch täglich · garantierte mystische Beute bei Sieg.
      </div>
      <button type="button" class="btn v110-event-btn" data-v111-openboss>
        🔷 SMARAGD-KOLOSS HERAUSFORDERN
      </button>`;

    const events=world.querySelector('.v085-section');
    if(events)events.insertAdjacentElement('afterend',card);
    else world.prepend(card);
  }
}

/* Delegated listeners survive every world re-render. */
document.addEventListener('click',e=>{
  const open=e.target.closest('[data-v111-openboss]');
  if(open){
    e.preventDefault();
    e.stopPropagation();
    v111OpenWorldBoss();
    return;
  }

  if(e.target.closest('[data-v111-closeboss]')){
    e.preventDefault();
    document.querySelector('#v110Overlay')?.classList.remove('show');
  }
},true);

/* Phase artwork follows combat state. */
const v111OldFight=v110Fight;
v110Fight=function(){
  const result=v111OldFight();

  const watch=setInterval(()=>{
    const phase=(document.querySelector('#v110Phase')?.textContent||'');
    const scene=document.querySelector('#v111BossScene');
    if(!scene){clearInterval(watch);return}

    scene.classList.toggle('phase2',phase.includes('RASEREI'));
    scene.classList.toggle('phase3',phase.includes('LETZTE'));

    const btn=document.querySelector('#v110Fight');
    if(btn && !btn.disabled)clearInterval(watch);
  },150);

  return result;
};

/* Disable old fragile button installer; use dedicated card instead. */
v110InstallEventButton=function(){v111InstallWorldBossCard()};

const v111BaseRender=render;
render=function(){
  const result=v111BaseRender();
  
  if(!window.__V483_MODERN_WORLD_ONLY__)requestAnimationFrame(v111InstallWorldBossCard);
  return result;
};

/* V4.86: retired old-world Smaragd-Koloss card installer. The modern V4.366
   home already owns the boss entry; combat/overlay functions remain active. */
