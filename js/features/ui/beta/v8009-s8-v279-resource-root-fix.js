/* ===== V4.02 root fix =====
   V4.02 created a second Dampf event chip while V4.02 still created the first.
   V4.02 removed one during scroll, but V4.02's painter recreated it later.
   This version gives Dampf ONE owner and rebuilds Harz with explicit markup.
*/

function v279BuildHarzCard(){return false}


/* V8.009: v279 Dampf DOM producer retired; v271/v284 own Dampf. */
/* Historical callers use both names. Point both at the single final painter. */
v026PaintDampf=v271PaintDampf;

/* Replace V4.02 helper so it no longer manufactures another Dampf badge. */
v277PrepareResourceCards=function(){
  const gold=document.querySelector('#gold')?.closest('.stat');
  const skill=document.querySelector('#points')?.closest('.stat');
  const dampf=document.querySelector('#energy')?.closest('.stat');

  const defs=[
    [gold,'v277-gold-card','Deine Währung für Händler & Upgrades'],
    [skill,'v277-skill-card','Punkte für deine Charakterwerte'],
    [dampf,'v277-dampf-card','Energie für Quests und Abenteuer']
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

  if(gold)gold.classList.toggle('v277-event-on',!!v274GoldEventActive());

  v279BuildHarzCard();
  v271PaintDampf();
};

/* Neutralize V4.02's scroll repair.
   It was the reason the second Dampf badge appeared/disappeared while scrolling. */
v278StabilizeResources=function(){
  try{
    v279BuildHarzCard();
    const topGold=document.querySelector('#gold');
    if(topGold){
      const badges=[...topGold.querySelectorAll(':scope > .v276-gold2')];
      badges.slice(1).forEach(x=>x.remove());
    }
  }catch(e){}
};

/* V8.009: v279 global render/timer repair retired; v283/v284 are final resource owners. */

