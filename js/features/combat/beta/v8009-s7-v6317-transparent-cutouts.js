(()=>{
  'use strict';
  if(window.__V6317_TRANSPARENT_CUTOUTS__)return;
  window.__V6317_TRANSPARENT_CUTOUTS__=true;
  const ART={
    grower:'assets/v7198-base64/0aa947b91251adad6bdd.webp',
    scout:'assets/v7198-base64/a883a8a8e19ac7966fcd.webp',
    bruiser:'assets/v7198-base64/27b06274844b64f02c49.webp',
    frost:'assets/v7198-base64/cee95c189b1adc592223.webp',
    boss:'assets/v7198-base64/ec5a0df5306ad91d0b43.webp'
  };
  window.__V6317_GUILD_BOSS_ART__=ART;
  let lastClass='';
  function classFromMeta(){
    const direct=String(document.getElementById('v260DailyBossArena')?.dataset?.activeGuildClass||'').toLowerCase();
    if(['grower','scout','bruiser','frost','summoner'].includes(direct))return direct;
    const raw=((document.getElementById('v260FighterMeta')?.textContent||'')+' '+(document.getElementById('v260FighterName')?.textContent||'')).toLowerCase();
    if(/harzrufer|summoner/.test(raw))return 'summoner';
    if(/blatt|schütz|scout/.test(raw))return 'scout';
    if(/bong|magier|bruiser/.test(raw))return 'bruiser';
    if(/frost|todesritter/.test(raw))return 'frost';
    return 'grower';
  }
  function artForClass(cls){
    if(cls==='summoner'){
      try{const src=typeof v080AvatarFor==='function'?v080AvatarFor('summoner'):'';if(src)return src}catch(_){}
    }
    return ART[cls]||ART.grower;
  }
  function ensure(){
    const stage=document.querySelector('#v260DailyBossArena .v259-stage');
    if(!stage)return;
    if(!document.getElementById('v6320HeroCutout')){
      const img=document.createElement('img');img.id='v6320HeroCutout';img.alt='Aktiver Gildenkämpfer';img.decoding='async';img.draggable=false;stage.appendChild(img);
    }
    if(!document.getElementById('v6320BossCutout')){
      const img=document.createElement('img');img.id='v6320BossCutout';img.alt='Verseuchter Titan';img.decoding='async';img.draggable=false;img.src=ART.boss;stage.appendChild(img);
    }
  }
  function sync(){
    ensure();
    const hero=document.getElementById('v6320HeroCutout');
    const boss=document.getElementById('v6320BossCutout');
    const cls=classFromMeta();
    if(hero && cls!==lastClass){hero.src=artForClass(cls);hero.dataset.cls=cls;lastClass=cls;}
    if(boss && !boss.src)boss.src=ART.boss;
    const heroThumb=document.getElementById('v6309HeroThumb');if(heroThumb && hero?.src)heroThumb.src=hero.src;
    const bossThumb=document.getElementById('v6309BossThumb');if(bossThumb)bossThumb.src=ART.boss;
  }
  window.v6317SyncGuildBossArt=sync;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
