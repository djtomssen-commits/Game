(()=>{
  'use strict';
  if(window.__V6211_POPUP_RELIABILITY__)return;
  window.__V6211_POPUP_RELIABILITY__=true;

  const SOURCE_LABEL={grow:'🌱 Growroom',quest:'📜 Quest',elite:'🔴 Elite-Quest',dungeon:'👹 Dungeon',dungeon_boss:'👑 Dungeon-Boss',endgame:'🌀 Nebelriss',endgame_boss:'👑 Riss-Endboss',mythic_boss:'💎 Mystischer Boss'};
  let levelTimer=0;

  function visible(el){
    if(!el||!el.isConnected)return false;
    try{const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)!==0}catch(_){return true}
  }

  function levelFallback(oldLevel,newLevel){
    if(!(newLevel>oldLevel))return;
    const legacy=document.getElementById('v420LevelUpOverlay');
    if(visible(legacy))return;
    if(document.getElementById('v6211LevelUpFallback'))return;
    const gained=newLevel-oldLevel;
    const attrGain=gained*2;
    const talentGain=Math.max(0,Math.floor(newLevel/2)-Math.floor(oldLevel/2));
    const ov=document.createElement('div');
    ov.id='v6211LevelUpFallback';
    ov.innerHTML=`<div class="v6211-level-card"><div class="v6211-title">🎉 LEVEL UP!</div><div class="v6211-level">Level ${oldLevel} → ${newLevel}</div><div class="v6211-rewards"><b>+${attrGain} Attributpunkte</b>${talentGain?` · +${talentGain} Talentpunkt${talentGain===1?'':'e'}`:''}</div></div>`;
    document.body.appendChild(ov);
    clearTimeout(levelTimer);
    levelTimer=setTimeout(()=>ov.remove(),3800);
  }

  /* Final XP guard. Existing Level-Up code remains authoritative; this only
     creates a fallback if its overlay was not actually visible. */
  try{
    if(typeof addXp==='function'&&!addXp.__v6211PopupGuard){
      const base=addXp;
      const wrapped=function(){
        const oldLevel=Math.max(1,Number(s?.level)||1);
        const out=base.apply(this,arguments);
        const newLevel=Math.max(1,Number(s?.level)||1);
        if(newLevel>oldLevel)setTimeout(()=>levelFallback(oldLevel,newLevel),40);
        return out;
      };
      wrapped.__v6211PopupGuard=true;
      addXp=wrapped;
      try{window.addXp=wrapped}catch(_){}
    }
  }catch(e){console.warn('V6.211 level popup guard',e)}

  function petDef(id){
    try{return (window.v686PetDefinitions||[]).find(p=>String(p?.id||'')===String(id||''))||null}catch(_){return null}
  }
  function qualityDef(q){
    try{return (window.v686PetQualities||[]).find(x=>String(x?.id||'')===String(q||''))||null}catch(_){return null}
  }
  function petPopupVisible(){return visible(document.getElementById('v688PetPopup'))||visible(document.getElementById('v6211PetFallback'))}
  function acknowledgePending(pid,q){
    try{
      const a=s?.v686PetAlbum;if(!a||!Array.isArray(a.pendingFindPopups))return;
      a.pendingFindPopups=a.pendingFindPopups.filter(x=>!(String(x?.petId||'')===String(pid)&&String(x?.quality||'')===String(q)));
      try{persist(false)}catch(_){}
    }catch(_){}
  }
  function showPetFallback(pid,q,source){
    if(petPopupVisible())return;
    const p=petDef(pid),qd=qualityDef(q);
    if(!p)return;
    const ov=document.createElement('div');
    ov.id='v6211PetFallback';
    ov.style.setProperty('--v6211q',qd?.color||'#62d765');
    ov.innerHTML=`<div class="v6211-pet-card"><div class="v6211-kicker">🐾 NEUES PET GEFUNDEN</div><div class="v6211-icon">${p.emoji||'🐾'}</div><h3>${p.name||'Pet'}</h3><div class="v6211-quality">${qd?.label||q||''}</div><div class="v6211-source">Quelle: ${SOURCE_LABEL[source]||source||'Unbekannt'}</div><div class="v6211-body">Neue Qualitätsstufe für dein Sammelalbum wurde dauerhaft freigeschaltet.</div><div class="v6211-actions"><button type="button" data-v6211-close>Schließen</button><button type="button" class="primary" data-v6211-album>Zum Album</button></div></div>`;
    const close=(openAlbum)=>{acknowledgePending(pid,q);ov.remove();if(openAlbum)try{window.v686OpenPetAlbum?.()}catch(_){}};
    ov.querySelector('[data-v6211-close]').onclick=()=>close(false);
    ov.querySelector('[data-v6211-album]').onclick=()=>close(true);
    ov.addEventListener('click',e=>{if(e.target===ov)close(false)});
    document.body.appendChild(ov);
  }

  /* The V6.99 queue normally opens the popup immediately. This final wrapper
     only steps in if a successful new grant produced no visible popup. */
  try{
    if(typeof window.v686GrantPet==='function'&&!window.v686GrantPet.__v6211PopupGuard){
      const baseGrant=window.v686GrantPet;
      const wrappedGrant=function(pid,q,source){
        const existed=!!s?.v686PetAlbum?.found?.[pid]?.[q];
        const out=baseGrant.apply(this,arguments);
        const check=(ok)=>{
          const now=!!s?.v686PetAlbum?.found?.[pid]?.[q];
          if(!existed&&now&&ok!==false){
            setTimeout(()=>{if(!petPopupVisible())showPetFallback(pid,q,source)},220);
          }
          return ok;
        };
        return out&&typeof out.then==='function'?out.then(check):check(out);
      };
      wrappedGrant.__v6211PopupGuard=true;
      window.v686GrantPet=wrappedGrant;
    }
  }catch(e){console.warn('V6.211 pet popup guard',e)}

  /* If a popup was already pending from a previous interrupted render, let the
     existing recovery code get first chance, then fall back to the newest item. */
  function recoverPendingFallback(){
    setTimeout(()=>{
      if(petPopupVisible())return;
      try{
        const rows=s?.v686PetAlbum?.pendingFindPopups;
        if(!Array.isArray(rows)||!rows.length)return;
        const x=rows[rows.length-1];
        if(x?.petId&&x?.quality)showPetFallback(x.petId,x.quality,x.source||'');
      }catch(_){}
    },420);
  }
  window.addEventListener('growlegends:account-ready',recoverPendingFallback);
  window.addEventListener('pageshow',recoverPendingFallback,{passive:true});

  window.v6211PopupDiagnostics=()=>({
    levelOverlay:visible(document.getElementById('v420LevelUpOverlay'))||visible(document.getElementById('v6211LevelUpFallback')),
    petOverlay:petPopupVisible(),
    petPending:Array.isArray(s?.v686PetAlbum?.pendingFindPopups)?s.v686PetAlbum.pendingFindPopups.length:0,
    level:Number(s?.level)||1
  });
})();
