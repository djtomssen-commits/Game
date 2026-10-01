(function(){
  'use strict';
  const selectedByClass=window.__v543TalentBranchByClass||(window.__v543TalentBranchByClass=window.__v542TalentBranchByClass||{});
  const classLabel=()=>{try{return classes?.[s?.playerClass]?.name||({frost:'Frost-Todesritter'}[s?.playerClass])||String(s?.playerClass||'Klasse')}catch(e){return 'Klasse'}};
  const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const titleParts=b=>{
    const raw=String(b?.title||'').trim();
    const m=raw.match(/^(\S+)\s+(.+)$/u);
    return m?{icon:m[1],name:m[2]}:{icon:b?.icon||'🌿',name:raw||'Talent'};
  };
  const segIcons={
    wucht:['💥','💪','🪓','☠️','🌿','⚡','👑'],
    tank:['🛡️','🧱','❤️','🌿','💚','⛰️','👑'],
    rage:['🔥','🩸','⚔️','🌋','💢','😈','👑'],
    precision:['🎯','👁️','🏹','☠️','⚡','🍃','👑'],
    dodge:['🍃','💨','🪽','🌑','👻','🌀','👑'],
    salvo:['🏹','⚡','🎯','🌧️','🍃','🗡️','👑'],
    magic:['🔮','💨','⚡','💥','🌿','🧪','👑'],
    critmagic:['⚡','💥','✨','⛓️','💣','🌀','👑'],
    smoke:['🌫️','☠️','🛡️','🧪','💨','🌑','👑'],
    frostblade:['❄️','🗡️','💥','🧊','⚔️','🖤','👑'],
    iceguard:['🧊','🛡️','💙','🥶','🧱','💎','👑'],
    deathpact:['☠️','🩸','⚔️','👻','💀','🪦','👑']
  };
  const mileIcons={
    wucht:['⭐','💀','🌿','🩸','😡','🦬','👑'],
    tank:['⭐','🐕','💚','🛡️','⛰️','🌳','👑'],
    rage:['⭐','🩸','☠️','❤️‍🔥','😈','🔥','👑'],
    precision:['⭐','🎯','🏹','☠️','⚡','🌪️','👑'],
    dodge:['⭐','👻','🍃','🌑','🪽','💨','👑'],
    salvo:['⭐','⚡','🎯','🌧️','🏹','♾️','👑'],
    magic:['⭐','✨','💥','🧪','⚡','🔮','👑'],
    critmagic:['⭐','⚡','✨','💣','⛓️','🌀','👑'],
    smoke:['⭐','🌫️','☠️','🛡️','💨','🧪','👑'],
    frostblade:['⭐','❄️','💥','💙','🌪️','🖤','👑'],
    iceguard:['⭐','🦴','🧊','🥶','💎','🪦','👑'],
    deathpact:['⭐','🩸','⚔️','🖤','💀','🪦','👑']
  };
  function iconFor(branch,kind,i){
    if(kind==='m')return mileIcons[branch.id]?.[i]||(i===6?'👑':'⭐');
    return segIcons[branch.id]?.[i]||branch.icon||'🌿';
  }
  function branchId(){
    const cls=String(s?.playerClass||'');
    const branches=V314_BRANCHES?.[cls]||[];
    const current=selectedByClass[cls];
    return branches.some(b=>b.id===current)?current:(branches[0]?.id||'');
  }
  function select(id){
    const cls=String(s?.playerClass||'');
    const branches=V314_BRANCHES?.[cls]||[];
    if(!branches.some(b=>b.id===id))return;
    selectedByClass[cls]=id;
    renderTree();
  }
  window.v543SelectTalentBranch=select;
  window.v542SelectTalentBranch=select;

  function buttonLabelNormal(unlocked,maxed){
    if(maxed)return 'Max';
    if(!unlocked)return 'Gesperrt';
    return '+ Talentpunkt';
  }
  function buttonLabelMilestone(unlocked,rank,master){
    if(rank)return master?'Meistertalent aktiv':'Freigeschaltet';
    if(!unlocked)return 'Gesperrt';
    return master?'Meistertalent lernen':'Freischalten';
  }
  function headerMarkup(branches,active){
    const points=v314Available();
    const spent=v314Spent();
    const earned=v314Earned();
    const cls=classLabel();
    return `<div class="v543-head">
      <div class="v543-plaque">KLASSEN-SKILLS</div>
      <div class="v543-head-meta">
        <div class="v543-head-copy">
          <div class="v543-class-title"><span class="leaf">🌿</span> Talentbaum · ${esc(cls)}</div>
          <div class="v543-class-sub">1 Talentpunkt alle 2 Level · Meisterschaft bis Level 300</div>
          <div class="v543-earned">Verfügbar: <b>${points}</b> · Verteilt: <b>${spent}</b> / ${earned} verdient</div>
        </div>
        <div class="v543-points"><span>Talentpunkte</span><b>${points}</b></div>
      </div>
    </div>
    <nav class="v543-tabs" aria-label="Talentbäume">
      ${branches.map(b=>{const p=titleParts(b);return `<button type="button" class="v543-tab ${b.id===active?'active':''}" onclick="v543SelectTalentBranch('${b.id}')"><span class="v543-tab-icon">${esc(p.icon)}</span><span class="v543-tab-name">${esc(p.name)}</span></button>`}).join('')}
    </nav>`;
  }
  function normalNode(b,i){
    const rank=v314Rank(b.id,'s',i),max=V314_SEG_RANKS[i],unlocked=v314NodeUnlocked(b.id,'s',i),maxed=rank>=max;
    const prereq=!unlocked?`<div class="v543-lock v6257-prereq">${esc(v6257NormalTalentPrerequisite(b.id,i))}</div>`:'';
    const action=maxed?'':`<button class="btn secondary" onclick="v314Upgrade('${b.id}','s',${i})" ${!unlocked||v314Available()<1?'disabled':''}>${unlocked?'+ Talentpunkt':'Gesperrt'}</button>`;
    return `<article class="v543-node left normal ${unlocked?'':'locked'} ${rank?'active':''} ${maxed?'maxed':''}">
      <div class="v543-node-icon">${iconFor(b,'s',i)}</div>
      <div class="v543-node-head">
        <div class="v543-node-title"><div class="v543-node-name">${esc(b.seg[i])}</div><div class="v543-node-type">Talentknoten</div></div>
        <div class="v543-node-rank">${rank}/${max}</div>
      </div>
      ${v320PointInfo(b.id,i,rank,max)}
      ${prereq}
      ${action}
    </article>`;
  }
  function milestoneNode(b,i){
    const rank=v314Rank(b.id,'m',i),unlocked=v314NodeUnlocked(b.id,'m',i),master=i===6;
    const status=rank?`<div class="v543-state">${master?'Meistertalent aktiv':'Freigeschaltet'}</div>`:(!unlocked?`<div class="v543-lock">🔒 Level ${V314_LEVELS[i]} · ${V314_REQ[i]} Astpunkte</div>`:'');
    const action=rank?'':`<button class="btn ${master?'gold':'secondary'}" onclick="v314Upgrade('${b.id}','m',${i})" ${!unlocked||v314Available()<1?'disabled':''}>${unlocked?(master?'Meistertalent lernen':'Freischalten'):'Gesperrt'}</button>`;
    return `<article class="v543-node right milestone ${master?'master':''} ${unlocked?'':'locked'} ${rank?'active':''}">
      <div class="v543-node-icon">${iconFor(b,'m',i)}</div>
      <div class="v543-node-head">
        <div class="v543-node-title"><div class="v543-node-name">${esc(b.mile[i])}</div><div class="v543-node-type">${master?'Meistertalent':'Schlüsseltalent'}</div></div>
        <div class="v543-node-rank">${rank}/1</div>
      </div>
      <div class="v543-node-desc">${v314Desc(b.id,'m',i)}</div>
      ${status}
      ${action}
    </article>`;
  }
  function rowMarkup(b,i){
    return `<div class="v543-row">${normalNode(b,i)}<div class="v543-spine" aria-hidden="true"></div>${milestoneNode(b,i)}</div>`;
  }
  function renderTree(){
    const box=document.getElementById('skillTree');if(!box)return;
    const oldPoint=document.getElementById('skillPoints');if(oldPoint)oldPoint.textContent=v314Available();
    if(!s?.playerClass){box.innerHTML='<div class="empty" style="margin:10px">Wähle zuerst deine Klasse.</div>';return;}
    const branches=V314_BRANCHES?.[s.playerClass]||[];
    if(!branches.length){box.innerHTML='<div class="empty" style="margin:10px">Für diese Klasse ist noch kein Talentbaum verfügbar.</div>';return;}
    const activeId=branchId();
    selectedByClass[String(s.playerClass)]=activeId;
    const b=branches.find(x=>x.id===activeId)||branches[0];
    const bp=titleParts(b);
    const cost=Math.max(500,(Number(s.level)||1)*500);
    const rows=Array.from({length:7},(_,i)=>rowMarkup(b,i)).join('');
    const frostNote=String(s.playerClass)==='frost'?'<div class="v543-node-desc" style="margin:8px 8px 0;padding:7px 8px;border:1px solid #376d7c;border-radius:8px;background:#09151a;color:#9ed6e3"><b style="color:#d5f7ff">❄️ Frost-Todesritter</b> · Eigener Talentbaum mit Kältemarken, Barrieren und Seelenschnitten.</div>':'';
    box.innerHTML=headerMarkup(branches,b.id)+frostNote+`
      <section class="v543-banner" data-icon="${esc(bp.icon)}">
        <div><b>${esc(bp.name)}</b><span>${esc(b.theme)}</span></div>
        <div class="v543-branch-count">${v314BranchSpent(b.id)}/100 Punkte</div>
      </section>
      <div class="v543-tree"><div class="v543-tree-track">${rows}</div></div>
      <div class="v543-reset-wrap"><button type="button" class="btn secondary v543-reset" onclick="v314Reset()">↻ Reset · ${cost.toLocaleString('de-DE')} Gold</button></div>`;
  }
  window.v543RenderTalentTree=renderTree;
  try{renderSkillTree=renderTree;window.renderSkillTree=renderTree}catch(e){console.warn('V5.43 talent owner',e)}
  /* v459 owns when the visible talent tab is refreshed. */
})();
