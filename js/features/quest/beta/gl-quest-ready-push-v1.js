
(()=>{
  'use strict';
  if(window.__glQuestReadyPushV1)return;
  window.__glQuestReadyPushV1=true;

  async function questPushUser(){
    try{
      if(typeof v073Db==='undefined'||!v073Db?.auth)return null;
      try{
        let {data}=await v073Db.auth.getSession();
        let session=data?.session||null;
        if(session){
          try{
            const refreshed=await v073Db.auth.refreshSession();
            if(refreshed?.data?.session)session=refreshed.data.session;
            if(refreshed?.error)console.warn('[GL Quest Push] forced refresh',refreshed.error);
          }catch(e){console.warn('[GL Quest Push] refresh exception',e);}
          if(session?.user)return session.user;
        }
      }catch(e){console.warn('[GL Quest Push] session',e);}
      const {data,error}=await v073Db.auth.getUser();
      if(error)return null;
      return data?.user||null;
    }catch(e){
      console.warn('[GL Quest Push] user',e);
      return null;
    }
  }

  async function cancelQuestPush(){
    try{
      const user=await questPushUser();
      if(!user)return false;
      const nowIso=new Date().toISOString();
      const {error}=await v073Db.from('push_jobs')
        .update({cancelled_at:nowIso,updated_at:nowIso})
        .eq('user_id',user.id)
        .eq('type','quest_ready')
        .is('sent_at',null)
        .is('cancelled_at',null);
      if(error)throw error;
      return true;
    }catch(e){
      console.warn('[GL Quest Push] cancel',e);
      return false;
    }
  }

  async function syncQuestPush(forcedEnds=null){
    if(typeof window.glPushEnabled==='function'&&!window.glPushEnabled())return false;
    try{
      const user=await questPushUser();
      if(!user)return false;

      const active=(typeof s!=='undefined')?s?.quests?.active:null;
      const forced=Number(forcedEnds);
      const ends=(Number.isFinite(forced)&&forced>Date.now())
        ? forced
        : Number(active?.ends||0);

      if(!Number.isFinite(ends)||ends<=Date.now()){
        return cancelQuestPush();
      }

      const nowIso=new Date().toISOString();
      const sendAt=new Date(ends).toISOString();
      const title='Grow Legends';
      const body='📜 Deine Quest ist abgeschlossen!';

      const {data:updated,error:updateError}=await v073Db.from('push_jobs')
        .update({title,body,send_at:sendAt,updated_at:nowIso})
        .eq('user_id',user.id)
        .eq('type','quest_ready')
        .is('sent_at',null)
        .is('cancelled_at',null)
        .select('id');

      if(updateError)throw updateError;
      if(Array.isArray(updated)&&updated.length){
        console.info('[GL Quest Push] quest_ready aktualisiert',updated[0].id,sendAt);
        return true;
      }

      const {error:insertError}=await v073Db.from('push_jobs').insert({
        user_id:user.id,
        type:'quest_ready',
        title,
        body,
        send_at:sendAt
      });

      if(insertError){
        if(String(insertError.code||'')!=='23505')throw insertError;
        const {error:retryError}=await v073Db.from('push_jobs')
          .update({title,body,send_at:sendAt,updated_at:nowIso})
          .eq('user_id',user.id)
          .eq('type','quest_ready')
          .is('sent_at',null)
          .is('cancelled_at',null);
        if(retryError)throw retryError;
      }

      console.info('[GL Quest Push] quest_ready geplant',sendAt);
      return true;
    }catch(e){
      console.warn('[Grow Legends] Quest-Push konnte nicht geplant werden:',e);
      return false;
    }
  }

  window.glSyncQuestPushJob=syncQuestPush;
  window.glCancelQuestPushJob=cancelQuestPush;

  /* Hook the final active quest-start implementation only after all historical wrappers. */
  try{
    if(typeof window.startQuest==='function'&&!window.startQuest.__glQuestPushV1){
      const base=window.startQuest;
      const wrapped=function(...args){
        const before=!!(typeof s!=='undefined'&&s?.quests?.active);
        const result=base.apply(this,args);
        const schedule=()=>{
          try{
            const q=(typeof s!=='undefined')?s?.quests?.active:null;
            if(!before&&q&&Number(q.ends)>Date.now())void syncQuestPush(Number(q.ends));
          }catch(e){console.warn('[GL Quest Push] start hook',e);}
        };
        if(result&&typeof result.then==='function')result.finally(()=>setTimeout(schedule,30));
        else setTimeout(schedule,30);
        return result;
      };
      wrapped.__glQuestPushV1=true;
      wrapped.__glQuestPushBase=base;
      window.startQuest=wrapped;
      try{startQuest=wrapped}catch(e){}
    }
  }catch(e){console.warn('[GL Quest Push] install start hook',e);}

  /* Zeit-Samen skip: once the quest is skipped, its scheduled completion push is obsolete. */
  try{
    if(typeof window.v316SkipActiveQuest==='function'&&!window.v316SkipActiveQuest.__glQuestPushV1){
      const base=window.v316SkipActiveQuest;
      const wrapped=function(...args){
        const result=base.apply(this,args);
        const done=()=>setTimeout(()=>void cancelQuestPush(),20);
        if(result&&typeof result.then==='function')result.then(done,()=>{});
        else done();
        return result;
      };
      wrapped.__glQuestPushV1=true;
      wrapped.__glQuestPushBase=base;
      window.v316SkipActiveQuest=wrapped;
      try{v316SkipActiveQuest=wrapped}catch(e){}
    }
  }catch(e){console.warn('[GL Quest Push] install skip hook',e);}

  /* If the reward is claimed before cron processes the job, prevent a stale notification. */
  try{
    if(typeof claimQuest==='function'&&!claimQuest.__glQuestPushV1){
      const base=claimQuest;
      const wrapped=function(...args){
        const wasReady=!!(typeof s!=='undefined'&&s?.quests?.active&&Date.now()>=Number(s.quests.active.ends||0));
        const result=base.apply(this,args);
        const done=()=>{
          try{
            if(wasReady&&!(typeof s!=='undefined'&&s?.quests?.active))void cancelQuestPush();
          }catch(e){}
        };
        if(result&&typeof result.then==='function')result.finally(()=>setTimeout(done,20));
        else setTimeout(done,20);
        return result;
      };
      wrapped.__glQuestPushV1=true;
      wrapped.__glQuestPushBase=base;
      claimQuest=wrapped;
      try{window.claimQuest=wrapped}catch(e){}
    }
  }catch(e){console.warn('[GL Quest Push] install claim hook',e);}

  function resyncActiveQuest(){
    try{
      const q=(typeof s!=='undefined')?s?.quests?.active:null;
      if(q&&Number(q.ends)>Date.now())void syncQuestPush(Number(q.ends));
    }catch(e){}
  }

  window.addEventListener('growlegends:account-ready',()=>setTimeout(resyncActiveQuest,1200));
  window.addEventListener('pageshow',()=>setTimeout(resyncActiveQuest,700),{passive:true});
})();
