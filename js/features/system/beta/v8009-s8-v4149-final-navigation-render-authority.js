(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const T=(key,fallback)=>window.GrowI18n?.t?.(key)||fallback||key;
 const PUBLIC=Object.freeze([
  ['world','⌂','nav.world','Startseite'],['character','🧙','nav.character','Charakter'],['grow','🌱','nav.grow','Growroom'],['quests','📜','nav.quests','Quest & Schicht'],
  ['dungeon','⚔️','nav.dungeon','Dungeons'],['tower','🗼','nav.tower','Anbauturm'],['caravan','🚚','nav.caravan','Nebelkarawane'],['endgame','🌌','nav.endgame','Endgame'],['shop','🛒','nav.shop','Händler'],['forge','🔨','nav.forge','Harzschmiede'],
  ['harzDealer','🟢','nav.harzDealer','Harz & Gold & Rahmen Dealer'],['bagDealer','🏪','nav.bagDealer','Hinterhof-Dealer'],['pvp','⚔️','nav.pvp','PvP-Arena'],['guild','🏰','nav.guild','Gilde'],['hall','🏆','nav.hall','Hall of Haze'],
  ['friends','🤝','nav.friends','Nebel-Crew'],['mail','✉️','nav.mail','Nebel-Post']
 ]);
 let raf=0,lastBuildAt=0;
 function admin(){try{return typeof v093IsAdmin!=='undefined'&&v093IsAdmin===true&&!!v073User&&!v073User.is_anonymous}catch(e){return false}}
 function available(id){
  if(id==='bagDealer')return !!document.getElementById(id);
  if(document.getElementById(id))return true;
  if(id==='endgame')return typeof window.v457RenderEndgame==='function'||typeof window.renderEndgame==='function';
  if(id==='forge')return typeof window.v488OpenForge==='function'||typeof window.v488ForgeRender==='function';
  return false;
 }
 function expected(){
  const ids=PUBLIC.filter(([id])=>available(id)).map(([id])=>id);
  if(admin()){
   if(document.getElementById('admin'))ids.push('admin');
   if(document.getElementById('systemtech')||typeof window.v4107OpenSystemtechnik==='function')ids.push('systemtech');
  }
  return ids;
 }
 function item(id,icon,label){
  const b=document.createElement('button');b.type='button';b.className='top-menu-item';b.dataset.screen=id;
  if(id==='harzDealer')b.setAttribute('data-v341-harz-menu','1');
  b.innerHTML=`<span>${icon}</span>${label}`;b.onclick=e=>{e.preventDefault();e.stopPropagation();go(id)};return b;
 }
 function sep(){const x=document.createElement('div');x.className='v4149-menu-separator v086-menu-separator';return x}
 function go(id){
  try{
   if(id==='systemtech')return admin()?window.v4107OpenSystemtechnik?.():false;
   if(id==='admin'){
    if(!admin())return false;
    const r=typeof v032Go==='function'?v032Go('admin'):false;
    setTimeout(async()=>{try{const ok=await v093CheckAdmin?.();if(ok)await v093AdminLoadLists?.()}catch(e){}},0);return r;
   }
   if(typeof v032Go==='function')return v032Go(id);
  }catch(e){console.warn('V4.159 navigation',id,e)}
  return false;
 }
 function syncActive(panel=document.getElementById('v032MenuPanel')){
  if(!panel)return;const active=document.querySelector('section.screen.active')?.id||document.querySelector('.screen.active')?.id||'';
  panel.querySelectorAll('[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===active));
 }
 function build(force=false){
  let panel=document.getElementById('v032MenuPanel');
  if(!panel){try{v032InstallMenu?.()}catch(e){}panel=document.getElementById('v032MenuPanel')}
  if(!panel)return false;
  const exp=expected(),actual=[...panel.querySelectorAll(':scope > [data-screen]')].map(x=>x.dataset.screen);
  const duplicates=actual.some((x,i)=>actual.indexOf(x)!==i),same=!duplicates&&exp.length===actual.length&&exp.every((x,i)=>actual[i]===x);
  if(force||!same){
   const open=panel.classList.contains('open')||panel.classList.contains('show');
   const oldScroll=open?panel.scrollTop:0;
   const weather=panel.querySelector(':scope > #glWeatherMenu');
   const frag=document.createDocumentFragment();let publicAdded=0;
   if(weather)frag.appendChild(weather);
   for(const [id,icon,key,fallback] of PUBLIC){
    if(!available(id))continue;
    if(id==='pvp'&&publicAdded)frag.appendChild(sep());
    frag.appendChild(item(id,icon,T(key,fallback)));publicAdded++;
   }
   if(admin()){
    frag.appendChild(sep());
    if(document.getElementById('admin'))frag.appendChild(item('admin','🛡️',T('nav.admin','Admin')));
    if(document.getElementById('systemtech')||typeof window.v4107OpenSystemtechnik==='function')frag.appendChild(item('systemtech','⚙️',T('nav.systemtech','Systemtechnik')));
   }
   panel.replaceChildren(frag);
   if(open)panel.scrollTop=oldScroll;
   lastBuildAt=Date.now();
  }
  syncActive(panel);return true;
 }
 function stamp(){}
 function settle(force=false){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{raf=0;build(force);stamp();try{window.v4142SyncAdminSystemtechnik?.()}catch(e){}})}
 // Final menu builder: every historical call to the global complete-menu function now resolves here.
 try{v086BuildCompleteMenu=build}catch(e){}window.v086BuildCompleteMenu=build;window.v4149BuildCompleteMenu=build;
 // Keep the existing feature-rich render chain, but make its final UI state deterministic.
 try{
  const current=(typeof render==='function'?render:window.render);
  if(typeof current==='function'&&!current.__v4149Final){
   const finalRender=function(){
    const r=current.apply(this,arguments);
    try{if(document.getElementById('shop')?.classList.contains('active'))window.renderShop?.()}catch(e){}
    settle(false);
    try{
      const active=document.querySelector('section.screen.active,.screen.active')?.id||'';
      window.v8144GameplayI18n?.schedule?.(active);
    }catch(e){}
    return r;
   };finalRender.__v4149Final=true;
   try{render=finalRender}catch(e){}window.render=finalRender;
  }
 }catch(e){console.warn('V4.159 final render authority',e)}
 // Keep all historical navigation feature hooks, then enforce one final menu/active/version state after them.
 try{
  const current=(typeof v032Go==='function'?v032Go:window.v032Go);
  if(typeof current==='function'&&!current.__v4149Final){
   const finalGo=function(id){
    if(id==='systemtech'&&!admin())id='world';
    const r=current.call(this,id);
    if(id==='grow'&&window.v7081UseAuthority?.('grow')){const c=window.__V7208_GROW_ORDERS_CANONICAL__,rows=Array.isArray(c?.contracts)?c.contracts:[];if(rows.length!==6)setTimeout(()=>{Promise.resolve(window.v7065GrowAuthorityRefresh?.()).finally(()=>window.v6163GrowTabs?.refresh?.())},0)}
    settle(false);
    try{
      window.dispatchEvent(new CustomEvent('growlegends:navigation-open-v7119',{detail:{id:String(id||'')}}));
      window.v8144GameplayI18n?.schedule?.(String(id||''));
    }catch(e){}
    return r;
   };finalGo.__v4149Final=true;
   try{v032Go=finalGo}catch(e){}window.v032Go=finalGo;
  }
 }catch(e){console.warn('V4.159 final navigation authority',e)}
 function diagnostics(){
  const panel=document.getElementById('v032MenuPanel'),exp=expected(),actual=panel?[...panel.querySelectorAll(':scope > [data-screen]')].map(x=>x.dataset.screen):[];
  const active=[...document.querySelectorAll('section.screen.active,.screen.active')].map(x=>x.id).filter(Boolean);
  return {version:V.short,expected:exp,actual,missing:exp.filter(x=>!actual.includes(x)),unexpected:actual.filter(x=>!exp.includes(x)),duplicates:[...new Set(actual.filter((x,i)=>actual.indexOf(x)!==i))],activeScreens:[...new Set(active)],admin:admin(),lastBuildAt};
 }
 window.v4149NavigationDiagnostics=diagnostics;
 document.addEventListener('click',e=>{if(e.target?.closest?.('#v032MenuBtn,#v032MenuToggle'))settle(false)},true);
 ['growlegends:account-ready','growlegends:extras-ready','growlegends:foreground-ready'].forEach(ev=>window.addEventListener(ev,()=>settle(false)));
 window.addEventListener('growlegends:language-changed',()=>{
  settle(true);
  try{window.v8144GameplayI18n?.applyAllScreens?.()}catch(e){}
 },{passive:true});
 window.addEventListener('pageshow',()=>settle(false),{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle(false)},{passive:true});
 settle(true);stamp();
})();
