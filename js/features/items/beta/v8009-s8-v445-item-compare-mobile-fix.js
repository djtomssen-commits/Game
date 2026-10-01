(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  const LABEL={staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück'};

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
  function bonusText(it){
    const p=[];
    if(it?.gem?.stat&&COMBAT.includes(it.gem.stat)&&Number(it.gem.value))p.push(`💎 +${Number(it.gem.value)} ${LABEL[it.gem.stat]||it.gem.stat}`);
    const e=enchantOf(it);
    if(e?.effect==='luck'&&Number(e.value))p.push(`📜 +${Number(e.value)} Glück`);
    return p.join(' · ');
  }
  function specialText(it){
    const p=[];
    const e=enchantOf(it);
    if(e&&e.effect!=='luck'){
      if(e.effect==='crit')p.push(`📜 +${Number(e.value)||0}% Krit`);
      else if(e.effect==='primaryPct')p.push(`📜 +${Number(e.value)||0}% Hauptattribut-Schaden`);
      else if(e.effect==='damageReduce')p.push(`📜 -${Number(e.value)||0}% erlittener Schaden`);
      else p.push(`📜 Spezialeffekt`);
    }
    if(it?.mysticSpecial)p.push('✨ Mystischer Spezialeffekt');
    return p.join(' · ');
  }
  function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  comparison=function(it){
    if(!it?.slot||it.type==='material')return '';
    const old=s.equipment?.[it.slot]||null;
    const ib=baseTotal(it), itot=fullTotal(it), ilv=Math.max(1,Number(it.dropLevel)||1);
    const iBonus=bonusText(it), iSpecial=specialText(it);

    if(!old){
      return `<div class="v445-compare">
        <div class="v445-title"><span>⚖️ Vergleich</span><span>Freier Slot</span></div>
        <div class="v445-lines">
          <div class="v445-line"><span>Dieses Item</span><b>${itot} Punkte</b></div>
          ${itot!==ib?`<div class="v445-line"><span>Grundwerte</span><b>${ib}</b></div>`:''}
        </div>
        ${iBonus?`<div class="v445-bonus">${esc(iBonus)}</div>`:''}
        <div class="v445-result up">▲ Kann direkt angelegt werden</div>
        <div class="v445-levels">Item Lv.${ilv}</div>
        ${iSpecial?`<div class="v445-special">${esc(iSpecial)} · separat bewertet</div>`:''}
      </div>`;
    }

    const ob=baseTotal(old), otot=fullTotal(old), olv=Math.max(1,Number(old.dropLevel)||1);
    const d=itot-otot;
    const cls=d>0?'up':d<0?'down':'same';
    const result=d>0?`▲ +${d} Punkte besser`:d<0?`▼ ${Math.abs(d)} Punkte schlechter`:'◆ Gleich stark';
    const oBonus=bonusText(old), oSpecial=specialText(old);
    const bonusParts=[];
    if(iBonus)bonusParts.push(`Dieses: ${iBonus}`);
    if(oBonus)bonusParts.push(`Angelegt: ${oBonus}`);
    const specials=[iSpecial,oSpecial].filter(Boolean);

    return `<div class="v445-compare">
      <div class="v445-title"><span>⚖️ Vergleich</span><span>${it?.slot?esc(String(it.slot).toUpperCase()):''}</span></div>
      <div class="v445-lines">
        <div class="v445-line"><span>Dieses Item</span><b>${itot} Punkte</b></div>
        <div class="v445-line"><span>Angelegt</span><b>${otot} Punkte</b></div>
        ${(itot!==ib||otot!==ob)?`<div class="v445-line"><span>Grundwerte</span><b>${ib} / ${ob}</b></div>`:''}
      </div>
      ${bonusParts.length?`<div class="v445-bonus">${esc(bonusParts.join(' · '))}</div>`:''}
      <div class="v445-result ${cls}">${result}</div>
      <div class="v445-levels">Dieses Lv.${ilv} · Angelegt Lv.${olv}</div>
      ${specials.length?`<div class="v445-special">✨ Spezialeffekte werden separat bewertet</div>`:''}
    </div>`;
  };
  try{window.comparison=comparison}catch(e){}

  /* Older inventory renderers already call comparison(). Repaint after their full
     chain as a final UI authority so delayed legacy painters cannot restore V4.32. */
  function repaint(){
    [...document.querySelectorAll('#inventory .inv-item')].forEach((card,i)=>{
      const it=s.inventory?.[i],box=card.querySelector('.compare');
      if(it&&box)try{box.innerHTML=comparison(it)}catch(e){console.warn('V4.45 item comparison',e)}
    });
  }
  window.v445RepaintItemComparison=repaint;
  /* Character/Inventory cleanup Phase 2: V445 render hooks retired.
     V470 is the later canonical comparison owner for inventory/equipment. */

  function stamp(){}
  repaint();stamp();
  document.addEventListener('DOMContentLoaded',()=>{repaint();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{repaint();stamp()},{passive:true});
  document.addEventListener('click',()=>setTimeout(repaint,0),true);
  setTimeout(()=>{repaint();stamp()},300);
  setTimeout(()=>{repaint();stamp()},1600);
  setTimeout(()=>{repaint();stamp()},5200); /* V4.123: removed useless late clear of already-fired one-shot timeout. */
})();
