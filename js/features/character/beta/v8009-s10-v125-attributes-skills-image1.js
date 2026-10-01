/* ===== V4.02 Bild 1 implementation ===== */
function v125Fmt(value){
  const n=Number(value)||0;
  return String(Math.round(n));
}
function v125PrimaryKey(){
  return s.playerClass==='scout'?'geschick':(s.playerClass==='bruiser'||s.playerClass==='summoner')?'intelligenz':'staerke';
}
const V125_ATTRS=[
  ['staerke','💪','Stärke','Erhöht deinen Schaden'],
  ['geschick','🎯','Geschick','Erhöht Präzision und Tempo'],
  ['intelligenz','🧠','Intelligenz','Erhöht Magieschaden'],
  ['ausdauer','❤️','Ausdauer','Erhöht deine Lebenspunkte'],
  ['glueck','🍀','Glück','Verbessert Krit-Chance & Beute'],

];
function v125RenderAttrs(){
  const box=document.querySelector('#attrs');if(!box)return;
  const primary=v125PrimaryKey();
  const ordered=[
    ...V125_ATTRS.filter(x=>x[0]===primary),
    ...V125_ATTRS.filter(x=>x[0]!==primary)
  ];
  box.innerHTML=ordered.map(([k,icon,name,desc])=>{
    const isPrimary=k===primary;
    return `<div class="v125-attr ${isPrimary?'primary':''}">
      <div class="v125-attr-icon">${icon}</div>
      <div>
        <div class="v125-attr-name">${name}</div>
        <div class="v125-attr-value">${v125Fmt(totalAttr(k))}</div>
        <div class="v125-attr-desc">${desc}</div>
      </div>
      <button type="button" onclick="incAttr('${k}')" ${s.points<1?'disabled':''} aria-label="${name} erhöhen">+</button>
    </div>`;
  }).join('');
}
function v125SkillType(index){
  if(index===0)return ['active','AKTIV'];
  if(index===1)return ['passive','PASSIV'];
  return ['special','SPEZIAL'];
}
function v125RenderSkills(){
  const box=document.querySelector('#skillTree');if(!box)return;
  const points=document.querySelector('#skillPoints');
  if(points)points.textContent=s.skillPoints||0;

  if(!s.playerClass){
    box.innerHTML='<div class="empty">Wähle zuerst deine Klasse.</div>';
    return;
  }

  const defs=skillDefs[s.playerClass]||[];
  box.innerHTML=defs.map((sk,index)=>{
    const r=skillRank(sk.id);
    const unlocked=s.level>=sk.unlock;
    const maxed=r>=5;
    const [typeCls,typeLabel]=v125SkillType(index);
    return `<div class="v125-skill ${typeCls} ${!unlocked?'locked':''} ${maxed?'maxed':''}">
      <span class="v125-skill-type">${typeLabel}</span>
      ${maxed?'<span class="v125-max-badge">★ MAX</span>':''}
      ${!unlocked?'<span class="v125-lock-watermark">🔒</span>':''}
      <div class="v125-skill-head">
        <div class="v125-skill-icon">${unlocked?sk.icon:'🔒'}</div>
        <div>
          <div class="v125-skill-name">${sk.name}</div>
          <div class="v125-skill-rank">${unlocked?`Rang ${r}/5`:`Freischaltung ab Level ${sk.unlock}`}</div>
        </div>
      </div>
      <div class="v125-skill-desc">${sk.desc}<br><b>${sk.perRank}</b></div>
      <div class="v125-skill-ranks">${[1,2,3,4,5].map(x=>`<span class="v125-rank ${r>=x?'on':''}"></span>`).join('')}</div>
      <div class="v125-skill-bottom">
        <span class="v125-skill-state">${!unlocked?`🔒 Level ${sk.unlock}`:maxed?'★ MAXIMAL':'✦ 1 Talentpunkt'}</span>
        <button class="btn secondary" onclick="upgradeSkill('${sk.id}')" ${!unlocked||maxed||(s.skillPoints||0)<1?'disabled':''}>
          ${maxed?'Maximal':'Verbessern'}
        </button>
      </div>
    </div>`;
  }).join('')+
  `<div class="v125-skill-info">ⓘ <b>Mehr Talentpunkte</b> bekommst du durch Levelaufstiege. Neue Klassen-Skills werden mit höheren Leveln freigeschaltet.</div>`;
}

/* V8.009: active attribute/talent ownership retired here.
   v4140 owns attributes and v543 owns the talent tree. */
