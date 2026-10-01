(function(){
  const VERSION='V4.68 Stable',SHORT='V4.68';
  let painting=false;
  function artUri(it){try{return typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri(it):''}catch(e){return''}}
  function setArt(box,it){
    if(!box||!it)return false;
    const uri=artUri(it);if(!uri)return false;
    const current=box.querySelector(':scope > img.v466-item-art');
    if(current&&current.src===uri&&box.childElementCount===1)return true;
    const img=document.createElement('img');img.className='v466-item-art';img.src=uri;img.alt=String(it.name||'Item');img.decoding='async';
    box.replaceChildren(img);box.dataset.v468Art='1';return true;
  }
  function paintInventory(){
    if(painting)return;painting=true;
    try{
      document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((card,i)=>{
        const it=s?.inventory?.[i];if(!it)return;
        setArt(card.querySelector('.v459-inv-icon'),it);
        /* Preserve the one useful V466 inventory decoration while keeping a single art owner. */
        let mark=card.querySelector('.v466-set-mark');if(mark)mark.remove();
        if(it.setName||it.setId||it.mysticSetId){
          mark=document.createElement('span');mark.className='v466-set-mark';
          const q=String(it.quality||'').toLowerCase();
          mark.textContent=q==='cyan'?'MYTHIC SET':'SET';card.appendChild(mark);
        }
      });
    }finally{painting=false}
  }
  function stamp(){}
  try{
    if(typeof renderInventory==='function'&&!window.__v468InventoryWrapped){
      const base=renderInventory;
      renderInventory=function(){const r=base.apply(this,arguments);paintInventory();return r};
      window.renderInventory=renderInventory;window.__v468InventoryWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof window.v459CompactInventory==='function'&&!window.__v468CompactWrapped){
      const base=window.v459CompactInventory;
      window.v459CompactInventory=function(){const r=base.apply(this,arguments);paintInventory();return r};
      window.__v468CompactWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof render==='function'&&!window.__v468RenderWrapped){
      const base=render;
      render=function(){const r=base.apply(this,arguments);if(document.getElementById('character')?.classList.contains('active'))paintInventory();stamp();return r};
      window.render=render;window.__v468RenderWrapped=true;
    }
  }catch(e){}

  /* Watch only the inventory container. If a legacy painter replaces an icon later,
     immediately restore the one canonical V4.66/V4.68 art. No global DOM observer. */
  function installObserver(){
    const root=document.querySelector('#character #inventory .inventory-grid');
    if(!root||root.dataset.v468Observed==='1')return;
    root.dataset.v468Observed='1';
    const mo=new MutationObserver(muts=>{
      if(!document.getElementById('character')?.classList.contains('active'))return;
      if(painting)return;
      let needs=false;
      for(const m of muts){
        const t=m.target?.nodeType===1?m.target:m.target?.parentElement;
        if(t?.closest?.('.v459-inv-icon')){needs=true;break}
      }
      if(needs)queueMicrotask(paintInventory);
    });
    mo.observe(root,{childList:true,subtree:true});
    window.__V468_ITEM_ART_OBSERVER__=mo;
  }
  function init(){paintInventory();installObserver();stamp()}
  document.addEventListener('DOMContentLoaded',init,{once:true});
  window.addEventListener('pageshow',init,{passive:true});
  try{init()}catch(e){}
})();
