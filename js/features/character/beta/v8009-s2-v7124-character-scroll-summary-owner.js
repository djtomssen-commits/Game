(()=>{
'use strict';
if(window.__V7124_CHARACTER_FIX__)return;
window.__V7124_CHARACTER_FIX__=true;
window.__V7124_CHARACTER_SUMMARY_OWNER__=true;
const EVENT='growlegends:navigation-open-v7119';
const S=window.__V7124_CHARACTER_STATE__||(window.__V7124_CHARACTER_STATE__={opens:0,summaryPaints:0,avatarHardens:0});
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function state(){try{return (typeof s!=='undefined'&&s)||window.s||{}}catch(_){return window.s||{}}}
function values(){
  const st=state(),cls=String(st?.playerClass||'');
  let count=0;
  try{
    if(typeof equippedSetCount==='function')count=Number(equippedSetCount(cls))||0;
    else if(typeof window.equippedSetCount==='function')count=Number(window.equippedSetCount(cls))||0;
    else count=Object.values(st?.equipment||{}).filter(x=>x?.setId===cls).length;
  }catch(_){ }
  let setName='Klassen-Set';
  try{
    if(typeof classSets!=='undefined')setName=classSets?.[cls]?.name||setName;
    else setName=window.classSets?.[cls]?.name||setName;
  }catch(_){ }
  let talents=Math.max(0,Number(st?.skillPoints)||0);
  try{
    if(typeof v314Available==='function')talents=Math.max(0,Number(v314Available())||0);
    else if(typeof window.v314Available==='function')talents=Math.max(0,Number(window.v314Available())||0);
  }catch(_){ }
  return {cls,count,setName,talents};
}
function paintSummary(){
  const box=document.getElementById('v459SetSummary');
  if(!box)return false;
  const v=values(),sig=[v.cls,v.count,v.setName,v.talents].join('|');
  const stable=box.dataset.v519Sig===sig&&box.querySelector('.v519-set-cell')&&box.querySelector('.v519-talent-cell');
  if(stable)return true;
  box.dataset.v519Sig=sig;
  box.innerHTML=v.cls
    ? '<span class="v519-set-cell"><span class="v519-summary-label"><span class="v519-summary-icon">🧩</span><span class="v519-summary-text">'+esc(v.setName)+'</span></span><b>'+v.count+'/6</b></span><span class="v519-talent-cell"><span class="v519-summary-label"><span class="v519-summary-icon">🌳</span><span class="v519-summary-text">Talentpunkte</span></span><b>'+v.talents+'</b></span>'
    : '<span class="v519-set-cell"><span class="v519-summary-label"><span class="v519-summary-icon">🧬</span><span class="v519-summary-text">Klasse wählen</span></span><b>—</b></span><span class="v519-talent-cell"><span class="v519-summary-label"><span class="v519-summary-icon">🌳</span><span class="v519-summary-text">Talentpunkte</span></span><b>'+v.talents+'</b></span>';
  S.summaryPaints++;
  return true;
}
function retireOldSummaryObserver(){
  const box=document.getElementById('v459SetSummary');
  if(!box)return;
  try{box.__v519Observer?.disconnect?.()}catch(_){ }
  /* Truthy sentinel prevents the old lexical watch() from attaching a new observer. */
  box.__v519Observer={disconnect(){}};
}
function hardenAvatar(){
  const root=document.querySelector('#character.v514-reference-hero #v510HeroRoot');
  if(!root)return false;
  root.setAttribute('data-hero-layout','reference-v7124');
  const img=root.querySelector('.v080-class-avatar-img');
  if(img){
    img.loading='eager';img.decoding='sync';
    try{img.fetchPriority='high'}catch(_){ }
    ['display','visibility','opacity','transform','-webkit-transform','filter','-webkit-filter','contain','content-visibility','will-change','backface-visibility','-webkit-backface-visibility'].forEach(k=>{
      const val=({display:'block',visibility:'visible',opacity:'1',transform:'none','-webkit-transform':'none',filter:'none','-webkit-filter':'none',contain:'none','content-visibility':'visible','will-change':'auto','backface-visibility':'visible','-webkit-backface-visibility':'visible'})[k];
      try{img.style.setProperty(k,val,'important')}catch(_){ }
    });
    try{img.style.setProperty('-webkit-mask-image','none','important');img.style.setProperty('mask-image','none','important');img.style.setProperty('clip-path','none','important')}catch(_){ }
  }
  S.avatarHardens++;
  return true;
}
function refresh(){
  if(!document.getElementById('character')?.classList.contains('active'))return false;
  retireOldSummaryObserver();
  paintSummary();
  hardenAvatar();
  return true;
}
window.v7124PaintCharacterSummary=paintSummary;
window.v519ApplyHero=paintSummary;
window.v7124HardenCharacterAvatar=hardenAvatar;
window.addEventListener(EVENT,e=>{
  if(String(e?.detail?.id||'')!=='character')return;
  S.opens++;
  /* Same navigation frame, no waiting room and no delayed repaint chain. */
  refresh();
},{passive:true});
window.addEventListener('growlegends:account-ready',()=>requestAnimationFrame(refresh),{passive:true});
window.addEventListener('pageshow',()=>requestAnimationFrame(refresh),{passive:true});
requestAnimationFrame(refresh);
window.__GROW_LEGENDS_RELEASE__='V7.124';
window.__V7124_CLEANUP__=Object.freeze({
  phase:9,
  characterAvatarScrollStable:true,
  avatarGpuTransformFilterRetired:true,
  characterSummarySingleOwner:true,
  oldSummaryMutationObserverRetired:true,
  delayedSummaryTimersRetired:15,
  noWaitingRoom:true,
  gameplayRulesChanged:false,
  serverAuthorityChanged:false
});
window.v7124CharacterDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',version:window.GROW_LEGENDS_VERSION?.short||'',
  opens:S.opens,summaryPaints:S.summaryPaints,avatarHardens:S.avatarHardens,
  summaryOwner:!!window.__V7124_CHARACTER_SUMMARY_OWNER__,
  summaryCells:document.querySelectorAll('#v459SetSummary .v519-set-cell,#v459SetSummary .v519-talent-cell').length,
  avatar:!!document.querySelector('#character #v510HeroRoot .v080-class-avatar-img'),
  scrollRepairRetired:typeof window.v126RepairCharacter==='function'
});
})();
