/* ===== V4.02 single Harz amount + Dampf event wording ===== */

function v283CleanHarzAmount(){
  const card=document.querySelector('.harz-stat');
  if(!card)return;

  /* Remove all obsolete duplicate amount nodes created by older delayed timers. */
  card.querySelectorAll('.v281-harz-amount').forEach(x=>x.remove());

  /* Ensure there is exactly one canonical #topHarz node. */
  const all=[...card.querySelectorAll('#topHarz')];
  all.slice(1).forEach(x=>x.remove());

  let amount=card.querySelector('#topHarz');
  if(!amount || !amount.classList.contains('v282-harz-count')){
    const value=Math.max(0,Number(s?.harzTaler)||0);
    card.innerHTML=`
      <div class="v282-harz-label">HARZ-TALER</div>
      <div id="topHarz" class="v282-harz-count">${value}</div>
      <div class="v282-harz-sub">Premium-Währung</div>`;
    amount=card.querySelector('#topHarz');
  }

  if(amount)amount.textContent=Math.max(0,Number(s?.harzTaler)||0);
}

/* Final Dampf painter. During Dampf event the main card explicitly says
   "300/300 Dampf" instead of only "300/300". */
v271PaintDampf=function(){
  v271EnsureRefillState();

  const cap=v271DampfCap();
  const e=Math.max(0,Math.min(cap,Math.floor(Number(s.energy)||0)));
  if(Number(s.energy)!==e)s.energy=e;

  const eventActive=v271DampfEventActive();
  const energyEl=document.querySelector('#energy');
  if(energyEl){
    energyEl.textContent=eventActive
      ?`${e}/${cap} Dampf`
      :`💨 ${e}/${cap}`;
  }

  const host=energyEl?.parentElement;
  if(host){
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

    if(eventActive){
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
v026PaintDampf=v271PaintDampf;

/* Point every later Harz repair call to the same canonical cleaner. */
v282PaintHarzCard=v283CleanHarzAmount;
v279BuildHarzCard=v283CleanHarzAmount;
v281PaintHarzAmount=v283CleanHarzAmount;

const v283BaseRender=render;
render=function(){
  const r=v283BaseRender();
  requestAnimationFrame(()=>{
    v283CleanHarzAmount();
    v271PaintDampf();
  });
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

/* Run after all old delayed Harz callbacks have fired, then clean once more. */
setTimeout(v283CleanHarzAmount,250);
setTimeout(v283CleanHarzAmount,1100);
setTimeout(v283CleanHarzAmount,1800);


const v283Line=document.querySelector('#v141VersionLine');
