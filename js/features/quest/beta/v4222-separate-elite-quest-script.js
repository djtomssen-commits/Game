
(function(){
  const CHANCE=6;
  let separating=false;

  function cloneQuest(q){
    try{return structuredClone(q)}catch(e){try{return JSON.parse(JSON.stringify(q))}catch(_){return {...q}}}
  }

  function normalTriplet(){
    const out=[];
    for(let i=0;i<3;i++){
      let q=null;
      try{q=makeQuest()}catch(e){console.error('V4.222 make normal quest',e)}
      if(!q)continue;
      try{delete q.v310Elite;delete q.v310EliteHarz;delete q.v310EliteItemName}catch(e){}
      out.push(q);
    }
    return out.length===3?out:null;
  }

  /* V310 originally turned one of the three normal offers into Elite.
     We move that exact rolled Elite into its own saved slot and immediately
     create a fresh NORMAL trio for the three normal cards. */
  function separateEliteFromOffers(){
    if(separating)return false;
    /* V7.127: on quest authority, elite_offer is already a dedicated server
       field. Never split/regenerate the canonical normal offer trio locally. */
    if(window.v7110QuestAuthorityEnforced?.())return false;
    const offers=s?.quests?.offers;
    if(!Array.isArray(offers)||!offers.length)return false;
    const eliteIndex=offers.findIndex(q=>q?.v310Elite);
    if(eliteIndex<0)return false;
    separating=true;
    try{
      s.quests.eliteOffer=cloneQuest(offers[eliteIndex]);
      const fresh=normalTriplet();
      if(fresh)s.quests.offers=fresh;
      else{
        /* Defensive fallback: keep the two normal offers and replace only the Elite. */
        const replacement=cloneQuest(offers.find(q=>!q?.v310Elite)||{});
        delete replacement.v310Elite;
        s.quests.offers=offers.slice(0,3).map((q,i)=>i===eliteIndex?replacement:q);
      }
      try{if(typeof v309EnsureCurrentOffers==='function')v309EnsureCurrentOffers()}catch(e){}
      try{if(typeof v271NormalizeQuestOffers==='function')v271NormalizeQuestOffers()}catch(e){}
      try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_) {}}
      return true;
    }finally{separating=false}
  }

  function questCost(q){
    try{if(typeof v271EffectiveQuestCost==='function'){const n=Number(v271EffectiveQuestCost(q));if(n>0)return n}}catch(e){}
    try{if(typeof v321QuestDampfBase==='function'){const n=Number(v321QuestDampfBase(q));if(n>0)return n}}catch(e){}
    return Math.max(1,Math.floor(Number(q?.energy)||1));
  }

  function esc(v){
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function renderElitePanel(){
    const root=document.querySelector('#quests');
    const shell=root?.querySelector('.v386-shell');
    if(!root||!shell)return;
    let box=shell.querySelector('.v4172-elite-info');
    if(!box){
      box=document.createElement('section');
      box.className='v4172-elite-info';
      const ref=shell.querySelector('.v387-refresh');
      if(ref)ref.before(box);else shell.appendChild(box);
    }

    const q=s?.quests?.eliteOffer||null;
    if(q?.v310Elite && !s?.quests?.active){
      const level=Math.max(1,Math.floor(Number(s.level)||1));
      if(!q.v6238EliteBalanced || Number(q.v6238EliteBalanceLevel)!==level){
        try{
          v6238ApplyEliteCurve(q,level);
          if(typeof v321QuestDampfBase==='function'){
            q.energy=v321QuestDampfBase(q,level);
            q.v321DampfBase=q.energy;
            q.v321DampfLevel=level;
          }
          persist(false);
        }catch(e){console.warn('V6.238 elite offer rebalance',e)}
      }
    }
    if(!q){
      box.classList.remove('v4222-has-elite');
      box.innerHTML=`<div class="v4172-elite-icon">👑</div><div><b>Elite-Quest</b><span>Nach einer erfolgreich abgeschlossenen Quest besteht die Chance auf einen zusätzlichen Elite-Auftrag.</span></div><b class="v4172-elite-chance">${CHANCE} % Chance</b>`;
      return;
    }

    const cost=questCost(q);
    const sec=Math.max(1,Math.round(Number(q.duration)||1));
    const eliteTime=sec>=3600?`${Math.floor(sec/3600)}:${String(Math.floor((sec%3600)/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`:`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
    const xp=Math.max(0,Math.round(Number(q.xp)||0));
    const gold=Math.max(0,Math.round(Number(q.gold)||0));
    const canStart=!s?.quests?.active && Math.max(0,Number(s?.energy)||0)>=cost;
    box.classList.add('v4222-has-elite');
    box.innerHTML=`
      <div class="v4172-elite-icon">👑</div>
      <div><b>Elite-Quest verfügbar!</b><span>Zusätzlicher Langzeitauftrag · länger und wertvoller als eine schwere Quest.</span></div>
      <b class="v4172-elite-chance v4222-hit">6 % TREFFER</b>
      <div class="v4222-elite-live">
        <div class="v4222-elite-name">${esc(q.title||q.name||'Elite-Auftrag')}</div>
        <div class="v4222-elite-desc">${esc(q.desc||q.description||q.text||'Ein seltener Elite-Auftrag wartet auf dich.')}</div>
        <div class="v4222-elite-stats">
          <div class="v4222-elite-stat"><b>⏱️ ${eliteTime}</b><span>Elite-Dauer</span></div>
          <div class="v4222-elite-stat"><b>💨 ${cost}</b><span>Dampf</span></div>
          <div class="v4222-elite-stat"><b>EXP ${xp}</b><span>Belohnung</span></div>
          <div class="v4222-elite-stat"><b>💰 ${gold}</b><span>Gold</span></div>
        </div>
        <div class="v4222-elite-guarantee">🎁 Garantiert: 1–3 Harz-Taler + gutes Item (Blau bis Episch)</div>
        <button type="button" class="v4222-elite-start" id="v4222StartElite" ${canStart?'':'disabled'}>🔴 Elite-Quest starten · 💨 ${cost}</button>
      </div>`;

    const btn=box.querySelector('#v4222StartElite');
    if(btn)btn.onclick=e=>{e.preventDefault();e.stopPropagation();startEliteQuest()};
  }

  window.v4222RenderElitePanel=renderElitePanel;

  function startEliteQuest(){
    if(s?.quests?.active)return;
    const q=s?.quests?.eliteOffer;
    if(!q)return;
    try{
      const level=Math.max(1,Math.floor(Number(s.level)||1));
      v6238ApplyEliteCurve(q,level);
      if(typeof v321QuestDampfBase==='function'){
        q.energy=v321QuestDampfBase(q,level);
        q.v321DampfBase=q.energy;
        q.v321DampfLevel=level;
      }
    }catch(e){console.warn('V6.238 elite start balance',e)}
    const regular=Array.isArray(s.quests.offers)?s.quests.offers.slice(0,3):[];
    s.quests.offers=regular.concat([q]);
    let result;
    try{
      if(typeof window.startQuest==='function')result=window.startQuest(3);
      else if(typeof startQuest==='function')result=startQuest(3);
    }catch(e){
      console.error('V4.222 elite start',e);
    }
    if(s?.quests?.active?.v310Elite){
      const role=String(s.quests.active.v310BaseRole||'normal');
      s.quests.active.v392Kind=role==='quick'?'fast':role==='heavy'?'hard':'normal';
      s.quests.eliteOffer=null;
      try{persist(false)}catch(e){}
    }else{
      /* Start failed (e.g. Dampf): restore exactly the three normal offers. */
      s.quests.offers=regular;
    }
    try{renderQuests()}catch(e){renderElitePanel()}
    return result;
  }

  function afterClaim(){
    const moved=separateEliteFromOffers();
    if(moved){
      try{renderQuests()}catch(e){}
    }
    renderElitePanel();
  }

  /* Migrate a save that was created by the old "Elite replaces one of 3" system. */
  try{separateEliteFromOffers()}catch(e){console.error('V4.222 migrate elite',e)}

  /* The visible claim button currently goes through v233ClaimQuest; wrap both
     paths safely because old screens can still call claimQuest directly. */
  try{
    if(typeof claimQuest==='function'&&!claimQuest.__v4222SeparateElite){
      const base=claimQuest;
      const wrapped=function(){
        const r=base.apply(this,arguments);
        if(r&&typeof r.then==='function')return r.finally(afterClaim);
        afterClaim();
        return r;
      };
      wrapped.__v4222SeparateElite=true;
      claimQuest=wrapped;window.claimQuest=wrapped;
    }
  }catch(e){console.error('V4.222 claim wrap',e)}

  try{
    if(typeof v233ClaimQuest==='function'&&!v233ClaimQuest.__v4222SeparateElite){
      const base=v233ClaimQuest;
      const wrapped=function(){
        const r=base.apply(this,arguments);
        if(r&&typeof r.then==='function')return r.finally(afterClaim);
        afterClaim();
        return r;
      };
      wrapped.__v4222SeparateElite=true;
      v233ClaimQuest=wrapped;window.v233ClaimQuest=wrapped;
    }
  }catch(e){console.error('V4.222 v233 claim wrap',e)}

  /* Starting ANY quest consumes the current offer batch, therefore an unused
     Elite offer disappears when the player chooses one of the three normals. */
  try{
    if(typeof window.startQuest==='function'&&!window.startQuest.__v4222EliteBatch){
      const base=window.startQuest;
      const wrapped=function(i){
        const r=base.apply(this,arguments);
        if(s?.quests?.active){
          s.quests.eliteOffer=null;
          try{persist(false)}catch(e){}
        }
        renderElitePanel();
        return r;
      };
      wrapped.__v4222EliteBatch=true;
      window.startQuest=wrapped;
      try{startQuest=wrapped}catch(e){}
    }
  }catch(e){console.error('V4.222 start wrap',e)}

  /* V8.009: delayed renderQuests wrapper/startup repaint retired.
     v6344 calls v4222RenderElitePanel directly in the canonical Quest paint. */
})();
