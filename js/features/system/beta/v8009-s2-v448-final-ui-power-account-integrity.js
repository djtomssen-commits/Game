(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  const LABEL={staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück'};
  const ID_PREFIX='growLegendsCharacterIdentity:';
  let trusted=null, identityBusy=false, powerPainting=false;

  function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function fmt(n){return Math.round(Number(n)||0).toLocaleString('de-DE')}
  function signed(n){n=Math.round(Number(n)||0);return n>0?'+'+n:String(n)}
  function diffClass(n){return n>0?'good':n<0?'bad':'even'}
  function enchantOf(it){return (Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant)||null}
  function normalizeItem(it){try{if(typeof v447ApplyItemCurve==='function')v447ApplyItemCurve(it)}catch(e){}return it}
  function nativeMap(it){
    normalizeItem(it);
    if(it?.v429StatLock?.native&&typeof it.v429StatLock.native==='object'){
      const out={};COMBAT.forEach(k=>{const v=Number(it.v429StatLock.native[k])||0;if(v)out[k]=v});return out;
    }
    const out={}, gem=it?.gem, ench=enchantOf(it);
    COMBAT.forEach(k=>{let v=Number(it?.bonus?.[k])||0;if(gem?.stat===k)v-=Number(gem.value)||0;if(k==='glueck'&&ench?.effect==='luck')v-=Number(ench.value)||0;if(v)out[k]=v});
    return out;
  }
  function nativeTotal(it){const m=nativeMap(it);return COMBAT.reduce((n,k)=>n+(Number(m[k])||0),0)}
  function pointExtrasTotal(it){normalizeItem(it);return Math.max(0,COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0)-nativeTotal(it))}
  function pointTotal(it){normalizeItem(it);return COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0)}

  function pointExtraLines(it){
    const p=[];
    if(it?.gem?.stat&&COMBAT.includes(it.gem.stat)&&Number(it.gem.value)){
      p.push(`💎 Stein: +${fmt(it.gem.value)} ${LABEL[it.gem.stat]||it.gem.stat}`);
    }
    const e=enchantOf(it);
    if(e?.effect==='luck'&&Number(e.value))p.push(`📜 Stat-Rolle: +${fmt(e.value)} Glück`);
    return p;
  }
  function specialLines(it){
    const p=[],e=enchantOf(it);
    if(e&&e.effect!=='luck'){
      const v=Number(e.value)||0;
      if(e.effect==='crit')p.push(`📜 Rolle: +${fmt(v)} % Krit-Chance`);
      else if(e.effect==='primaryPct')p.push(`📜 Rolle: +${fmt(v)} % Hauptattribut-Schaden`);
      else if(e.effect==='damageReduce')p.push(`📜 Rolle: -${fmt(v)} % erlittener Schaden`);
      else p.push(`📜 Rolle: Spezialeffekt`);
    }
    if(it?.mysticSpecial){
      let txt='Mystischer Spezialeffekt';
      try{if(typeof v296MysticSpecialText==='function')txt=v296MysticSpecialText(it)||txt}catch(e){}
      p.push(`✨ ${txt}`);
    }
    return p;
  }
  function extraHtml(it){
    const point=pointExtraLines(it), special=specialLines(it), all=[...point,...special];
    return all.length?all.map(x=>`<span class="v448-extra-text">${esc(x)}</span>`).join(''):'<span class="v448-extra-text v448-extra-none">Keine Extras</span>';
  }
  function pointSourceLabel(it){
    const a=[];
    if(it?.gem?.stat&&COMBAT.includes(it.gem.stat)&&Number(it.gem.value))a.push('Edelstein');
    const e=enchantOf(it);if(e?.effect==='luck'&&Number(e.value))a.push('Stat-Rolle');
    return a.join(' + ');
  }
  function verdict(baseDiff,finalDiff,newExtra,oldExtra,it,old){
    const newSrc=pointSourceLabel(it)||'Extras', oldSrc=pointSourceLabel(old)||'Extras';
    if(finalDiff>0){
      if(baseDiff<=0 && newExtra>oldExtra)return ['good','✅ BESSER',`Besser nur durch ${newSrc}`];
      if(baseDiff>0 && newExtra<oldExtra)return ['good','✅ BESSER',`Bessere Grundwerte – trotz ${oldSrc} am angelegten Item`];
      return ['good','✅ BESSER',baseDiff>0?'Besser durch Grundwerte':'Mit Extras insgesamt besser'];
    }
    if(finalDiff<0){
      if(baseDiff>0 && oldExtra>newExtra)return ['bad','❌ SCHLECHTER',`Grundwerte besser – angelegtes Item gewinnt durch ${oldSrc}`];
      if(newExtra>0)return ['bad','❌ SCHLECHTER',`Schlechter trotz ${newSrc}`];
      return ['bad','❌ SCHLECHTER','Schlechtere Grundwerte'];
    }
    if(baseDiff!==0)return ['even','⚪ GLEICH',`${newExtra>oldExtra?newSrc:oldSrc} gleicht den Grundwert-Unterschied aus`];
    return ['even','⚪ GLEICH','Gleiche Punktwerte'];
  }

  comparison=function(it){
    if(!it?.slot||it.type==='material')return '';
    normalizeItem(it);
    const old=s.equipment?.[it.slot]||null;
    const ib=nativeTotal(it), ie=pointExtrasTotal(it), itot=pointTotal(it), ilv=Math.max(1,Number(it.dropLevel)||1);
    const iSpecial=specialLines(it);
    if(!old){
      return `<div class="v448-itemcheck">
        <div class="v448-verdict free"><strong>🆓 FREIER SLOT</strong><span>Dieses Item kann direkt angelegt werden.</span></div>
        <div class="v448-block"><div class="v448-block-title">Grundwerte <small>ohne Stein / Stat-Rolle</small></div>
          <div class="v448-score"><span>Dieses Item</span><b>${fmt(ib)} Punkte</b></div>
        </div>
        <div class="v448-block"><div class="v448-block-title">Extras <small>Stein / Rolle</small></div>
          <div class="v448-extra-item"><b>Dieses Item</b>${extraHtml(it)}</div>
        </div>
        <div class="v448-block"><div class="v448-block-title">Mit Punkt-Extras <small>ohne Spezialeffekte</small></div>
          <div class="v448-score"><span>Gesamt</span><b>${fmt(itot)} Punkte</b></div>
        </div>
        ${iSpecial.length?'<div class="v448-special-note">ℹ️ Krit, Schadensreduktion, Hauptattribut-% und mystische Spezialeffekte werden separat angezeigt und nicht künstlich in Attributpunkte umgerechnet.</div>':''}
        <div class="v448-levels">Item Lv.${ilv}</div>
      </div>`;
    }
    normalizeItem(old);
    const ob=nativeTotal(old), oe=pointExtrasTotal(old), otot=pointTotal(old), olv=Math.max(1,Number(old.dropLevel)||1);
    const bd=ib-ob, fd=itot-otot, hasSpecial=iSpecial.length||specialLines(old).length;
    const [vc,vt,vr]=verdict(bd,fd,ie,oe,it,old);
    return `<div class="v448-itemcheck">
      <div class="v448-verdict ${vc}"><strong>${vt}</strong><span>${esc(vr)}</span></div>
      <div class="v448-block"><div class="v448-block-title">1. Grundwerte <small>ohne Stein / Stat-Rolle</small></div>
        <div class="v448-score"><span>Dieses Item</span><b>${fmt(ib)}</b></div>
        <div class="v448-score"><span>Angelegt</span><b>${fmt(ob)}</b></div>
        <div class="v448-score delta ${diffClass(bd)}"><span>Differenz</span><b>${signed(bd)}</b></div>
      </div>
      <div class="v448-block"><div class="v448-block-title">2. Extras <small>was macht den Unterschied?</small></div>
        <div class="v448-extra-item"><b>Dieses Item</b>${extraHtml(it)}</div>
        <div class="v448-extra-item"><b>Angelegt</b>${extraHtml(old)}</div>
      </div>
      <div class="v448-block"><div class="v448-block-title">3. Mit Stein / Stat-Rolle <small>Punktvergleich</small></div>
        <div class="v448-score"><span>Dieses Item</span><b>${fmt(itot)}</b></div>
        <div class="v448-score"><span>Angelegt</span><b>${fmt(otot)}</b></div>
        <div class="v448-score delta ${diffClass(fd)}"><span>Enddifferenz</span><b>${signed(fd)}</b></div>
      </div>
      ${hasSpecial?'<div class="v448-special-note">ℹ️ Spezialeffekte wie Krit-Chance, Schadensreduktion, Hauptattribut-% oder mystische Effekte sind wichtig, aber nicht fair in Attributpunkte umrechenbar. Sie stehen oben bei „Extras“ und sind nicht in der Enddifferenz enthalten.</div>':''}
      <div class="v448-levels">Dieses Lv.${ilv} · Angelegt Lv.${olv}</div>
    </div>`;
  };
  try{window.comparison=comparison}catch(e){}

  function repaintItems(){
    try{
      document.querySelectorAll('#inventory .inv-item').forEach((card,i)=>{
        const it=s.inventory?.[i],box=card.querySelector('.compare');
        if(!it||!box)return;
        const html=comparison(it);
        /* Idempotent repaint: do not rebuild identical DOM. This avoids waking old
           layout observers and keeps mobile rendering cheap. */
        if(box.innerHTML!==html)box.innerHTML=html;
      });
    }catch(e){console.warn('V4.49 item verdict repaint',e)}
  }
  window.v448RepaintItemVerdicts=repaintItems;

  /* Final power painter. A MutationObserver protects #charPower from older delayed
     renderers so the character page cannot drift from the global live value. */
  function livePower(){
    try{return Math.max(0,Math.round(Number(typeof v446CombatPower==='function'?v446CombatPower():combatPower())||0))}catch(e){return 0}
  }
  function setText(el,val){if(el&&el.textContent!==String(val))el.textContent=String(val)}
  function replacePowerText(el,cp){if(!el)return;const t=String(el.textContent||'');const n=t.replace(/Kampfkraft\s*[\d.]+/i,`Kampfkraft ${cp}`);if(n!==t)el.textContent=n}
  function paintPower(){
    if(powerPainting)return;powerPainting=true;
    try{
      const cp=livePower();
      ['#power','#charPower','#v358Power','#v110Cp'].forEach(sel=>setText(document.querySelector(sel),cp));
      document.querySelectorAll('.v349-power b,.v366-power b,.v251-detail-bottom .v251-mini-stat:first-child b').forEach(el=>setText(el,cp));
      replacePowerText(document.querySelector('#v209PlayerSub'),cp);
      const uid=uidNow();
      if(uid){
        document.querySelectorAll('.v072-player-row[data-profile-id]').forEach(row=>{
          if(String(row.getAttribute('data-profile-id')||'')!==uid)return;
          const sub=row.querySelector('.v072-player-sub');if(sub)replacePowerText(sub,cp);
        });
        document.querySelectorAll('#v072OwnProfile .v326-profile-stat,#v072OwnProfile .v072-profile-stat').forEach(box=>{
          if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');if(b)setText(b,cp)}
        });
        const openProfile=document.querySelector('#v074ProfileContent');
        if(openProfile&&String(openProfile.dataset.profileId||'')===uid){
          openProfile.querySelectorAll('.v326-profile-stat,.v072-profile-stat,.v074-power').forEach(box=>{
            if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');if(b)setText(b,cp)}
          });
        }
      }
    }finally{powerPainting=false}
  }
  window.v448PaintPower=paintPower;

  function uidNow(){try{return v073User?.id?String(v073User.id):''}catch(e){return ''}}
  function cleanName(x){try{return typeof v071CleanName==='function'?v071CleanName(x):String(x||'').trim()}catch(e){return String(x||'').trim()}}
  function validName(x){try{return typeof v071NameValid==='function'?v071NameValid(x):cleanName(x).length>=2}catch(e){return cleanName(x).length>=2}}
  function stateReadyForAccount(){
    const uid=uidNow();if(!uid)return false;
    try{return String(v075CloudLoadedFor||'')===uid && String(s?.__accountOwnerId||'')===uid}catch(e){return false}
  }
  function identityKey(uid){return ID_PREFIX+uid}
  function loadIdentity(uid){
    try{const x=JSON.parse(localStorage.getItem(identityKey(uid))||'null');return x&&x.userId===uid&&validName(x.name)?x:null}catch(e){return null}
  }
  function saveIdentity(x){try{localStorage.setItem(identityKey(x.userId),JSON.stringify(x))}catch(e){}}
  function applyTrusted(){
    const uid=uidNow();if(!trusted||trusted.userId!==uid||!stateReadyForAccount())return false;
    let changed=false;
    if(cleanName(s.characterName)!==trusted.name){s.characterName=trusted.name;changed=true}
    if(String(s.playerName||'')!==trusted.name){s.playerName=trusted.name;changed=true}
    if(String(s.name||'')!==trusted.name){s.name=trusted.name;changed=true}
    if(trusted.classId&&s.playerClass!==trusted.classId){s.playerClass=trusted.classId;changed=true}
    if(validName(trusted.name)&&!s.characterNameSet){s.characterNameSet=true;changed=true}
    s.__accountOwnerId=uid;s.social??={};s.social.playerId=uid;
    if(changed){
      try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
      try{if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal()}catch(e){}
      try{if(typeof v071ApplyNameToUi==='function')v071ApplyNameToUi()}catch(e){}
    }
    return changed;
  }
  window.v448ApplyTrustedIdentity=applyTrusted;

  async function reconcileIdentity(){
    if(identityBusy||!stateReadyForAccount())return false;
    const uid=uidNow();if(!uid)return false;
    identityBusy=true;
    try{
      /* V4.159: never resurrect identity from profiles or an old identity cache.
         Only a complete, already account-owned save may refresh the helper cache. */
      if(!s?.characterNameSet||!validName(s?.characterName)||!s?.playerClass){trusted=null;return false}
      trusted={userId:uid,name:cleanName(s.characterName),classId:s.playerClass||null,lockedAt:Date.now()};
      saveIdentity(trusted);
      return true;
    }finally{identityBusy=false}
  }
  window.v448ReconcileIdentity=reconcileIdentity;  window.v448ReconcileIdentity=reconcileIdentity;

  /* Block full profile writes while the generic browser state has not yet been
     resolved to THIS authenticated account. This closes the cross-account race. */
  if(typeof v073SyncProfile==='function'&&!window.__v448ProfileSyncGuard){
    const base=v073SyncProfile;
    v073SyncProfile=async function(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
      const uid=uidNow();
      if(uid&&!stateReadyForAccount())return false;
      if(uid&&stateReadyForAccount()){
        if(!trusted&&s.characterNameSet&&validName(s.characterName))await reconcileIdentity();
        applyTrusted();
      }
      return base.apply(this,arguments);
    };
    try{window.v073SyncProfile=v073SyncProfile}catch(e){}
    window.__v448ProfileSyncGuard=true;
  }

  /* Once an identity is locked to an account, every outgoing profile payload keeps
     that name/class even if an old delayed login repair briefly touches s.*. */
  if(typeof v073ProfilePayload==='function'&&!window.__v448PayloadIdentityGuard){
    const base=v073ProfilePayload;
    v073ProfilePayload=function(){
      applyTrusted();
      const p=base.apply(this,arguments)||{};
      if(trusted&&trusted.userId===uidNow()){
        p.character_name=trusted.name;
        if(trusted.classId)p.class_id=trusted.classId;
      }
      return p;
    };
    try{window.v073ProfilePayload=v073ProfilePayload}catch(e){}
    window.__v448PayloadIdentityGuard=true;
  }

  /* Capture/reconcile immediately after the authoritative account cloud resolver. */
  if(typeof v075ResolveCloudAfterLogin==='function'&&!window.__v448ResolveWrapped){
    const base=v075ResolveCloudAfterLogin;
    v075ResolveCloudAfterLogin=async function(){
      const r=await base.apply(this,arguments);
      if(r){await reconcileIdentity();applyTrusted()}
      return r;
    };
    try{window.v075ResolveCloudAfterLogin=v075ResolveCloudAfterLogin}catch(e){}
    window.__v448ResolveWrapped=true;
  }

  /* Correct the identity BEFORE v075WriteCloudSave takes its snapshot. Otherwise a
     transient old login repair could be serialized first and repaired only afterward. */
  if(typeof v075WriteCloudSave==='function'&&!window.__v448CloudWriteWrapped){
    const base=v075WriteCloudSave;
    v075WriteCloudSave=async function(force=false){
      if(stateReadyForAccount()){
        if(!trusted&&s.characterNameSet&&validName(s.characterName))await reconcileIdentity();
        applyTrusted();
      }
      return base.apply(this,arguments);
    };
    try{window.v075WriteCloudSave=v075WriteCloudSave}catch(e){}
    window.__v448CloudWriteWrapped=true;
  }

  /* New character creation reaches profile sync after name/class are selected;
     the guarded sync above captures the identity before the first server write. */

  function stamp(){}

  /* Character/Inventory cleanup Phase 3: legacy V448 item-verdict repaint retired.
     V470 owns item comparisons; V448 keeps only power + account integrity here. */
  if(typeof renderInventory==='function'&&!window.__v448InventoryWrapped){
    const base=renderInventory;renderInventory=function(){const r=base.apply(this,arguments);paintPower();applyTrusted();return r};
    try{window.renderInventory=renderInventory}catch(e){}window.__v448InventoryWrapped=true;
  }
  if(typeof render==='function'&&!window.__v448RenderWrapped){
    const base=render;render=function(){const r=base.apply(this,arguments);paintPower();applyTrusted();stamp();return r};
    try{window.render=render}catch(e){}window.__v448RenderWrapped=true;
  }
  if(typeof persist==='function'&&!window.__v448PersistWrapped){
    const base=persist;persist=function(){applyTrusted();const r=base.apply(this,arguments);paintPower();applyTrusted();return r};
    try{window.persist=persist}catch(e){}window.__v448PersistWrapped=true;
  }
  window.addEventListener('growlegends:navigation-open-v7119',()=>{paintPower();applyTrusted()});
  window.__v448GoWrapped='v7119-event';

  /* V4.49: never observe the whole character subtree. V4.48 did that and its
     callback repainted item HTML, which itself created another mutation and could
     starve the browser in an endless microtask loop during startup. Only watch the
     single Kampfkraft value; paintPower() is idempotent and never rewrites it when
     the value is already correct. */
  const charPowerNode=document.querySelector('#charPower');
  if(charPowerNode){
    let powerQueued=false;
    const mo=new MutationObserver(()=>{
      if(powerQueued)return;
      powerQueued=true;
      requestAnimationFrame(()=>{powerQueued=false;paintPower()});
    });
    mo.observe(charPowerNode,{subtree:true,childList:true,characterData:true});
  }

  paintPower();stamp();
  if(stateReadyForAccount())void reconcileIdentity();
  document.addEventListener('DOMContentLoaded',()=>{paintPower();stamp();if(stateReadyForAccount())void reconcileIdentity()},{once:true});
  window.addEventListener('pageshow',()=>{paintPower();applyTrusted();stamp();if(stateReadyForAccount())void reconcileIdentity()},{passive:true});
  setTimeout(()=>{paintPower();applyTrusted();stamp();if(stateReadyForAccount())void reconcileIdentity()},300);
  setTimeout(()=>{paintPower();applyTrusted();stamp()},900);
  setTimeout(()=>{paintPower();applyTrusted();stamp()},1900);
  setTimeout(()=>{paintPower();applyTrusted();stamp()},5200);
  /* V4.86: retired 20 s duplicate combat-power/identity polling guard. */
})();
