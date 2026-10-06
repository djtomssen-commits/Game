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

  /* ---------- 2. Legacy Grow-Skill migration ---------- */
  /* V8.172: global totalAttr wrapper retired. Attribute math must have one owner. */

  /* Attribute investment can never recreate the retired Grow-Skill. */
  const v327BaseIncAttr=typeof incAttr==='function'?incAttr:null;
  incAttr=function(k){
    if(k==='growSkill')return;
    if(v327BaseIncAttr)return v327BaseIncAttr(k);
  };

  function v327CleanAttributeUi(){
    /* V8.172: retired attribute DOM writer.
       v4140 is the sole Attribute renderer/number owner.
       This migration helper may only remove the retired Grow-Skill fragment. */
    const box=document.querySelector('#attrs');
    if(!box)return;
    [...box.children].forEach(el=>{
      if(/grow[\s-]*skill|🌱\s*grow/i.test(el.textContent||''))el.remove();
    });
  }

  /* V8.172: legacy v125 attribute renderer override retired.
     v4140 owns #attrs exclusively. */

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

  /* V8.009 Worldboss powerblock: attribute migration no longer wraps the
     global renderer. Clean only after account hydration and Character navigation. */
  const v327CleanLegacyGrowSkill=()=>{
    try{
      if(s.attrs && 'growSkill' in s.attrs)delete s.attrs.growSkill;
      v327CleanAttributeUi();
    }catch(e){}
  };
  window.addEventListener('growlegends:account-ready',v327CleanLegacyGrowSkill,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||e?.detail?.screen||'')==='character')v327CleanLegacyGrowSkill();
  },{passive:true});

  try{
    localStorage.setItem(KEY,JSON.stringify(s));
    v327CleanLegacyGrowSkill();
  }catch(e){console.error('V4.02 migration',e)}
  /* Confirmation DOM is created lazily on the first paid retry. */
})();
