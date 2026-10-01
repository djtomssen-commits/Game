
(function(){
  const VERSION='V4.29 Stable';
  let lastErrorAt=0;
  function report(kind,detail){
    const now=Date.now();
    if(now-lastErrorAt<1500)return;
    lastErrorAt=now;
    try{console.error(`[V4.02 ${kind}]`,detail)}catch(e){}
  }
  window.addEventListener('error',e=>report('runtime',e?.error||e?.message||'Unbekannter Laufzeitfehler'));
  window.addEventListener('unhandledrejection',e=>report('promise',e?.reason||'Unbehandelter Promise-Fehler'));

  /* Never expose raw auth/session tokens through accidental DOM rendering. */
  window.v384SafeDebug=function(value){
    try{
      const s=String(value??'');
      return s
        .replace(/(access_token|refresh_token|authorization)\s*[:=]\s*["']?[^"'\\s,}]+/ig,'$1=[REDACTED]')
        .replace(/Bearer\\s+[A-Za-z0-9._~+\\/-]+/ig,'Bearer [REDACTED]');
    }catch(e){return '[unavailable]'}
  };

  document.querySelectorAll(
    '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
  ).forEach(el=>{if(el)el.textContent=VERSION});
  document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
})();
