/* ===== V4.02 resource card renderer ===== */
function v277PrepareResourceCards(){
  const gold=document.querySelector('#gold')?.closest('.stat');
  const skill=document.querySelector('#points')?.closest('.stat');
  const dampf=document.querySelector('#energy')?.closest('.stat');
  const harz=document.querySelector('#topHarz')?.closest('.stat');

  const defs=[
    [gold,'v277-gold-card','Deine Währung für Händler & Upgrades'],
    [skill,'v277-skill-card','Punkte für deine Charakterwerte'],
    [dampf,'v277-dampf-card','Energie für Quests und Abenteuer'],
    [harz,'v277-harz-card','Premium-Währung']
  ];

  defs.forEach(([card,cls,sub])=>{
    if(!card)return;
    card.classList.add(cls);
    let el=card.querySelector('.v277-resource-sub');
    if(!el){
      el=document.createElement('div');
      el.className='v277-resource-sub';
      card.appendChild(el);
    }
    el.textContent=sub;
  });

  if(gold){
    gold.classList.toggle('v277-event-on',!!v274GoldEventActive());
  }

  if(dampf){
    let chip=dampf.querySelector('.v277-dampf-event-chip');
    if(v271DampfEventActive()){
      if(!chip){
        chip=document.createElement('span');
        chip.className='v277-dampf-event-chip';
        dampf.appendChild(chip);
      }
      chip.textContent='💨 EVENT 300/300';
    }else if(chip){
      chip.remove();
    }
  }
}

/* Replace V4.02's generic Gold decorator.
   In the top resource card only #gold gets ONE x2 badge.
   This removes the duplicate badge caused by decorating both "GOLD" label
   and the numeric value. Other game Gold labels still get their event marker. */
v276DecorateGold=function(){
  document.querySelectorAll('.v276-gold2').forEach(el=>el.remove());
  document.querySelectorAll('.v276-gold-text-active')
    .forEach(el=>el.classList.remove('v276-gold-text-active'));

  if(!v274GoldEventActive()){
    v277PrepareResourceCards();
    return;
  }

  const topGold=document.querySelector('#gold');
  if(topGold){
    topGold.classList.add('v276-gold-text-active');
    const badge=document.createElement('span');
    badge.className='v276-gold2';
    badge.textContent='×2';
    badge.title='2× Gold-Event aktiv';
    topGold.appendChild(badge);
  }

  const root=document.querySelector('main');
  if(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const found=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      const parent=node.parentElement;
      if(!parent)continue;
      if(['SCRIPT','STYLE','TEXTAREA','INPUT','OPTION'].includes(parent.tagName))continue;
      if(parent.closest('.v276-gold2,.v094-event-bonus,.v274-event-live'))continue;
      const text=(node.nodeValue||'').trim();
      if(/\bGold\b/i.test(text))found.push(parent);
    }

    [...new Set(found)].forEach(el=>{
      if(el.children.length>3)return;
      el.classList.add('v276-gold-text-active');
      if(!el.querySelector(':scope > .v276-gold2')){
        const badge=document.createElement('span');
        badge.className='v276-gold2';
        badge.textContent='×2';
        badge.title='2× Gold-Event aktiv';
        el.appendChild(badge);
      }
    });
  }

  v277PrepareResourceCards();
};

const v277BaseRender=render;
render=function(){
  const r=v277BaseRender();
  requestAnimationFrame(()=>{
    v277PrepareResourceCards();
    v276DecorateGold();
  });
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(()=>{
  try{
    v277PrepareResourceCards();
    v276DecorateGold();
  }catch(e){console.error('V4.02 resource cards',e)}
  
  const line=document.querySelector('#v141VersionLine');
},400);
