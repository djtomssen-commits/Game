/* === v556-guild-progress-admin-js === */
(function(){
  'use strict';
  const THRESH=[0,500,1500,3500,7000,12500,20500,31500,46000,65000,90000,122000,162000,212000,275000,355000,460000,600000,900000,1800000];
  function guild(){try{return typeof v254Guild!=='undefined'?v254Guild:null}catch(e){return null}}
  function info(g){
    const xp=Math.max(0,Math.floor(Number(g?.guild_xp)||0));
    let lv=1;
    for(let i=1;i<THRESH.length;i++){if(xp>=THRESH[i])lv=i+1;else break}
    lv=Math.max(1,Math.min(20,lv));
    if(lv>=20)return {lv:20,pct:100,text:`${xp.toLocaleString('de-DE')} Gilden-EP · MAX`};
    const lo=THRESH[lv-1],hi=THRESH[lv];
    const pct=Math.max(0,Math.min(100,((xp/Math.max(1,hi))*100)));
    return {lv,pct,text:`${xp.toLocaleString('de-DE')} / ${hi.toLocaleString('de-DE')} Gilden-EP · noch ${(hi-xp).toLocaleString('de-DE')} bis Level ${lv+1}`};
  }
  function ensureProgress(){
    const g=guild();
    const hero=document.querySelector('#guild .v554-guild-hero');
    if(!g||!hero)return;
    let box=hero.querySelector(':scope > .v556-progress');
    if(!box){
      box=document.createElement('div');
      box.className='v556-progress';
      hero.appendChild(box);
    }
    const z=info(g);
    const sig=[z.lv,z.pct.toFixed(2),z.text].join('|');
    if(box.dataset.sig!==sig){
      box.innerHTML=`<div class="v556-progress-head"><span>🏰 GILDENFORTSCHRITT</span><b>Gildenlevel ${z.lv}</b></div><div class="v556-progress-bar"><i style="width:${z.pct.toFixed(2)}%"></i></div><small>${z.text}</small>`;
      box.dataset.sig=sig;
    }
    hero.querySelectorAll('.v554-progress-slot').forEach(x=>x.style.display='none');
    document.querySelectorAll('#guild .v409-guild-progress:not(.v556-progress)').forEach(x=>x.style.display='none');
  }
  function compactAdmin(){
    document.querySelectorAll('#guild #v257RequestsCard .v380-request-note').forEach(x=>x.style.display='none');
  }
  function paint(){ensureProgress();compactAdmin()}

  paint();
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(paint),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(paint),{passive:true});
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-screen="guild"],.v254-tab,#v380RefreshGuildRequests'))setTimeout(paint,40)},true);
  /* V6.206 performance: the old full #guild subtree MutationObserver caused
     every boss/chat/member DOM update to repaint guild decoration again.
     One startup pass + explicit render/navigation hooks are sufficient. */
  setTimeout(paint,120);

  if(typeof v254RenderGuild==='function'&&!window.__v6206GuildProgressWrap){
    const base=v254RenderGuild;
    v254RenderGuild=function(){
      const r=base.apply(this,arguments);
      requestAnimationFrame(paint);
      return r;
    };
    try{window.v254RenderGuild=v254RenderGuild}catch(e){}
    window.__v6206GuildProgressWrap=true;
  }
})();

