(()=>{
'use strict';
if(window.__V7131_UI_POLISH__)return;
window.__V7131_UI_POLISH__=true;
window.__GROW_LEGENDS_RELEASE__='V7.131';
function toast(title,type='info',detail=''){try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}}
function referralMessage(url){return `Komm zu Grow Legends – erreiche Stufe 35 und wir sichern uns Belohnungen! ${url}`}
function ensureShareSheet(){
 let ov=document.getElementById('v7131ShareOverlay');if(ov)return ov;
 ov=document.createElement('div');ov.id='v7131ShareOverlay';
 ov.innerHTML=`<div class="v7131-share-sheet"><h3>🤝 Einladungslink teilen</h3><p>Wähle aus, wohin du deinen Freundeslink schicken möchtest.</p><div class="v7131-share-grid"><button data-v7131-share="whatsapp">💬 WhatsApp</button><button data-v7131-share="telegram">✈️ Telegram</button><button data-v7131-share="sms">📱 SMS</button><button data-v7131-share="email">✉️ E-Mail</button><button class="v7131-share-copy" data-v7131-share="copy">🔗 Link kopieren</button><button class="v7131-share-cancel" data-v7131-share="cancel">Abbrechen</button></div></div>`;
 document.body.appendChild(ov);
 ov.addEventListener('click',async e=>{
  if(e.target===ov){ov.classList.remove('show');return}
  const b=e.target?.closest?.('[data-v7131-share]');if(!b)return;
  const kind=String(b.dataset.v7131Share||'');const url=String(ov.dataset.url||'');const msg=referralMessage(url);
  if(kind==='cancel'){ov.classList.remove('show');return}
  if(kind==='copy'){
   try{await navigator.clipboard.writeText(url)}catch(_){const ta=document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(__){}ta.remove()}
   ov.classList.remove('show');toast('Link kopiert','success','Schick ihn deinem Freund.');return;
  }
  ov.classList.remove('show');
  if(kind==='whatsapp'){location.href='https://wa.me/?text='+encodeURIComponent(msg);return}
  if(kind==='telegram'){location.href='https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent('Komm zu Grow Legends – erreiche Stufe 35 und wir sichern uns Belohnungen!');return}
  if(kind==='sms'){location.href='sms:?body='+encodeURIComponent(msg);return}
  if(kind==='email'){location.href='mailto:?subject='+encodeURIComponent('Grow Legends – Freundeseinladung')+'&body='+encodeURIComponent(msg);return}
 });
 return ov;
}
window.v7131ReferralShareFallback=url=>{const ov=ensureShareSheet();ov.dataset.url=String(url||'');ov.classList.add('show');return true};
window.__V7131_UI_POLISH__=Object.freeze({questOfferDurationMinutesSeconds:true,serverMaterialSelectionDialogRestored:true,referralSlotRewardVisible:true,referralNativeShareWithChooserFallback:true,gameplayBalanceChanged:false,serverAuthorityChanged:false});
})();
