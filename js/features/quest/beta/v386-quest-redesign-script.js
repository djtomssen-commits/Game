
(function(){
  const VERSION='V4.29 Stable';

  function esc(s){
    return String(s??'')
      .replaceAll('&','&amp;').replaceAll('<','&lt;')
      .replaceAll('>','&gt;').replaceAll('"','&quot;');
  }

  function typeMeta(i){
    return [
      {cls:'fast',label:'⚡ SCHNELL',hint:'Schnell erledigt'},
      {cls:'normal',label:'🌿 NORMAL',hint:'Gute Belohnung'},
      {cls:'hard',label:'☠️ SCHWER',hint:'Große Gefahr'}
    ][i]||{cls:'normal',label:'🌿 NORMAL',hint:'Gute Belohnung'};
  }

  function getQuestCost(q){
    try{
      if(typeof v309QuestCost==='function')return Math.max(0,Number(v309QuestCost(q))||0);
      if(typeof questEnergyCost==='function')return Math.max(0,Number(questEnergyCost(q))||0);
    }catch(e){}
    return Math.max(0,Number(q?.energy)||0);
  }

  function getQuestSeconds(q){
    const sec=Math.max(1,Math.round(Number(q?.duration||q?.seconds||q?.time||60)));
    return sec;
  }

  function getReward(q,key){
    if(key==='xp') return Math.max(0,Number(q?.xp||q?.exp)||0);
    if(key==='gold') return Math.max(0,Number(q?.gold)||0);
    return 0;
  }

  function questTitle(q,i){
    return q?.title||q?.name||['Jagd auf die Riesentrauerfliege','Miras verschwundene Lieferung','Ungeziefer im Hinterhof'][i]||'Auftrag';
  }

  function questDesc(q,i){
    return q?.desc||q?.description||[
      'Eine riesige Trauerfliege kreist über den Dächern von Grünhain.',
      'Mira wartet auf eine Lieferung, die nie angekommen ist.',
      'Im Hinterhof frisst sich etwas durch die Beete.'
    ][i]||'Ein neuer Auftrag wartet auf dich.';
  }

  function recommended(q,i){
    const lvl=Math.max(1,Number(s?.level)||1);
    const base=[Math.max(1,lvl-7),lvl,Math.max(1,lvl+3)][i]||lvl;
    return Math.max(1,Number(q?.recommendedLevel)||base);
  }

  function startQuestByIndex(i){
    try{
      if(typeof window.startQuest==='function')return window.startQuest(i);
      if(typeof startQuest==='function')return startQuest(i);
    }catch(e){
      console.error('V4.02 quest start',e);
    }
  }

  function buildCard(q,i){
    const meta=typeMeta(i);
    const cost=getQuestCost(q);
    const sec=getQuestSeconds(q);
    const xp=getReward(q,'xp');
    const gold=getReward(q,'gold');
    const itemText='20 %';
    return `
      <article class="v386-card ${meta.cls}" data-v386-index="${i}">
        <div class="v386-scene ${meta.cls}">
          <div class="v386-scene-art"></div>
          <div class="v386-type">${meta.label}</div>
          <div class="v386-title">${esc(questTitle(q,i))}</div>
          <div class="v386-desc">${esc(questDesc(q,i))}</div>
        </div>
        <div class="v386-card-body">
          <div class="v386-meta">
            <div class="v386-box"><b>☠️ Stufe ${Math.max(1,Number(s?.level)||1)}</b><span>Deine Stufe</span></div>
            <div class="v386-box"><b>⏱️ ${Math.floor(sec/60)} Min ${String(sec%60).padStart(2,'0')} Sek</b><span>Dauer</span></div>
            <div class="v386-box"><b>💨 ${cost} Dampf</b><span>Kosten</span></div>
          </div>
          <div class="v386-rewards">
            <div class="v386-box v386-reward xp"><b>EXP ${xp}</b><span>${v094XpEventActive?.()?'×2 Event aktiv':'Belohnung'}</span></div>
            <div class="v386-box v386-reward"><b>${gold} Gold</b><span>${v274GoldEventActive?.()?'×2 Event aktiv':'Belohnung'}</span></div>
            <div class="v386-box v386-reward item"><b>${itemText}</b><span>Zufalls-Item</span></div>
          </div>
          <button class="v386-start" type="button" data-v386-start="${i}">Auftrag starten · 💨 ${cost}</button>
          <div class="v386-note">Empfohlen ab Stufe ${recommended(q,i)}</div>
        </div>
      </article>`;
  }

  function findQuestContainer(){
    return document.querySelector('#quests .quest-list')
      || document.querySelector('#quests #questList')
      || document.querySelector('#quests .quests-list')
      || document.querySelector('#quests .v009-quest-list')
      || document.querySelector('#quests');
  }

  function currentQuestSet(){
    try{
      if(Array.isArray(s?.quests?.offers) && s.quests.offers.length)return s.quests.offers.slice(0,3);
      if(Array.isArray(s?.quests?.available) && s.quests.available.length)return s.quests.available.slice(0,3);
      if(Array.isArray(s?.quests?.list) && s.quests.list.length)return s.quests.list.slice(0,3);
      if(Array.isArray(window.currentQuests) && window.currentQuests.length)return window.currentQuests.slice(0,3);
      if(Array.isArray(window.questOptions) && window.questOptions.length)return window.questOptions.slice(0,3);
    }catch(e){}
    return [0,1,2].map(i=>({title:['Jagd auf die Riesentrauerfliege','Miras verschwundene Lieferung','Ungeziefer im Hinterhof'][i],description:[
      'Eine riesige Trauerfliege kreist über den Dächern von Grünhain.',
      'Mira aus der Taverne wartet auf eine Kiste, die nie angekommen ist.',
      'Rudi meldet, dass sich etwas durch die Beete am Schwarzen Brett frisst.'
    ][i],energy:[5,6,7][i],duration:[38,61,94][i],xp:[587,752,1090][i],gold:[1334,1754,2632][i]}));
  }

  function hideOldQuestBlocks(){
    const root=document.querySelector('#quests');
    if(!root)return;
    root.querySelectorAll(
      '.v052-scene,.v038-location,.v041-npc,.scene-label,.v386-generated-old,'+
      '.quest-hero,.questgiver-card,.quest-intro,.v041-scene,.v052-banner'
    ).forEach(el=>{
      if(!el.closest('.v386-shell'))el.classList.add('v386-old-hidden');
    });
  }

  function install(){
    const root=document.querySelector('#quests');
    if(!root || root.querySelector('.v386-shell'))return;

    try{window.v392SyncActiveMode?.()}catch(_){}
    hideOldQuestBlocks();

    const shell=document.createElement('div');
    shell.className='v386-shell';
    shell.innerHTML=`
      <section class="v386-mira">
        <div class="v386-mira-art"></div>
        <div class="v386-mira-copy">
          <div class="v386-kicker">🌿 Zur krummen Gießkanne · Questgeberin</div>
          <div class="v386-mira-name">Mira</div>
          <div class="v386-bubble">Ich hab da ein paar Aufträge für dich. Wähle deinen Job und zeig, was du drauf hast!</div>
        </div>
        <div class="v386-tabs">
          <div class="v386-tab fast">⚡ SCHNELL<br><small>Schnell erledigt</small></div>
          <div class="v386-tab normal">🌿 NORMAL<br><small>Gute Belohnung</small></div>
          <div class="v386-tab hard">☠️ SCHWER<br><small>Große Gefahr</small></div>
        </div>
      </section>
      <div class="v386-list"></div>
    `;

    const target=findQuestContainer();
    if(target===root)root.prepend(shell);
    else target.parentNode.insertBefore(shell,target);

    renderCards();
  }

  function renderCards(){
    const list=document.querySelector('#quests .v386-list');
    if(!list)return;
    const qs=currentQuestSet();
    list.innerHTML=qs.slice(0,3).map((q,i)=>buildCard(q,i)).join('');
    list.querySelectorAll('[data-v386-start]').forEach(btn=>{
      btn.onclick=()=>{
        const i=Number(btn.dataset.v386Start)||0;
        startQuestByIndex(i);
      };
    });
  }

  window.v386RenderQuestShell=()=>{
    try{window.v392SyncActiveMode?.()}catch(_){}
    install();
    hideOldQuestBlocks();
    renderCards();
  };

  /* V7.122: duplicate quest-nav redesign pass retired; v6344 owns the final quest paint. */

  setTimeout(()=>{
    try{window.v392SyncActiveMode?.()}catch(_){}
    install();
    hideOldQuestBlocks();
    renderCards();
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  },550);
})();
