/* ===== V4.02 root fix =====
   V4.02 created a second Dampf event chip while V4.02 still created the first.
   V4.02 removed one during scroll, but V4.02's painter recreated it later.
   This version gives Dampf ONE owner and rebuilds Harz with explicit markup.
*/

function v279BuildHarzCard(){
  const value=document.querySelector('#topHarz');
  const card=value?.closest('.stat');
  if(!card)return;

  card.classList.add('v277-harz-card','v279-harz-card');

  if(!card.querySelector('.v279-resource-label')){
    const current=String(value.textContent||'—').trim();

    /* Replace the old loose "HARZ-TALER" text + emoji wrapper,
       but preserve the public #topHarz id used by all game logic. */
    card.innerHTML=`
      <div class="v279-resource-label">HARZ-TALER</div>
      <div class="v279-resource-value"><span id="topHarz">${current}</span></div>
      <div class="v279-resource-sub">Premium-Währung</div>
    `;
  }
}

/* Final Dampf painter: the only event badge is #v271DampfEventBadge.
   No extra V4.02 chip is ever created. */
v271PaintDampf=function(){
  v271EnsureRefillState();

  const cap=v271DampfCap();
  const e=Math.max(0,Math.min(cap,Math.floor(Number(s.energy)||0)));
  if(Number(s.energy)!==e)s.energy=e;

  const energyEl=document.querySelector('#energy');
  if(energyEl)energyEl.textContent=`💨 ${e}/${cap}`;

  const host=energyEl?.parentElement;
  if(host){
    /* Remove the redundant V4.02 badge permanently. */
    host.querySelectorAll('.v277-dampf-event-chip').forEach(x=>x.remove());

    let info=host.querySelector('#v271DampfInfo');
    if(!info){
      info=document.createElement('div');
      info.id='v271DampfInfo';
      host.appendChild(info);
    }

    const used=Number(s.v271DampfRefill?.count)||0;
    info.replaceChildren();

    const refillState=document.createElement('span');
    refillState.innerHTML=`Auffüllen: <b>${used}/10</b>`;
    info.appendChild(refillState);

    if(v271DampfEventActive()){
      const badge=document.createElement('span');
      badge.id='v271DampfEventBadge';
      badge.textContent='💨 EVENT 300/300';
      info.appendChild(badge);
    }
  }

  const refill=document.querySelector('#v026RefillBtn');
  if(refill){
    const used=Number(s.v271DampfRefill?.count)||0;
    refill.textContent=`🟢 +20 💨 Dampf (${used}/10)`;
    refill.disabled=used>=10 || e>=cap;
  }
};

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

const v279BaseRender=render;
render=function(){
  const r=v279BaseRender();
  requestAnimationFrame(()=>{
    v279BuildHarzCard();
    v271PaintDampf();
  });
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(()=>{
  try{
    v279BuildHarzCard();
    v271PaintDampf();
  }catch(e){console.error('V4.02 resource root fix',e)}
},250);
