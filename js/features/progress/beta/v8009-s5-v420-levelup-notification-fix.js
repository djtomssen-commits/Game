(function(){
  const VERSION='V4.29 Stable';
  let hideTimer=0;
  let levelDone=Promise.resolve();

  function stamp(){}

  function show(oldLevel,newLevel){
    if(!(newLevel>oldLevel))return Promise.resolve(false);
    try{window.v6111Sfx?.('levelup')}catch(e){}
    const gained=newLevel-oldLevel;
    const attrGain=gained*2;
    const talentGain=Math.max(0,Math.floor(newLevel/2)-Math.floor(oldLevel/2));

    document.querySelectorAll('.v101-levelup,.v102-levelup-overlay,#v420LevelUpOverlay').forEach(x=>x.remove());
    const ov=document.createElement('div');
    ov.id='v420LevelUpOverlay';
    ov.innerHTML=`<div class="v420-card">
      <div class="v420-title">🎉 LEVEL UP!</div>
      <div class="v420-level">Level ${oldLevel} → ${newLevel}</div>
      <div class="v420-rewards"><b>+${attrGain} Attributpunkte</b>${talentGain?` · +${talentGain} Talentpunkt${talentGain===1?'':'e'}`:''}</div>
    </div>`;
    document.body.appendChild(ov);
    clearTimeout(hideTimer);
    levelDone=new Promise(resolve=>{
      hideTimer=setTimeout(()=>{ov.remove();resolve(true)},3600);
    });
    try{if(typeof v063Toast==='function')v063Toast('🎉 Level Up!','success',`Du bist jetzt Level ${newLevel}.`)}catch(e){}
    return levelDone;
  }
  window.v420ShowLevelUp=show;
  window.v420LevelUpDone=()=>levelDone;

  /* Final owner: a genuine Level-Up can only happen inside addXp().
     Comparing state before/after avoids fake popups during login/cloud hydration. */
  if(typeof addXp==='function' && !window.__v420LevelUpWrapped){
    const baseAddXp=addXp;
    addXp=function(n){
      const oldLevel=Math.max(1,Number(s?.level)||1);
      const result=baseAddXp.apply(this,arguments);
      const newLevel=Math.max(1,Number(s?.level)||1);
      if(newLevel>oldLevel){
        try{if(typeof v102ObservedLevel!=='undefined')v102ObservedLevel=newLevel}catch(e){}
        show(oldLevel,newLevel);
      }
      return result;
    };
    window.addXp=addXp;
    window.__v420LevelUpWrapped=true;
  }

  stamp();
})();
