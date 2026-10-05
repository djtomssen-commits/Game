(function(){
'use strict';
if(window.__V7260_BAG_DEALER_VISIBILITY__)return;
window.__V7260_BAG_DEALER_VISIBILITY__=true;

/* V8.101: Hinterhof-Dealer is public. Tütchen access itself is controlled
   separately by the Harz-Lotto owner and stays Coming Soon. */
function sync(){
 document.documentElement.classList.add('v7260-bag-admin');
 window.__V7215_AD_BAG_MENU_VISIBLE__=true;
 try{window.v086BuildCompleteMenu?.(true)}catch(_){}
 try{window.v4149BuildCompleteMenu?.(true)}catch(_){}
 return true;
}
window.v7260BagDealerAdminSync=sync;
['growlegends:account-ready','growlegends:extras-ready','growlegends:foreground-ready','growlegends:navigation-ready']
 .forEach(ev=>window.addEventListener(ev,sync,{passive:true}));
window.addEventListener('pageshow',sync,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()},{passive:true});
sync();
})();
