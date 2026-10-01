/* ===== V4.02 Daily "Dampf" system ===== */
const V026_DAILY_DAMPF=100;
const V026_MAX_DAMPF=300;
const V026_REFILL=20;
function v026ServerOwned(){try{return !!(typeof v073User!=='undefined'&&v073User?.id&&window.v7081UseAuthority?.('quest'))}catch(_){return false}}
window.__V7173_LEGACY_LOCAL_GUARD__=window.__V7173_LEGACY_LOCAL_GUARD__||{dampfResetBlocks:0,midnightResetBlocks:0,worldbossTimerBlocks:0,retiredTimers:0,v026TimerActive:false,v127TimerActive:false,v112TimerActive:false,lastBlockAt:0};
function v7173LegacyBlock(kind){const g=window.__V7173_LEGACY_LOCAL_GUARD__;if(!g)return;g[kind]=(Number(g[kind])||0)+1;g.lastBlockAt=Date.now()}

function v026DayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function v026DailyReset(forceRender=false){
  if(v026ServerOwned()){v7173LegacyBlock('dampfResetBlocks');return false;}
  const today=v026DayKey();
  if(s.v026DampfDay!==today){
    s.energy=V026_DAILY_DAMPF;
    s.v026DampfDay=today;
    s.lastEnergy=Date.now();
    localStorage.setItem(KEY,JSON.stringify(s));
    if(forceRender)try{render()}catch(e){}
    return true;
  }
  return false;
}
v026DailyReset.__v7173ServerGuard=true;

/* Migration: on first V4.02 launch, start the new daily system at 100. */
if(!s.v026DampfInit&&!v026ServerOwned()){
  s.energy=V026_DAILY_DAMPF;
  s.v026DampfDay=v026DayKey();
  s.v026DampfInit=true;
  s.lastEnergy=Date.now();
  localStorage.setItem(KEY,JSON.stringify(s));
}else{
  v026DailyReset(false);
}

/* Disable old time-based regeneration. Keep timestamp current so old logic cannot accumulate. */
const v026LegacyDampfTimer=setInterval(()=>{
  if(document.hidden)return;
  if(v026ServerOwned()){clearInterval(v026LegacyDampfTimer);const g=window.__V7173_LEGACY_LOCAL_GUARD__;if(g){g.v026TimerActive=false;g.retiredTimers++;}v7173LegacyBlock('dampfResetBlocks');return;}
  s.lastEnergy=Date.now();
  v026DailyReset(true);
  localStorage.setItem(KEY,JSON.stringify(s));
},30000);
window.__V7173_LEGACY_LOCAL_GUARD__.v026TimerActive=true;
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{if(v026ServerOwned()&&window.__V7173_LEGACY_LOCAL_GUARD__.v026TimerActive){clearInterval(v026LegacyDampfTimer);window.__V7173_LEGACY_LOCAL_GUARD__.v026TimerActive=false;window.__V7173_LEGACY_LOCAL_GUARD__.retiredTimers++;}},900),{passive:true});

/* Rename visible energy wording to Dampf and show 300 cap. */
function v026PaintDampf(){
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length===0 && typeof el.textContent==='string'){
      el.textContent=el.textContent
        .replace(/Dampf/g,'Dampf')
        .replace(/⚡/g,'🌿');
    }
  });
  const energyEl=document.querySelector('#energy');
  if(energyEl)energyEl.textContent=`${Math.floor(s.energy||0)}/${V026_MAX_DAMPF}`;
}

/* Add refill control to the top/resource area. */
function v026AddRefill(){
  if(document.querySelector('#v026Refill'))return;
  const energyEl=document.querySelector('#energy');
  if(!energyEl)return;
  const host=energyEl.parentElement;
  const box=document.createElement('span');
  box.id='v026Refill';
  box.style.marginLeft='8px';
  box.innerHTML=`<button id="v026RefillBtn" class="small">🟢 +20 Dampf</button>`;
  host.appendChild(box);
  document.querySelector('#v026RefillBtn').onclick=()=>{
    v026DailyReset(false);
    if((s.energy||0)>=V026_MAX_DAMPF)return v115Alert('Dein Dampf ist bereits voll: 300/300.');
    if((s.harzTaler||0)<1)return v115Alert('Du hast keinen Harz-Taler mehr.');
    const add=Math.min(V026_REFILL,V026_MAX_DAMPF-(s.energy||0));
    if(!confirm(`1 Harz-Taler einsetzen und +${add} Dampf erhalten?\n\nNicht verbrauchter Dampf verfällt beim täglichen Reset.`))return;
    s.harzTaler--;
    s.energy=Math.min(V026_MAX_DAMPF,(s.energy||0)+V026_REFILL);
    persist(false);
    render();
    v026PaintDampf();
    v026AddRefill();
  };
}

/* Wrap render so a date change resets before UI is painted. */
const v026OldRender=render;
render=function(){
  v026DailyReset(false);
  v026OldRender();
  v026PaintDampf();
  v026AddRefill();
};

/* Old regen() may still be called by existing timers. Neutralize its regeneration effect. */
regen=function(){
  if(v026ServerOwned())return false;
  v026DailyReset(false);
  s.lastEnergy=Date.now();
  localStorage.setItem(KEY,JSON.stringify(s));
  try{v026PaintDampf();v026AddRefill()}catch(e){}
};

try{render()}catch(e){console.error('V4.02 Dampf init',e)}
