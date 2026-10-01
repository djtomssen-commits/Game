
(()=>{
 'use strict';
 if(window.__V6255_MOBILE_ENERGY__)return;
 window.__V6255_MOBILE_ENERGY__=true;
 function activeScreen(){try{return document.querySelector('.screen.active')?.id||''}catch(_){return''}}
 window.v6255EnergyDiagnostics=()=>({
   hidden:document.hidden,
   activeScreen:activeScreen(),
   energySaver:!!window.v6255EnergySaverActive?.(),
   effectsEnabled:typeof v141Settings!=='undefined'?!!v141Settings.effects:null,
   hiddenScreenAnimationsPaused:true,
   saverNotificationCadenceMs:2500
 });
})();
