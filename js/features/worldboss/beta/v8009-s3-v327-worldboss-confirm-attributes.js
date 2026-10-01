(function(){
  /* ---------- 1. Grow-Skill completely retired ---------- */
  try{ if(s.attrs && 'growSkill' in s.attrs) delete s.attrs.growSkill; }catch(e){}

  function v327StripGrowBonus(it){
    if(!it || typeof it!=='object')return;
    if(it.bonus && typeof it.bonus==='object' && 'growSkill' in it.bonus)delete it.bonus.growSkill;
    if(it.baseBonusV055 && typeof it.baseBonusV055==='object' && 'growSkill' in it.baseBonusV055)delete it.baseBonusV055.growSkill;
  }
  try{
    (s.inventory||[]).forEach(v327StripGrowBonus);
    Object.values(s.equipment||{}).forEach(v327StripGrowBonus);
  }catch(e){}

  /* Legacy static shop templates must also stop creating Grow-Skill. */
  try{
    if(typeof items!=='undefined' && Array.isArray(items))items.forEach(v327StripGrowBonus);
  }catch(e){}
  try{
    if(typeof shopItems!=='undefined' && Array.isArray(shopItems))shopItems.forEach(v327StripGrowBonus);
  }catch(e){}

  /* ---------- 2. Canonical integer attribute owner ---------- */
  const v327BaseTotalAttr=totalAttr;
  totalAttr=function(k){
    if(k==='growSkill')return 0;
    return Math.round(Number(v327BaseTotalAttr(k))||0);
  };

  /* Attribute investment can never recreate the retired Grow-Skill. */
  const v327BaseIncAttr=typeof incAttr==='function'?incAttr:null;
  incAttr=function(k){
    if(k==='growSkill')return;
    if(v327BaseIncAttr)return v327BaseIncAttr(k);
  };

  function v327CleanAttributeUi(){
    const box=document.querySelector('#attrs');
    if(!box)return;

    [...box.children].forEach(el=>{
      if(/grow[\s-]*skill|🌱\s*grow/i.test(el.textContent||''))el.remove();
    });

    const labels={
      staerke:'Stärke',
      geschick:'Geschick',
      intelligenz:'Intelligenz',
      ausdauer:'Ausdauer',
      glueck:'Glück'
    };
    [...box.children].forEach(el=>{
      const txt=(el.textContent||'').toLowerCase();
      const key=Object.keys(labels).find(k=>txt.includes(labels[k].toLowerCase()));
      if(!key)return;
      const value=String(Math.round(Number(totalAttr(key))||0));
      const valueNode=el.querySelector('.v125-attr-value');
      if(valueNode)valueNode.textContent=value;
      const b=el.querySelector('b');
      if(b)b.textContent=value;
    });
  }

  /* Final attribute renderer: only the five combat attributes. */
  if(typeof v125RenderAttrs==='function'){
    v125RenderAttrs=function(){
      const box=document.querySelector('#attrs');if(!box)return;
      const primary=typeof v125PrimaryKey==='function'?v125PrimaryKey():
        (s.playerClass==='scout'?'geschick':(s.playerClass==='bruiser'||s.playerClass==='summoner')?'intelligenz':'staerke');
      const attrs=[
        ['staerke','💪','Stärke','Erhöht deinen Schaden'],
        ['geschick','🎯','Geschick','Erhöht Präzision und Tempo'],
        ['intelligenz','🧠','Intelligenz','Erhöht Magieschaden'],
        ['ausdauer','❤️','Ausdauer','Erhöht deine Lebenspunkte'],
        ['glueck','🍀','Glück','Verbessert Krit-Chance & Beute']
      ];
      const ordered=[...attrs.filter(x=>x[0]===primary),...attrs.filter(x=>x[0]!==primary)];
      box.innerHTML=ordered.map(([k,icon,name,desc])=>`
        <div class="v125-attr ${k===primary?'primary':''}">
          <div class="v125-attr-icon">${icon}</div>
          <div>
            <div class="v125-attr-name">${name}</div>
            <div class="v125-attr-value">${Math.round(Number(totalAttr(k))||0)}</div>
            <div class="v125-attr-desc">${desc}</div>
          </div>
          <button type="button" onclick="incAttr('${k}')" ${(Number(s.points)||0)<1?'disabled':''} aria-label="${name} erhöhen">+</button>
        </div>`).join('');
    };
  }

  /* Item text must no longer advertise the retired attribute. */
  const v327BaseItemBonus=typeof itemBonus==='function'?itemBonus:null;
  itemBonus=function(it){
    const bonus={...(it?.bonus||{})};
    delete bonus.growSkill;
    const names={staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück'};
    const parts=Object.entries(bonus).map(([k,v])=>`+${Math.round(Number(v)||0)} ${names[k]||k}`);
    if(parts.length)return parts.join(' · ');
    return v327BaseItemBonus?String(v327BaseItemBonus({...it,bonus:{}})||'').replace(/(?:^| · )\+?[\d.,]+\s*(?:Grow-Skill|Grow)(?= · |$)/gi,''):'';
  };

  /* ---------- 3. In-game confirmation before every paid Smaragd retry ---------- */
  function v327EnsureConfirm(){
    let ov=document.querySelector('#v327BossConfirm');
    if(ov)return ov;
    ov=document.createElement('div');
    ov.id='v327BossConfirm';
    ov.innerHTML=`
      <div class="v327-confirm-card">
        <div class="v327-confirm-icon">☠️🟢</div>
        <div class="v327-confirm-title">Smaragd-Koloss erneut herausfordern?</div>
        <div class="v327-confirm-text">Dein kostenloser Versuch wurde bereits verbraucht. Der Kampf startet erst nach deiner Bestätigung.</div>
        <div class="v327-confirm-cost">10 Harz-Taler verwenden?<br><span class="tiny">Aktuell: <b id="v327HarzNow">0</b> Harz-Taler</span></div>
        <div class="v327-confirm-actions">
          <button class="btn secondary" id="v327BossCancel">Abbrechen</button>
          <button class="btn gold" id="v327BossPay">10 Harz-Taler nutzen</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    return ov;
  }
  function v327AskBossRetry(){
    const ov=v327EnsureConfirm();
    const n=ov.querySelector('#v327HarzNow');if(n)n.textContent=Math.max(0,Number(s.harzTaler)||0);
    ov.classList.add('show');
    return new Promise(resolve=>{
      const cancel=ov.querySelector('#v327BossCancel');
      const pay=ov.querySelector('#v327BossPay');
      let finished=false;
      const done=(ok)=>{
        if(finished)return;finished=true;
        ov.classList.remove('show');
        cancel.onclick=null;pay.onclick=null;
        resolve(ok);
      };
      cancel.onclick=()=>done(false);
      pay.onclick=()=>done(true);
    });
  }

  /* Capture the current canonical V4.02/V4.02 fight. It deducts 10 Taler itself.
     For an approved retry we temporarily mark it free and deduct exactly once here. */
  const v327CanonicalFight=v110Fight;
  v110Fight=async function(){
    if(typeof v110MysticEventActive==='function' && !v110MysticEventActive())return v110Close?.();

    if(typeof v110ResetDay==='function')v110ResetDay();
    const wb=typeof v290EnsureWorldBossState==='function'
      ?v290EnsureWorldBossState()
      :(typeof v112EnsureWorldBossState==='function'?v112EnsureWorldBossState():s.v110WorldBoss);

    if(wb?.freeUsed){
      if((Number(s.harzTaler)||0)<10){
        if(typeof v063Toast==='function')v063Toast('Zu wenig Harz-Taler','warn','Ein weiterer Versuch gegen den Smaragd-Koloss kostet 10 Harz-Taler.');
        return;
      }

      const ok=await v327AskBossRetry();
      if(!ok)return;

      s.harzTaler=Math.max(0,(Number(s.harzTaler)||0)-10);
      const oldFree=wb.freeUsed;
      wb.freeUsed=false;
      try{
        const result=v327CanonicalFight.apply(this,arguments);
        wb.freeUsed=true;
        try{persist(false)}catch(e){}
        return result;
      }catch(e){
        wb.freeUsed=oldFree;
        s.harzTaler=(Number(s.harzTaler)||0)+10;
        throw e;
      }
    }

    return v327CanonicalFight.apply(this,arguments);
  };

  /* Final cleanup after every old renderer has run. */
  const v327BaseRender=render;
  render=function(){
    const r=v327BaseRender.apply(this,arguments);
    try{
      if(s.attrs && 'growSkill' in s.attrs)delete s.attrs.growSkill;
      v327CleanAttributeUi();
    }catch(e){}
    
    const line=document.querySelector('#v141VersionLine');
    return r;
  };

  try{
    localStorage.setItem(KEY,JSON.stringify(s));
    render();
  }catch(e){console.error('V4.02 migration',e)}
  setTimeout(v327EnsureConfirm,200);
})();
