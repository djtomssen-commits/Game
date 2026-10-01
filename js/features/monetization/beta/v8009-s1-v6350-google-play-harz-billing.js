(()=>{
 'use strict';
 if(window.__V6350_GOOGLE_PLAY_HARZ__)return;
 window.__V6350_GOOGLE_PLAY_HARZ__=true;

 const PRODUCT_MAP={
   harz_25:25,harz_50:50,harz_100:100,harz_150:150,harz_250:250,
   harz_400:400,harz_600:600,harz_900:900,harz_1300:1300,harz_2000:2000
 };
 let busy=false,recoveryBusy=false,healthCache={at:0,ok:false};

 const alertMsg=(msg,title='Harz Dealer',type='info')=>{
   try{if(typeof v115Alert==='function')return v115Alert(msg,title,type)}catch(_){ }
   try{if(typeof v063Toast==='function')return v063Toast(title,type,msg)}catch(_){ }
   try{alert(msg)}catch(_){ }
 };
 const toast=(title,type,msg)=>{
   try{if(typeof v063Toast==='function')return v063Toast(title,type,msg)}catch(_){ }
   return alertMsg(msg,title,type);
 };
 const plugin=()=>window.Capacitor?.Plugins?.GrowLegendsBilling||null;
 const durableUser=()=>{
   try{if(typeof v200DurableUser==='function')return !!v200DurableUser()}catch(_){ }
   return !!(window.v073User?.id&&!window.v073User?.is_anonymous);
 };
 const productForIndex=idx=>{
   const packs=window.V322_HARZ_PACKAGES||(typeof V322_HARZ_PACKAGES!=='undefined'?V322_HARZ_PACKAGES:[]); const p=packs[Number(idx)];
   if(!p)return null;
   const productId='harz_'+String(Number(p.harz)||0);
   return PRODUCT_MAP[productId]?{...p,productId}:null;
 };

 function setBusy(on){
   busy=!!on;
   document.querySelectorAll('[data-v322-buy],[data-v567-buy],[data-v338-buy],[data-v339-buy]').forEach(btn=>{
     if('disabled' in btn)btn.disabled=busy;
     btn.classList.toggle('gl-billing-busy',busy);
   });
 }

 async function ensureAccount(){
   try{if(typeof v073Init==='function')await v073Init()}catch(_){ }
   if(!durableUser()){
     alertMsg('Für Echtgeld-Käufe musst du mit deinem Grow-Legends-Account angemeldet sein.','Anmeldung erforderlich','warn');
     return false;
   }
   return true;
 }

 async function billingServerReady(force=false){
   if(!force&&healthCache.ok&&Date.now()-healthCache.at<60000)return true;
   if(typeof v073Db==='undefined'||!v073Db)return false;
   try{
     const {data,error}=await v073Db.functions.invoke('verify-google-play-purchase',{body:{action:'health'}});
     const ok=!error&&data?.ok===true&&data?.ready===true;
     healthCache={at:Date.now(),ok};
     return ok;
   }catch(e){
     console.warn('V6.350 billing health',e);
     return false;
   }
 }

 async function syncBeforePurchase(){
   try{if(typeof v075WriteCloudSave==='function')await v075WriteCloudSave(true)}catch(e){console.warn('V6.350 pre-purchase save',e)}
 }

 async function refreshAuthoritativeSave(fallbackBalance){
   try{
     if(typeof v075GetCloudSave==='function'&&typeof v075ApplyCloudSave==='function'){
       const cloud=await v075GetCloudSave();
       if(cloud?.save_data){await v075ApplyCloudSave(cloud.save_data);return}
     }
   }catch(e){console.warn('V6.350 cloud refresh',e)}
   if(Number.isFinite(Number(fallbackBalance)))s.harzTaler=Math.max(0,Number(fallbackBalance));
   try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){ }
   try{render()}catch(_){ }
 }

 const V7235_PENDING_PURCHASE_SERVER='growLegendsPendingPurchaseServerV7235';
 const V7235_TOKEN_SERVER_PREFIX='growLegendsPurchaseServerV7235:';
 function v7235CurrentPurchaseServer(){
   try{
     const cur=String(window.v343CurrentServer||localStorage.getItem('growLegendsSelectedServer')||'');
     if(cur==='server1')return 'server1';
   }catch(_){ }
   return 'beta';
 }
 function v7235RememberPendingServer(server){
   const id=server==='server1'?'server1':'beta';
   try{localStorage.setItem(V7235_PENDING_PURCHASE_SERVER,id)}catch(_){ }
   return id;
 }
 function v7235ServerForPurchase(purchase){
   const token=String(purchase?.purchaseToken||'');
   let id='';
   try{if(token)id=String(localStorage.getItem(V7235_TOKEN_SERVER_PREFIX+token)||'')}catch(_){ }
   try{if(!id)id=String(localStorage.getItem(V7235_PENDING_PURCHASE_SERVER)||'')}catch(_){ }
   if(id!=='server1'&&id!=='beta')id=v7235CurrentPurchaseServer();
   if(token){try{localStorage.setItem(V7235_TOKEN_SERVER_PREFIX+token,id)}catch(_){ }}
   return id;
 }
 function v7235ClearPurchaseBinding(purchase,server){
   const token=String(purchase?.purchaseToken||'');
   try{if(token)localStorage.removeItem(V7235_TOKEN_SERVER_PREFIX+token)}catch(_){ }
   try{
     if(String(localStorage.getItem(V7235_PENDING_PURCHASE_SERVER)||'')===String(server||'')){
       localStorage.removeItem(V7235_PENDING_PURCHASE_SERVER);
     }
   }catch(_){ }
 }
 function v7235ClearPendingServer(){try{localStorage.removeItem(V7235_PENDING_PURCHASE_SERVER)}catch(_){ }}

 async function verifyAndConsume(purchase,{quiet=false}={}){
   const native=plugin();
   if(!native||!purchase?.purchaseToken)return false;
   const productId=String(purchase.requestedProductId||purchase.products?.[0]||'');
   if(!PRODUCT_MAP[productId])throw new Error('Unbekanntes Google-Play-Produkt.');
   const serverId=v7235ServerForPurchase(purchase);

   if(typeof v073Db==='undefined'||!v073Db)throw new Error('Serververbindung nicht verfügbar.');
   const {data,error}=await v073Db.functions.invoke('verify-google-play-purchase',{
     body:{
       action:'verify',
       serverId,
       productId,
       purchaseToken:String(purchase.purchaseToken),
       orderId:purchase.orderId||null,
       purchaseTime:Number(purchase.purchaseTime)||null
     }
   });
   if(error)throw error;
   if(!data?.ok)throw new Error(data?.error||'Kauf konnte serverseitig nicht bestätigt werden.');
   if(String(data.server||'')!==serverId)throw new Error('Kauf wurde vom Server falsch zugeordnet.');

   await refreshAuthoritativeSave(data.balance);

   try{v7235ClearTokenServer(String(purchase.purchaseToken))}catch(_){}
   try{v7235ClearPendingServer()}catch(_){}

   try{
     await native.consume({purchaseToken:String(purchase.purchaseToken)});
   }catch(e){
     console.warn('V7.273 consume pending; will retry on original server',e);
     if(!quiet)toast('Kauf gutgeschrieben','success',`Die Harz-Taler sind auf ${serverId==='server1'?'Server 1':'Beta'} gutgeschrieben. Google Play wird den Verbrauch beim nächsten App-Start erneut abschließen.`);
     return true;
   }

   v7235ClearPurchaseBinding(purchase,serverId);
   try{if(typeof v322RenderDealer==='function')v322RenderDealer()}catch(_){ }
   try{document.querySelector('#v567Balance')?.replaceChildren(document.createTextNode(Math.max(0,Number(s.harzTaler)||0).toLocaleString('de-DE')))}catch(_){ }
   if(!quiet){
     const added=Number(data.harzAdded)||PRODUCT_MAP[productId]||0;
     toast('💎 Kauf erfolgreich','success',`+${added} Harz-Taler wurden auf ${serverId==='server1'?'Server 1':'Beta'} gutgeschrieben.`);
   }
   return true;
 }

 async function buy(idx){
   if(busy)return false;
   const pkg=productForIndex(idx);
   if(!pkg)return alertMsg('Dieses Harz-Paket ist nicht korrekt mit Google Play verknüpft.','Kauf nicht möglich','error');
   if(!(await ensureAccount()))return false;
   const native=plugin();
   if(!native){
     alertMsg('Echtgeld-Käufe sind nur in der Android-App über Google Play verfügbar.','Google Play erforderlich','info');
     return false;
   }
   if(!(await billingServerReady(true))){
     alertMsg('Die sichere Kaufprüfung ist noch nicht freigeschaltet. Es wird kein Kauf gestartet und kein Geld abgebucht.','Zahlungssystem noch nicht bereit','warn');
     return false;
   }

   setBusy(true);
   try{
     await syncBeforePurchase();

     let purchase=null;
     const purchaseServer=v7235RememberPendingServer(v7235CurrentPurchaseServer());
     try{
       purchase=await native.purchase({productId:pkg.productId,accountId:String(v073User.id)});
     }catch(e){
       console.warn('V7.273 Google Play purchase returned an error; checking open purchases first',e);
       try{
         const restored=await recoverPending({notify:true,serverHint:purchaseServer,allowBusy:true});
         if(restored>0)return true;
       }catch(re){console.warn('V7.273 immediate purchase recovery failed',re)}
       alertMsg(
         'Google Play hat den Kaufdialog nicht normal abgeschlossen. Offene Käufe wurden geprüft. Falls Google den Kauf bereits bestätigt hat, bleibt er gespeichert und wird automatisch erneut geprüft.',
         'Kaufprüfung läuft weiter',
         'info'
       );
       return false;
     }

     if(purchase?.status==='canceled'){
       v7235ClearPendingServer();
       alertMsg(
         'Der Kauf wurde abgebrochen. Es wurde nichts berechnet und keine Harz-Taler wurden gutgeschrieben.',
         'Kauf abgebrochen',
         'info'
       );
       return false;
     }
     if(purchase?.status==='pending'){
       alertMsg('Google Play verarbeitet die Zahlung noch. Harz-Taler werden erst nach bestätigter Zahlung gutgeschrieben.','Zahlung ausstehend','info');
       return false;
     }
     if(purchase?.status!=='purchased'){
       v7235ClearPendingServer();
       alertMsg(
         'Der Kauf wurde nicht abgeschlossen. Es wurde nichts berechnet und keine Harz-Taler wurden gutgeschrieben.',
         'Kauf nicht abgeschlossen',
         'info'
       );
       return false;
     }

     try{
       return await verifyAndConsume(purchase);
     }catch(e){
       console.error('V6.352 Google Play verification',e);
       alertMsg(
         'Google Play hat den Kauf gemeldet, aber die sichere Kaufprüfung konnte noch nicht abgeschlossen werden. Falls die Zahlung bestätigt wurde, bleibt der Kauf offen und wird beim nächsten App-Start erneut geprüft.\n\n'+String(e?.message||e),
         'Kaufprüfung fehlgeschlagen',
         'error'
       );
       return false;
     }
   }finally{setBusy(false)}
 }
 window.glPlayBuy=buy;


 async function v7237RecoverBoundTokens({notify=false}={}){
   if(!durableUser()||typeof v073Db==='undefined'||!v073Db)return 0;
   const current=v7235CurrentPurchaseServer();
   const native=plugin();
   const bound=[];
   try{
     for(let i=0;i<localStorage.length;i++){
       const key=localStorage.key(i);
       if(!key||!key.startsWith(V7235_TOKEN_SERVER_PREFIX))continue;
       const token=key.slice(V7235_TOKEN_SERVER_PREFIX.length);
       const server=String(localStorage.getItem(key)||'');
       if(!token||server!==current)continue;
       bound.push({token,server,key});
     }
   }catch(e){
     console.warn('V7.273 token binding scan',e);
     return 0;
   }

   let recovered=0;
   for(const item of bound){
     try{
       const {data,error}=await v073Db.functions.invoke('verify-google-play-purchase',{
         body:{
           action:'recover_token',
           serverId:item.server,
           purchaseToken:item.token
         }
       });
       if(error)throw error;
       if(!data?.ok)throw new Error(data?.error||'Gespeicherter Kauf konnte nicht wiederhergestellt werden.');
       if(String(data.server||'')!==item.server)throw new Error('Wiederhergestellter Kauf wurde dem falschen Server zugeordnet.');

       await refreshAuthoritativeSave(data.balance);

       try{localStorage.removeItem(item.key)}catch(_){}
       try{
         if(String(localStorage.getItem(V7235_PENDING_PURCHASE_SERVER)||'')===item.server){
           localStorage.removeItem(V7235_PENDING_PURCHASE_SERVER);
         }
       }catch(_){}

       if(native){
         try{
           await native.consume({purchaseToken:item.token});
         }catch(e){
           console.warn('V7.273 recovered purchase consume pending',e);
         }
       }

       recovered++;
       if(notify){
         const added=Number(data.harzAdded)||PRODUCT_MAP[String(data.productId||'')]||0;
         toast('💎 Kauf wiederhergestellt','success',`+${added} Harz-Taler wurden auf ${item.server==='server1'?'Server 1':'Beta'} gutgeschrieben.`);
       }
     }catch(e){
       console.warn('V7.273 bound purchase recovery',e);
       const msg=String(e?.message||e||'');
       if(/findet diesen offenen Kauf nicht mehr|nicht mehr abgeschlossen|purchaseState/i.test(msg)){
         /* Keep the token binding for one more app session; Google test purchases can
            briefly transition before their final state is visible. */
       }
     }
   }
   return recovered;
 }

 async function recoverPending({notify=false,serverHint='',allowBusy=false}={}){
   if((busy&&!allowBusy)||recoveryBusy||!durableUser())return 0;
   try{
     const boundRecovered=await v7237RecoverBoundTokens({notify});
     if(boundRecovered>0)return boundRecovered;
   }catch(e){console.warn('V7.273 bound token pre-recovery',e)}
   const native=plugin();if(!native)return 0;
   if(!(await billingServerReady(false)))return 0;
   if(serverHint==='server1'||serverHint==='beta')v7235RememberPendingServer(serverHint);
   recoveryBusy=true;
   let recovered=0;
   try{
     const res=await native.pendingPurchases();
     const purchases=Array.isArray(res?.purchases)?res.purchases:[];
     for(const purchase of purchases){
       try{
         const ok=await verifyAndConsume(purchase,{quiet:!notify});
         if(ok)recovered++;
       }catch(e){
         console.warn('V7.273 pending purchase verification',e);
       }
     }
     if(notify&&recovered===0&&purchases.length===0){
       toast('Google Play','info','Aktuell wurde kein offener, bereits bezahlter Kauf gefunden.');
     }
     return recovered;
   }catch(e){
     console.warn('V7.273 pending lookup',e);
     return 0;
   }finally{
     recoveryBusy=false;
   }
 }
 window.glRecoverPlayPurchases=recoverPending;
 window.glRecoverBoundPlayPurchases=v7237RecoverBoundTokens;

 function v7236RecoveryBurst(){
   [300,1200,3000,6500,12000,20000].forEach(ms=>{
     setTimeout(()=>{try{void recoverPending()}catch(_){}},ms);
   });
 }

 function patchDealerCopy(){
   document.querySelectorAll('#harzDealer .v567-info div').forEach(row=>{
     const b=row.querySelector('b');if(!b)return;
     if(/Zahlung/i.test(b.textContent||'')){
       const span=row.querySelector('span');if(span)span.textContent='Sichere Zahlung über Google Play. Gutschrift erst nach serverseitiger Kaufprüfung.';
     }
     if(/Hinweis/i.test(b.textContent||'')){
       const span=row.querySelector('span');if(span)span.textContent='Käufe werden deinem angemeldeten Grow-Legends-Account gutgeschrieben.';
     }
   });
 }
 document.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('[data-screen="harzDealer"],#v322HarzPlus'))setTimeout(patchDealerCopy,60)},true);
 window.addEventListener('growlegends:account-ready',()=>v7236RecoveryBurst());
 window.addEventListener('pageshow',()=>v7236RecoveryBurst(),{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)v7236RecoveryBurst()},{passive:true});
 document.addEventListener('click',e=>{
   if(e.target instanceof Element&&e.target.closest('[data-screen="harzDealer"],#v322HarzPlus')){
     setTimeout(()=>{try{void recoverPending({notify:true})}catch(_){}},500);
   }
 },true);
 setTimeout(patchDealerCopy,800);setTimeout(patchDealerCopy,2200);setTimeout(v7236RecoveryBurst,2200);
})();
