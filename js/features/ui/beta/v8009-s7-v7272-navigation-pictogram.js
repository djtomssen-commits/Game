(()=>{
 'use strict';
 if(window.__V7272_NAVIGATION_PICTOGRAM__)return;
 window.__V7272_NAVIGATION_PICTOGRAM__=true;
 const PATHS=Object.freeze({
  world:'<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.7 10.2V20h12.6v-9.8"/><path d="M9.5 20v-5.5h5V20"/>',
  character:'<circle cx="12" cy="8" r="3.1"/><path d="M5.7 20c.7-4.3 3-6.4 6.3-6.4s5.6 2.1 6.3 6.4"/>',
  grow:'<path d="M12 21V10.2"/><path d="M12 13c-4.5 0-7-2.3-7.4-6.2 4.3-.5 7 1.4 7.4 5.6"/><path d="M12 10.8c.4-4.2 3.1-6.1 7.4-5.6-.4 4-2.9 6.2-7.4 6.2"/>',
  quests:'<path d="M7 4h10v16H7z"/><path d="M9.5 8h5M9.5 12h5M9.5 16h3.5"/><path d="M5 6v12"/>',
  dungeon:'<path d="M5 20V8l3-3h8l3 3v12"/><path d="M9 20v-6h6v6"/><path d="M8 9h2M14 9h2"/><path d="M4 20h16"/>',
  tower:'<path d="M7 21h10"/><path d="M8 21 9.3 8h5.4L16 21"/><path d="M8.8 8 7.5 5h9L15.2 8"/><path d="M10.2 12h3.6M9.8 16h4.4"/>',
  caravan:'<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
  endgame:'<circle cx="12" cy="12" r="7.5"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/><path d="m12 8 1.2 2.7L16 12l-2.8 1.3L12 16l-1.2-2.7L8 12l2.8-1.3z"/>',
  shop:'<path d="M4 9h16l-1.2-4H5.2z"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
  forge:'<path d="m4 19 7.2-7.2"/><path d="m9.5 5.5 2-2 7 7-2 2z"/><path d="m13 8 3-3"/>',
  harzDealer:'<path d="m12 3 6 5-6 13L6 8z"/><path d="M6 8h12M9 8l3 13 3-13"/>',
  bagDealer:'<path d="M7 8h10l2 12H5z"/><path d="M9 8c0-2 1-4 3-4s3 2 3 4"/><path d="M9.5 13h5"/>',
  pvp:'<path d="m5 4 6 6-2 2-6-6z"/><path d="m19 4-6 6 2 2 6-6z"/><path d="m8 13-4 7M16 13l4 7"/>',
  guild:'<path d="M12 3 19 6v5c0 4.5-2.7 7.7-7 10-4.3-2.3-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-5"/>',
  hall:'<path d="M8 4h8v5c0 3-1.7 5-4 5S8 12 8 9z"/><path d="M8 6H5v2c0 2 1.2 3 3 3M16 6h3v2c0 2-1.2 3-3 3"/><path d="M12 14v4M8 21h8M9 18h6"/>',
  friends:'<circle cx="9" cy="8" r="3"/><circle cx="16.5" cy="9.5" r="2.3"/><path d="M3.8 20c.4-4.2 2.2-6.2 5.2-6.2s4.8 2 5.2 6.2"/>',
  mail:'<path d="M3 6h18v12H3z"/><path d="m4 7 8 6 8-6"/>',
  admin:'<path d="M12 3 19 6v5c0 4.7-2.8 7.8-7 10-4.2-2.2-7-5.3-7-10V6z"/><path d="M9 12h6M12 9v6"/>',
  systemtech:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5 7 7M17 17l1.5 1.5M18.5 5.5 17 7M7 17l-1.5 1.5"/>'
 });
 const FALLBACK='<circle cx="12" cy="12" r="7"/><path d="M9 12h6M12 9v6"/>';
 let scheduled=false,repairing=false,observer=null,lastRepairAt=0;
 const svg=id=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[id]||FALLBACK}</svg>`;
 function panel(){return document.getElementById('v032MenuPanel')}
 function decorate(p=panel()){
  if(!p)return false;
  p.querySelectorAll(':scope > .top-menu-item[data-screen]').forEach(btn=>{
   let box=btn.querySelector(':scope > span');
   if(!box){box=document.createElement('span');btn.prepend(box)}
   box.className='v7272-nav-icon';
   const id=String(btn.dataset.screen||'');
   if(box.dataset.v7272Icon!==id){box.dataset.v7272Icon=id;box.innerHTML=svg(id)}
  });
  return true;
 }
 function diagnosticsBase(){
  try{return window.v4149NavigationDiagnostics?.()||window.v4148MenuDiagnostics?.()||{}}catch(_){return {}}
 }
 function structure(){
  const p=panel(),d=diagnosticsBase();
  if(!p)return {actual:[],duplicates:[],missing:[],unexpected:[],expected:Array.isArray(d.expected)?d.expected:[]};
  const actual=[...p.querySelectorAll(':scope > .top-menu-item[data-screen]')].map(x=>String(x.dataset.screen||''));
  const duplicates=[...new Set(actual.filter((x,i)=>actual.indexOf(x)!==i))];
  return {actual,duplicates,missing:Array.isArray(d.missing)?d.missing:[],unexpected:Array.isArray(d.unexpected)?d.unexpected:[],expected:Array.isArray(d.expected)?d.expected:[]};
 }
 function repair(force=false){
  scheduled=false;if(repairing)return;repairing=true;
  try{
   const before=structure();
   if(force||before.duplicates.length||before.missing.length||before.unexpected.length){
    try{
     if(typeof window.v4149BuildCompleteMenu==='function')window.v4149BuildCompleteMenu(true);
     else if(typeof window.v4148BuildCompleteMenu==='function')window.v4148BuildCompleteMenu(true);
     else if(typeof window.v086BuildCompleteMenu==='function')window.v086BuildCompleteMenu(true);
    }catch(e){console.warn('[V7.273] navigation canonical rebuild',e)}
   }
   decorate();lastRepairAt=Date.now();
  }finally{repairing=false}
 }
 function schedule(force=false){if(scheduled&&!force)return;scheduled=true;requestAnimationFrame(()=>repair(force))}
 function bindObserver(){
  const p=panel();if(!p)return false;
  observer?.disconnect();
  observer=new MutationObserver(muts=>{if(!repairing&&muts.some(m=>m.type==='childList'))schedule(false)});
  observer.observe(p,{childList:true,subtree:true});return true;
 }
 function boot(){repair(true);bindObserver()}
 document.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('#v032MenuBtn,#v032MenuToggle,.v366-menu'))schedule(false)},true);
 ['growlegends:account-ready','growlegends:extras-ready','growlegends:foreground-ready','growlegends:first-playable'].forEach(ev=>window.addEventListener(ev,()=>schedule(false),{passive:true}));
 window.addEventListener('pageshow',()=>schedule(false),{passive:true});
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(boot),{once:true});
 requestAnimationFrame(boot);
 window.v7272NavigationDiagnostics=()=>{
  const st=structure(),p=panel();
  const iconMissing=p?[...p.querySelectorAll(':scope > .top-menu-item[data-screen]')].filter(b=>!b.querySelector(':scope > .v7272-nav-icon svg')).map(b=>b.dataset.screen):[];
  const active=p?[...p.querySelectorAll(':scope > .top-menu-item.active[data-screen]')].map(b=>b.dataset.screen):[];
  return {version:'V7.308',...st,iconMissing,active,lastRepairAt,observer:!!observer};
 };
})();
