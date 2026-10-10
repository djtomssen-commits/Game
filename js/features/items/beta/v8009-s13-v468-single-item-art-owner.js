(function(){
  const VERSION='V4.68 Stable',SHORT='V4.68';
  let painting=false;
  const v8376ArtQa={kept:0,replaced:0};
  window.__V8376_V468_ART_QA__=()=>({...v8376ArtQa});
  function artUri(it){try{return typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri(it):''}catch(e){return''}}
  function setArt(box,it){
    if(!box||!it)return false;
    const uri=artUri(it);if(!uri)return false;
    const current=box.querySelector(':scope > img.v466-item-art');
    const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'||(window.__GROW_SERVER1_PERFORMANCE_V8376__===true&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='server1');
    /* V8.376: src resolves relative artwork URLs to absolute URLs.
       Compare the actual src attribute as well; don't destroy a correct
       picture merely because the browser expanded its URL. */
    const sameSource=current&&(beta
      ?(current.getAttribute('src')===uri||current.src===uri)
      :current.src===uri);
    if(sameSource&&box.childElementCount===1){
      if(beta){
        if(current.alt!==String(it.name||'Item'))current.alt=String(it.name||'Item');
        v8376ArtQa.kept++;
      }
      return true;
    }
    if(beta)v8376ArtQa.replaced++;
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
        let mark=card.querySelector('.v466-set-mark');
        const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'||(window.__GROW_SERVER1_PERFORMANCE_V8376__===true&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='server1');
        const hasSet=!!(it.setName||it.setId||it.mysticSetId);
        if(beta){
          /* V8.373: a set marker is a persistent item node, not a repaint. */
          if(!hasSet){mark?.remove()}
          else{
            const q=String(it.quality||'').toLowerCase();
            const label=q==='cyan'?'MYTHIC SET':'SET';
            if(!mark){mark=document.createElement('span');mark.className='v466-set-mark';card.appendChild(mark)}
            if(mark.textContent!==label)mark.textContent=label;
          }
        }else{
          /* Server1 historical painting remains unchanged. */
          if(mark)mark.remove();
          if(hasSet){
            mark=document.createElement('span');mark.className='v466-set-mark';
            const q=String(it.quality||'').toLowerCase();
            mark.textContent=q==='cyan'?'MYTHIC SET':'SET';card.appendChild(mark);
          }
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
