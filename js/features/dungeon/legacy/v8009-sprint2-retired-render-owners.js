/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-SPRINT-2. DO NOT LOAD. */

/* ===== v4225-final-10er-owner ===== */
(function(){
  function installV261Owner(){
    const detail=window.v261RenderDetail;
    if(typeof detail!=='function'){
      console.error('V4.225: v261RenderDetail fehlt');
      return false;
    }

    /* Alle alten Detail-Einstiegspunkte hart auf den neuesten Renderer legen. */
    try{window.v251RenderDetail=detail}catch(e){}
    try{v251RenderDetail=detail}catch(e){}
    try{window.v244RenderSelectedDungeonMap=detail}catch(e){}
    try{v244RenderSelectedDungeonMap=detail}catch(e){}
    try{window.v064RenderMap=detail}catch(e){}
    try{v064RenderMap=detail}catch(e){}

    /* Nur Kartenmodus übernehmen. Kampf/Reward laufen weiter über das bestehende System. */
    try{
      const current=window.renderDungeon || renderDungeon;
      if(typeof current==='function' && !current.__v4225DetailOwner){
        const base=current;
        const wrapped=function(){
          try{
            if(s?.dungeon?.layer==='dungeon' && s?.dungeon?.view==='map'){
              return detail();
            }
          }catch(e){}
          return base.apply(this,arguments);
        };
        wrapped.__v4225DetailOwner=true;
        wrapped.__v4225Base=base;
        try{window.renderDungeon=wrapped}catch(e){}
        try{renderDungeon=wrapped}catch(e){}
      }
    }catch(e){console.error('V4.225 renderDungeon owner',e)}

    /* Bereits offene Detailkarte sofort neu zeichnen. */
    try{
      const sec=document.getElementById('dungeon');
      if(sec?.classList.contains('active') &&
         s?.dungeon?.layer==='dungeon' &&
         s?.dungeon?.view==='map'){
        requestAnimationFrame(()=>{try{detail()}catch(e){console.error('V4.225 repaint',e)}});
      }
    }catch(e){}

    return true;
  }

  installV261Owner();
  window.addEventListener('pageshow',()=>setTimeout(installV261Owner,0),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(installV261Owner,0);
  },{passive:true});
})();

/* ===== v447-d9-preview-button-restore ===== */
(function(){
  'use strict';
  if(window.__V447_D9_PREVIEW_BUTTON__) return;
  window.__V447_D9_PREVIEW_BUTTON__=true;

  function previewActive(){
    return !!(
      window.__v441Dungeon9Preview?.active ||
      document.querySelector('#dungeonMapCard.v441-preview-mode')
    );
  }

  function ensureButton(){
    try{
      if(previewActive()) return;

      const dungeon=document.getElementById('dungeon');
      if(!dungeon?.classList.contains('active')) return;

      const card=document.getElementById('dungeonMapCard');
      if(!card) return;

      /* Auf Dungeon 7 ODER 8 darf die D9-Vorschau zum Testen geöffnet werden. */
      const selected=Number(s?.dungeon?.selected||0);
      if(selected!==6 && selected!==7) return;

      if(card.querySelector('.v447-d9-preview-launch')) return;

      const stage=card.querySelector('.v261-stage');
      if(!stage?.parentNode) return;

      /* Alte/unsichtbare Preview-Buttons sicher entfernen. */
      card.querySelectorAll('.v441-preview-launch').forEach(el=>el.remove());

      const btn=document.createElement('button');
      btn.type='button';
      btn.className='v441-preview-launch v447-d9-preview-launch';
      btn.textContent='👁 DUNGEON 9 VORSCHAU – NUR OPTIK, KEIN FORTSCHRITT';
      btn.style.display='block';
      btn.style.width='100%';

      btn.addEventListener('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        if(typeof window.v441OpenDungeon9Preview==='function'){
          window.v441OpenDungeon9Preview();
        }
      });

      stage.parentNode.insertBefore(btn,stage);
    }catch(e){
      console.error('V4.247 D9 Preview Button',e);
    }
  }

  /*
    Bewusst KEIN MutationObserver.
    Nur ein sehr leichter Existenz-Check. Solange der Button da ist,
    wird überhaupt nichts am DOM geändert und V46 Timer/Kampf bleiben unberührt.
  */
  /* V6.97: permanent D9 preview polling retired. */

  setTimeout(ensureButton,120);
  window.addEventListener('pageshow',()=>setTimeout(ensureButton,100),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(ensureButton,100);
  },{passive:true});

  /* Auch nach normalen Dungeon-Rendern sofort wieder einsetzen. */
  try{
    const current=window.renderDungeon || renderDungeon;
    if(typeof current==='function' && !current.__v447PreviewButtonOwner){
      const base=current;
      const wrapped=function(){
        const out=base.apply(this,arguments);
        setTimeout(ensureButton,80);
        return out;
      };
      wrapped.__v447PreviewButtonOwner=true;
      try{window.renderDungeon=wrapped}catch(e){}
      try{renderDungeon=wrapped}catch(e){}
    }
  }catch(e){}
})();
