(()=>{
  'use strict';
  const VERSION='V6.52';
  function classIdFromText(text){
    const t=String(text||'').toLowerCase();
    if(t.includes('harzrufer'))return 'summoner';
    if(t.includes('frost')||t.includes('todesritter'))return 'frost';
    if(t.includes('blatt-schütze')||t.includes('blatt-schutze')||t.includes('schütze')||t.includes('schutze'))return 'scout';
    if(t.includes('magier'))return 'bruiser';
    return 'grower';
  }
  function decorateProfile(){
    const content=document.querySelector('#v074ProfileContent');
    const modal=document.querySelector('#v074ProfileOverlay .v074-profile-modal');
    if(!content||!modal)return;
    content.classList.add('v652-profile');

    let banner=content.querySelector(':scope > .v652-profile-banner');
    const head=content.querySelector('.v074-profile-head');
    const close=content.querySelector('#v074CloseBtn')||content.querySelector('.v074-close');
    if(!banner){
      banner=document.createElement('div');
      banner.className='v652-profile-banner';
      banner.innerHTML='<span>Spielerprofil</span>';
      content.insertBefore(banner,content.firstChild);
    }
    if(close&&close.parentElement!==banner)banner.appendChild(close);

    if(head){
      const info=head.querySelector(':scope > div:not(.v652-profile-avatar):not(.v326-profile-stat)');
      if(!head.querySelector('.v652-profile-avatar')){
        const cls=classIdFromText(content.querySelector('.v074-profile-class')?.textContent);
        const av=document.createElement('div');
        av.className='v652-profile-avatar';
        let src='';
        try{src=typeof v080AvatarFor==='function'?v080AvatarFor(cls):''}catch(e){}
        av.innerHTML=src?`<img src="${src}" alt="Spieleravatar">`:'<div class="v652-profile-avatar-fallback">🌿</div>';
        if(info)head.insertBefore(av,info);else head.prepend(av);
      }
      const topGrid=content.querySelector(':scope > .v326-profile-grid');
      const power=topGrid?.querySelector(':scope > .v326-profile-stat:first-child');
      if(power&&!head.querySelector('.v652-head-power')){
        power.classList.add('v652-head-power');
        head.appendChild(power);
      }
    }

    const mystic=content.querySelector(':scope > .v326-mystic');
    const pvp=content.querySelector(':scope > .v326-pvp');
    if(mystic&&pvp&&!mystic.parentElement.classList.contains('v652-profile-dual')){
      const dual=document.createElement('div');
      dual.className='v652-profile-dual';
      mystic.parentNode.insertBefore(dual,mystic);
      dual.append(mystic,pvp);
    }

    const title=[...content.querySelectorAll('h3')].find(x=>/Angelegte Ausrüstung/i.test(x.textContent||''));
    if(title)title.classList.add('v652-equipment-title');
  }

  let queued=0;
  function queueDecorate(resetScroll=false){
    if(queued)cancelAnimationFrame(queued);
    queued=requestAnimationFrame(()=>{
      queued=0;decorateProfile();
      if(resetScroll){const m=document.querySelector('#v074ProfileOverlay .v074-profile-modal');if(m)m.scrollTop=0}
    });
  }

  /* V8.009: v074OpenProfile wrapper retired; v655 owns loading/rendering.
     MutationObserver below remains the single decoration hook. */


  const content=document.querySelector('#v074ProfileContent');
  if(content){
    const mo=new MutationObserver(()=>queueDecorate(false));
    mo.observe(content,{childList:true,subtree:true});
  }
})();
