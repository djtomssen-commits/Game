/* ===== V4.02 Dampf card final owner =====
   Event active: 300/300 Dampf
   No event:     100/100 Dampf
   Refill:       small button, max 10x/day
*/

function v284BuildDampfCard(){
  const oldEnergy=document.querySelector('#energy');
  const card=oldEnergy?.closest('.stat');
  if(!card)return null;

  card.classList.add('v277-dampf-card','v284-dampf-card');

  /* V4.02: rebuild the card from one source of truth. */
  card.innerHTML=`
    <div class="v284-dampf-icon" aria-hidden="true">💨</div>
    <div class="v284-dampf-content">
      <div class="v284-dampf-label">DAMPF</div>
      <div id="energy" class="v284-dampf-value">—/—</div>
      <div id="v284DampfEvent" class="v284-dampf-event" style="display:none">💨 DAMPF-EVENT AKTIV</div>
      <button id="v026RefillBtn" class="small v284-dampf-buy" type="button">+20 Dampf kaufen · 1 Harz</button>
      <div id="v284DampfRefills" class="v284-dampf-refills">Auffüllungen: 0/10</div>
    </div>
  `;

  return card;
}

v271PaintDampf=function(){
  v271EnsureRefillState();

  const card=v284BuildDampfCard();
  if(!card)return;

  const active=v271DampfEventActive();
  const cap=active?300:100;

  let current=Math.max(0,Math.floor(Number(s.energy)||0));

  /* Event guarantees 300 max, normal mode 100 max.
     Existing over-cap values are normalized visually and in save state. */
  if(current>cap)current=cap;
  if(Number(s.energy)!==current)s.energy=current;

  const energyEl=card.querySelector('#energy');
  if(energyEl){
    energyEl.textContent=`${current}/${cap}`;
  }

  const eventEl=card.querySelector('#v284DampfEvent');
  if(eventEl){
    eventEl.style.display=active?'inline-flex':'none';
  }

  const used=Math.max(0,Math.min(10,Number(s.v271DampfRefill?.count)||0));

  const refillText=card.querySelector('#v284DampfRefills');
  if(refillText){
    refillText.textContent=`Auffüllungen: ${used}/10`;
  }

  const btn=card.querySelector('#v026RefillBtn');
  if(btn){
    btn.textContent='+20 Dampf kaufen · 1 Harz';
    btn.disabled=used>=10 || current>=cap;
    btn.onclick=v271RefillDampf;
  }

  /* Remove all older Dampf helper blocks/badges from this card. */
  card.querySelectorAll(
    '#v271DampfInfo,#v026Refill,.v277-dampf-event-chip,#v271DampfEventBadge'
  ).forEach(el=>{
    if(el.id!=='v026RefillBtn')el.remove();
  });
};

v026PaintDampf=v271PaintDampf;

/* Old helper must no longer create a second refill control. */
v026AddRefill=function(){
  v271PaintDampf();
};

/* V8.009: duplicate global render + 150/650/1500 ms repaint cascade retired.
   v284 owns the Dampf card DOM; v294 owns the final paint lifecycle. */
const v284Line=document.querySelector('#v141VersionLine');
