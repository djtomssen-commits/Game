/* ===== V4.02 live worldboss event countdown ===== */

function v120ActiveWorldBossEvent(){
  const now=Date.now();
  return (v093Events||[]).find(ev=>{
    if(!ev?.is_active)return false;
    const start=ev.starts_at?new Date(ev.starts_at).getTime():0;
    const end=ev.ends_at?new Date(ev.ends_at).getTime():Infinity;
    const n=String(ev.name||'').toLowerCase();
    const match=n.includes('myst')||n.includes('smaragd')||n.includes('weltboss');
    return match && now>=start && now<=end;
  })||null;
}

function v120FormatRemaining(ms){
  if(!Number.isFinite(ms))return 'Ohne Endzeit';
  if(ms<=0)return 'Event beendet';

  const total=Math.floor(ms/1000);
  const days=Math.floor(total/86400);
  const hours=Math.floor((total%86400)/3600);
  const mins=Math.floor((total%3600)/60);
  const secs=total%60;

  if(days>0){
    return `${days}T ${String(hours).padStart(2,'0')}H ${String(mins).padStart(2,'0')}M`;
  }
  if(hours>0){
    return `${hours}H ${String(mins).padStart(2,'0')}M ${String(secs).padStart(2,'0')}S`;
  }
  return `${mins}M ${String(secs).padStart(2,'0')}S`;
}

function v120UpdateCountdown(){
  const event=v120ActiveWorldBossEvent();
  const boxes=document.querySelectorAll('[data-v120-countdown]');

  if(!event){
    boxes.forEach(el=>{
      el.textContent='⏳ Event beendet';
      el.classList.add('ending');
    });
    return;
  }

  const end=event.ends_at?new Date(event.ends_at).getTime():Infinity;
  const left=Number.isFinite(end)?end-Date.now():Infinity;
  const text=v120FormatRemaining(left);

  boxes.forEach(el=>{
    el.textContent=`⏳ Restzeit: ${text}`;
    el.classList.remove('urgent','ending');

    if(Number.isFinite(left)){
      if(left<=3600000)el.classList.add('ending');
      else if(left<=21600000)el.classList.add('urgent');
    }
  });
}

/* Add the live timer directly below attempts/wins in the top hero. */
const v120OldHeroHtml=v118WorldBossHeroHtml;
v118WorldBossHeroHtml=function(){
  let base=v120OldHeroHtml();

  if(!base.includes('data-v120-countdown')){
    base=base.replace(
      /(<div class="v118-boss-meta">[\s\S]*?<\/div>)/,
      `$1<div class="v120-event-time" data-v120-countdown>⏳ Restzeit wird geladen...</div>`
    );
  }
  return base;
};

/* Also support already-rendered hero cards. */
function v120InstallCountdown(){
  const hero=document.querySelector('#v118WorldBossHero');
  if(!hero)return;

  let box=hero.querySelector('[data-v120-countdown]');
  if(!box){
    const meta=hero.querySelector('.v118-boss-meta');
    if(meta){
      box=document.createElement('div');
      box.className='v120-event-time';
      box.dataset.v120Countdown='1';
      meta.insertAdjacentElement('afterend',box);
    }
  }

  v120UpdateCountdown();
}

/* V8.009 Worldboss powerblock: no global render wrapper. The home/world
   lifecycle mounts the countdown directly; the 1s ticker only updates while visible. */
const v120Mount=()=>{try{if(document.querySelector('#world')?.classList.contains('active'))v120InstallCountdown()}catch(e){}};
document.addEventListener('DOMContentLoaded',v120Mount,{once:true});
window.addEventListener('pageshow',v120Mount,{passive:true});
window.addEventListener('growlegends:account-ready',v120Mount,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||e?.detail?.screen||'')==='world')v120Mount();
},{passive:true});

/* Live countdown: update once per second. */
setInterval(()=>{
  try{
    if(document.hidden||!document.querySelector('#world')?.classList.contains('active'))return;
    v120InstallCountdown();
  }catch(e){}
},1000);

v120Mount();
