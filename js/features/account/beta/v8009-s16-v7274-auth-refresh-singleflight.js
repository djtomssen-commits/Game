(()=>{
 'use strict';
 if(window.__V7274_AUTH_REFRESH_SINGLEFLIGHT__)return;
 window.__V7274_AUTH_REFRESH_SINGLEFLIGHT__=true;
 let currentAuth=null,inflight=null,lastOkAt=0;
 function install(){
  try{
   if(typeof v073Db==='undefined'||!v073Db?.auth)return false;
   const auth=v073Db.auth;
   if(currentAuth!==auth){currentAuth=auth;inflight=null;lastOkAt=0}
   if(auth.refreshSession?.__v7274SingleFlight)return true;
   const base=auth.refreshSession.bind(auth);
   const wrapped=async function(){
    if(inflight)return inflight;
    if(Date.now()-lastOkAt<12000){
     try{
      const g=await auth.getSession();
      const session=g?.data?.session||null;
      if(session)return {data:{session,user:session.user||null},error:null};
     }catch(_){}
    }
    inflight=Promise.resolve()
      .then(()=>base.apply(auth,arguments))
      .then(r=>{if(r?.data?.session)lastOkAt=Date.now();return r})
      .finally(()=>{inflight=null});
    return inflight;
   };
   wrapped.__v7274SingleFlight=true;
   wrapped.__v7274Base=base;
   auth.refreshSession=wrapped;
   return true;
  }catch(e){console.warn('[V7.276] auth refresh guard install',e);return false}
 }
 try{
  if(typeof v073Init==='function'&&!v073Init.__v7274RefreshGuard){
   const baseInit=v073Init;
   const wrappedInit=async function(){const r=await baseInit.apply(this,arguments);install();return r};
   wrappedInit.__v7274RefreshGuard=true;
   try{v073Init=wrappedInit}catch(_){}
   try{window.v073Init=wrappedInit}catch(_){}
  }
 }catch(_){}
 ['growlegends:account-ready','growlegends:foreground-ready'].forEach(ev=>window.addEventListener(ev,install,{passive:true}));
 window.addEventListener('pageshow',install,{passive:true});
 setTimeout(install,0);setTimeout(install,250);setTimeout(install,900);
 window.v7274AuthRefreshDiagnostics=()=>({installed:!!currentAuth?.refreshSession?.__v7274SingleFlight,inflight:!!inflight,lastOkAt});
})();
