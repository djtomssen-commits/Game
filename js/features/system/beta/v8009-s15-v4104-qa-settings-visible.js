(()=>{
 'use strict';
 const VERSION='V4.104 Stable',SHORT='V4.104';
 let installing=false;
 function owner(){try{return String((typeof v073User!=='undefined'&&v073User?.id)||s?.__accountOwnerId||s?.social?.playerId||'local')}catch(e){return'local'}}
 function report(){
  try{
   const keys=[`growLegendsQA:v4106:${owner()}`,`growLegendsQA:v4103:${owner()}`,`growLegendsQA:v4102:${owner()}`];
   for(const k of keys){const r=JSON.parse(localStorage.getItem(k)||'null');if(r&&typeof r==='object')return r}
  }catch(e){}
  return null;
 }
 function runtimeIssues(){
  try{
   const keys=[`growLegendsQA:v4106:${owner()}:runtime`,`growLegendsQA:v4103:${owner()}:runtime`,`growLegendsQA:v4102:${owner()}:runtime`];
   for(const k of keys){const a=JSON.parse(localStorage.getItem(k)||'[]');if(Array.isArray(a)&&a.length)return a}
  }catch(e){}
  return [];
 }
 function paintStatus(){
  const b=document.getElementById('v4104QaStatus');if(!b)return;
  const r=report(),logs=runtimeIssues();
  b.className='';
  if(logs.some(x=>x?.severity!=='warn')){b.classList.add('bad');b.textContent='FEHLER';return}
  if(r?.failed){b.classList.add('bad');b.textContent=`${r.failed} FEHLER`;return}
  if((r?.warnings||0)>0||logs.length){b.classList.add('warn');b.textContent='WARNUNG';return}
  if(r){b.classList.add('ok');b.textContent='OK';return}
  b.textContent='PRÜFEN';
 }
 function openQA(){
  try{
   if(typeof window.v4102OpenQA==='function'){window.v4102OpenQA();return true}
   if(typeof window.v4102RunQA==='function'){window.v4102RunQA({open:true});return true}
  }catch(e){console.warn('V4.104 QA open',e)}
  return false;
 }
 function install(){
  /* V4.160: Systemtechnik/Systemtest was intentionally removed from the settings dropdown. */
  try{document.querySelector('#v141SettingsMenu #v4104QaRow')?.remove()}catch(e){}
  return false;
 }
 function stamp(){install();}
 try{
  if(typeof v141BuildSettings==='function'&&!window.__v4104SettingsQa){
   const base=v141BuildSettings;v141BuildSettings=function(){const r=base.apply(this,arguments);queueMicrotask(install);requestAnimationFrame(install);return r};
   try{window.v141BuildSettings=v141BuildSettings}catch(e){}window.__v4104SettingsQa=true;
  }
 }catch(e){console.warn('V4.104 settings wrapper',e)}
 document.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('#v141SettingsBtn')){requestAnimationFrame(()=>{install();paintStatus()});setTimeout(()=>{install();paintStatus()},80)}},true);
 /* V4.160: old settings-row MutationObserver retired; the row must not be recreated. */
 stamp();
 document.addEventListener('DOMContentLoaded',stamp,{once:true});
 window.addEventListener('pageshow',stamp,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();paintStatus()}},{passive:true});
 window.addEventListener('growlegends:account-ready',()=>{stamp();paintStatus()},{passive:true});
 /* V4.123: V4.104 menu/status poll retired; canonical Systemtechnik refresh owns this. */
 window.v4104InstallQaSettings=install;
})();
