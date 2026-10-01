(function(){
  const VERSION='V4.32 Stable', SHORT='V4.32';
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  const LABEL={staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück'};

  function enchantOf(it){
    return it?.enchant || (Array.isArray(it?.enchants)?it.enchants[0]:null) || null;
  }
  function addonMap(it){
    const out={};
    if(it?.gem?.stat && COMBAT.includes(it.gem.stat)){
      const v=Number(it.gem.value)||0;
      if(v)out[it.gem.stat]=(Number(out[it.gem.stat])||0)+v;
    }
    const e=enchantOf(it);
    if(e?.effect==='luck'){
      const v=Number(e.value)||0;
      if(v)out.glueck=(Number(out.glueck)||0)+v;
    }
    return out;
  }
  function nativeMap(it){
    if(it?.v429StatLock?.native && typeof it.v429StatLock.native==='object'){
      const out={};COMBAT.forEach(k=>{const v=Number(it.v429StatLock.native[k])||0;if(v)out[k]=v});return out;
    }
    const add=addonMap(it),out={};
    COMBAT.forEach(k=>{
      const v=(Number(it?.bonus?.[k])||0)-(Number(add[k])||0);
      if(v)out[k]=v;
    });
    return out;
  }
  function sumMap(map){return COMBAT.reduce((n,k)=>n+(Number(map?.[k])||0),0)}
  function fullTotal(it){return COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0)}
  function baseTotal(it){return sumMap(nativeMap(it))}
  function addonTotal(it){return Math.max(0,fullTotal(it)-baseTotal(it))}
  function addonText(it){
    const parts=[];
    if(it?.gem?.stat && COMBAT.includes(it.gem.stat) && Number(it.gem.value)){
      parts.push(`💎 +${Number(it.gem.value)} ${LABEL[it.gem.stat]||it.gem.stat}`);
    }
    const e=enchantOf(it);
    if(e?.effect==='luck' && Number(e.value))parts.push(`📜 +${Number(e.value)} Glück`);
    return parts.join(' · ');
  }
  function hasSeparateSpecial(it){
    const e=enchantOf(it);
    return !!(it?.mysticSpecial || (e && e.effect!=='luck'));
  }
  function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  /* The comparison never changes item data. It only explains the already locked values. */
  comparison=function(it){
    if(!it?.slot)return '';
    const old=s.equipment?.[it.slot]||null;
    const ib=baseTotal(it), itot=fullTotal(it), ilv=Math.max(1,Number(it.dropLevel)||1);

    if(!old){
      const ia=addonText(it);
      return `<div class="v432-compare">
        <div class="v432-row"><b>Grundwerte</b><span>Dieses Item: ${ib}</span></div>
        <div class="v432-row"><b>Mit Sockel/Stat-Rolle</b><span>Dieses Item: ${itot}${addonTotal(it)?` (+${addonTotal(it)})`:''}</span></div>
        ${ia?`<div class="v432-addon">${esc(ia)}</div>`:''}
        <div class="v432-result better">▲ Freier Slot · Item Lv.${ilv}</div>
        ${hasSeparateSpecial(it)?'<div class="v432-special-note">✨ Spezialeffekte werden separat bewertet und sind nicht in diesen Attributpunkten enthalten.</div>':''}
      </div>`;
    }

    const ob=baseTotal(old), otot=fullTotal(old), olv=Math.max(1,Number(old.dropLevel)||1);
    const d=itot-otot, cls=d>0?'better':d<0?'worse':'same';
    const mark=d>0?'▲':d<0?'▼':'=';
    const signed=d>0?`+${d}`:String(d);
    const ia=addonText(it),oa=addonText(old);
    const addonLine=[ia?`Dieses: ${ia}`:'',oa?`Angelegt: ${oa}`:''].filter(Boolean).join(' · ');
    return `<div class="v432-compare">
      <div class="v432-row"><b>Grundwerte</b><span>Dieses ${ib} · Angelegt ${ob}</span></div>
      <div class="v432-row"><b>Mit Sockel/Stat-Rolle</b><span>Dieses ${itot} · Angelegt ${otot}</span></div>
      ${addonLine?`<div class="v432-addon">${esc(addonLine)}</div>`:''}
      <div class="v432-result ${cls}">${mark} ${signed} Attributpunkte · Lv.${ilv} vs Lv.${olv}</div>
      ${(hasSeparateSpecial(it)||hasSeparateSpecial(old))?'<div class="v432-special-note">✨ Spezialeffekte wie Wuchtschlag/Krit sind nicht in den Attributpunkten eingerechnet.</div>':''}
    </div>`;
  };

  function repaint(){
    [...document.querySelectorAll('#inventory .inv-item')].forEach((card,i)=>{
      const it=s.inventory?.[i],box=card.querySelector('.compare');
      if(it&&box)try{box.innerHTML=comparison(it)}catch(e){console.warn('V4.32 Vergleich',e)}
    });
  }
  function stamp(){}

  /* Existing renderers call the global comparison() function. Repaint once now,
     and after navigation so older version-label writers cannot win either. */
  repaint();stamp();
  /* Older compatibility blocks still contain historic version stamps. During the
     first seconds keep the visible label pinned to the current build, then stop. */ /* V4.123: removed useless late clear of already-fired one-shot timeout. */
  document.addEventListener('DOMContentLoaded',()=>{repaint();stamp()},{once:true});
  document.addEventListener('click',()=>setTimeout(()=>{repaint();stamp()},0),true);
  window.addEventListener('growlegends:account-ready',()=>{repaint();stamp()},{passive:true});
})();
