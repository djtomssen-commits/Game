(function(){
  const VERSION='V4.67 Stable',SHORT='V4.67';
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  function enchantOf(it){return it?.enchant || (Array.isArray(it?.enchants)?it.enchants[0]:null) || null}
  function addonMap(it){
    const out={};
    if(it?.gem?.stat&&COMBAT.includes(it.gem.stat)){
      const v=Number(it.gem.value)||0;if(v)out[it.gem.stat]=(Number(out[it.gem.stat])||0)+v;
    }
    const e=enchantOf(it);
    if(e?.effect==='luck'){
      const v=Number(e.value)||0;if(v)out.glueck=(Number(out.glueck)||0)+v;
    }
    return out;
  }
  function nativeMap(it){
    if(it?.v429StatLock?.native&&typeof it.v429StatLock.native==='object'){
      const out={};COMBAT.forEach(k=>{const v=Number(it.v429StatLock.native[k])||0;if(v)out[k]=v});return out;
    }
    const add=addonMap(it),out={};
    COMBAT.forEach(k=>{const v=(Number(it?.bonus?.[k])||0)-(Number(add[k])||0);if(v)out[k]=v});
    return out;
  }
  function baseTotal(it){const m=nativeMap(it);return COMBAT.reduce((n,k)=>n+(Number(m[k])||0),0)}
  function fullTotal(it){return COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0)}
  function addonTotal(it){const a=addonMap(it);return COMBAT.reduce((n,k)=>n+(Number(a[k])||0),0)}
  function sanitize(txt){return String(txt??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  function compareState(it){
    if(!it?.slot||it.type==='material')return null;
    const old=s?.equipment?.[it.slot]||null;
    if(it.classId&&s?.playerClass&&it.classId!==s.playerClass){
      return {cls:'worse',mark:'⛔',diff:'Falsch',reason:'falsche Klasse'};
    }
    if(!old)return {cls:'free',mark:'▲',diff:'+?',reason:'Slot frei'};
    const newBase=baseTotal(it), oldBase=baseTotal(old), newFull=fullTotal(it), oldFull=fullTotal(old);
    const d=newFull-oldFull, baseDiff=newBase-oldBase, addDiff=addonTotal(it)-addonTotal(old);
    let cls='same',mark='◆',diff='±0',reason='gleichwertig';
    if(d>0){
      cls='better';mark='▲';diff='+'+d;
      if(baseDiff>0 && addDiff>0)reason='Basis + Sockel';
      else if(baseDiff>0 && addDiff<=0)reason='Basiswert besser';
      else if(baseDiff<=0 && addDiff>0)reason='durch Stein/Rolle';
      else reason='knapp besser';
    }else if(d<0){
      cls='worse';mark='▼';diff=String(d);
      if(baseDiff<0 && addDiff<0)reason='Basis + Sockel';
      else if(baseDiff<0 && addDiff>=0)reason='Basiswert schlechter';
      else if(baseDiff>=0 && addDiff<0)reason='wegen Stein/Rolle';
      else reason='knapp schlechter';
    }
    return {cls,mark,diff,reason};
  }

  function fixHeroStats(){
    /* On Beta, v515 owns visible Heldenquartier stats; do not repaint the
       old donor once the final stage exists. Keep fallback otherwise. */
    const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
    if(beta&&typeof window.v515PolishHero==='function'&&
       document.querySelector('#character #v510HeroRoot .v510-stats .combat-box'))return;
    const boxes=[...document.querySelectorAll('#character .v459-hero-bottom .combat-box')];
    boxes.forEach((box,i)=>{
      if(beta){
        box.classList.toggle('hp',i===0);
        box.classList.toggle('power',i===1);
      }else box.classList.remove('hp','power');
      const label=box.querySelector('span');
      if(!label)return;
      if(i===0){
        if(!beta)box.classList.add('hp');
        const markup='<em>❤️</em> Lebenspunkte';
        if(!beta||label.innerHTML!==markup)label.innerHTML=markup;
      }else if(i===1){
        if(!beta)box.classList.add('power');
        const markup='<em>⚔️</em> Kampfkraft';
        if(!beta||label.innerHTML!==markup)label.innerHTML=markup;
      }
    });
  }

  function paintInventoryIndicators(){
    const cards=[...document.querySelectorAll('#character #inventory .inventory-grid > .inv-item')];
    cards.forEach((card,i)=>{
      card.classList.remove('v460-better','v460-worse','v460-same','v460-free');
      const old=card.querySelector('.v460-compare-flag'); if(old) old.remove();
      const it=s?.inventory?.[i]; if(!it) return;
      const st=compareState(it); if(!st) return;
      card.classList.add('v460-'+st.cls);
      const flag=document.createElement('div');
      flag.className='v460-compare-flag';
      flag.innerHTML=`<span class="v460-diff">${sanitize(st.mark+' '+st.diff)}</span><span class="v460-reason">${sanitize(st.reason)}</span>`;
      card.appendChild(flag);
      const chk=card.querySelector('.v268-pick'); if(chk) chk.style.zIndex='3';
      const title=`${st.mark} ${st.diff} · ${st.reason}`;
      card.title=title;
      card.setAttribute('aria-label',`${it.name||'Item'}: ${title}`);
    });
  }

  function stampVersion(){
    try{
      const el=document.querySelector('header .version');
      if(el&&(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()!=='beta'||el.textContent!==VERSION))el.textContent=VERSION
    }catch(e){}
    try{document.title=document.title.replace(/V4\.59|V4\.60/g,'V4.67')}catch(e){}
  }

  function apply(){
    fixHeroStats();
    /* Character/Inventory cleanup Phase 3: V470 is the canonical inventory comparison owner.
       V460 now only keeps its hero-stat polish; it must not repaint item verdicts anymore. */
    stampVersion();
  }

  /* Character/Inventory cleanup Phase 3: V460 compact-inventory comparison wrapper retired; V470 owns it. */
  /* Character/Inventory cleanup Phase 3: V460 renderInventory comparison wrapper retired; V470 owns it. */
  /* V8.009: global render polish hook retired.
     Character navigation/pageshow own the remaining hero-stat polish. */
  let navTime={at:0,cpuMs:0};
  window.v460CharacterNavDiagnostics=()=>({...navTime});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')!=='character')return;
    const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
    const start=beta?(performance.now?.()||Date.now()):0;
    apply();
    if(beta)navTime={at:Date.now(),cpuMs:Math.round((performance.now?.()||Date.now())-start)};
  });
  window.__v460GoWrapped='v7119-event';

  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  /* One short fallback is enough; later inventory owners use targeted hooks. */
  setTimeout(apply,180);
  apply();
})();
