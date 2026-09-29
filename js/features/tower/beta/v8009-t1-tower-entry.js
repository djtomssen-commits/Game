(()=>{
 'use strict';
 if(window.__V4166_TOWER_ENTRY__)return;window.__V4166_TOWER_ENTRY__=true;
 function openTower(){try{if(typeof v032Go==='function')return v032Go('tower')}catch(e){console.warn('V4.167 tower open',e)}return false}
 function addMenu(){
  const panel=document.getElementById('v032MenuPanel');if(!panel)return false;
  let b=panel.querySelector(':scope > [data-screen="tower"]');
  if(!b){
   b=document.createElement('button');b.type='button';b.className='top-menu-item';b.dataset.screen='tower';b.innerHTML='<span>🗼</span>Anbauturm';b.onclick=e=>{e.preventDefault();e.stopPropagation();openTower()};
   const d=panel.querySelector(':scope > [data-screen="dungeon"]');
   if(d) d.insertAdjacentElement('afterend',b); else panel.appendChild(b);
  }
  return true;
 }
 function bindPanelObserver(){
  const p=document.getElementById('v032MenuPanel');if(!p||p.dataset.v4166TowerObserved==='1')return;
  p.dataset.v4166TowerObserved='1';let busy=false;
  new MutationObserver(()=>{if(busy)return;busy=true;queueMicrotask(()=>{busy=false;addMenu()})}).observe(p,{childList:true});
 }
 function refresh(){addMenu();bindPanelObserver();try{window.vTowerRender?.()}catch(e){}}
 document.addEventListener('click',e=>{if(e.target?.closest?.('#v032MenuBtn,#v032MenuToggle,.v366-menu'))requestAnimationFrame(refresh)},true);
 ['growlegends:account-ready','growlegends:extras-ready','growlegends:foreground-ready'].forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(refresh)));
 window.addEventListener('pageshow',()=>requestAnimationFrame(refresh),{passive:true});
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(refresh),{once:true});
 setTimeout(refresh,0);setTimeout(refresh,250);setTimeout(refresh,900);
 window.v4166OpenTower=openTower;window.v4166EnsureTowerEntry=refresh;
})();
