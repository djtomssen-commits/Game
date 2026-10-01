(()=>{
  'use strict';
  if(window.__glDungeonReadyPushV1)return;
  window.__glDungeonReadyPushV1=true;
  const HOUR=60*60*1000;

  async function dungeonPushUser(){
    try{
      if(typeof v073Db==='undefined'||!v073Db?.auth)return null;
      try{
        let {data}=await v073Db.auth.getSession();
        let session=data?.session||null;
        if(session){
          try{
            const refreshed=await v073Db.auth.refreshSession();
            if(refreshed?.data?.session)session=refreshed.data.session;
            if(refreshed?.error)console.warn('[GL Dungeon Push] forced refresh',refreshed.error);
          }catch(e){console.warn('[GL Dungeon Push] refresh exception',e);}
          if(session?.user)return session.user;
        }
      }catch(e){console.warn('[GL Dungeon Push] session',e);}
      const {data,error}=await v073Db.auth.getUser();
      if(error)return null;
      return data?.user||null;
    }catch(e){
      console.warn('[GL Dungeon Push] user',e);
      return null;
    }
  }

  async function cancelDungeonPush(){
    try{
      const user=await dungeonPushUser();
      if(!user)return false;
      const nowIso=new Date().toISOString();
      const {error}=await v073Db.from('push_jobs')
        .update({cancelled_at:nowIso,updated_at:nowIso})
        .eq('user_id',user.id)
        .eq('type','dungeon_ready')
        .is('sent_at',null)
        .is('cancelled_at',null);
      if(error)throw error;
      return true;
    }catch(e){
      console.warn('[GL Dungeon Push] cancel',e);
      return false;
    }
  }

  let dungeonSyncPromise=null;
  let dungeonSyncQueuedReadyAt=0;

  async function syncDungeonPush(forcedReadyAt=null){
    if(typeof window.glPushEnabled==='function'&&!window.glPushEnabled())return false;
    const requested=Number(forcedReadyAt);
    if(Number.isFinite(requested)&&requested>0){
      dungeonSyncQueuedReadyAt=Math.max(dungeonSyncQueuedReadyAt,requested);
    }
    if(dungeonSyncPromise)return dungeonSyncPromise;

    dungeonSyncPromise=(async()=>{
    try{
      const user=await dungeonPushUser();
      if(!user)return false;

      const forced=Number(dungeonSyncQueuedReadyAt||forcedReadyAt);
      dungeonSyncQueuedReadyAt=0;
      const lastFree=Math.max(0,Number(
        (typeof s!=='undefined'&&s?.dungeonPass?.lastFree)||0
      ));
      const readyAt=(Number.isFinite(forced)&&forced>Date.now())
        ? forced
        : (lastFree>0 ? lastFree+HOUR : 0);

      if(!readyAt || readyAt<=Date.now()){
        return cancelDungeonPush();
      }

      const nowIso=new Date().toISOString();
      const sendAt=new Date(readyAt).toISOString();
      const title='Grow Legends';
      const body='⚔️ Dein kostenloser Dungeon-Versuch ist wieder bereit!';

      const {data:updated,error:updateError}=await v073Db.from('push_jobs')
        .update({title,body,send_at:sendAt,updated_at:nowIso})
        .eq('user_id',user.id)
        .eq('type','dungeon_ready')
        .is('sent_at',null)
        .is('cancelled_at',null)
        .select('id');

      if(updateError)throw updateError;
      if(Array.isArray(updated)&&updated.length){
        console.info('[GL Dungeon Push] dungeon_ready aktualisiert',updated[0].id,sendAt);
        return true;
      }

      const {error:insertError}=await v073Db.from('push_jobs').insert({
        user_id:user.id,
        type:'dungeon_ready',
        title,
        body,
        send_at:sendAt
      });

      if(insertError){
        if(String(insertError.code||'')!=='23505')throw insertError;
        const {error:retryError}=await v073Db.from('push_jobs')
          .update({title,body,send_at:sendAt,updated_at:nowIso})
          .eq('user_id',user.id)
          .eq('type','dungeon_ready')
          .is('sent_at',null)
          .is('cancelled_at',null);
        if(retryError)throw retryError;
      }

      console.info('[GL Dungeon Push] dungeon_ready geplant',sendAt);
      return true;
    }catch(e){
      console.warn('[Grow Legends] Dungeon-Push konnte nicht geplant werden:',e);
      return false;
    }
    })();

    try{
      return await dungeonSyncPromise;
    }finally{
      dungeonSyncPromise=null;
    }
  }

  window.glSyncDungeonPushJob=syncDungeonPush;
  window.glCancelDungeonPushJob=cancelDungeonPush;

  /*
    Final owner hook:
    - only a REAL free attempt starts a new 1h timer and schedules a push.
    - Harz attempts preserve the existing free-timer anchor and must not move the push.
  */
  try{
    if(typeof consumeDungeonAttempt==='function'&&!consumeDungeonAttempt.__glDungeonPushV1){
      const base=consumeDungeonAttempt;
      const wrapped=async function(...args){
        const before=Math.max(0,Number(
          (typeof s!=='undefined'&&s?.dungeonPass?.lastFree)||0
        ));
        let freeBefore=true;
        try{
          freeBefore=(typeof freeDungeonReady==='function')
            ? !!freeDungeonReady()
            : (Date.now()-before>=HOUR);
        }catch(e){
          freeBefore=(Date.now()-before>=HOUR);
        }

        const result=await base.apply(this,args);
        if(!result)return result;

        setTimeout(()=>{
          try{
            const after=Math.max(0,Number(
              (typeof s!=='undefined'&&s?.dungeonPass?.lastFree)||0
            ));

            if(freeBefore && after>0){
              void syncDungeonPush(after+HOUR);
            }else if(!freeBefore && after>0){
              /* paid attempt: keep the already-running original timer */
              const readyAt=after+HOUR;
              if(readyAt>Date.now())void syncDungeonPush(readyAt);
            }
          }catch(e){
            console.warn('[GL Dungeon Push] attempt hook',e);
          }
        },80);

        return result;
      };
      wrapped.__glDungeonPushV1=true;
      wrapped.__glDungeonPushBase=base;
      consumeDungeonAttempt=wrapped;
      try{window.consumeDungeonAttempt=wrapped}catch(e){}
    }
  }catch(e){
    console.warn('[GL Dungeon Push] install attempt hook',e);
  }

  function resyncDungeonPush(){
    try{
      const lastFree=Math.max(0,Number(
        (typeof s!=='undefined'&&s?.dungeonPass?.lastFree)||0
      ));
      if(!lastFree)return;
      const readyAt=lastFree+HOUR;
      if(readyAt>Date.now())void syncDungeonPush(readyAt);
      else void cancelDungeonPush();
    }catch(e){}
  }

  window.addEventListener('growlegends:account-ready',()=>setTimeout(resyncDungeonPush,1400));
  window.addEventListener('pageshow',()=>setTimeout(resyncDungeonPush,900),{passive:true});
})();
