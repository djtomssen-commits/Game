(()=>{
 'use strict';
 if(window.__V6107_GLOBAL_ITEM_ART_AUTHORITY__)return;
 window.__V6107_GLOBAL_ITEM_ART_AUTHORITY__=true;
 const real=window.v6106RealItemArt;
 if(typeof real!=='function')return;

 const V6108_Q={
   gray:{label:'Normal',color:'#9aa0a6',glow:'#e4e8ec'},
   green:{label:'Gewöhnlich',color:'#54d568',glow:'#9cff9f'},
   blue:{label:'Rare',color:'#29a8ff',glow:'#83d2ff'},
   purple:{label:'Episch',color:'#d13cff',glow:'#ed9cff'},
   orange:{label:'Legendär',color:'#ff9f18',glow:'#ffd16d'},
   cyan:{label:'Mystisch',color:'#20e8e5',glow:'#8ffffd'},
   prismatic:{label:'Prismatisch',color:'#ff5ed2',glow:'#fff3a0'}
 };
 const V6108_CACHE=new Map();

 function qualityOf(it){
   let q=String(it?.quality||'').toLowerCase().trim();
   if(V6108_Q[q])return q;

   const r=(String(it?.rarity||'')+' '+String(it?.name||'')).toLowerCase();
   if(/prism/.test(r))return'prismatic';
   if(/cyan|myth|myst|mystisch/.test(r))return'cyan';
   if(/orange|legend|legendär/.test(r))return'orange';
   if(/purple|epic|episch|set/.test(r))return'purple';
   if(/blue|rare|selten/.test(r))return'blue';
   if(/green|uncommon|gewöhnlich/.test(r))return'green';
   return'gray';
 }
 window.v6108ItemQuality=qualityOf;

 function qualityFrame(base,it){
   /* V7.207: Base64 Phase 2 moved the real artwork to external files.
      Do not embed an external asset again inside a data: SVG: SVG images used
      through <img> are isolated and the nested relative image URL stays blank.
      The existing .v6108-quality-artbox / v6108-q-* classes own the rarity frame. */
   return String(base||'');
 }

 const canonical=it=>{
   try{
     const base=String(real(it)||'');
     return qualityFrame(base,it);
   }catch(e){return''}
 };
 window.v6107CanonicalItemArt=canonical;
 window.v6108QualityFramedItemArt=canonical;
 const ownResolvers=()=>{
   window.v466ItemArtUri=canonical;
   window.v4106ComicItemArtUri=canonical;
   window.v4111ComicItemArtUri=canonical;
   window.v4115ComicItemArtUri=canonical;
   window.v6105ItemArtUri=canonical;
   try{v466ItemArtUri=canonical}catch(e){}
 };
 ownResolvers();

 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function imgHtml(it,extra=''){
   const u=canonical(it);if(!u)return'';
   const q=qualityOf(it);
   return `<img class="v466-item-art v6107-item-art v6108-quality-art v6108-q-${q} ${esc(extra)}" data-v6107="1" data-v6108-quality="${q}" src="${u}" alt="${esc(it?.name||'Item')}">`;
 }
 window.v6107ItemImgHtml=imgHtml;
 function setBox(box,it){
   if(!box||!it)return false;
   const u=canonical(it);if(!u)return false;
   const q=qualityOf(it);
   box.dataset.v6107Art='1';
   box.dataset.v6108Quality=q;
   box.classList.add('v6108-quality-artbox');
   ['gray','green','blue','purple','orange','cyan','prismatic'].forEach(x=>box.classList.toggle('v6108-q-'+x,x===q));

   const cur=box.querySelector(':scope > img.v6107-item-art');
   if(cur&&cur.getAttribute('src')===u&&box.childElementCount===1){
     cur.dataset.v6108Quality=q;
     return true;
   }
   const im=document.createElement('img');
   im.className='v466-item-art v6107-item-art v6108-quality-art';
   im.dataset.v6107='1';
   im.dataset.v6108Quality=q;
   im.src=u;
   im.alt=String(it?.name||'Item');
   im.loading='eager';
   im.decoding='sync';
   box.replaceChildren(im);
   return true;
 }
 const clean=v=>String(v||'').replace(/^(Normal|Gewöhnlich|Rare|Selten|Episch|Legendär|Mystisch|Prismatisch):\s*/i,'').replace(/\s*\[Lv\.\d+\]\s*$/i,'').trim();
 function known(){const a=[];try{a.push(...(s?.inventory||[]),...Object.values(s?.equipment||{}).filter(Boolean),...(s?.weaponShop||[]),...(s?.magicShop||[]),...(s?.materials||[]))}catch(e){}return a.filter(Boolean)}
 function byTitle(title){const t=clean(title);if(!t)return null;const p=known();return p.find(it=>clean(it?.name)===t)||p.find(it=>t.includes(clean(it?.name))||clean(it?.name).includes(t))||null}

 function paintShop(){
   document.querySelectorAll('#v057WeaponGrid .shop-item').forEach((c,i)=>{const it=s?.weaponShop?.[i];if(it)setBox(c.querySelector('.shop-icon,.v41-shop-icon'),it)});
   document.querySelectorAll('#v057MagicGrid .shop-item').forEach((c,i)=>{const it=s?.magicShop?.[i];if(it)setBox(c.querySelector('.shop-icon,.v41-shop-icon'),it)});
 }
 function paintInventory(){
   document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((c,i)=>{const di=Number(c.dataset.v459Index);const it=s?.inventory?.[Number.isInteger(di)?di:i]||s?.inventory?.[i];if(!it)return;let box=c.querySelector('.v459-inv-icon');if(!box){const n=c.querySelector('.item-name');if(n){box=document.createElement('span');box.className='v459-inv-icon';n.prepend(box)}}if(box)setBox(box,it)});
 }
 function paintEquipment(){
   ['head','weapon','weapon2','ring','body','boots','amulet'].forEach(sl=>{const it=s?.equipment?.[sl];if(!it)return;const c=document.getElementById('slot-'+sl);if(c)setBox(c.querySelector('.slot-icon,.ico'),it)});
 }
 function paintLoot(scope=document){
   scope.querySelectorAll?.('.v240-loot-item').forEach(c=>{const it=byTitle(c.querySelector('.v240-loot-name')?.textContent||'');if(it)setBox(c.querySelector('.v240-loot-icon'),it)});
   scope.querySelectorAll?.('.v395-loot-card').forEach(c=>{const it=byTitle(c.querySelector('b')?.textContent||'');if(it)setBox(c.querySelector('.ico'),it)});
 }
 function paintDetails(){
   const sh=document.querySelector('#v459InventoryOverlay.show #v459InventorySheet');if(sh){const it=byTitle(sh.querySelector('.v459-sheet-name')?.textContent||'');if(it)setBox(sh.querySelector('.v459-sheet-icon'),it)}
   const d=document.querySelector('#v123ItemDetail');if(d){const it=byTitle(d.querySelector('.v123-detail-name')?.textContent||'');if(it)setBox(d.querySelector('.v123-detail-icon'),it)}
 }
 function paint(scope=document){
   ownResolvers();const active=document.querySelector('.screen.active')?.id||'';
   if(active==='shop'||scope?.id==='shop')paintShop();
   if(active==='character'||scope?.id==='character'){paintInventory();paintEquipment();paintDetails()}
   paintLoot(scope||document);return true;
 }
 window.v6107PaintItemSurfaces=paint;

 /* Dungeon/quest reward HTML is created with approved artwork immediately. */
 const baseReward=typeof window.v240ItemRewardHtml==='function'?window.v240ItemRewardHtml:null;
 const reward=function(it){
   try{if(typeof window.v4103RenderItemCard==='function')return window.v4103RenderItemCard(it,{slot:it?.slot,context:'reward',extraClass:'v240-loot-item v6107-current-art'})}catch(e){}
   const h=baseReward?baseReward.apply(this,arguments):'';const u=canonical(it);if(!u)return h;
   return String(h).replace(/<div class="v240-loot-icon">[\s\S]*?<\/div>/,`<div class="v240-loot-icon">${imgHtml(it,'v6107-reward-art')}</div>`);
 };
 try{v240ItemRewardHtml=reward}catch(e){}window.v240ItemRewardHtml=reward;

 function wrap(name,after){
   try{
     const fn=window[name];if(typeof fn!=='function'||fn.__v6107)return;
     const w=function(){const r=fn.apply(this,arguments);ownResolvers();after.apply(this,arguments);return r};w.__v6107=true;window[name]=w;
     try{if(name==='renderShop')renderShop=w;if(name==='renderInventory')renderInventory=w;if(name==='v459CompactInventory')v459CompactInventory=w;if(name==='v459OpenInventoryItem')v459OpenInventoryItem=w;if(name==='v123OpenItem')v123OpenItem=w;if(name==='v247ShowDungeonReward')v247ShowDungeonReward=w}catch(e){}
   }catch(e){}
 }
 wrap('renderShop',paintShop);
 wrap('renderInventory',()=>{paintInventory();paintEquipment()});
 wrap('v459CompactInventory',paintInventory);
 wrap('v459OpenInventoryItem',paintDetails);
 wrap('v123OpenItem',paintDetails);
 wrap('v247ShowDungeonReward',()=>paintLoot(document.getElementById('v247DungeonReward')||document));

 document.addEventListener('click',e=>{if(!e.target?.closest?.('#shop,#character,#v231QuestReward,#v247DungeonReward'))return;paint(document.querySelector('.screen.active')||document)},false);
 document.addEventListener('DOMContentLoaded',()=>paint(document.querySelector('.screen.active')||document),{once:true});
 window.addEventListener('pageshow',()=>paint(document.querySelector('.screen.active')||document),{passive:true});
 window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>paint(document.querySelector('.screen.active')||document),80));
 paint(document.querySelector('.screen.active')||document);

 window.v6107ItemArtQA=()=>({
   oneResolver:[window.v466ItemArtUri,window.v4106ComicItemArtUri,window.v4111ComicItemArtUri,window.v4115ComicItemArtUri,window.v6105ItemArtUri].every(x=>x===canonical),
   qualityFramed:['gray','green','blue','purple','orange','cyan'].every(q=>{
     const u=canonical({name:'QA '+q,slot:'weapon',classId:'grower',quality:q});
     return u.startsWith('data:image/svg+xml')&&decodeURIComponent(u).includes(V6108_Q[q].color);
   }),
   sourceRealWebp:[{slot:'weapon',classId:'grower'},{slot:'body',classId:'bruiser'},{slot:'weapon',classId:'scout'},{slot:'head',classId:'frost'}].every(x=>/^(?:data:image\/webp;base64,|assets\/v71(?:95|98)-base64\/)/.test(String(real(x)||''))),
   stable:true
 });
})();
