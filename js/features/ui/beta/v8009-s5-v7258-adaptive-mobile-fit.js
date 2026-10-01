(function(){
'use strict';
if(window.__V7258_ADAPTIVE_MOBILE_FIT__)return;
window.__V7258_ADAPTIVE_MOBILE_FIT__=true;
const PX=v=>`${Math.round(v)}px`;
function overlap(a,b,pad){
  pad=pad||0;
  return !(a.right-pad<=b.left+pad||a.left+pad>=b.right-pad||a.bottom-pad<=b.top+pad||a.top+pad>=b.bottom-pad);
}
function applyWorldFit(){
  const world=document.getElementById('world');
  if(!world||!world.classList.contains('active'))return;
  const hero=world.querySelector('.v366-hero');
  if(!hero)return;
  const profile=hero.querySelector('.v366-profile');
  const welcome=hero.querySelector('.v366-welcome');
  const motto=hero.querySelector('.v6103-motto');
  const chest=hero.querySelector('.v6239-weekly-chest');
  if(!profile||!welcome||!motto||!chest)return;
  const w=Math.round(hero.clientWidth||hero.getBoundingClientRect().width||360);
  const leftPad=w<=390?8:12;
  const profileWidth=w<=350?Math.min(184,w*0.52):w<=390?Math.min(188,w*0.51):w<=430?Math.min(194,w*0.49):Math.min(205,w*0.48);
  const mottoLeft=w<=390?12:18;
  const mottoWidth=w<=350?54:w<=390?60:w<=430?68:72;
  const mottoBottom=w<=390?10:18;
  const chestWidth=w<=350?64:w<=390?72:w<=430?80:88;
  const chestBottom=w<=390?10:18;
  let chestLeft=mottoLeft+mottoWidth+8;
  let welcomeLeftPx=Math.max(leftPad+profileWidth+(w<=390?8:12),Math.round(w*(w<=390?0.515:0.54)));
  let welcomeRightPx=w<=390?2:3;
  const maxWelcomeLeft=Math.max(leftPad+profileWidth+6,w-160);
  if(welcomeLeftPx>maxWelcomeLeft)welcomeLeftPx=maxWelcomeLeft;
  hero.style.setProperty('--v7258-profile-left',PX(leftPad));
  hero.style.setProperty('--v7258-profile-top',PX(w<=390?9:12));
  hero.style.setProperty('--v7258-profile-width',PX(profileWidth));
  hero.style.setProperty('--v7258-motto-left',PX(mottoLeft));
  hero.style.setProperty('--v7258-motto-bottom',PX(mottoBottom));
  hero.style.setProperty('--v7258-motto-width',PX(mottoWidth));
  hero.style.setProperty('--v7258-chest-left',PX(chestLeft));
  hero.style.setProperty('--v7258-chest-bottom',PX(chestBottom));
  hero.style.setProperty('--v7258-chest-width',PX(chestWidth));
  hero.style.setProperty('--v7258-welcome-left',PX(welcomeLeftPx));
  hero.style.setProperty('--v7258-welcome-right',PX(welcomeRightPx));
  hero.style.setProperty('--v7258-welcome-bottom',PX(w<=390?16:22));

  requestAnimationFrame(()=>{
    const heroRect=hero.getBoundingClientRect();
    let chestRect=chest.getBoundingClientRect();
    let welcomeRect=welcome.getBoundingClientRect();
    let mottoRect=motto.getBoundingClientRect();

    if(overlap(chestRect,welcomeRect,2)){
      let idealLeft=Math.round((welcomeRect.left-heroRect.left)-chestRect.width-8);
      let minLeft=Math.round(mottoRect.right-heroRect.left+6);
      let nextLeft=Math.max(minLeft,idealLeft);
      if(nextLeft!==chestLeft){
        chestLeft=nextLeft;
        hero.style.setProperty('--v7258-chest-left',PX(chestLeft));
      }
    }

    requestAnimationFrame(()=>{
      chestRect=chest.getBoundingClientRect();
      welcomeRect=welcome.getBoundingClientRect();
      mottoRect=motto.getBoundingClientRect();

      if(chestRect.right>heroRect.right-8){
        chestLeft=Math.max(Math.round(mottoRect.right-heroRect.left+6),Math.round(heroRect.width-chestRect.width-10));
        hero.style.setProperty('--v7258-chest-left',PX(chestLeft));
      }

      requestAnimationFrame(()=>{
        chestRect=chest.getBoundingClientRect();
        welcomeRect=welcome.getBoundingClientRect();
        mottoRect=motto.getBoundingClientRect();

        if(overlap(chestRect,welcomeRect,2)){
          const smaller=Math.max(60,Math.round(chestRect.width-8));
          hero.style.setProperty('--v7258-chest-width',PX(smaller));
          chestLeft=Math.max(Math.round(mottoRect.right-heroRect.left+6),Math.round((welcomeRect.left-heroRect.left)-smaller-8));
          hero.style.setProperty('--v7258-chest-left',PX(chestLeft));
        }
        if(overlap(chest.getBoundingClientRect(),motto.getBoundingClientRect(),2)){
          hero.style.setProperty('--v7258-motto-width',PX(Math.max(48,mottoWidth-8)));
          hero.style.setProperty('--v7258-chest-left',PX(Math.round(motto.getBoundingClientRect().right-heroRect.left+8)));
        }
      });
    });
  });
}
let raf=0;
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(applyWorldFit)}
window.v7258AdaptiveMobileFitNow=schedule;
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(schedule,120),{passive:true});
window.addEventListener('load',()=>{schedule();setTimeout(schedule,120);setTimeout(schedule,380)});
document.addEventListener('DOMContentLoaded',()=>{schedule();setTimeout(schedule,120)});
/* V7.308 performance: document-wide mutation observation + permanent 1.8 s polling retired.
   Fit only on real lifecycle/navigation changes. */
window.addEventListener('growlegends:account-ready',()=>setTimeout(schedule,80),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||e?.detail?.screen||'');
  if(!id||id==='world')setTimeout(schedule,45);
},{passive:true});
schedule();
})();
