
/* ===== V4.02 immediate Harz-Taler sync ===== */

function v069SyncCurrencies(){
  document.querySelectorAll('#harz,#topHarz,#shopHarz,[data-harz],.harz-value').forEach(el=>{
    el.textContent=s.harzTaler;
  });

  /* Also update stat cards whose label contains Harz-Taler. */
  document.querySelectorAll('.stat').forEach(card=>{
    const txt=(card.textContent||'').toLowerCase();
    if(txt.includes('harz')){
      const b=card.querySelector('b');
      if(b)b.textContent=s.harzTaler;
    }
  });
}

/* Replace dungeon attempt function with immediate persistence + HUD refresh. */
consumeDungeonAttempt=async function(){
  if(freeDungeonReady()){
    s.dungeonPass.lastFree=Date.now();
    localStorage.setItem(KEY,JSON.stringify(s));
    return true;
  }

  if((s.harzTaler||0)>=1){
    const ok=await v063Confirm(
      'Dein Gratisversuch ist noch nicht bereit.\n\nMöchtest du 1 Harz-Taler für einen weiteren Dungeon-Versuch ausgeben?',
      'Weiterer Dungeon-Versuch',
      '1 Harz-Taler ausgeben'
    );

    if(!ok)return false;

    s.harzTaler=Math.max(0,(Number(s.harzTaler)||0)-1);

    /* Critical fix: save and update visible HUD immediately. */
    localStorage.setItem(KEY,JSON.stringify(s));
    v069SyncCurrencies();

    if(typeof v063Toast==='function'){
      v063Toast(
        '1 Harz-Taler verwendet',
        'success',
        `Verbleibend: ${s.harzTaler}`
      );
    }

    return true;
  }

  if(typeof v063Toast==='function'){
    v063Toast(
      'Kein Dungeon-Versuch verfügbar',
      'error',
      'Warte auf den Gratisversuch oder besorge Harz-Taler.'
    );
  }

  return false;
};

const v069BaseRender=render;
render=function(){
  v069BaseRender();
  v069SyncCurrencies();
  
};

try{
  v069SyncCurrencies();
  render();
}catch(e){
  console.error('V4.02 currency sync',e);
}
