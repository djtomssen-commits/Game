/* V8.008-C8 BETA — boss final arena/cleanup owner after replay owner. */

/* === V8.008-C8 merged source: v6309-guildboss-final-arena-script === */
/* === v6309-guildboss-final-arena-script === */
(()=>{
  'use strict';
  if(window.__V6309_GUILD_BOSS_FINAL_ARENA__)return;
  window.__V6309_GUILD_BOSS_FINAL_ARENA__=true;
  let queued=false;
  function ensureFinalArena(){
    const stage=document.querySelector('#v260DailyBossArena .v259-stage');if(!stage)return;
    if(!document.getElementById('v6309Clash')){const e=document.createElement('div');e.id='v6309Clash';stage.appendChild(e)}
    if(!document.getElementById('v6309HeroPlate')){const e=document.createElement('div');e.id='v6309HeroPlate';e.innerHTML='<img id="v6309HeroThumb" alt=""><div><b id="v6309HeroName">Kämpfer</b><small id="v6309HeroMeta"></small><div id="v6309HeroMiniBar"><i id="v6309HeroMiniFill"></i></div></div>';stage.appendChild(e)}
    if(!document.getElementById('v6309BossPlate')){const e=document.createElement('div');e.id='v6309BossPlate';e.innerHTML='<img id="v6309BossThumb" alt=""><div><b>Verseuchter Titan</b><small id="v6309BossMeta"></small><div id="v6309BossMiniBar"><i id="v6309BossMiniFill"></i></div></div>';stage.appendChild(e)}
  }
  function parseHp(text){const m=String(text||'').match(/([\d.,]+)\s*\/\s*([\d.,]+)/);if(!m)return null;const n=s=>Number(String(s).replace(/\./g,'').replace(',','.'))||0;return{hp:n(m[1]),max:Math.max(1,n(m[2]))}}
  function syncFinalArena(){
    queued=false;ensureFinalArena();
    const f=document.getElementById('v260FighterAvatar'),fn=document.getElementById('v260FighterName'),fm=document.getElementById('v260FighterMeta');
    const hThumb=document.getElementById('v6309HeroThumb'),hName=document.getElementById('v6309HeroName'),hMeta=document.getElementById('v6309HeroMeta'),cut=document.getElementById('v6320HeroCutout');
    if(hThumb&&(cut?.src||f?.src))hThumb.src=cut?.src||f.src;
    if(hName)hName.textContent=(fn?.textContent||'Kämpfer').replace(' · TEST','');
    if(hMeta)hMeta.textContent=fm?.textContent||'';
    const bossCut=document.getElementById('v6320BossCutout'),bImg=document.querySelector('#v260Titan .v6202-boss-img'),bThumb=document.getElementById('v6309BossThumb');
    if(bThumb&&(bossCut?.src||bImg?.src))bThumb.src=bossCut?.src||bImg.src;
    const hpText=document.getElementById('v260BossHpText')?.textContent||'',hp=parseHp(hpText),bMeta=document.getElementById('v6309BossMeta'),bFill=document.getElementById('v6309BossMiniFill');
    if(bMeta)bMeta.textContent=hpText||'Bereit';if(bFill&&hp)bFill.style.width=Math.max(0,Math.min(100,hp.hp/hp.max*100))+'%';
    const heroPct=Number((document.getElementById('v260HeroEnduranceText')?.textContent||'100').replace(/[^\d.]/g,''))||100,hFill=document.getElementById('v6309HeroMiniFill');if(hFill)hFill.style.width=Math.max(0,Math.min(100,heroPct))+'%';
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(syncFinalArena)}
  function observe(){
    ensureFinalArena();
    ['v260FighterAvatar','v260FighterName','v260FighterMeta','v260BossHpText','v260HeroEnduranceText'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.dataset.v6309Observed){el.dataset.v6309Observed='1';new MutationObserver(queue).observe(el,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','class','style']})}});
    queue();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
  setTimeout(observe,700);
})();

/* === V8.008-C8 merged source: v6315-guildboss-legacy-cleanup-script === */
/* === v6315-guildboss-legacy-cleanup-script === */
(()=>{
  'use strict';
  if(window.__V6315_GUILD_BOSS_LEGACY_CLEANUP__)return;
  window.__V6315_GUILD_BOSS_LEGACY_CLEANUP__=true;
  const trash=['v6308HeroHud','v6308BossHud','v6308ArenaPrompt','v260HeroImpact','v260BossImpact'];
  function clean(){
    trash.forEach(id=>document.getElementById(id)?.remove());
    document.querySelectorAll('#v260DailyBossArena .v6305-kicker').forEach(n=>n.remove());
    const vs=document.querySelector('#v260DailyBossArena .v259-vs');
    if(vs)vs.setAttribute('aria-hidden','true');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
  setTimeout(clean,300);setTimeout(clean,1200);setTimeout(clean,2600);
})();
