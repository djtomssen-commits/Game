(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 function admin(){try{return typeof v093IsAdmin!=='undefined'&&v093IsAdmin===true&&!!v073User&&!v073User.is_anonymous}catch(e){return false}}
 function leaveSystemtech(){
  const sec=document.getElementById('systemtech');if(!sec?.classList.contains('active'))return;
  try{if(typeof v032Go==='function'){v032Go('world');return}}catch(e){}
  try{document.querySelectorAll('section.screen').forEach(x=>x.classList.remove('active'));document.getElementById('world')?.classList.add('active')}catch(e){}
 }
 function ensureAdminUi(){
  const panel=document.getElementById('v032MenuPanel');
  if(panel&&!panel.querySelector('[data-screen="systemtech"]')){
   const b=document.createElement('button');b.className='top-menu-item';b.dataset.screen='systemtech';b.innerHTML='<span>⚙️</span>Systemtechnik';
   b.onclick=()=>{if(admin())window.v4107OpenSystemtechnik?.()};panel.appendChild(b);
  }
  /* V4.160: Systemtechnik remains available through the admin navigation only, not settings. */
  document.getElementById('v4104QaRow')?.remove();
 }
 function sync(){
  const ok=admin();document.documentElement.classList.toggle('v4142-systemtech-admin',ok);
  if(!ok){
   document.querySelectorAll('#v032MenuPanel [data-screen="systemtech"]').forEach(x=>x.remove());
   document.getElementById('v4104QaRow')?.remove();document.getElementById('v4102QaButton')?.remove();leaveSystemtech();return false;
  }
  ensureAdminUi();return true;
 }
 window.v4142SyncAdminSystemtechnik=sync;
 document.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('#v032MenuToggle'))requestAnimationFrame(sync)},true);
 document.addEventListener('DOMContentLoaded',sync,{once:true});window.addEventListener('pageshow',sync,{passive:true});
 window.addEventListener('growlegends:account-ready',sync,{passive:true});
 function stamp(){}
 stamp();sync();
})();
