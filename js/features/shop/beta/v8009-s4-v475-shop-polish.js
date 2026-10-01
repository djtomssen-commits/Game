(function(){
  const VERSION='V4.75',SHORT='V4.75';
  const rarityPrefix=/^(?:normal|gewöhnlich|gewoehnlich|selten|episch|legendär|legendaer|mystisch)\s*:\s*/i;
  let queued=false;

  function stamp(){}

  function cleanTitle(h3){
    if(!h3)return;
    let raw=String(h3.textContent||'').replace(/\s+/g,' ').trim();
    if(!raw)return;
    raw=raw.replace(rarityPrefix,'');
    const m=raw.match(/^(.*?)(?:\s*\[?Lv\.?\s*(\d+)\]?)$/i);
    const name=(m?m[1]:raw).trim();
    const level=m?m[2]:'';
    const signature=name+'|'+level;
    if(h3.dataset.v475Title===signature)return;
    h3.dataset.v475Title=signature;
    h3.textContent='';
    const title=document.createElement('span');title.className='v475-item-title';title.textContent=name;h3.appendChild(title);
    if(level){const tag=document.createElement('span');tag.className='v475-level-tag';tag.textContent='Lv. '+level;h3.appendChild(tag)}
  }

  function ensureHeroArt(hero){
    if(!hero)return;
    hero.classList.add('v472-dual-hero');
    if(!hero.querySelector('.v472-hero-weapon')){
      const el=document.createElement('div');el.className='v472-hero-weapon';hero.insertBefore(el,hero.firstChild);
    }
    if(!hero.querySelector('.v472-hero-magic')){
      const el=document.createElement('div');el.className='v472-hero-magic';hero.insertBefore(el,hero.firstChild);
    }
    if(!hero.querySelector('.v472-hero-shade')){
      const el=document.createElement('div');el.className='v472-hero-shade';hero.insertBefore(el,hero.firstChild);
    }
    const title=(hero.querySelector('h2')?.textContent||'').toLowerCase();
    if(title.includes('schmuck')||title.includes('magie')||/mira/i.test(hero.textContent||''))hero.classList.add('v464-magic');
  }

  function cleanMarkedExtras(shop){
    if(!shop)return;
    /* User-approved shop cleanup: keep these old helper panels permanently out. */
    shop.querySelectorAll('.v41-npc-banner').forEach(el=>el.remove());
    shop.querySelectorAll('.v052-scene-banner,.v052-shop,[class*="scene-banner"]').forEach(el=>{
      const t=(el.textContent||'').toLowerCase();
      if(t.includes('händlergasse')||t.includes('haendlergasse'))el.remove();
    });
    const rarityHint=shop.querySelector('#v055RarityHint');if(rarityHint)rarityHint.remove();
    shop.querySelectorAll('*').forEach(el=>{
      if(el.closest('#v461ShopHero'))return;
      const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(!t)return;
      if(t==='🏪 händlergasse'||t==='händlergasse'||t==='🏪händlergasse'){
        const removable=el.closest('.v052-scene-banner,.card,button,div,span')||el;
        if(removable&&removable!==shop&&!removable.closest('#v461ShopHero'))removable.remove();
        return;
      }
      if(t.startsWith('⚖️ werte steigen jetzt klar mit der seltenheit')||t.startsWith('werte steigen jetzt klar mit der seltenheit')){
        if(el.children.length===0||el.classList.contains('tiny')||el.classList.contains('muted')||el.tagName==='P'||el.tagName==='DIV')el.remove();
      }
    });
  }

  function polishShop(){
    queued=false;
    const shop=document.querySelector('#shop');if(!shop||!shop.classList.contains('active'))return;
    shop.querySelectorAll('.shop-item h3').forEach(cleanTitle);
    const hero=shop.querySelector('#v461ShopHero');
    if(hero){
      ensureHeroArt(hero);
      if(hero.classList.contains('v464-magic')){
        const kicker=hero.querySelector('.v461-shop-kicker');
        const title=hero.querySelector('h2');
        const desc=hero.querySelector('.muted');
        if(kicker)kicker.textContent='💎 MIRAS NEBELVITRINE';
        if(title)title.textContent='Schmuck & Magie';
        if(desc)desc.textContent='Ringe, Amulette, Edelsteine und Rollen für deine Ausrüstung.';
      }
    }
    cleanMarkedExtras(shop);
    stamp();
  }
  function queue(){if(queued)return;queued=true;polishShop()}

  if(typeof renderShop==='function'&&!window.__v475RenderShopWrapped){
    const base=renderShop;renderShop=function(){const r=base.apply(this,arguments);queue();return r};window.renderShop=renderShop;window.__v475RenderShopWrapped=true;
  }
  /* V6.320: redundant global render hook retired; renderShop + navigation hooks remain. */
  if(!window.__v475GoWrapped){
    window.addEventListener('growlegends:navigation-open-v7119',e=>{
      if(String(e?.detail?.id||'')==='shop')queue();
    });
    window.__v475GoWrapped='v7120-event';
  }

  /* No permanent DOM observer: shop polish is driven by the canonical render/navigation hooks only. */
  stamp();queue();
  document.addEventListener('DOMContentLoaded',()=>{stamp();queue()},{once:true});
  window.addEventListener('pageshow',()=>{stamp();queue()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{stamp();queue()},{passive:true});
})();
