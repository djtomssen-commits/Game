(()=>{
  'use strict';
  if(window.__v7307BossSignupOwner)return;
  window.__v7307BossSignupOwner=true;

  const previous=typeof v254ToggleSignup==='function'?v254ToggleSignup:null;
  let busy=false;

  const scrolling=()=>document.scrollingElement||document.documentElement;

  const bossViewSnapshot=()=>{
    const btn=document.getElementById('v254BossSignup');
    const root=scrolling();
    return {
      scrollTop:Number(root?.scrollTop||window.scrollY||0),
      buttonTop:btn?.getBoundingClientRect?.().top??null
    };
  };

  const forceBossTab=()=>{
    const bossTab=document.querySelector('[data-v254-tab="boss"]');
    if(!bossTab)return;
    document.querySelectorAll('[data-v254-tab]').forEach(x=>x.classList.toggle('active',x===bossTab));

    const overview=document.getElementById('v254GuildOverview');
    const grow=document.getElementById('v7273GuildGrow');
    const boss=document.getElementById('v254GuildBoss');
    const war=document.getElementById('v254GuildWar');

    if(overview)overview.style.display='none';
    if(grow)grow.style.display='none';
    if(boss)boss.style.display='';
    if(war)war.style.display='none';
  };

  const restoreBossView=(view)=>{
    if(!view)return;
    forceBossTab();
    const root=scrolling();
    if(root)root.scrollTop=view.scrollTop;

    requestAnimationFrame(()=>{
      forceBossTab();
      const r=scrolling();
      if(r)r.scrollTop=view.scrollTop;
    });

    /* Several historical guild render wrappers repaint one frame later.
       One short correction prevents them from switching the visible tab or
       moving the viewport after the server response. */
    setTimeout(()=>{
      forceBossTab();
      const r=scrolling();
      if(r)r.scrollTop=view.scrollTop;
    },90);
  };

  const setMembersFromParticipants=(participants)=>{
    const ids=new Set((Array.isArray(participants)?participants:[]).map(x=>String(x?.user_id||'')));
    if(Array.isArray(v254Members)){
      v254Members.forEach(m=>{m.boss_signed=ids.has(String(m?.user_id||''));});
    }
  };

  const paintStable=(view)=>{
    try{v254RenderGuild()}catch(_){}
    try{v255RenderBoss()}catch(_){}
    restoreBossView(view);
  };

  const setBossSignup=async()=>{
    if(busy)return false;
    if(!v254Membership||!(await v254EnsureOnline()))return false;

    const view=bossViewSnapshot();
    forceBossTab();

    const wanted=!v254Membership.boss_signed;
    const btn=document.getElementById('v254BossSignup');
    busy=true;
    if(btn){
      btn.disabled=true;
      btn.textContent=wanted?'⏳ Anmeldung wird gespeichert …':'⏳ Anmeldung wird entfernt …';
    }

    try{
      const {data,error}=await v073Db.rpc('v7307_set_guild_boss_signup',{p_value:wanted});
      if(error)throw error;

      const payload=Array.isArray(data)?data[0]:data;
      if(!payload?.ok)throw new Error(payload?.reason||'Anmeldung konnte nicht gespeichert werden.');

      const registered=!!payload.registered;
      v254Membership.boss_signed=registered;
      v255BossParticipants=Array.isArray(payload.participants)?payload.participants:[];
      setMembersFromParticipants(v255BossParticipants);

      paintStable(view);

      const count=document.getElementById('v254BossCount');
      if(count)count.textContent=String(Number(payload.participant_count)||v255BossParticipants.length);

      try{
        v063Toast?.(
          registered?'Gildenboss-Anmeldung gespeichert':'Gildenboss-Anmeldung entfernt',
          registered?'success':'info',
          registered?'Du bist für die heutige Bossrunde angemeldet.':'Du nimmst heute nicht am Gildenboss teil.'
        );
      }catch(_){}

      /* One authoritative read-back catches cache/UI drift immediately,
         but must not change the active tab or scroll position. */
      try{
        const {data:verify,error:verifyError}=await v073Db.rpc('v255_get_guild_boss');
        if(!verifyError){
          const p=Array.isArray(verify)?verify[0]:verify;
          v255BossRound=p?.round||null;
          v255BossParticipants=Array.isArray(p?.participants)?p.participants:[];
          setMembersFromParticipants(v255BossParticipants);

          const me=v255BossParticipants.some(
            x=>String(x?.user_id||'')===String(v073User?.id||'')
          );
          v254Membership.boss_signed=me;
          paintStable(view);
        }
      }catch(_){}

      return registered;
    }catch(e){
      console.warn('[V8.003] guild boss signup',e);
      try{
        v063Toast?.(
          'Gildenboss-Anmeldung fehlgeschlagen',
          'error',
          e?.message||'Serverfehler'
        );
      }catch(_){}

      try{await v254LoadGuild()}catch(_){}
      try{await v255LoadBoss()}catch(_){}
      restoreBossView(view);
      return false;
    }finally{
      busy=false;
      paintStable(view);
      const liveBtn=document.getElementById('v254BossSignup');
      if(liveBtn)liveBtn.disabled=!v255LocalPhase().open;
    }
  };

  const owner=async function(kind){
    if(kind==='boss')return setBossSignup();
    return previous?previous.apply(this,arguments):undefined;
  };

  try{v254ToggleSignup=owner}catch(_){}
  try{window.v254ToggleSignup=owner}catch(_){}

  window.v7307SetGuildBossSignup=setBossSignup;

  /* V8.005: while today's signup is open, the live participant list from
     v255_get_guild_boss is canonical. A historical completed round must not
     overwrite it after render. */
  try{
    const previousBossLoad=window.v255LoadBoss||((typeof v255LoadBoss==='function')?v255LoadBoss:null);
    if(typeof previousBossLoad==='function'&&!previousBossLoad.__v8005LiveSignupOwner){
      const canonicalBossLoad=async function(){
        const view=bossViewSnapshot();
        const r=await previousBossLoad.apply(this,arguments);
        try{
          const phase=v255LocalPhase?.();
          if(phase?.open && typeof v073Db!=='undefined' && v073Db){
            const {data,error}=await v073Db.rpc('v255_get_guild_boss');
            if(error)throw error;

            const payload=Array.isArray(data)?data[0]:data;
            v255BossRound=payload?.round||null;
            v255BossParticipants=Array.isArray(payload?.participants)?payload.participants:[];

            try{
              window.v255BossRound=v255BossRound;
              window.v255BossParticipants=v255BossParticipants;
            }catch(_){}

            setMembersFromParticipants(v255BossParticipants);

            /* If the compatibility/history layer inserted yesterday's note,
               remove it while the current signup list is being shown. */
            if(!v255BossRound){
              document.getElementById('v7165BossHistoryNote')?.remove();
            }

            paintStable(view);
          }
        }catch(e){
          console.warn('[V8.005] canonical boss signup refresh',e);
          restoreBossView(view);
        }
        return r;
      };

      canonicalBossLoad.__v8005LiveSignupOwner=true;
      canonicalBossLoad.__base=previousBossLoad;

      try{v255LoadBoss=canonicalBossLoad}catch(_){}
      try{window.v255LoadBoss=canonicalBossLoad}catch(_){}
    }
  }catch(e){
    console.warn('[V8.005] install boss live-signup owner',e);
  }
})();
