
(function(){
'use strict';
if(window.__V7260_BAG_ADMIN_ONLY__)return;
window.__V7260_BAG_ADMIN_ONLY__=true;
function isAdmin(){
 try{return typeof v093IsAdmin!=='undefined'&&v093IsAdmin===true&&!!v073User&&!v073User.is_anonymous}catch(_){return false}
}
function sync(){
 const ok=isAdmin();
 document.documentElement.classList.toggle('v7260-bag-admin',ok);
 window.__V7215_AD_BAG_MENU_VISIBLE__=ok;
 try{window.v086BuildCompleteMenu?.(true)}catch(_){}
 const screen=document.getElementById('bagDealer');
 if(!ok&&screen?.classList.contains('active')){
  try{window.v032Go?.('world')}catch(_){screen.classList.remove('active');document.getElementById('world')?.classList.add('active')}
 }
 return ok;
}
window.v7260BagDealerAdminSync=sync;
['growlegends:account-ready','growlegends:extras-ready','growlegends:foreground-ready'].forEach(ev=>window.addEventListener(ev,sync,{passive:true}));
window.addEventListener('pageshow',sync,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()},{passive:true});
sync();
})();
