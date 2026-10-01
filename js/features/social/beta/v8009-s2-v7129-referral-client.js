(()=>{
'use strict';
const VERSION='V7.159',PENDING='glReferralPendingV7129',INSTALL='glReferralInstallV7129',PLAY_STORE='https://play.google.com/store/apps/details?id=de.growlegends.app';
let state=null,busy=false,bootFor='';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Math.max(0,Number(v)||0).toLocaleString('de-DE');
function user(){try{return (typeof v073User!=='undefined'&&v073User&&!v073User.is_anonymous)?v073User:null}catch(_){return null}}
async function db(){try{if(typeof v073Init==='function')await v073Init();return (typeof v073Db!=='undefined')?v073Db:null}catch(_){return null}}
async function installToken(){
 let t=String(window.__GROW_LEGENDS_INSTALL_TOKEN__||'');
 if(t){try{localStorage.setItem(INSTALL,t)}catch(_){};return t}
 try{t=localStorage.getItem(INSTALL)||''}catch(_){}
 if(t)return t;
 try{const dev=window.Capacitor?.Plugins?.Device;if(dev?.getId){const x=await dev.getId();const id=String(x?.identifier||x?.uuid||'');if(id)t='native:'+id}}catch(_){}
 if(!t){try{t='install:'+crypto.randomUUID()}catch(_){t='install:'+Date.now().toString(36)+Math.random().toString(36).slice(2)}}
 try{localStorage.setItem(INSTALL,t)}catch(_){}return t;
}
function capture(){try{const u=new URL(location.href);let c=String(u.searchParams.get('ref')||window.__GROW_LEGENDS_INSTALL_REFERRAL__||localStorage.getItem('gl_referral_pending_v1')||'').toUpperCase();if(/^GL[0-9A-F]{8}$/.test(c)){localStorage.setItem(PENDING,c);localStorage.setItem('gl_referral_pending_v1',c);if(u.searchParams.has('ref')){u.searchParams.delete('ref');history.replaceState({},document.title,u.pathname+(u.search||'')+(u.hash||''))}}}catch(_){}}
async function rpc(name,args={}){const x=await db();if(!x)throw new Error('SERVER_NOT_READY');const {data,error}=await x.rpc(name,args);if(error)throw error;return Array.isArray(data)?data[0]:data}
function applyState(st){if(!st?.ok)return;state=st;window.__V7129_REFERRAL_STATE__=st;document.body?.classList.remove('v7129-referral-frame');ensureCharIcon();paintPopup();try{if(document.getElementById('world')?.classList.contains('active'))window.v085InstallWorld?.(false)}catch(_){};try{window.v7137ApplyOwnFrames?.()}catch(_){}}
async function refresh(){if(!user())return null;const token=await installToken();const st=await rpc('v7129_referral_state',{p_install_token:token,p_client_version:VERSION});applyState(st);return st}
async function bindPending(){const u=user();if(!u)return;let c='';try{c=localStorage.getItem(PENDING)||''}catch(_){}if(!/^GL[0-9A-F]{8}$/.test(c))return;const token=await installToken();try{const r=await rpc('v7129_bind_referral',{p_code:c,p_install_token:token,p_client_version:VERSION});if(r?.ok){try{localStorage.removeItem(PENDING)}catch(_){};try{v063Toast?.('🤝 Einladung gespeichert','success','Erreiche Stufe 35, dann zählt deine Einladung.')}catch(_){}}else if(['INVALID_CODE','SELF_REFERRAL','DEVICE_ALREADY_USED','ACCOUNT_NOT_NEW','REFERRAL_TOO_LATE','ALREADY_REFERRED'].includes(String(r?.reason||''))){try{localStorage.removeItem(PENDING)}catch(_){}}}catch(e){console.warn('[V7.129] referral bind',e)}}
async function boot(){const u=user();if(!u)return;if(bootFor===u.id&&state)return;bootFor=u.id;await bindPending();try{await refresh()}catch(e){console.warn('[V7.129] referral state',e)}}
function ensureCharIcon(){const root=document.getElementById('v510HeroRoot');if(!root||document.getElementById('v7129CharacterReferralBtn'))return;const b=document.createElement('button');b.id='v7129CharacterReferralBtn';b.type='button';b.dataset.referralOpen='1';b.title='Freund werben';b.setAttribute('aria-label','Freund werben');b.textContent='🤝';root.appendChild(b)}
function ensurePopup(){let ov=document.getElementById('v7129ReferralOverlay');if(ov)return ov;ov=document.createElement('div');ov.id='v7129ReferralOverlay';ov.innerHTML='<div class="v7129-panel"><div class="v7129-head"><div class="v7129-head-art">🤝</div><div><h2>Freund werben</h2><p>Freunde einladen · Stufe 35 erreichen · Belohnungen sichern</p></div><button class="v7129-close" type="button">×</button></div><div id="v7129ReferralBody"></div></div>';document.body.appendChild(ov);ov.querySelector('.v7129-close').onclick=()=>ov.classList.remove('open');ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('open')});return ov}
function link(){const code=String(state?.code||'').toUpperCase();return /^GL[0-9A-F]{8}$/.test(code)?`${PLAY_STORE}&referrer=${encodeURIComponent('gl_ref='+code)}`:''}
function paintPopup(){const body=document.getElementById('v7129ReferralBody');if(!body||!state)return;const slots=Array.isArray(state.slots)?state.slots:[];const pending=Array.isArray(state.pending_invites)?state.pending_invites:[];let pi=0;const l=link();body.innerHTML=`<div class="v7129-progress"><b>${Math.min(10,Number(state.qualified_count)||0)}/10 freigeschaltet</b><span>${num(state.pending_count)} eingeladen · noch nicht Stufe 35</span></div><div class="v7129-slots">${slots.map(x=>{const friend=!x.qualified&&pi<pending.length?pending[pi++]:null;if(friend){const lv=Math.max(1,Math.min(35,Number(friend.level)||1));const pct=Math.max(3,Math.min(100,lv/35*100));return `<div class="v7129-slot pending"><strong>👤</strong><b>${x.slot}</b><div class="v7129-ref-name">${esc(friend.character_name||'Spieler')}</div><div class="v7129-ref-level">Stufe ${lv} / 35</div><div class="v7129-ref-bar"><i style="width:${pct}%"></i></div><small>⏳ Eingeladen</small></div>`}const cl=x.claimed?'claimed':x.qualified?'ready':'locked';return `<div class="v7129-slot ${cl}"><strong>${x.claimed?'✓':x.qualified?'💎':'🔒'}</strong><b>${x.slot}</b><small>${x.claimed?'💎 25 Harz · abgeholt':x.qualified?'💎 25 Harz · bereit':'💎 25 Harz · Stufe 35'}</small>${x.claimable?`<button data-referral-claim="${x.slot}">Abholen</button>`:''}</div>`}).join('')}</div><div class="v7129-grand ${state.grand_ready?'ready':''}"><h3>🎁 10-Freunde-Paket</h3><div class="v7129-rewards"><span>🪙 ${num(state.grand_gold)} Gold</span><span>🌰 10 Samen</span><span>⏱️ 10 Zeit-Samen</span><span>💎 100 Harz</span><span>🧩 250 Fragmente</span><span>🔷 1 mythisches Item</span><span>🖼️ Exklusiver Avatar-Rahmen</span></div><button data-referral-grand="1" ${state.grand_ready&&!state.grand_claimed?'':'disabled'}>${state.grand_claimed?'Paket abgeholt ✓':state.grand_ready?'Großes Paket abholen':'Bei 10 Freunden freigeschaltet'}</button></div><div class="v7129-linkbox"><label>Dein persönlicher Einladungslink</label><div class="v7129-linkrow"><input id="v7129ReferralLink" readonly value="${esc(l)}"><button data-referral-copy="1">Kopieren</button><button class="share" data-referral-share="1">Teilen</button></div><div class="v7129-note">Eingeladene Freunde werden sofort im Slot angezeigt. Die 25-Harz-Belohnung wird erst freigeschaltet, wenn der Freund Stufe 35 erreicht. Pro Account nur eine Zuordnung.</div></div>`}
async function open(){const ov=ensurePopup();ov.classList.add('open');const body=document.getElementById('v7129ReferralBody');if(body&&!state)body.innerHTML='<div class="v7129-progress"><b>Freundesprogramm wird synchronisiert …</b></div>';try{await refresh()}catch(e){if(body)body.innerHTML='<div class="v7129-progress"><b>Serverstand nicht erreichbar</b><span>Bitte erneut öffnen.</span></div>'}}
async function claim(slot){if(busy)return;busy=true;try{const r=await rpc('v7129_claim_referral_slot',{p_slot:Number(slot)});if(!r?.ok)throw new Error(String(r?.reason||'CLAIM_FAILED'));try{v063Toast?.('💎 25 Harz-Taler','success',`Einladung ${slot} abgeholt.`)}catch(_){};await window.v7072AuthorityRefresh?.();await refresh()}catch(e){try{v063Toast?.('Belohnung nicht verfügbar','error',String(e?.message||e))}catch(_){}}finally{busy=false}}
async function claimGrand(){if(busy)return;busy=true;try{const r=await rpc('v7129_claim_referral_grand');if(!r?.ok)throw new Error(String(r?.reason||'CLAIM_FAILED'));try{v063Toast?.('🎁 10-Freunde-Paket','success','Gold, Samen, Harz, Fragmente, mythisches Item und Avatar-Rahmen erhalten.')}catch(_){};await window.v7072AuthorityRefresh?.();try{await window.v7063ItemStageRefresh?.(true)}catch(_){};try{await window.v7064GrowAuthorityRefresh?.()}catch(_){};await refresh()}catch(e){try{v063Toast?.('Paket nicht verfügbar','error',String(e?.message||e))}catch(_){}}finally{busy=false}}
async function copy(){const l=link();if(!l)return;try{await navigator.clipboard.writeText(l);v063Toast?.('Link kopiert','success','Schick ihn deinem Freund.')}catch(_){const i=document.getElementById('v7129ReferralLink');i?.select();try{document.execCommand('copy')}catch(__){}}}
async function share(){
 const l=link();if(!l)return;
 const code=String(state?.code||'').toUpperCase();
 if(/^GL[0-9A-F]{8}$/.test(code)){
  try{
   const native=window.Capacitor?.Plugins?.GrowLegendsBilling;
   if(native?.shareReferral){await native.shareReferral({code});return}
  }catch(e){if(String(e?.message||'').toLowerCase().includes('cancel'))return;console.warn('[V7.151] native Play referral share',e)}
 }
 const title='Grow Legends';
 const text='Spiel Grow Legends mit mir! Installiere die App über Google Play – erreiche Stufe 35 und wir sichern uns Belohnungen!';
 const cap=window.Capacitor||null;
 const nativePlatform=!!cap&&((typeof cap.isNativePlatform==='function'&&cap.isNativePlatform())||String(cap.getPlatform?.()||'web')!=='web');
 if(nativePlatform){
  try{
   const sh=cap?.Plugins?.Share;
   if(sh?.share){await sh.share({title,text,url:l,dialogTitle:'Freund werben'});return}
  }catch(e){if(String(e?.message||'').toLowerCase().includes('cancel'))return;console.warn('[V7.151] native referral fallback share',e)}
  if(typeof window.v7131ReferralShareFallback==='function')return window.v7131ReferralShareFallback(l);
  return copy();
 }
 try{
  if(navigator.share){await navigator.share({title,text,url:l});return}
 }catch(e){if(e?.name==='AbortError')return;console.warn('[V7.151] web referral share',e)}
 if(typeof window.v7131ReferralShareFallback==='function')return window.v7131ReferralShareFallback(l);
 return copy();
}
window.addEventListener('growlegends:native-referral',e=>{try{const c=String(e?.detail?.code||'').toUpperCase();if(/^GL[0-9A-F]{8}$/.test(c)){window.__GROW_LEGENDS_INSTALL_REFERRAL__=c;localStorage.setItem(PENDING,c);localStorage.setItem('gl_referral_pending_v1',c)}const t=String(e?.detail?.installToken||'');if(t){window.__GROW_LEGENDS_INSTALL_TOKEN__=t;localStorage.setItem(INSTALL,t)}setTimeout(()=>void bindPending(),80)}catch(_){}},{passive:true});
document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-referral-open],[data-referral-claim],[data-referral-grand],[data-referral-copy],[data-referral-share]');if(!b)return;if(b.dataset.referralOpen!=null){e.preventDefault();open()}else if(b.dataset.referralClaim)claim(b.dataset.referralClaim);else if(b.dataset.referralGrand!=null)claimGrand();else if(b.dataset.referralCopy!=null)copy();else if(b.dataset.referralShare!=null)share()});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')requestAnimationFrame(ensureCharIcon)});
window.addEventListener('growlegends:account-ready',()=>{const run=()=>void boot();if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(run,1300);else setTimeout(run,120)},{passive:true});
window.addEventListener('pageshow',()=>{if(window.v7206StartupBusy?.()||window.v7204StartupQuiet?.())return;setTimeout(boot,220)},{passive:true});
capture();ensureCharIcon();setTimeout(()=>{if(!window.v7206StartupBusy?.()&&!window.v7204StartupQuiet?.())void boot()},5200);
window.v7129OpenReferral=open;window.v7129ReferralRefresh=refresh;window.v7129ReferralDiagnostics=()=>({version:VERSION,playStoreLink:link(),state:state?{qualified:state.qualified_count,claimed:state.claimed_count,pending:state.pending_count,grandReady:state.grand_ready,grandClaimed:state.grand_claimed,frame:state.frame_unlocked}:null,pendingCode:(()=>{try{return localStorage.getItem(PENDING)||''}catch(_){return''}})()});
window.__GROW_LEGENDS_RELEASE__='V7.129';
})();
