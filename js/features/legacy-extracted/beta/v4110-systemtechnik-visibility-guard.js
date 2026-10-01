
(()=>{
 const VERSION='V4.110 Stable',SHORT='V4.110';
 function stamp(){}
 function guard(){try{stamp();const sec=document.getElementById('systemtech');if(!sec?.classList.contains('active'))return;const panels=['v4107Status','v4107Groups','v4107Tests'];for(const id of panels){const el=document.getElementById(id);if(el&&!String(el.textContent||'').trim()){el.innerHTML='<div class="v4110-loading"><b>🛡️ Anzeige wird wiederhergestellt…</b>Systemtechnik hat einen leeren Bereich erkannt und lädt den letzten Bericht neu.</div>';try{window.v4107OpenSystemtechnik?.()}catch(e){}}}}catch(e){}}
 stamp();guard();window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='systemtech')guard()},{passive:true});window.addEventListener('pageshow',guard,{passive:true});document.addEventListener('visibilitychange',()=>!document.hidden&&guard(),{passive:true});
})();
