(()=>{
  'use strict';
  if(window.__v7307BossSignupOwner)return;
  window.__v7307BossSignupOwner=true;

  const previous=typeof v254ToggleSignup==='function'?v254ToggleSignup:null;
  let busy=false;

  const setMembersFromParticipants=(participants)=>{
    const ids=new Set((Array.isArray(participants)?participants:[]).map(x=>String(x?.user_id||'')));
    if(Array.isArray(v254Members)){
      v254Members.forEach(m=>{m.boss_signed=ids.has(String(m?.user_id||''));});
    }
  };

  const setBossSignup=async()=>{
    if(busy)return false;
    if(!v254Membership||!(await v254EnsureOnline()))return false;
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

      try{v254RenderGuild()}catch(_){}
      try{v255RenderBoss()}catch(_){}

      const count=document.getElementById('v254BossCount');
      if(count)count.textContent=String(Number(payload.participant_count)||v255BossParticipants.length);

      try{
        v063Toast?.(
          registered?'Gildenboss-Anmeldung gespeichert':'Gildenboss-Anmeldung entfernt',
          registered?'success':'info',
          registered?'Du bist für die heutige Bossrunde angemeldet.':'Du nimmst heute nicht am Gildenboss teil.'
        );
      }catch(_){}

      /* one authoritative read-back: catches cache/UI drift immediately */
      try{
        const {data:verify,error:verifyError}=await v073Db.rpc('v255_get_guild_boss');
        if(!verifyError){
          const p=Array.isArray(verify)?verify[0]:verify;
          v255BossRound=p?.round||null;
          v255BossParticipants=Array.isArray(p?.participants)?p.participants:[];
          setMembersFromParticipants(v255BossParticipants);
          const me=v255BossParticipants.some(x=>String(x?.user_id||'')===String(v073User?.id||''));
          v254Membership.boss_signed=me;
          try{v254RenderGuild()}catch(_){}
          try{v255RenderBoss()}catch(_){}
        }
      }catch(_){}

      return registered;
    }catch(e){
      console.warn('[V7.308] guild boss signup',e);
      try{v063Toast?.('Gildenboss-Anmeldung fehlgeschlagen','error',e?.message||'Serverfehler')}catch(_){}
      try{await v254LoadGuild()}catch(_){}
      try{await v255LoadBoss()}catch(_){}
      return false;
    }finally{
      busy=false;
      try{v254RenderGuild()}catch(_){}
      try{v255RenderBoss()}catch(_){}
      if(btn)btn.disabled=!v255LocalPhase().open;
    }
  };

  const owner=async function(kind){
    if(kind==='boss')return setBossSignup();
    return previous?previous.apply(this,arguments):undefined;
  };
  try{v254ToggleSignup=owner}catch(_){}
  try{window.v254ToggleSignup=owner}catch(_){}

  window.v7307SetGuildBossSignup=setBossSignup;
})();
