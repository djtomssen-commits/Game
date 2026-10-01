(()=>{
 'use strict';
 function activate(which){
   const map={inbox:'v381Inbox',sent:'v381Sent',compose:'v381Compose',battlelog:'v6200BattleLogPanel'};
   document.querySelectorAll('#mail [data-v381-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v381Tab===which));
   Object.entries(map).forEach(([k,id])=>{
     const el=document.getElementById(id);if(!el)return;
     const on=k===which;el.classList.toggle('v677-active-panel',on);el.style.display=on?'':'none';
   });
   if(which==='battlelog')try{window.v6200LoadBattleLog?.()}catch(_){}
 }
 function current(){return document.querySelector('#mail [data-v381-tab].active')?.dataset.v381Tab||'inbox'}
 function repair(){activate(current())}
 document.addEventListener('click',e=>{const b=e.target?.closest?.('#mail [data-v381-tab]');if(!b)return;activate(b.dataset.v381Tab)},true);
 window.addEventListener('growlegends:account-ready',repair,{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='mail')repair()},{passive:true});
 document.addEventListener('DOMContentLoaded',repair,{once:true});
 window.addEventListener('pageshow',()=>{if(document.getElementById('mail')?.classList.contains('active'))repair()},{passive:true});
 window.v6202MailTab=activate;
})();
