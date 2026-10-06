(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const PUBLIC=[
  ['world','⌂'],['character','🧙'],['grow','🌱'],['quests','📜'],['dungeon','⚔️'],
  ['tower','🗼'],['caravan','🚚'],['endgame','🌌'],['shop','🛒'],['forge','🔨'],
  ['harzDealer','🟢'],['bagDealer','🏪'],['pvp','⚔️'],['guild','🏰'],['hall','🏆'],
  ['friends','🤝'],['mail','✉️']
 ];
 const T=(key,fallback)=>window.GrowI18n?.t?.(key)||fallback||key;
 const FALLBACK={world:'Startseite',character:'Charakter',grow:'Growroom',quests:'Quest & Schicht',dungeon:'Dungeons',tower:'Anbauturm',caravan:'Nebelkarawane',endgame:'Endgame',shop:'Händler',forge:'Harzschmiede',harzDealer:'Harz & Gold & Rahmen Dealer',bagDealer:'Hinterhof-Dealer',pvp:'PvP-Arena',guild:'Gilde',hall:'Hall of Haze',friends:'Nebel-Crew',mail:'Nebel-Post'};
 function admin(){try{return typeof v093IsAdmin!=='undefined'&&v093IsAdmin===true&&!!v073User&&!v073User.is_anonymous}catch(e){return false}}
 function available(id){
  if(id==='bagDealer')return !!document.getElementById('bagDealer');
  if(document.getElementById(id))return true;
  if(id==='endgame')return typeof window.v457RenderEndgame==='function'||typeof window.renderEndgame==='function';
  if(id==='forge')return typeof window.v488OpenForge==='function'||typeof window.v488ForgeRender==='function';
  return false;
 }
 function go(id){
  try{
   if(id==='harzDealer'&&typeof window.v322OpenDealer==='function')return window.v322OpenDealer();
   if(id==='forge'&&typeof window.v488OpenForge==='function')return window.v488OpenForge();
   if(id==='systemtech')return admin()?window.v4107OpenSystemtechnik?.():false;
   if(id==='admin'){
    if(!admin())return false;
    if(typeof v032Go==='function')v032Go('admin');
    setTimeout(async()=>{try{const ok=await v093CheckAdmin?.();if(ok)await v093AdminLoadLists?.()}catch(e){}},0);
    return true;
   }
   if(typeof v032Go==='function')return v032Go(id);
  }catch(e){console.warn('V4.159 menu navigation',id,e)}
  return false;
 }
 function item(id,icon,label){
  const b=document.createElement('button');
  b.type='button';b.className='top-menu-item';b.dataset.screen=id;
  if(id==='harzDealer')b.setAttribute('data-v341-harz-menu','1');
  b.innerHTML=`<span>${icon}</span>${label}`;
  b.classList.toggle('active',document.getElementById(id)?.classList.contains('active'));
  b.onclick=e=>{e.preventDefault();e.stopPropagation();go(id)};
  return b;
 }
 function sep(){const x=document.createElement('div');x.className='v4148-menu-separator v086-menu-separator';return x}
 function build(){
  let panel=document.getElementById('v032MenuPanel');
  if(!panel){try{v032InstallMenu?.()}catch(e){}panel=document.getElementById('v032MenuPanel')}
  if(!panel)return false;
  const frag=document.createDocumentFragment();
  let added=0;
  PUBLIC.forEach((row,i)=>{
   const [id,icon]=row,label=T('nav.'+id,FALLBACK[id]||id);if(!available(id))return;
   if(id==='pvp'&&added)frag.appendChild(sep());
   frag.appendChild(item(id,icon,label));added++;
  });
  if(admin()){
   frag.appendChild(sep());
   if(document.getElementById('admin'))frag.appendChild(item('admin','🛡️',T('nav.admin','Admin')));
   if(document.getElementById('systemtech')||typeof window.v4107OpenSystemtechnik==='function')frag.appendChild(item('systemtech','⚙️',T('nav.systemtech','Systemtechnik')));
  }
  panel.replaceChildren(frag);
  panel.querySelectorAll('.top-menu-item').forEach(b=>b.classList.toggle('active',document.getElementById(b.dataset.screen)?.classList.contains('active')));
  return true;
 }
 window.v4148BuildCompleteMenu=build;
 window.v086BuildCompleteMenu=build;
 function diagnostics(){
  const panel=document.getElementById('v032MenuPanel');
  const expected=PUBLIC.filter(([id])=>available(id)).map(([id])=>id).concat(admin()?['admin','systemtech'].filter(id=>id==='systemtech'?document.getElementById(id)||typeof window.v4107OpenSystemtechnik==='function':document.getElementById(id)):[]);
  const actual=panel?[...panel.querySelectorAll('[data-screen]')].map(x=>x.dataset.screen):[];
  return {version:V.short,expected,actual,missing:expected.filter(x=>!actual.includes(x)),duplicates:actual.filter((x,i)=>actual.indexOf(x)!==i),admin:admin()};
 }
 window.v4148MenuDiagnostics=diagnostics;
 // Rebuild at deterministic lifecycle points. No polling interval or MutationObserver.
 document.addEventListener('click',e=>{if(e.target?.closest?.('#v032MenuBtn,#v032MenuToggle'))requestAnimationFrame(build)},true);
 window.addEventListener('growlegends:account-ready',()=>requestAnimationFrame(build));
 window.addEventListener('growlegends:extras-ready',()=>requestAnimationFrame(build));
 window.addEventListener('growlegends:foreground-ready',()=>requestAnimationFrame(build));
 window.addEventListener('growlegends:language-changed',()=>requestAnimationFrame(build));
 window.addEventListener('pageshow',()=>requestAnimationFrame(build),{passive:true});
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(build),{once:true});
 requestAnimationFrame(build);
 function stamp(){}
 stamp();
})();
