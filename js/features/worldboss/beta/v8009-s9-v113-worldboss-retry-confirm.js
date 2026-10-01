/* ===== V4.02 Confirm Harz-Taler before paid worldboss retry ===== */
const v113OldWorldBossFight=v110Fight;

v110Fight=function(){
  v112EnsureWorldBossState();
  v110ResetDay();

  if(s.v110WorldBoss.freeUsed){
    if((s.harzTaler||0)<10){
      if(typeof v063Toast==='function'){
        v063Toast('Zu wenig Harz-Taler','warn','Ein weiterer Weltboss-Versuch kostet 10 Harz-Taler.');
      }
      return;
    }

    const ok=confirm(
      'Weiteren Versuch starten?\n\n'+
      'Dieser Versuch kostet 10 Harz-Taler.\n'+
      `Aktuell: ${s.harzTaler} Harz-Taler\n\n`+
      '10 Harz-Taler wirklich verwenden?'
    );

    if(!ok)return;

    /*
      Temporarily mark the attempt as free so the old fight function does not
      subtract the 10 Harz-Taler a second time. We subtract exactly once here.
    */
    s.harzTaler-=10;
    const oldFree=s.v110WorldBoss.freeUsed;
    s.v110WorldBoss.freeUsed=false;

    try{
      const result=v113OldWorldBossFight();
      s.v110WorldBoss.freeUsed=true;
      persist(false);
      return result;
    }catch(e){
      s.v110WorldBoss.freeUsed=oldFree;
      s.harzTaler+=10;
      throw e;
    }
  }

  return v113OldWorldBossFight();
};

/* V7.113: retired pure pass-through render wrapper (V113). */
