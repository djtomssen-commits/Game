/* ===== V4.02 resource card stability =====
   Fixes:
   1) Harz-Taler uses the same left-icon/right-value layout as the other cards.
   2) Remove duplicated Dampf event labels.
   3) Re-assert resource card DOM state after scroll/repaint without rebuilding cards.
*/

function v278NormalizeDampfBadges(){
  const card=document.querySelector('#energy')?.closest('.stat');
  if(!card)return;

  /* Keep exactly one dedicated V4.02 chip. */
  const own=[...card.querySelectorAll('.v277-dampf-event-chip')];
  own.slice(1).forEach(x=>x.remove());

  /* Remove older visual duplicates that contain the same event text. */
  [...card.querySelectorAll('*')].forEach(el=>{
    if(el.classList.contains('v277-dampf-event-chip'))return;
    const t=(el.textContent||'').trim().replace(/\s+/g,' ');
    if(/EVENT\s*300\/300/i.test(t) && el.children.length===0){
      el.remove();
    }
  });
}

function v278FixHarzCard(){
  const card=document.querySelector('#topHarz')?.closest('.stat');
  if(!card)return;
  card.classList.add('v277-harz-card');

  let sub=card.querySelector('.v277-resource-sub');
  if(!sub){
    sub=document.createElement('div');
    sub.className='v277-resource-sub';
    card.appendChild(sub);
  }
  sub.textContent='Premium-Währung';
}

function v278StabilizeResources(){
  try{
    v277PrepareResourceCards();
    v278FixHarzCard();
    v278NormalizeDampfBadges();

    /* Prevent duplicate top Gold badge as well. */
    const topGold=document.querySelector('#gold');
    if(topGold){
      const badges=[...topGold.querySelectorAll(':scope > .v276-gold2')];
      badges.slice(1).forEach(x=>x.remove());
    }
  }catch(e){
    console.error('V4.02 resource stabilize',e);
  }
}

/* V7.157: global scroll-time resource DOM normalization retired.
   Resource cards are stable after render/account events; mutating the header on every
   scroll frame forced whole-page repaints on Android WebView and could drop character
   equipment paint layers while scrolling. */
window.__V7157_RESOURCE_SCROLL_REPAINT_RETIRED__=true;

const v278BaseRender=render;
render=function(){
  const r=v278BaseRender();
  requestAnimationFrame(v278StabilizeResources);
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(v278StabilizeResources,250);
setTimeout(v278StabilizeResources,900);


const v278Line=document.querySelector('#v141VersionLine');
