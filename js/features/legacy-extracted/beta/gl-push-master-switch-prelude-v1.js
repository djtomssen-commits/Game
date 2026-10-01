
(()=>{
 'use strict';
 function enabled(){
  try{
   if(typeof v141Settings==='object'&&v141Settings)return v141Settings.pushNotifications!==false;
   const x=JSON.parse(localStorage.getItem('growLegendsSettingsV141')||'{}');
   return x.pushNotifications!==false;
  }catch(e){return true}
 }
 window.glPushEnabled=enabled;
})();
