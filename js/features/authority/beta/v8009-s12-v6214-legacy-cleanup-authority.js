(()=>{
 'use strict';
 if(window.__V6214_LEGACY_CLEANUP__)return;
 window.__V6214_LEGACY_CLEANUP__=true;
 /* V7.156: ranking/profile repaint ownership now lives in V6.145 + V6.290.
    Keep only the idempotent Hall polish helper; old ranking/pageshow/account
    wrappers are retired. */
 function polishHall(){
  try{window.v646DecorateHall?.()}catch(_){}
  const hall=document.getElementById('hall');if(!hall)return;
  hall.classList.add('v648-hall');hall.setAttribute('data-hall-build','V6.145');
  const title=hall.querySelector('.v052-title'),sub=hall.querySelector('.v052-sub');
  if(title&&title.textContent!=='HALL OF HAZE')title.textContent='HALL OF HAZE';
  const wanted='Rangliste, Spielerprofile und die größten Grow-Legenden.';
  if(sub&&sub.textContent!==wanted)sub.textContent=wanted;
  hall.querySelectorAll('#v072HallRanking .v072-player-row').forEach(row=>{
   const actions=row.querySelector('.v073-row-actions');if(!actions)return;
   const pill=[...actions.querySelectorAll('.pill')].find(el=>el.textContent.trim().toUpperCase()==='DU');
   const name=row.querySelector('.v072-player-name');if(!pill||!name)return;
   row.classList.add('v648-self-row');pill.classList.add('v648-self-pill');if(pill.parentElement!==name)name.appendChild(pill);
  });
 }
 window.v6214PolishHall=polishHall;
 function cleanupPreviewDom(){
  try{document.querySelectorAll('.v435-preview-launch,.v441-preview-launch,[data-v435-preview],[data-v441-preview]').forEach(x=>x.remove())}catch(_){}
  try{document.getElementById('glWeatherLayer')?.remove()}catch(_){}
 }
 cleanupPreviewDom();
 window.__V6214_QA__=()=>({hallPolishWrapperRetired:true,lifecycleHooksRetired:true,temporaryDungeonPreviewModulesRetired:true});
})();
