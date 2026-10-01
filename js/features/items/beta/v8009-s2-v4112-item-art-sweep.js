(function(){
  'use strict';
  const artUri=(it)=>{try{return window.v4111ComicItemArtUri?.(it)||window.v466ItemArtUri?.(it)||''}catch(e){return''}};
  const clean=(v)=>String(v||'').replace(/^(Normal|Gewöhnlich|Rare|Selten|Episch|Legendär|Mystisch|Prismatisch):\s*/i,'').replace(/\s*·.*$/,'').trim().toLowerCase();
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const slotMap={waffe:'weapon',kopf:'head',körper:'body',brust:'body',schuhe:'boots',füße:'boots',fuesse:'boots',ring:'ring',amulett:'amulet',nebenhand:'offhand'};
  function pool(){
    let out=[];
    try{ out=out.concat(s?.inventory||[]); }catch(e){}
    try{ out=out.concat(Object.values(s?.equipment||{}).filter(Boolean)); }catch(e){}
    try{ out=out.concat(s?.weaponShop||[]); }catch(e){}
    try{ out=out.concat(s?.magicShop||[]); }catch(e){}
    try{ out=out.concat(s?.materials||[]); }catch(e){}
    return out.filter(Boolean);
  }
  function byName(name,slot){
    const n=clean(name); if(!n) return null;
    const all=pool();
    let hit=all.find(it=>clean(it?.name)===n && (!slot || String(it?.slot||it?.type||'').toLowerCase()===slot));
    if(hit) return hit;
    hit=all.find(it=>clean(it?.name)===n);
    return hit||null;
  }
  function put(box,it){
    if(!box||!it) return false;
    const u=artUri(it); if(!u) return false;
    let img=box.querySelector(':scope > img.v466-item-art');
    if(!img){ img=document.createElement('img'); img.className='v466-item-art'; box.replaceChildren(img); }
    img.src=u; img.alt=String(it?.name||'Gegenstand'); img.loading='lazy'; img.decoding='async';
    box.dataset.v466Art='1';
    return true;
  }
  function decorateLegacyProfile(root){
    root.querySelectorAll('.v210-profile-item').forEach(card=>{
      const name=card.querySelector('.v210-profile-item-name')?.textContent||'';
      const slotLabel=clean(card.querySelector('.v210-profile-slot')?.textContent||'');
      const slot=slotMap[slotLabel]||'';
      const it=byName(name,slot);
      if(it) put(card.querySelector('.v210-profile-icon'),it);
    });
  }
  function decorateLoot(root){
    root.querySelectorAll('.v240-loot-item').forEach(card=>{
      const name=card.querySelector('.v240-loot-name')?.textContent||'';
      const it=byName(name,'');
      if(it) put(card.querySelector('.v240-loot-icon'),it);
    });
  }
  function decorateGeneric(root){
    try{ root.querySelectorAll('#character #inventory .inventory-grid > .inv-item,.inventory-grid > .inv-item').forEach((card,i)=>{ let it=null; const nm=card.querySelector('.v459-item-name,.inv-name,h3,b')?.textContent||''; if(nm)it=byName(nm,''); if(!it)it=s?.inventory?.[i]; if(it) put(card.querySelector('.v459-inv-icon,.v4103-item-art,.slot-icon,.inv-icon,.ico'),it); }); }catch(e){}
    try{ ['head','weapon','ring','body','boots','amulet'].forEach(slot=>{ const it=s?.equipment?.[slot]; if(it) put(root.querySelector('#slot-'+slot+' .slot-icon'),it); }); }catch(e){}
    try{ root.querySelectorAll('#shop .shop-item').forEach(card=>{ const name=card.querySelector('h3,.v475-item-title')?.textContent||''; const it=byName(name,''); if(it) put(card.querySelector('.shop-icon,.v41-shop-icon,.ico'),it); }); }catch(e){}
    try{ root.querySelectorAll('#character #v030Materials .inventory-grid > .inv-item').forEach((card,i)=>{ const it=s?.materials?.[i]||byName(card.querySelector('h3,b')?.textContent||'',''); if(!it) return; let box=card.querySelector('.v466-material-artbox'); if(!box){ box=document.createElement('div'); box.className='v466-material-artbox'; card.insertBefore(box,card.firstChild); } put(box,it); }); }catch(e){}
    try{ const sheet=root.querySelector('#v459InventorySheet'); if(sheet){const nm=sheet.querySelector('.v459-sheet-name')?.textContent||'';const it=byName(nm,'');if(it)put(sheet.querySelector('.v459-sheet-icon'),it)} }catch(e){}
    try{ root.querySelectorAll('#v488ForgeInventory [data-v488-key]').forEach(card=>{ const key=String(card.dataset.v488Key||''); let it=(s?.inventory||[]).find(x=>String(x?.id||x?.uid||'')===key); if(!it)it=byName(card.querySelector('.nm')?.textContent||'',''); if(it) put(card.querySelector('.ico,.v4103-forge-art,.v459-inv-icon'),it); }); }catch(e){}
    try{ const reveal=root.querySelector('#v484Reveal.show'); if(reveal&&!reveal.querySelector('.v4103-item-card')){const nm=reveal.querySelector('h3')?.textContent||'';const it=byName(nm,'');if(it&&typeof window.v4103RenderItemCard==='function')reveal.innerHTML=window.v4103RenderItemCard(it,{slot:it.slot,context:'daily-login'})} }catch(e){}
    try{ const rew=root.querySelector('#v457Reward .v457-reward'); if(rew&&!rew.querySelector('.v4103-item-card')){const all=pool();const it=[...all].reverse().find(x=>(rew.textContent||'').includes(String(x?.name||'')));if(it&&typeof window.v4103RenderItemCard==='function')rew.insertAdjacentHTML('beforeend',window.v4103RenderItemCard(it,{slot:it.slot,context:'endgame-reward'}))} }catch(e){}
    try{ const log=root.querySelector('#v110Log'); if(log&&/Garantierte mystische Beute/i.test(log.textContent||'')){let card=root.querySelector('#v4113WorldbossItem');const it=[...(s?.inventory||[])].reverse().find(x=>/cyan|myst|myth/i.test(String(x?.quality||'')+' '+String(x?.rarity||'')));if(it&&typeof window.v4103RenderItemCard==='function'){if(!card){card=document.createElement('div');card.id='v4113WorldbossItem';log.insertAdjacentElement('afterend',card)}card.innerHTML=window.v4103RenderItemCard(it,{slot:it.slot,context:'smaragd-koloss'})}} }catch(e){}
    try{ root.querySelectorAll('#loot .loot,.loot').forEach(box=>{if(box.querySelector('.v466-item-art,.v4103-item-card'))return;const txt=box.textContent||'';const it=[...pool()].reverse().find(x=>String(x?.name||'').length>3&&txt.includes(String(x.name)));if(it){let holder=box.querySelector('.v4113-inline-art');if(!holder){holder=document.createElement('span');holder.className='v4113-inline-art';box.prepend(holder)}put(holder,it)}}); }catch(e){}
    decorateLegacyProfile(root);
    decorateLoot(root);
  }
  function itemArtAudit(){
    const failures=[],checked=[];
    const check=(el,label,needed=true)=>{if(!el||!needed)return;checked.push(label);if(!el.querySelector('img.v466-item-art')&&!el.querySelector('.v4103-item-card img.v466-item-art'))failures.push(label)};
    try{document.querySelectorAll('#shop .shop-item').forEach((x,i)=>{const name=x.querySelector('h3')?.textContent||'';check(x,`Händler ${i+1}`,!!byName(name,''))})}catch(e){}
    try{document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((x,i)=>check(x,`Inventar ${i+1}`,!!s?.inventory?.[i]))}catch(e){}
    try{['head','weapon','ring','body','boots','amulet'].forEach(sl=>check(document.getElementById('slot-'+sl),`Ausrüstung ${sl}`,!!s?.equipment?.[sl]))}catch(e){}
    try{document.querySelectorAll('#v074ProfileContent .v4103-item-card,#v074ProfileContent .v210-profile-item').forEach((x,i)=>check(x,`Spielerprofil ${i+1}`,true))}catch(e){}
    try{document.querySelectorAll('.v240-loot-item,.v246-dungeon-item').forEach((x,i)=>check(x,`Beute ${i+1}`,true))}catch(e){}
    try{document.querySelectorAll('#v488ForgeInventory .v488-item').forEach((x,i)=>check(x,`Harzschmiede ${i+1}`,true))}catch(e){}
    try{document.querySelectorAll('#character #v030Materials .inv-item').forEach((x,i)=>check(x,`Material ${i+1}`,true))}catch(e){}
    try{const sh=document.getElementById('v459InventorySheet');if(sh&&sh.offsetParent!==null)check(sh,'Item-Detail',true)}catch(e){}
    const src=document.documentElement.innerHTML;
    const legacyRaw=(src.match(/(?:shop-icon|slot-icon|v240-loot-icon)[^\n]{0,160}\$\{(?:it\??\.icon|found\??\.icon)/g)||[]).length;
    return {checked:checked.length,failures:[...new Set(failures)],legacyRaw};
  }
  function paintAudit(){
    try{
      const status=document.getElementById('v4107Status');
      if(!status||!document.getElementById('systemtech')?.classList.contains('active'))return;
      const a=itemArtAudit();
      let el=document.getElementById('v4113ItemAudit');if(!el){el=document.createElement('div');el.id='v4113ItemAudit';el.className='v4113-item-audit';status.appendChild(el)}
      el.classList.toggle('bad',a.failures.length>0);
      el.innerHTML=`<b>${a.failures.length?'❌':'✅'} ITEM-ART RESTSUCHE</b><span>${a.checked} sichtbare Item-Flächen geprüft · ${a.failures.length} alte Darstellung${a.failures.length===1?'':'en'} sichtbar · ${a.legacyRaw} historische Roh-Renderer im Quelltext (werden überschrieben)</span>${a.failures.length?`<small>${a.failures.slice(0,12).join(' · ')}</small>`:''}`;
    }catch(e){}
  }
  window.v4113ItemArtAudit=itemArtAudit;
  window.v4112RefreshAllItemArt=function(root){ try{ decorateGeneric(root||document); }catch(e){} };

  try{
    const baseReward=window.v240ItemRewardHtml;
    if(typeof baseReward==='function'&&!window.__v4112RewardWrapped){
      window.v240ItemRewardHtml=function(it){
        const html=baseReward.apply(this,arguments);
        const u=artUri(it);
        if(!u) return html;
        return html.replace(/<div class="v240-loot-icon">[\s\S]*?<\/div>/,`<div class="v240-loot-icon"><img class="v466-item-art" src="${u}" alt="${esc(it?.name||'Gegenstand')}"></div>`);
      };
      window.__v4112RewardWrapped=true;
    }
  }catch(e){}

  try{
    if(typeof window.v246DungeonRewardItemHtml==='function'&&!window.__v4112DungeonRewardWrapped){
      const base=window.v246DungeonRewardItemHtml;
      window.v246DungeonRewardItemHtml=function(found,boss=false){
        const html=base.apply(this,arguments);
        const u=artUri(found);
        if(!u) return html;
        return html.replace(/<div class="v240-loot-icon">[\s\S]*?<\/div>/,`<div class="v240-loot-icon"><img class="v466-item-art" src="${u}" alt="${esc(found?.name||'Gegenstand')}"></div>`);
      };
      window.__v4112DungeonRewardWrapped=true;
    }
  }catch(e){}

  let raf=0,pendingRoot=null;
  function queue(root){
    pendingRoot=root||pendingRoot||document.querySelector('.screen.active')||document;
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      const scope=pendingRoot||document;pendingRoot=null;
      decorateGeneric(scope);
      paintAudit();
    });
  }

  /* V6.101: no full-document MutationObserver and no global render wrapper.
     Item art is refreshed only for the screen that actually opens. */
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    if(['character','shop','dungeon','hall','endgame'].includes(id))queue(document.getElementById(id));
  },{passive:true});
  window.__v4112ScopedGo='v7119-event';

  document.addEventListener('DOMContentLoaded',()=>queue(document.querySelector('.screen.active')||document),{once:true});
  window.addEventListener('pageshow',()=>queue(document.querySelector('.screen.active')||document),{passive:true});
})();
