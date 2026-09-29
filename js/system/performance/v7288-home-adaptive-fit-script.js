(()=>{'use strict';
if(window.__V7288_HOME_ADAPTIVE_FIT__)return;
window.__V7288_HOME_ADAPTIVE_FIT__=true;

let raf=0,lastHero=null,lastWidth=0,baseHeight=0;

function px(n){return `${Math.max(0,Math.round(Number(n)||0))}px`}

function run(){
  raf=0;
  const world=document.getElementById('world');
  if(!world||!world.classList.contains('active'))return;
  const hero=world.querySelector('.v366-hero');
  if(!hero)return;
  const profile=hero.querySelector('.v366-profile');
  const motto=hero.querySelector('.v6103-motto');
  const chest=hero.querySelector('.v6239-weekly-chest');
  const welcome=hero.querySelector('.v366-welcome');
  if(!profile||!motto||!chest||!welcome)return;

  const width=Math.round(hero.getBoundingClientRect().width||hero.clientWidth||360);

  /* A rebuilt home or a real width change gets a fresh CSS baseline. */
  if(hero!==lastHero || Math.abs(width-lastWidth)>12 || !baseHeight){
    lastHero=hero;lastWidth=width;
    hero.style.removeProperty('height');
    hero.style.removeProperty('min-height');
    baseHeight=Math.max(300,Math.round(hero.getBoundingClientRect().height||390));
  }

  /* Start every fit from the real CSS baseline. This makes the result deterministic
     and prevents repeated calls from growing the hero forever. */
  hero.style.setProperty('height',px(baseHeight),'important');
  hero.style.setProperty('min-height',px(baseHeight),'important');

  requestAnimationFrame(()=>{
    if(!hero.isConnected)return;

    const hr=hero.getBoundingClientRect();
    const pr=profile.getBoundingClientRect();
    const mr=motto.getBoundingClientRect();
    const cr=chest.getBoundingClientRect();
    const wr=welcome.getBoundingClientRect();

    /* Everything at the bottom of the hero forms one reserved bottom zone.
       This is the piece the previous fit missed: it checked chest vs welcome,
       but not the real height of the character checklist/profile. */
    const bottomTop=Math.min(mr.top,cr.top,wr.top);
    const gap=width<=390?8:10;
    let extra=Math.max(0,Math.ceil((pr.bottom+gap)-bottomTop));

    /* Also protect against enlarged text / accessibility font scaling that can
       make the bottom widgets themselves taller than expected. */
    const lowest=Math.max(mr.bottom,cr.bottom,wr.bottom);
    extra=Math.max(extra,Math.ceil(lowest-(hr.bottom-6)));

    const target=Math.min(560,baseHeight+Math.max(0,extra));
    hero.style.setProperty('height',px(target),'important');
    hero.style.setProperty('min-height',px(target),'important');
    hero.dataset.v7288Fit=`${width}:${baseHeight}:${target}`;
  });
}

function schedule(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    try{window.v7258AdaptiveMobileFitNow?.()}catch(_){}
    setTimeout(run,45);
  });
}
window.v7288HomeAdaptiveFitNow=schedule;
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(schedule,150),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(schedule,80),{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(schedule,100),{passive:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,50),{once:true});
document.addEventListener('click',e=>{
  if(e.target instanceof Element && e.target.closest('[data-screen="world"],[data-go="world"],.v366-menu')){
    setTimeout(schedule,120);
  }
},true);

/* V7.308 performance: the 1.6 s layout-measurement poll is retired. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||e?.detail?.screen||'');
  if(!id||id==='world')setTimeout(schedule,70);
},{passive:true});

schedule();
})();
