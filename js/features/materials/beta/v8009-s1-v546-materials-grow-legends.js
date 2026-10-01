(function(){
  'use strict';
  let activeType=window.__v546MaterialType||'gem';
  let activeQuality=window.__v546MaterialQuality||'all';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const qNorm=m=>{
    const raw=String(m?.quality||m?.rarity||'gray').toLowerCase();
    if(/myst|cyan|türkis|turkis/.test(raw))return 'cyan';
    if(/legend|orange/.test(raw))return 'orange';
    if(/epic|episch|purple|lila/.test(raw))return 'purple';
    if(/rare|selten|blue|blau/.test(raw))return 'blue';
    if(/uncommon|gewöhn|gewohn|green|grün|grun/.test(raw))return 'green';
    return 'gray';
  };
  const qLabel=q=>({gray:'Normal',green:'Gewöhnlich',blue:'Selten',purple:'Episch',orange:'Legendär',cyan:'Mystisch'}[q]||'Normal');
  const materialKey=m=>[m?.type||'',m?.name||'',qNorm(m),m?.stat||'',m?.effect||'',Number(m?.value)||0].join('|');
  const effectText=m=>{
    try{
      if(m?.type==='gem')return `+${Number(m.value)||0} ${typeof v030StatLabel==='function'?v030StatLabel(m.stat):String(m.stat||'Attribut')}`;
      return typeof v030EffectLabel==='function'?v030EffectLabel(m.effect,m.value):`${m.effect||'Effekt'} +${Number(m.value)||0}`;
    }catch(e){return m?.type==='gem'?`+${Number(m?.value)||0}`:`+${Number(m?.value)||0} Effekt`}
  };
  const artMarkup=m=>{
    try{
      const u=typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri(m):'';
      if(u)return `<img src="${esc(u)}" alt="${esc(m?.name||'Material')}" decoding="async">`;
    }catch(e){}
    return esc(m?.icon||(m?.type==='scroll'?'📜':'💎'));
  };
  function groups(){
    const out=[];
    const by=new Map();
    (Array.isArray(s?.materials)?s.materials:[]).forEach((m,index)=>{
      if(!m||!['gem','scroll'].includes(m.type))return;
      const key=materialKey(m);
      let g=by.get(key);
      if(!g){g={material:m,index,count:0,q:qNorm(m)};by.set(key,g);out.push(g)}
      g.count++;
    });
    return out;
  }
  function filtered(){
    return groups().filter(g=>g.material.type===activeType&&(activeQuality==='all'||g.q===activeQuality));
  }
  function header(){
    let h=document.getElementById('v546MaterialsHeader');
    if(!h){h=document.createElement('section');h.id='v546MaterialsHeader'}
    const total=(Array.isArray(s?.materials)?s.materials:[]).filter(m=>m&&['gem','scroll'].includes(m.type)).length;
    h.innerHTML=`
      <div class="v546-material-plaque"><span class="gem">💎</span><span>MATERIALIEN</span></div>
      <div class="v546-material-count">${total}</div>
      <div class="v546-type-tabs">
        <button type="button" class="v546-type-tab ${activeType==='gem'?'active':''}" data-type="gem"><span class="ico">💎</span><span>Edelsteine</span></button>
        <button type="button" class="v546-type-tab ${activeType==='scroll'?'active':''}" data-type="scroll"><span class="ico">📜</span><span>Schriftrollen</span></button>
      </div>`;
    h.querySelectorAll('.v546-type-tab').forEach(btn=>btn.onclick=()=>{
      activeType=btn.dataset.type||'gem';window.__v546MaterialType=activeType;
      renderMaterials();
    });
    return h;
  }
  function filters(){
    const qs=[['gray','Normal'],['green','Gewöhnlich'],['blue','Selten'],['purple','Episch'],['orange','Legendär'],['cyan','Mystisch']];
    return `<div class="v546-quality-row">${qs.map(([q,l])=>`<button type="button" class="v546-quality ${activeQuality===q?'active':''}" data-q="${q}">${l}</button>`).join('')}</div>`;
  }
  function card(g){
    const m=g.material,q=g.q;
    return `<article class="v546-material-item q-${q}">
      <div class="v546-material-qty">${g.count}×</div>
      <div class="v546-material-art">${artMarkup(m)}</div>
      <div class="v546-material-name">${esc(m.name||'Material')}</div>
      <div class="v546-rarity-badge">${qLabel(q)}</div>
      <div class="v546-material-bonus">${esc(effectText(m))}</div>
      <button type="button" class="btn v546-use" data-index="${g.index}">Auf Item anwenden</button>
    </article>`;
  }
  function emptySlot(i){
    const icon=activeType==='gem'?'💎':'📜';
    return `<div class="v547-empty-slot" aria-label="Freier Materialplatz"><div class="v547-slot-watermark">${icon}</div><div class="v547-slot-plus">+</div><div class="v547-slot-label">Platz für Material</div></div>`;
  }
  function emptyHint(){
    const hasType=groups().some(g=>g.material.type===activeType);
    const label=activeType==='gem'?'Edelsteine':'Schriftrollen';
    const icon=activeType==='gem'?'💎':'📜';
    const line=!hasType?`Noch keine ${label}.`:`Keine ${label} dieser Qualität.`;
    return `<div class="v547-empty-hint"><span>${icon}</span><b>${line}</b><em>Erbeute sie in Quests, Dungeons und bei Bossen.</em></div>`;
  }
  function arrange(){
    const panel=document.getElementById('v459PanelMaterials');if(!panel)return;
    const h=header();
    if(h.parentElement!==panel||panel.firstElementChild!==h)panel.insertBefore(h,panel.firstChild);
    const bar=document.getElementById('v480MaterialAutoBar');
    const card=document.getElementById('v030Materials');
    if(bar&&bar.parentElement===panel&&bar.previousElementSibling!==h)panel.insertBefore(bar,h.nextSibling);
    if(card&&card.parentElement===panel){
      const anchor=bar&&bar.parentElement===panel?bar:h;
      if(card.previousElementSibling!==anchor)panel.insertBefore(card,anchor.nextSibling);
    }
  }
  function renderMaterials(){
    let p=document.getElementById('v030Materials');
    const character=document.getElementById('character');
    if(!character)return;
    if(!p){p=document.createElement('div');p.id='v030Materials';p.className='card';character.appendChild(p)}
    p.classList.add('v546-material-card');
    const list=filtered();
    p.innerHTML=`
      <div class="v546-material-section-head">
        <div class="ico">${activeType==='gem'?'💎':'📜'}</div>
        <div><b>${activeType==='gem'?'Edelsteine':'Schriftrollen'}</b><span>${activeType==='gem'?'Attribute dauerhaft auf einem ausgerüsteten Item verstärken.':'Einen zusätzlichen Effekt auf ein ausgerüstetes Item legen.'}</span></div>
      </div>
      ${filters()}
      ${!list.length?emptyHint():''}
      <div class="v546-material-grid">${(()=>{const cards=list.map(card);const target=Math.max(6,Math.ceil(Math.max(cards.length,1)/3)*3);while(cards.length<target)cards.push(emptySlot(cards.length));return cards.join('')})()}</div>`;
    p.querySelectorAll('.v546-quality').forEach(btn=>btn.onclick=()=>{
      const q=btn.dataset.q||'all';activeQuality=activeQuality===q?'all':q;window.__v546MaterialQuality=activeQuality;renderMaterials();
    });
    p.querySelectorAll('.v546-use').forEach(btn=>btn.onclick=()=>{
      const i=Number(btn.dataset.index);if(Number.isInteger(i)&&i>=0)window.v030UseMaterial?.(i);
    });
    try{window.v480UpdateAutoBars?.()}catch(e){}
    arrange();
    try{window.v681EnhanceMaterials?.()}catch(e){}
    try{window.v683MaterialMultiSell?.enhance?.()}catch(e){}
    return p;
  }
  window.v546RenderMaterials=renderMaterials;
  window.v546ArrangeMaterials=arrange;
  try{v030Materials=renderMaterials;window.v030Materials=renderMaterials}catch(e){window.v030Materials=renderMaterials}
  try{v030RenderMaterials=renderMaterials;window.v030RenderMaterials=renderMaterials}catch(e){window.v030RenderMaterials=renderMaterials}

  /* Keep the final layout owner in sync after character layout changes. */
  try{
    if(typeof window.v459ArrangeCharacter==='function'&&!window.__v546ArrangeWrapped){
      const base=window.v459ArrangeCharacter;
      window.v459ArrangeCharacter=function(){const r=base.apply(this,arguments);arrange();return r};
      window.__v546ArrangeWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof window.v480UpdateAutoBars==='function'&&!window.__v546AutoBarsWrapped){
      const base=window.v480UpdateAutoBars;
      window.v480UpdateAutoBars=function(){const r=base.apply(this,arguments);arrange();return r};
      window.__v546AutoBarsWrapped=true;
    }
  }catch(e){}

  function apply(){
    if(!document.getElementById('character')?.classList.contains('active'))return false;
    try{renderMaterials();arrange()}catch(e){console.warn('V5.46 Materialien',e)}
  }
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')apply()});
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  /* Material tab switching only changes visibility. The material DOM is already
     rendered on character open; do not rebuild the full grid on every tab tap. */
  /* V8.009: bounded startup retry train retired. */
})();
