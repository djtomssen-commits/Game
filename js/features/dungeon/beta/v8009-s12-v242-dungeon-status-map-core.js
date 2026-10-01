/* ===== V4.02 visual status layer; no dungeon mechanics changed ===== */
function v242DungeonStatus(i){
  const d=dungeons?.[i];
  if(!d)return {state:'locked',icon:'🔒',label:'GESPERRT',badge:'lock',detail:'Dungeon nicht verfügbar.'};

  if(dungeonCompleted(i)){
    return {
      state:'completed',icon:'✓',label:'ABGESCHLOSSEN',badge:'done',
      detail:'Alle 10 Gegner besiegt · Dungeon versiegelt.'
    };
  }

  const levelOk=Number(s.level||0)>=Number(d.minLevel||0);
  const keyOk=!!dungeonUnlocked(i);

  if(levelOk && keyOk){
    const progress=Math.max(0,Math.min(9,Number(s.dungeon?.progress?.[i]??0)));
    return {
      state:i===Number(s.dungeon?.selected||0)?'current':'available',
      icon:'⚔',label:'OFFEN',badge:'open',
      detail:`Fortschritt ${progress}/10 · Bereit zum Betreten.`,
      progress:`${progress}/10`
    };
  }

  const missing=[];
  if(!levelOk)missing.push(`Level ${d.minLevel}`);
  if(!keyOk && i>0)missing.push(d.keyName||'Schlüsselstein');

  return {
    state:'locked',icon:'🔒',label:'GESPERRT',badge:'lock',
    detail:`Benötigt: ${missing.join(' + ')||'Freischaltung'}.`,
    progress:'🔒'
  };
}

function v242PaintDungeonWorldStatus(){
  const card=document.querySelector('.v065-worldmap-card');
  if(!card)return;

  const head=card.querySelector('.v065-worldmap-head');
  if(head && !card.querySelector('.v242-map-legend')){
    head.insertAdjacentHTML('afterend',`
      <div class="v242-map-legend">
        <div class="v242-legend-item done">✓ Abgeschlossen</div>
        <div class="v242-legend-item open">⚔ Offen</div>
        <div class="v242-legend-item lock">🔒 Gesperrt</div>
      </div>
    `);
  }

  card.querySelectorAll('[data-v065-dungeon]').forEach(node=>{
    const i=Number(node.dataset.v065Dungeon);
    const st=v242DungeonStatus(i);

    node.classList.remove('completed','available','current','locked');
    node.classList.add(st.state);
    node.setAttribute('aria-label',`Dungeon ${i+1}: ${dungeons[i]?.name||''} – ${st.label}`);

    let state=node.querySelector('.v242-node-state');
    if(!state){
      state=document.createElement('span');
      state.className='v242-node-state';
      node.appendChild(state);
    }
    state.textContent=st.icon;

    let progress=node.querySelector('.v242-node-progress');
    if(!progress){
      progress=document.createElement('span');
      progress.className='v242-node-progress';
      node.appendChild(progress);
    }
    progress.textContent=st.state==='completed'?'10/10':(st.progress||'🔒');
  });

  const selected=Math.max(0,Math.min(19,Number(s.dungeon?.selected)||0));
  const st=v242DungeonStatus(selected);
  const old=card.querySelector('.v065-world-info');

  if(old){
    old.classList.add('v242-status-panel');
    old.innerHTML=`
      <div class="v242-status-title">
        <span>Dungeon ${selected+1} · ${dungeons[selected].name}</span>
        <span class="v242-status-badge ${st.badge}">${st.icon} ${st.label}</span>
      </div>
      <div class="v242-status-reason">${st.detail}</div>
    `;
  }
}

/* Keep the existing V4.02/V4.02 renderer and interaction path intact. */
const v242BaseRenderWorld=v065RenderWorld;
v065RenderWorld=function(){
  const result=v242BaseRenderWorld();
  v242PaintDungeonWorldStatus();
  try{v067BindWorldMap()}catch(e){}
  return result;
};

setTimeout(()=>{
  try{
    if(document.querySelector('#dungeon')?.classList.contains('active') &&
       s.dungeon?.layer==='world'){
      v242PaintDungeonWorldStatus();
    }
  }catch(e){}

  
  const line=document.querySelector('#v141VersionLine');
},480);
