/* ===== V4.02 =====
   Gold x2 belongs only to rewards, not the player's Gold balance.
   Dampf refills are available only outside an active Dampf event.
*/

/* Final Gold decorator: no x2 badge on #gold/top balance. */
v276DecorateGold=function(){
  document.querySelectorAll('.v276-gold2').forEach(el=>el.remove());
  document.querySelectorAll('.v276-gold-text-active')
    .forEach(el=>el.classList.remove('v276-gold-text-active'));

  if(!v274GoldEventActive()){
    try{v277PrepareResourceCards()}catch(e){}
    return;
  }

  /* Quest offer rewards only. */
  document.querySelectorAll('#questList .quest').forEach((card,i)=>{
    const q=s.quests?.offers?.[i];
    if(!q)return;

    const base=Math.max(0,Number(q.v274BaseGold ?? q.gold)||0);
    q.v274BaseGold=base;

    const reward=[...card.querySelectorAll('.quest-meta span')]
      .find(el=>/💰|Gold/i.test(el.textContent||''));

    if(reward){
      reward.textContent=`💰 ${base*2} Gold`;
      reward.classList.add('v276-gold-text-active');

      const badge=document.createElement('span');
      badge.className='v276-gold2';
      badge.textContent='×2';
      badge.title='2× Gold-Event Belohnung';
      reward.appendChild(badge);
    }
  });

  /* Completed quest reward display only. */
  document.querySelectorAll('#v231QuestReward .v231-reward-value').forEach(el=>{
    if(!/Gold|💰/i.test(el.textContent||''))return;
    el.classList.add('v276-gold-text-active');
    if(!el.querySelector(':scope > .v276-gold2')){
      const badge=document.createElement('span');
      badge.className='v276-gold2';
      badge.textContent='×2';
      el.appendChild(badge);
    }
  });

  try{v277PrepareResourceCards()}catch(e){}

  /* Defensive cleanup in case an older queued decorator touched the top card. */
  document.querySelector('#gold')?.querySelectorAll('.v276-gold2').forEach(x=>x.remove());
};

/* Final Dampf painter:
   active event => no purchase button and no refill counter.
   no event     => +20 Dampf button, max 10/day. */
v271PaintDampf=function(){
  v271EnsureRefillState();

  const card=v284BuildDampfCard();
  if(!card)return;

  const active=v271DampfEventActive();
  const cap=active?300:100;

  let current=Math.max(0,Math.floor(Number(s.energy)||0));
  if(current>cap)current=cap;
  if(Number(s.energy)!==current)s.energy=current;

  card.classList.toggle('v288-dampf-event-active',active);

  const energyEl=card.querySelector('#energy');
  if(energyEl)energyEl.textContent=`${current}/${cap}`;

  const eventEl=card.querySelector('#v284DampfEvent');
  if(eventEl){
    eventEl.style.display=active?'inline-flex':'none';
    if(active)eventEl.textContent='💨 DAMPF-EVENT AKTIV';
  }

  const used=Math.max(0,Math.min(10,Number(s.v271DampfRefill?.count)||0));

  const refillText=card.querySelector('#v284DampfRefills');
  if(refillText){
    refillText.textContent=`Auffüllungen: ${used}/10`;
    refillText.style.display=active?'none':'block';
  }

  const btn=card.querySelector('#v026RefillBtn');
  if(btn){
    btn.textContent='+20 Dampf kaufen · 1 Harz';
    btn.style.display=active?'none':'inline-flex';
    btn.disabled=active || used>=10 || current>=100;
    btn.onclick=active?null:v271RefillDampf;
  }

  card.querySelectorAll(
    '#v271DampfInfo,#v026Refill,.v277-dampf-event-chip,#v271DampfEventBadge'
  ).forEach(el=>{
    if(el.id!=='v026RefillBtn')el.remove();
  });
};
v026PaintDampf=v271PaintDampf;

/* Hard guard: even if an old/direct caller invokes refill during an event,
   no Harz can be spent and no Dampf can be bought. */
const v288BaseRefillDampf=v271RefillDampf;
v271RefillDampf=function(){
  if(v271DampfEventActive()){
    v271PaintDampf();
    return false;
  }
  return v288BaseRefillDampf.apply(this,arguments);
};
v026Refill=v271RefillDampf;

const v288BaseRender=render;
render=function(){
  const r=v288BaseRender();
  requestAnimationFrame(()=>{
    try{
      v271PaintDampf();
      v276DecorateGold();
    }catch(e){}
  });
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(()=>{
  try{v271PaintDampf();v276DecorateGold()}catch(e){}
},300);


const v288Line=document.querySelector('#v141VersionLine');
