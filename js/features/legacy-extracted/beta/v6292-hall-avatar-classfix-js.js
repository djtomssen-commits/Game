
(()=>{
 'use strict';
 if(window.__V6292_HALL_AVATAR_FIX__)return;
 window.__V6292_HALL_AVATAR_FIX__=true;

 function fix(){
   try{window.v646DecorateHall?.()}catch(_){}
 }
 document.addEventListener('click',e=>{
   const hit=e.target instanceof Element
     ? e.target.closest('[data-screen="hall"],[data-go="hall"],[data-v085-go="hall"]')
     : null;
   if(hit)setTimeout(fix,0);
 },true);
 window.addEventListener('growlegends:account-ready',()=>setTimeout(fix,100));
 window.addEventListener('growlegends:foreground-ready',fix,{passive:true});

 window.v6292HallAvatarDiagnostics=()=>({
   version:'V6.292',
   rows:[...document.querySelectorAll('#v072HallRanking .v072-player-row')].map(r=>({
     profile:r.dataset.profileId||'',
     classId:r.dataset.classId||'',
     avatarClass:r.querySelector('.v646-row-avatar')?.dataset.avatarClass||''
   }))
 });
})();
