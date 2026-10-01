
(()=>{
 'use strict';
 /* V7.151 PHASE 2: compatibility facade only.
    V7065 owns Grow state + Grow actions. The former V7064 bridge had its own
    boot interval, local full-state writes, broad render()/renderGrow() fanout
    and a second action lane. External callers still using the historical
    v7064GrowAuthorityRefresh API are delegated to V7065. */
 if(window.__V7064_SERVER_GROW_STAGE__)return;
 window.__V7064_SERVER_GROW_STAGE__=true;
 window.__V7064_COMPAT_ONLY_V7150__=true;
 const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
 function diag(){
   let d=null;try{d=window.v7065GrowAuthorityDiagnostics?.()||null}catch(_){}
   const enabled=!!(d?.enabled||window.__V7065_GROW_SERVER_MODE__);
   window.__V7064_GROW_SERVER_MODE__=enabled;
   return clone({version:'V7.151',ready:!!d?.ready,enabled,busy:!!d?.busy,lastError:String(d?.lastError||''),compat:true,serverMode:enabled});
 }
 window.v7064GrowAuthorityDiagnostics=diag;
 window.v7064GrowAuthorityRefresh=async()=>{
   try{
     const r=await window.v7065GrowAuthorityRefresh?.(true);
     diag();
     return r||null;
   }catch(e){diag();return null}
 };
})();
