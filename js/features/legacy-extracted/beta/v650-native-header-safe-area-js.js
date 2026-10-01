
(function(){
  function isNativeApp(){
    try{
      const C=window.Capacitor;
      if(!C)return false;
      if(typeof C.isNativePlatform==='function')return !!C.isNativePlatform();
      if(typeof C.getPlatform==='function')return C.getPlatform()!=='web';
      return !!C.platform && C.platform!=='web';
    }catch(e){return false}
  }
  function apply(){
    document.body?.classList.toggle('v650-native-safe',isNativeApp());
  }
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  setTimeout(apply,100);
  setTimeout(apply,700);
})();
