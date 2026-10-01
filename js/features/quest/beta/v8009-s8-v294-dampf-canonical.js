/* V4.02: one Dampf card owner, one heading, numeric value only. */
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
};
v026PaintDampf=v271PaintDampf;

const v294BaseRender=render;
render=function(){
  const r=v294BaseRender.apply(this,arguments);
  v271PaintDampf();
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

try{v271PaintDampf();}catch(e){}


const v294Line=document.querySelector('#v141VersionLine');
