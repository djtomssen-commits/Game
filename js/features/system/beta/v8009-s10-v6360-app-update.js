(()=>{
 'use strict';
 if(window.__V6360_APP_UPDATE__)return;window.__V6360_APP_UPDATE__=true;
 const LEGACY_NATIVE_VERSION='1.0.3';
 const DEFAULT_CONFIG={platform:'android',enabled:true,latest_version_name:'1.0.3',force_update:false,message:'Eine neue Version von Grow Legends ist im Google Play Store verfügbar.',play_store_url:'https://play.google.com/store/apps/details?id=de.growlegends.app'};
 const S={running:false,done:false,shown:false,last:null};
 const native=()=>{
  try{return new URLSearchParams(location.search).get('gl_native')==='1'||window.Capacitor?.isNativePlatform?.()===true}catch(_){return false}
 };
 const plugin=()=>{try{return window.Capacitor?.Plugins?.GrowLegendsBilling||null}catch(_){return null}};
 const db=()=>{try{return typeof v073Db!=='undefined'?v073Db:null}catch(_){return null}};
 const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
 function cmp(a,b){
  const A=String(a||'').match(/\d+/g)?.map(Number)||[],B=String(b||'').match(/\d+/g)?.map(Number)||[];
  for(let i=0;i<Math.max(A.length,B.length);i++){const x=A[i]||0,y=B[i]||0;if(x!==y)return x>y?1:-1}return 0;
 }
 async function appInfo(){
  const p=plugin();
  if(p){try{const x=await p.getAppInfo();if(x?.versionName)return x}catch(_){} }
  return {versionName:LEGACY_NATIVE_VERSION,versionCode:null,legacy:true};
 }
 async function playInfo(){
  const p=plugin();if(!p)return null;
  try{return await p.checkAppUpdate()}catch(_){return null}
 }
 async function config(){
  const x=db();if(!x)return null;
  try{
   const {data,error}=await x.from('app_update_config').select('platform,enabled,latest_version_name,force_update,message,play_store_url,updated_at').eq('platform','android').maybeSingle();
   if(error)throw error;return data?{...DEFAULT_CONFIG,...data}:DEFAULT_CONFIG;
  }catch(e){console.warn('[V6.360] update config',e);return null}
 }
 function ensure(){
  let ov=document.getElementById('v6360AppUpdate');if(ov)return ov;
  ov=document.createElement('div');ov.id='v6360AppUpdate';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');document.body.appendChild(ov);return ov;
 }
 function show({installed,cfg,fromPlay=false,availableCode=null}){
  if(S.shown)return;S.shown=true;
  const ov=ensure(),latest=String(cfg?.latest_version_name||'').trim();
  const newerNamed=latest&&cmp(latest,installed.versionName)>0;
  const target=newerNamed?latest:(availableCode?`Build ${availableCode}`:'Neue Version');
  const force=!!cfg?.force_update&&newerNamed;
  ov.innerHTML=`<section class="v6360-card">
   <div class="v6360-icon">🌿⬆️</div>
   <h2>Update verfügbar</h2>
   <div class="v6360-ver"><span>Installiert: <b>${esc(installed.versionName||'–')}</b></span><span>→</span><span>Neu: <b>${esc(target)}</b></span></div>
   <p>${esc(cfg?.message||DEFAULT_CONFIG.message)}</p>
   <div class="v6360-actions">
    <button type="button" class="v6360-now">Google Play öffnen</button>
    ${force?'':'<button type="button" class="v6360-later">Später</button>'}
   </div>
   <div class="v6360-note">${force?'Dieses Update ist erforderlich, um weiterzuspielen.':'Du kannst jetzt aktualisieren oder später weiterspielen.'}</div>
  </section>`;
  ov.classList.add('show');
  ov.querySelector('.v6360-later')?.addEventListener('click',()=>ov.classList.remove('show'));
  ov.querySelector('.v6360-now')?.addEventListener('click',async()=>{
   const p=plugin();
   try{if(p){await p.openStore();return}}catch(_){}
   const url=String(cfg?.play_store_url||DEFAULT_CONFIG.play_store_url);
   try{window.open(url,'_blank','noopener,noreferrer')}catch(_){location.href=url}
  });
  S.last={installed:installed.versionName,target,fromPlay,force,at:Date.now()};
 }
 async function check(){
  if(!native()||S.running||S.done)return false;S.running=true;
  try{
   const [installed,play,cfg0]=await Promise.all([appInfo(),playInfo(),config()]);
   const cfg=cfg0||DEFAULT_CONFIG;
   const playAvailable=!!play?.updateAvailable;
   const serverAvailable=cfg?.enabled!==false&&cmp(cfg?.latest_version_name,installed?.versionName)>0;
   if(playAvailable||serverAvailable){
    show({installed,cfg,fromPlay:playAvailable,availableCode:play?.availableVersionCode||null});S.done=true;return true;
   }
   /* Mark complete only after either Play or the public server config answered.
      This lets very early startup calls retry while Supabase is still booting. */
   if(play||cfg0){S.done=true;S.last={installed:installed?.versionName||'',playAvailable:false,serverAvailable:false,at:Date.now()}}
   return false;
  }catch(e){console.warn('[V6.360] app update check',e);return false}
  finally{S.running=false}
 }
 window.glCheckAppUpdate=()=>check();
 window.glAppUpdateState=()=>({...S});
 [1400,3200,6500,12000].forEach(ms=>setTimeout(()=>void check(),ms));
 window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void check(),350),{passive:true});
})();
