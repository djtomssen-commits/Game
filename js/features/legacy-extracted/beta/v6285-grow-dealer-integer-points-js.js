
(()=>{
 'use strict';
 window.v6285GrowDealerDiagnostics=()=>({
   version:'V6.285',
   system:'C=1,B=2,A=3,S=4,S+=5,Mutation+1,Veredelt+2',
   availabilityLabel:[...document.querySelectorAll('#grow .v6282-offer-progress-text span')]
     .map(x=>x.textContent||'').find(x=>x.startsWith('Verfügbar:'))||''
 });
})();
