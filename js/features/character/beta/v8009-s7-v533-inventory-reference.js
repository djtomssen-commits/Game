(function(){
  'use strict';
  let applying=false;
  let filter='all';

  function category(it){
    const slot=String(it?.slot||'').toLowerCase();
    if(slot==='weapon')return'weapon';
    if(['head','body','boots','offhand'].includes(slot))return'armor';
    if(['ring','amulet'].includes(slot))return'jewelry';
    return'other';
  }

  function ensureHeader(card){
    let head=card.querySelector(':scope > .v533-inv-head');
    if(!head){
      head=document.createElement('header');
      head.className='v533-inv-head';
      head.innerHTML='<div class="v533-inv-title-wrap"><h2 class="v533-inv-title">INVENTAR</h2><div class="v533-inv-sub">DEINE AUSRÜSTUNG · ITEMS · SAMMELSTÜCKE</div></div><div class="v533-inv-count">0 Items</div>';
      card.prepend(head);
    }
    const count=head.querySelector('.v533-inv-count');
    const n=Array.isArray(s?.inventory)?s.inventory.length:0;
    if(count)count.textContent=`${n} Item${n===1?'':'s'}`;
    return head;
  }

  function ensureAuto(card,head){
    let bar=card.querySelector(':scope > .v533-auto-equip');
    if(!bar){
      bar=document.createElement('div');
      bar.className='v533-auto-equip';
      bar.innerHTML='<div class="v533-auto-copy"><b>⚡ Automatische Ausrüstung</b><span>Prüft dein Inventar auf echte Verbesserungen.</span></div><button type="button" class="v533-auto-btn">⚡ Beste Ausrüstung anlegen</button>';
      head.insertAdjacentElement('afterend',bar);
      bar.querySelector('button').addEventListener('click',()=>{try{window.v480AutoEquip?.()}catch(e){console.warn('V5.33 auto equip',e)}});
    }
    return bar;
  }

  function syncAuto(bar){
    const original=document.getElementById('v480EquipAutoBar');
    const src=original?.querySelector('.v480-auto-copy span');
    const srcBtn=original?.querySelector('button');
    const sub=bar?.querySelector('.v533-auto-copy span');
    const btn=bar?.querySelector('.v533-auto-btn');
    if(sub&&src?.textContent)sub.textContent=src.textContent.trim();
    if(btn){
      const disabled=!!srcBtn?.disabled;
      btn.disabled=disabled;
      btn.dataset.upgradeAvailable=disabled?'false':'true';
      if(srcBtn?.textContent)btn.textContent=srcBtn.textContent.trim();
      if(disabled&&!String(btn.textContent||'').includes('optimal'))btn.textContent='✓ Ausrüstung optimal';
    }
  }

  function ensureFilters(grid,sellbar){
    let filters=grid.querySelector(':scope > .v533-inv-filters');
    if(!filters){
      filters=document.createElement('div');filters.className='v533-inv-filters';
      filters.innerHTML='<button type="button" class="v533-filter" data-v533-filter="all">Alle</button><button type="button" class="v533-filter" data-v533-filter="weapon">Waffen</button><button type="button" class="v533-filter" data-v533-filter="armor">Rüstung</button><button type="button" class="v533-filter" data-v533-filter="jewelry">Schmuck</button><button type="button" class="v533-filter" data-v533-filter="other">Sonstiges</button>';
      (sellbar||grid.firstChild)?.insertAdjacentElement('afterend',filters);
      filters.addEventListener('click',e=>{
        const b=e.target.closest('[data-v533-filter]');if(!b)return;
        filter=b.dataset.v533Filter||'all';
        applyFilter(grid);
      });
    }
    filters.querySelectorAll('.v533-filter').forEach(b=>b.classList.toggle('active',b.dataset.v533Filter===filter));
    return filters;
  }

  function applyFilter(grid){
    const cards=[...grid.querySelectorAll(':scope > .inv-item')];
    cards.forEach((card,i)=>{
      const it=s?.inventory?.[i];
      card.dataset.v533Category=category(it);
      card.hidden=filter!=='all'&&card.dataset.v533Category!==filter;
    });
    grid.querySelectorAll(':scope > .v533-empty-slot').forEach(x=>x.remove());
    const visible=cards.filter(c=>!c.hidden).length;
    const target=visible<6?6-visible:0;
    for(let i=0;i<target;i++){
      const empty=document.createElement('div');
      empty.className='v533-empty-slot';
      empty.innerHTML='<span class="v533-empty-plus">＋</span><span>Noch mehr Loot wartet auf dich!</span>';
      grid.appendChild(empty);
    }
    grid.querySelectorAll('.v533-filter').forEach(b=>b.classList.toggle('active',b.dataset.v533Filter===filter));
  }

  function ensureTip(card){
    let tip=card.querySelector(':scope > .v533-inv-tip');
    if(!tip){
      tip=document.createElement('div');
      tip.className='v533-inv-tip';
      tip.textContent='Tipp: Markiere mehrere Items, um sie schnell zu verkaufen. Seltene Beute ist wertvoller.';
      card.appendChild(tip);
    }
  }

  function apply(){
    if(!document.getElementById('character')?.classList.contains('active'))return false;
    if(applying)return;
    applying=true;
    try{
      const box=document.getElementById('inventory');
      const card=box?.closest('.card');
      if(!box||!card)return;
      card.classList.add('v533-inv-card');
      const head=ensureHeader(card);
      const auto=ensureAuto(card,head);
      const grid=box.querySelector('.inventory-grid');
      if(grid){
        const sellbar=grid.querySelector(':scope > .v268-sellbar');
        ensureFilters(grid,sellbar);
        applyFilter(grid);
      }
      ensureTip(card);
      syncAuto(auto);
      requestAnimationFrame(()=>syncAuto(auto));
      setTimeout(()=>syncAuto(auto),90);
      card.dataset.inventoryLayout='reference-v533';
    }catch(e){console.warn('V5.33 inventory reference',e)}
    finally{applying=false}
  }

  window.v533ApplyInventory=apply;

  try{
    if(typeof renderInventory==='function'&&!window.__v533InventoryWrapped){
      const base=renderInventory;
      renderInventory=function(){const r=base.apply(this,arguments);apply();return r};
      try{window.renderInventory=renderInventory}catch(e){}
      window.__v533InventoryWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof window.v459ArrangeCharacter==='function'&&!window.__v533ArrangeWrapped){
      const base=window.v459ArrangeCharacter;
      window.v459ArrangeCharacter=function(){const r=base.apply(this,arguments);apply();return r};
      window.__v533ArrangeWrapped=true;
    }
  }catch(e){}

  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')apply()},{passive:true});
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
  /* V8.009: direct renderInventory/arrange/navigation/pageshow lifecycle. */
})();
