
(()=>{
 'use strict';
 window.v6210PetDiagnostics=()=>{
   const a=s?.v686PetAlbum||{};
   return {
     button:!!document.getElementById('v686PetAlbumBtn'),
     popup:document.getElementById('v688PetPopup')?.classList.contains('show')||false,
     unseen:Number(a.unseen)||0,
     newFinds:Array.isArray(a.newFinds)?a.newFinds.length:0,
     pendingPopups:Array.isArray(a.pendingFindPopups)?a.pendingFindPopups.length:0,
     found:Object.values(a.found||{}).reduce((n,row)=>n+Object.keys(row||{}).length,0),
     grantWrapped:typeof window.v686GrantPet==='function'&&!!window.__v688BaseGrant,
     eventBus:!!window.GL_EVENTS
   };
 };
 function sync(){try{window.v6104UpdatePetIndicators?.()}catch(_){}}
 window.addEventListener('growlegends:account-ready',()=>setTimeout(sync,220));
 window.addEventListener('pageshow',()=>setTimeout(sync,80),{passive:true});
 document.addEventListener('click',e=>{if(e.target?.closest?.('[data-screen="character"],[data-go="character"],[data-nav="character"]'))setTimeout(sync,80)},true);
})();
