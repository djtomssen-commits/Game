/* ===== V4.02 mark every visible EXP/Erfahrung source while 2x event is active ===== */

function v095DecorateXp(){
  const active=v094XpEventActive();

  /* Remove our old markers first, so rerenders never duplicate them. */
  document.querySelectorAll('.v095-xp2').forEach(el=>el.remove());
  document.querySelectorAll('.v095-xp-text-active').forEach(el=>el.classList.remove('v095-xp-text-active'));

  if(!active)return;

  /* Search visible game UI for XP / EXP / Erfahrung labels.
     Skip scripts/styles and the event badge itself. */
  const root=document.querySelector('main')||document.body;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const found=[];

  while(walker.nextNode()){
    const node=walker.currentNode;
    const parent=node.parentElement;
    if(!parent)continue;
    if(['SCRIPT','STYLE','TEXTAREA','INPUT','OPTION'].includes(parent.tagName))continue;
    if(parent.closest('.v095-xp2,.v094-event-bonus,.v366-event,.v349-event,.v372-topbar,.v371-topbar,.v690-events-card,.v6115-event-row'))continue;

    const text=(node.nodeValue||'').trim();
    if(!text)continue;

    if(/\b(XP|EXP|Erfahrung)\b/i.test(text)){
      found.push(parent);
    }
  }

  [...new Set(found)].forEach(el=>{
    /* Avoid giant containers; mark the closest useful leaf-ish element. */
    let target=el;
    if(target.children.length>3)return;

    target.classList.add('v095-xp-text-active');

    if(!target.querySelector(':scope > .v095-xp2')){
      const badge=document.createElement('span');
      badge.className='v095-xp2';
      badge.textContent='×2';
      badge.title='2× Erfahrungsevent aktiv';
      target.appendChild(badge);
    }
  });
}

/* Also decorate common dynamically opened overlays/modals after clicks. */
document.addEventListener('click',()=>{
  if(v094XpEventActive())setTimeout(v095DecorateXp,30);
},true);

/* V6.317: do not TreeWalk the complete visible game DOM after every global
   render or every 15 seconds. Current event owners call v095DecorateXp explicitly
   when event state changes; the click hook above still covers newly opened overlays. */
try{v095DecorateXp()}catch(e){}
