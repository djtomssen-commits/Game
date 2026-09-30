
(()=>{
 'use strict';
 if(window.__V646_HALL_TEMPLATE__) return;
 window.__V646_HALL_TEMPLATE__=true;
 const root=()=>document.getElementById('hall');
 const classFromText=t=>{
   t=String(t||'').toLowerCase();
   if(t.includes('harzruferin')||t.includes('harzrufer')) return 'summoner';
   if(t.includes('blatt-schütze')||t.includes('schütze')) return 'scout';
   if(t.includes('bong-magier')||t.includes('magier')) return 'bruiser';
   if(t.includes('frost')) return 'frost';
   return 'grower';
 };
 const avatar=cls=>{
   try{return typeof window.v080AvatarFor==='function' ? (window.v080AvatarFor(cls)||'') : ''}catch(e){return ''}
 };
 const makeAvatar=(cls,own=false)=>{
   const box=document.createElement('div');
   box.className=own?'v646-own-avatar':'v646-row-avatar';
   const src=avatar(cls);
   if(src){
     const img=document.createElement('img');
     img.alt=own?'Grow Legends Charakter':'Spieleravatar';
     img.loading=own?'eager':'lazy'; img.decoding='async'; img.src=src; box.appendChild(img);
   }else{
     box.textContent='🌿'; box.style.display='grid'; box.style.placeItems='center'; box.style.fontSize=own?'34px':'24px';
   }
   return box;
 };
 function decorateOwn(){
   const el=document.getElementById('v072OwnProfile'); if(!el) return;
   let cls='grower'; try{cls=String((typeof s!=='undefined'?s?.playerClass:window.s?.playerClass)||'grower')}catch(e){}
   const existing=el.querySelector('.v646-own-avatar');
   if(existing){
     const src=avatar(cls),img=existing.querySelector('img');
     if(src){
       if(img){if(img.src!==src)img.src=src;img.alt='Grow Legends Charakter'}
       else{existing.textContent='';const n=document.createElement('img');n.alt='Grow Legends Charakter';n.loading='eager';n.decoding='async';n.src=src;existing.appendChild(n)}
     }
     return;
   }
   const kids=[...el.children]; if(!kids.length) return;
   const main=document.createElement('div'); main.className='v646-own-main';
   kids.forEach(n=>main.appendChild(n));
   el.append(makeAvatar(cls,true),main); el.classList.add('v646-own-decorated');
 }
 function decorateRow(r){
   if(!r)return;
   const rank=r.querySelector(':scope > .v072-rank'); if(!rank) return;

   /* V6.292: never infer the class from rank.nextElementSibling.
      Once the avatar is inserted, that sibling IS the avatar and contains no
      class text, which previously collapsed every row back to Bud-Barbar. */
   const rawId=String(r.dataset.classId||'').toLowerCase();
   const known=['grower','scout','bruiser','frost','summoner'];
   const classText=r.querySelector('.v072-player-sub,.v4124-social-line')?.textContent||'';
   const cls=known.includes(rawId)?rawId:classFromText(classText);
   const src=avatar(cls);

   const existing=r.querySelector('.v646-row-avatar');
   if(existing){
     existing.dataset.avatarClass=cls;
     const img=existing.querySelector('img');
     if(src&&img&&img.src!==src){img.src=src;img.alt='Spieleravatar'}
     else if(src&&!img){existing.textContent='';const n=document.createElement('img');n.alt='Spieleravatar';n.loading='lazy';n.decoding='async';n.src=src;existing.appendChild(n)}
     return;
   }
   const art=makeAvatar(cls,false);
   art.dataset.avatarClass=cls;
   rank.insertAdjacentElement('afterend',art); r.classList.add('v646-row-decorated');
 }
 function decorate(){
   const h=root(); if(!h) return;
   h.classList.add('v646-hall');
   if(h.getAttribute('data-hall-build')!=='V6.46' && h.getAttribute('data-hall-build')!=='V6.48') h.setAttribute('data-hall-build','V6.46');
   const title=h.querySelector('.v052-title');
   if(title && title.textContent!=='HALL OF HAZE') title.textContent='HALL OF HAZE';
   const sub=h.querySelector('.v052-sub');
   const wantedSub='Rangliste, Spielerprofile und die größten Grow-Legenden.';
   if(sub && sub.textContent!==wantedSub) sub.textContent=wantedSub;
   decorateOwn();
   h.querySelectorAll('.v072-player-row').forEach(decorateRow);
 }
 let queued=false;
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
 function boot(){
   const h=root(); if(!h) return;
   schedule();
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
 document.addEventListener('click',e=>{if(e.target.closest?.('[data-screen="hall"],[data-go="hall"]'))setTimeout(schedule,0)},true);
 window.addEventListener('growlegends:account-ready',()=>setTimeout(schedule,0));
 window.v646DecorateHall=decorate;
})();
