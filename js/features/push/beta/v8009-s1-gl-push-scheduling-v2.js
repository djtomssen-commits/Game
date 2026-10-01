(()=>{
  'use strict';
  if(window.__glPushSchedulingV2)return;
  window.__glPushSchedulingV2=true;

  function glPushDebug(){/* diagnostics disabled in production */}
  window.glPushDebug=glPushDebug;

  async function glPushUser(){
    try{
      if(typeof v073Db==='undefined'||!v073Db?.auth)return null;
      /* Prefer the already-persisted session. This works immediately in the APK
         even when a network getUser() validation is temporarily delayed. */
      try{
        let {data}=await v073Db.auth.getSession();
        let session=data?.session||null;
        if(session){
          /* APK/WebView: always renew the persisted Supabase session before a
             scheduled push write. A locally unexpired access token can still be
             stale after the app has been killed/resumed. */
          try{
            const refreshed=await v073Db.auth.refreshSession();
            if(refreshed?.data?.session)session=refreshed.data.session;
            if(refreshed?.error)console.warn('[GL Push] forced refresh',refreshed.error);
          }catch(refreshErr){
            console.warn('[GL Push] forced refresh exception',refreshErr);
          }
          if(session?.user)return session.user;
        }
      }catch(e){console.warn('[GL Push] session refresh',e);}
      const {data,error}=await v073Db.auth.getUser();
      if(error)return null;
      return data?.user||null;
    }catch(e){console.warn('[GL Push] user',e);return null;}
  }

  function glNextGrowReadyAt(){
    try{
      const plants=(typeof s!=='undefined'&&s?.grow?.plants)||[];
      const now=Date.now();
      const times=plants.filter(Boolean)
        .map(p=>(Number(p.start)||0)+(Number(p.duration)||0))
        .filter(t=>Number.isFinite(t)&&t>now);
      return times.length?Math.min(...times):null;
    }catch(e){console.warn('[GL Push] readyAt',e);return null;}
  }

  async function glSyncGrowPushJob(forcedReadyAt=null){
    if(typeof window.glPushEnabled==='function'&&!window.glPushEnabled())return false;
    try{
      const user=await glPushUser();
      if(!user){console.warn('[GL Push] keine eingeloggte Session');glPushDebug('FEHLER: Keine gültige Supabase-Session.\nDer Push-Job kann nicht angelegt werden.');return false;}
      const db=v073Db;
      const forced=Number(forcedReadyAt);
      const readyAt=(Number.isFinite(forced)&&forced>Date.now())?forced:glNextGrowReadyAt();
      const nowIso=new Date().toISOString();

      /* Keine Pflanze mehr offen: vorhandenen aktiven Job sauber abbrechen. */
      if(!readyAt){
        const {error}=await db.from('push_jobs')
          .update({cancelled_at:nowIso,updated_at:nowIso})
          .eq('user_id',user.id).eq('type','grow_ready')
          .is('sent_at',null).is('cancelled_at',null);
        if(error)throw error;
        return true;
      }

      const sendAt=new Date(readyAt).toISOString();

      /* Erst vorhandenen EINEN aktiven Job aktualisieren. Der partielle
         Unique-Index in Supabase garantiert maximal einen aktiven grow_ready-Job. */
      const {data:updated,error:updateError}=await db.from('push_jobs')
        .update({title:'Grow Legends',body:'🌱 Deine Pflanze ist erntereif!',send_at:sendAt,updated_at:nowIso})
        .eq('user_id',user.id).eq('type','grow_ready')
        .is('sent_at',null).is('cancelled_at',null)
        .select('id');
      if(updateError)throw updateError;
      if(Array.isArray(updated)&&updated.length){
        console.info('[GL Push] grow_ready aktualisiert',updated[0].id,sendAt);
        glPushDebug('Push-Job aktualisiert ✅\nID: '+updated[0].id+'\nsend_at: '+sendAt,true);
        return true;
      }

      /* Noch kein aktiver Job: genau einen anlegen. Falls zwei Aufrufe exakt
         gleichzeitig hier landen, gewinnt einer den INSERT; der andere
         aktualisiert danach den durch den Unique-Index geschützten Job. */
      const {error:insertError}=await db.from('push_jobs').insert({
        user_id:user.id,type:'grow_ready',title:'Grow Legends',
        body:'🌱 Deine Pflanze ist erntereif!',send_at:sendAt
      });
      if(insertError){
        if(String(insertError.code||'')!=='23505')throw insertError;
        const {error:retryError}=await db.from('push_jobs')
          .update({send_at:sendAt,updated_at:nowIso})
          .eq('user_id',user.id).eq('type','grow_ready')
          .is('sent_at',null).is('cancelled_at',null);
        if(retryError)throw retryError;
      }
      console.info('[GL Push] grow_ready geplant',sendAt);
      glPushDebug('Push-Job angelegt ✅\nsend_at: '+sendAt,true);
      return true;
    }catch(e){
      console.warn('[Grow Legends] Grow-Push konnte nicht geplant werden:',e);
      const msg=[e?.message,e?.code,e?.details,e?.hint].filter(Boolean).join(' | ')||String(e);
      glPushDebug('FEHLER beim Push-Job ❌\n'+msg);
      return false;
    }
  }
  window.glSyncGrowPushJob=glSyncGrowPushJob;


  /* Pflege-Push: maximal EIN aktiver Job pro Account. Die vier echten
     V4.99-Pflegegrenzen sind 20/45/70/88 %. Mehrere Pflanzen werden gebündelt:
     der früheste offene Zeitpunkt gewinnt. Nach einem bereits gesendeten
     Pflege-Push gilt 10 Minuten Ruhezeit, damit versetzte Pflanzen nicht spammen. */
  const GL_CARE_AT=[.20,.45,.70,.88];
  const GL_CARE_BUNDLE_MS=10*60*1000;
  let glCareSyncPromise=null;
  let glCareSyncQueued=false;

  function glNextGrowCareAt(){
    try{
      const plants=(typeof s!=='undefined'&&s?.grow?.plants)||[];
      const now=Date.now(),times=[];
      for(const p of plants.filter(Boolean)){
        const start=Number(p?.start)||0,duration=Number(p?.duration)||0;
        if(!(start>0&&duration>0))continue;
        const ready=start+duration;
        if(ready<=now)continue;
        const care=Array.isArray(p?.care)?p.care:[];
        for(let i=0;i<GL_CARE_AT.length;i++){
          if(care[i]===true)continue;
          const t=start+duration*GL_CARE_AT[i];
          /* Nur zukünftige Fenster planen. Bereits verpasste Pflege erzeugt
             beim Öffnen der App keinen nachträglichen Push. */
          if(t>now&&t<ready)times.push(t);
        }
      }
      return times.length?Math.min(...times):null;
    }catch(e){console.warn('[GL Push] careAt',e);return null;}
  }

  async function glSyncGrowCarePushJob(){
    if(typeof window.glPushEnabled==='function'&&!window.glPushEnabled())return false;
    glCareSyncQueued=true;
    if(glCareSyncPromise)return glCareSyncPromise;
    glCareSyncPromise=(async()=>{
      while(glCareSyncQueued){
        glCareSyncQueued=false;
        try{
          const user=await glPushUser();
          if(!user)return false;
          const db=v073Db,now=Date.now(),nowIso=new Date(now).toISOString();
          let careAt=glNextGrowCareAt();
          if(!careAt){
            const {error}=await db.from('push_jobs')
              .update({cancelled_at:nowIso,updated_at:nowIso})
              .eq('user_id',user.id).eq('type','grow_care')
              .is('sent_at',null).is('cancelled_at',null);
            if(error)throw error;
            continue;
          }

          /* Letzten tatsächlich gesendeten Pflege-Push prüfen. Dadurch bleiben
             mindestens 10 Minuten Abstand, auch bei sechs versetzten Pflanzen. */
          const {data:last,error:lastError}=await db.from('push_jobs')
            .select('sent_at').eq('user_id',user.id).eq('type','grow_care')
            .not('sent_at','is',null).order('sent_at',{ascending:false}).limit(1);
          if(lastError)throw lastError;
          const lastSent=Date.parse(last?.[0]?.sent_at||'');
          if(Number.isFinite(lastSent))careAt=Math.max(careAt,lastSent+GL_CARE_BUNDLE_MS);
          if(careAt<=now)careAt=now+15000;
          const sendAt=new Date(careAt).toISOString();

          const payload={title:'Grow Legends',body:'💧 Deine Pflanzen brauchen Pflege!',send_at:sendAt,updated_at:nowIso};
          const {data:updated,error:updateError}=await db.from('push_jobs')
            .update(payload).eq('user_id',user.id).eq('type','grow_care')
            .is('sent_at',null).is('cancelled_at',null).select('id');
          if(updateError)throw updateError;
          if(Array.isArray(updated)&&updated.length){
            console.info('[GL Push] grow_care aktualisiert',updated[0].id,sendAt);
            continue;
          }
          const {error:insertError}=await db.from('push_jobs').insert({
            user_id:user.id,type:'grow_care',title:'Grow Legends',
            body:'💧 Deine Pflanzen brauchen Pflege!',send_at:sendAt
          });
          if(insertError){
            if(String(insertError.code||'')!=='23505')throw insertError;
            const {error:retryError}=await db.from('push_jobs').update(payload)
              .eq('user_id',user.id).eq('type','grow_care')
              .is('sent_at',null).is('cancelled_at',null);
            if(retryError)throw retryError;
          }
          console.info('[GL Push] grow_care geplant',sendAt);
        }catch(e){
          console.warn('[Grow Legends] Pflege-Push konnte nicht geplant werden:',e);
          return false;
        }
      }
      return true;
    })();
    try{return await glCareSyncPromise;}
    finally{glCareSyncPromise=null;}
  }
  window.glSyncGrowCarePushJob=glSyncGrowCarePushJob;

  function installHooks(){
    try{
      /* Wrap the FINAL planting function at EOF. Several older game patches wrap
         plantSelectedSeed earlier, so relying only on the original base function
         is fragile. This hook runs after all of them and reacts only when the
         number of planted plants actually increased. */
      if(typeof plantSelectedSeed==='function'&&!plantSelectedSeed.__glPushV2){
        const basePlant=plantSelectedSeed;
        const wrappedPlant=function(...args){
          const before=((typeof s!=='undefined'&&s?.grow?.plants)||[]).filter(Boolean).length;
          const result=basePlant.apply(this,args);
          setTimeout(()=>{
            try{
              const plants=((typeof s!=='undefined'&&s?.grow?.plants)||[]).filter(Boolean);
              const after=plants.length;
              if(after<=before)return;
              const now=Date.now();
              const readyTimes=plants.map(p=>(Number(p?.start)||0)+(Number(p?.duration)||0))
                .filter(t=>Number.isFinite(t)&&t>now);
              const readyAt=readyTimes.length?Math.min(...readyTimes):null;
              glPushDebug('Pflanze erkannt – Push wird geplant…'+(readyAt?'\nsend_at: '+new Date(readyAt).toISOString():''));
              void glSyncGrowPushJob(readyAt);
            }catch(e){
              console.warn('[GL Push] final plant hook',e);
              glPushDebug('FEHLER im Pflanzen-Hook ❌\n'+String(e?.message||e));
            }
          },150);
          return result;
        };
        wrappedPlant.__glPushV2=true;
        wrappedPlant.__glPushBase=basePlant;
        plantSelectedSeed=wrappedPlant;
        try{window.plantSelectedSeed=wrappedPlant}catch(e){}
      }

      if(typeof harvestReadyPlants==='function'&&!harvestReadyPlants.__glPushV2){
        const base=harvestReadyPlants;
        const wrapped=function(...args){
          const result=base.apply(this,args);
          setTimeout(()=>void glSyncGrowPushJob(),100);
          return result;
        };
        wrapped.__glPushV2=true;
        harvestReadyPlants=wrapped;
        try{window.harvestReadyPlants=wrapped}catch(e){}
      }
    }catch(e){console.warn('[GL Push] hook install',e);}
  }

  installHooks();
  setTimeout(installHooks,500);
  setTimeout(installHooks,2000);
  window.addEventListener('growlegends:account-ready',()=>{
    installHooks();
    setTimeout(()=>{void glSyncGrowPushJob();void glSyncGrowCarePushJob();},1000);
  });

  /* Reopen/resume the APK: force a fresh Supabase token before the next plant. */
  async function glRefreshPushSessionOnResume(){
    try{
      if(typeof v073Db==='undefined'||!v073Db?.auth)return;
      const {data}=await v073Db.auth.getSession();
      if(!data?.session)return;
      const refreshed=await v073Db.auth.refreshSession();
      if(refreshed?.error)console.warn('[GL Push] resume refresh',refreshed.error);
      else if(refreshed?.data?.session){
        glPushDebug('Supabase-Session erneuert ✅',true);
      }
    }catch(e){console.warn('[GL Push] resume refresh exception',e);}
  }
  window.addEventListener('pageshow',()=>setTimeout(()=>{void glRefreshPushSessionOnResume();void glSyncGrowCarePushJob();},250),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')setTimeout(()=>{void glRefreshPushSessionOnResume();void glSyncGrowCarePushJob();},250);
  },{passive:true});

  /* V3: observe planting from WINDOW capture, before Growroom's document-capture
     handler can stopImmediatePropagation(). This avoids every historical
     plantSelectedSeed wrapper and reacts to the actual plant state change. */
  if(!window.__glPushPlantCaptureV3){
    window.__glPushPlantCaptureV3=true;

    const plantSig=()=>{
      try{
        return (((typeof s!=='undefined'&&s?.grow?.plants)||[]).map((p,i)=>
          p?`${i}:${Number(p.start)||0}:${Number(p.duration)||0}:${String(p.seed||'')}`:`${i}:empty`
        )).join('|');
      }catch(e){return '';}
    };

    const newestReadyAt=()=>{
      try{
        const plants=((typeof s!=='undefined'&&s?.grow?.plants)||[]).filter(Boolean);
        if(!plants.length)return null;
        const newest=plants.slice().sort((a,b)=>(Number(b?.start)||0)-(Number(a?.start)||0))[0];
        const t=(Number(newest?.start)||0)+(Number(newest?.duration)||0);
        return Number.isFinite(t)&&t>Date.now()?t:null;
      }catch(e){return null;}
    };

    window.addEventListener('click',e=>{
      try{
        const target=e?.target?.closest?.('#plantBtn,.slot-plant-btn[data-grow-slot],[data-v492-plant]');
        if(!target)return;

        const before=plantSig();
        glPushDebug('Pflanzaktion erkannt ✅\nWarte auf neuen Pflanzen-Status…',true);

        [150,500,1200].forEach(delay=>setTimeout(()=>{
          try{
            const after=plantSig();
            if(!after||after===before)return;
            const readyAt=newestReadyAt();
            if(!readyAt){
              glPushDebug('Pflanze erkannt, aber keine gültige Erntezeit gefunden ❌');
              return;
            }
            glPushDebug('Neue Pflanze erkannt ✅\nPush wird geplant…\nsend_at: '+new Date(readyAt).toISOString(),true);
            void glSyncGrowPushJob(readyAt);
          }catch(err){
            console.warn('[GL Push] plant capture delayed',err);
            glPushDebug('FEHLER im Pflanzen-Capture ❌\n'+String(err?.message||err));
          }
        },delay));
      }catch(err){
        console.warn('[GL Push] plant capture',err);
      }
    },true);
  }
})();
