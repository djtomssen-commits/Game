
(function(){
  const VERSION='V4.29 Stable';

  function esc(v){
    return String(v??'')
      .replaceAll('&','&amp;').replaceAll('<','&lt;')
      .replaceAll('>','&gt;').replaceAll('"','&quot;');
  }

  function fmt(ms){
    ms=Math.max(0,Number(ms)||0);
    const total=Math.ceil(ms/1000);
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const sec=total%60;
    return h>0
      ?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      :`${m}:${String(sec).padStart(2,'0')}`;
  }

  function kindFor(q){
    const stored=String(q?.v392Kind||'');
    if(['fast','normal','hard'].includes(stored))return stored;

    /* Defensive fallback for older active saves created before V4.02. */
    const e=Math.max(0,Number(q?.energy)||0);
    if(e<=5)return 'fast';
    if(e>=7)return 'hard';
    return 'normal';
  }

  function typeLabel(kind){
    if(kind==='fast')return '⚡ SCHNELL';
    if(kind==='hard')return '☠️ SCHWER';
    return '🌿 NORMAL';
  }

  function activeHost(){
    const shell=document.querySelector('#quests .v386-shell');
    if(!shell)return null;
    let host=shell.querySelector('.v392-active-view');
    if(!host){
      host=document.createElement('div');
      host.className='v392-active-view';
      shell.appendChild(host);
    }
    return host;
  }

  function paintActive(){
    const root=document.querySelector('#quests');
    if(!root)return;

    const q=s.quests?.active||null;
    root.classList.toggle('v392-active-mode',!!q);

    const host=activeHost();
    if(!host)return;

    if(!q){
      host.innerHTML='';
      return;
    }

    const kind=kindFor(q);
    const left=Math.max(0,(Number(q.ends)||0)-Date.now());
    const done=left<=0;
    const xp=Math.max(0,Number(q.xp)||0);
    const gold=Math.max(0,Number(q.gold)||0);
    const energy=Math.max(0,Number(q.energy)||0);
    const title=q.name||q.title||'Aktiver Auftrag';
    const desc=q.text||q.description||q.desc||'Dein Auftrag läuft.';
    const tier=Math.max(1,Number(q.tier)||Number(s.level)||1);

    host.innerHTML=`
      <article class="v386-card ${kind}">
        <div class="v386-scene ${kind}">
          <div class="v386-scene-art"></div>
          <div class="v386-type">${typeLabel(kind)}</div>
          <div class="v386-title">${esc(title)}</div>
          <div class="v386-desc">${esc(desc)}</div>
        </div>

        <div class="v386-card-body">
          <div class="v392-active-head">
            <div class="v392-active-label">⏳ Aktiver Auftrag</div>
          </div>

          <div class="v386-meta">
            <div class="v386-box"><b>☠️ Stufe ${tier}</b><span>Queststufe</span></div>
            <div class="v386-box"><b>💨 ${energy} Dampf</b><span>Bezahlt</span></div>
            <div class="v386-box"><b>🎁 Belohnung</b><span>nach Timer</span></div>
          </div>

          <div class="v386-rewards">
            <div class="v386-box v386-reward xp"><b>EXP ${xp}</b><span>${typeof v094XpEventActive==='function'&&v094XpEventActive()?'×2 Event aktiv':'Belohnung'}</span></div>
            <div class="v386-box v386-reward"><b>${gold} Gold</b><span>${typeof v274GoldEventActive==='function'&&v274GoldEventActive()?'×2 Event aktiv':'Belohnung'}</span></div>
            <div class="v386-box v386-reward item"><b>20 %</b><span>Zufalls-Item</span></div>
          </div>

          <div class="v392-active-timer ${done?'done':''}">
            <span>${done?'Auftrag beendet':'Zeit bis zur Belohnung'}</span>
            <b id="v392QuestTimer">${done?'✅ Bereit zum Abholen':fmt(left)}</b>
          </div>

          ${done
            ?'<button type="button" class="v392-claim" id="v392ClaimQuest">🎁 Belohnung abholen</button>'
            :'<div class="v392-running-note">Die Belohnung kann abgeholt werden, sobald der Timer abgelaufen ist.</div>'
          }
        </div>
      </article>`;

    /*
      V4.02 already owns the approved artwork through these classes.
      Emptying the generated SVG lets the CSS artwork remain authoritative.
    */
    const art=host.querySelector('.v386-scene-art');
    if(art)art.innerHTML='';

    const claim=host.querySelector('#v392ClaimQuest');
    if(claim){
      claim.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
        if(typeof v233ClaimQuest==='function')return v233ClaimQuest();
        return claimQuest();
      };
    }
  }

  function tickActive(){
    const q=s.quests?.active;
    if(!q?.ends)return;

    const el=document.querySelector('#v392QuestTimer');
    if(!el)return;

    const left=Math.max(0,Number(q.ends)-Date.now());
    if(left>0){
      el.textContent=fmt(left);
      return;
    }

    /* Existing V4.02 timer owns the one-time completion repaint.
       We only request our view refresh if it has not painted the claim state yet. */
    if(!document.querySelector('#v392ClaimQuest')){
      paintActive();
    }
  }

  /* Direct hooks used by the canonical Quest owners. */
  window.v392PrepareStart=i=>{
    const q=s.quests?.offers?.[Number(i)];
    if(q && !s.quests?.active)q.v392Kind=['fast','normal','hard'][Number(i)]||'normal';
  };
  window.v392PaintActive=paintActive;

  /* Reuse the EXISTING one-second quest timer through one direct tick hook. */
  window.v392TickActive=tickActive;

  /* V7.122: duplicate quest-nav active paint retired; renderQuests owns it. */

  setTimeout(()=>{
    paintActive();
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  },650);
})();
