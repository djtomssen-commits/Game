(()=>{
'use strict';
if(window.__V6338_CENTRAL_TITLES__)return;
window.__V6338_CENTRAL_TITLES__=true;

const SERVER=[
 {id:'server_first_level_300',label:'Der Erste auf Level 300',icon:'👑',req:'Als erster Spieler des Servers Level 300 erreichen.',eligible:()=>Number(s?.level)>=300},
 {id:'server_first_dungeon_20',label:'Erster Bezwinger aller Dungeons',icon:'🗝️',req:'Als erster Spieler alle 20 Dungeons abschließen.',eligible:()=>Array.isArray(s?.dungeon?.completed)&&s.dungeon.completed.length>=20},
 {id:'server_first_pvp_100',label:'Erster Nebel-Champion',icon:'⚔️',req:'Als erster Spieler 100 PvP-Siege erreichen.',eligible:()=>Number(s?.v204Pvp?.wins)>=100},
 {id:'server_first_pet_120',label:'Erster Meistersammler',icon:'🐾',req:'Als erster Spieler alle 120 Pet-Qualitätsstufen sammeln.',eligible:()=>petFound()>=120},
 {id:'server_first_tower_100',label:'Erster Herr des Anbauturms',icon:'🗼',req:'Als erster Spieler Etage 100 im Anbauturm erreichen.',eligible:()=>towerFloor()>=100},
 {id:'server_first_worldboss_100',label:'Erster Koloss-Auslöscher',icon:'💎',req:'Als erster Spieler 100 mystische Weltboss-Siege erreichen.',eligible:()=>worldBossWins()>=100}
];
const ACH=[
 {id:'ach_lvl50',ach:'lvl50',label:'König der Gasse',icon:'⭐',desc:'Erfolg „König der Gasse“ abgeschlossen.'},
 {id:'ach_lvl100',ach:'lvl100',label:'Lebende Legende',icon:'🌟',desc:'Erfolg „Lebende Legende“ abgeschlossen.'},
 {id:'ach_d20',ach:'d20',label:'Herr der Unterwelt',icon:'⚔️',desc:'Alle 20 Dungeons abgeschlossen.'},
 {id:'ach_pvp100',ach:'pvp100',label:'Hall-of-Haze-Schrecken',icon:'🏆',desc:'100 PvP-Kämpfe gewonnen.'},
 {id:'ach_tower100',ach:'tower100',label:'Herr des Anbauturms',icon:'🗼',desc:'Etage 100 im Anbauturm erreicht.'},
 {id:'ach_rift9',ach:'rift_9',label:'Jenseits des Nebels',icon:'🌌',desc:'Alle 9 Nebelrisse abgeschlossen.'},
 {id:'ach_petrow20',ach:'petrow20',label:'Meister des Sammelalbums',icon:'🐾',desc:'Alle 20 Pet-Reihen bis Legendär vervollständigt.'},
 {id:'ach_wb100',ach:'wb100',label:'Koloss-Auslöscher',icon:'💎',desc:'100 mystische Weltbosse besiegt.'},
 {id:'ach_forge25',ach:'forge_c25',label:'Harzschmied-Meister',icon:'🔨',desc:'25 prismatische Items hergestellt.'},
 {id:'ach_login365',ach:'login365',label:'Kein freier Tag',icon:'🎁',desc:'365 Login-Boni abgeholt.'}
];
let filter='all',serverClaims=new Map(),syncBusy=false,lastServerSync=0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function titleState(){
 s.v6338Titles=(s.v6338Titles&&typeof s.v6338Titles==='object')?s.v6338Titles:{};
 s.v6338Titles.unlocked=(s.v6338Titles.unlocked&&typeof s.v6338Titles.unlocked==='object')?s.v6338Titles.unlocked:{};
 s.v6338Titles.activeId=String(s.v6338Titles.activeId||'');
 s.v6338Titles.activeLabel=String(s.v6338Titles.activeLabel||'');
 s.v6338Titles.activeSource=String(s.v6338Titles.activeSource||'');
 return s.v6338Titles;
}
function vipState(){return window.v8195VipState||null}
function vipActive(){const v=vipState();return !!(v?.active&&v?.vip_until&&new Date(v.vip_until).getTime()>Date.now())}
function vipPublic(){const v=vipState();return vipActive()&&v?.public_visible!==false}
function petFound(){const f=s?.v686PetAlbum?.found||{};return Object.values(f).reduce((n,row)=>n+Object.values(row&&typeof row==='object'?row:{}).filter(Boolean).length,0)}
function towerFloor(){return Math.max(0,Number(s?.tower?.season?.bestFloor)||0)}
function worldBossWins(){try{return Math.max(0,Number((typeof v112EnsureWorldBossState==='function'?v112EnsureWorldBossState():s?.v110WorldBoss)?.wins)||0)}catch(_){return Math.max(0,Number(s?.v110WorldBoss?.wins)||0)}}
function unlock(id,label,source,meta={}){const st=titleState();st.unlocked[id]={label:String(label||''),source:String(source||''),at:Number(st.unlocked[id]?.at)||Date.now(),...meta};return st.unlocked[id]}
function migrate(){
 const st=titleState();
 const defs=Array.isArray(window.v686PetDefinitions)?window.v686PetDefinitions:[];
 const petTitles=s?.v686PetAlbum?.titles||{};
 for(const p of defs){if(p?.id&&p?.title&&petTitles?.[p.id])unlock('pet:'+p.id,p.title,'pet',{petId:p.id})}
 for(const a of ACH){if(s?.v106Achievements?.done?.[a.ach])unlock(a.id,a.label,'achievement',{achievement:a.ach})}
 if(vipActive())unlock('vip_member','Grow VIP','vip',{temporary:true});
 else{
  delete st.unlocked.vip_member;
  if(st.activeId==='vip_member'){st.activeId='';st.activeLabel='';st.activeSource=''}
 }
 if(!st.activeId){
   try{
     const saved=JSON.parse(localStorage.getItem(activeStorageKey())||'null');
     if(saved?.id&&st.unlocked[String(saved.id)]){st.activeId=String(saved.id);st.activeLabel=String(saved.label||st.unlocked[st.activeId]?.label||'');st.activeSource=String(saved.source||st.unlocked[st.activeId]?.source||'')}
   }catch(_){}
 }
 if(!st.activeId){
   const old=String(s?.v686PetAlbum?.activeTitle||'');
   if(old){const p=defs.find(x=>String(x?.title||'')===old&&petTitles?.[x.id]);if(p){st.activeId='pet:'+p.id;st.activeLabel=old;st.activeSource='pet'}}
 }
 const rec=st.unlocked[st.activeId];
 if(st.activeId&&rec){st.activeLabel=String(rec.label||st.activeLabel||'');st.activeSource=String(rec.source||st.activeSource||'')}
 return st;
}
function active(){const st=migrate();return {id:st.activeId,label:st.activeLabel,source:st.activeSource}}
function publicTitle(){const a=active();if(a.id==='vip_member'&&!vipPublic())return {id:'',label:'',source:''};return {id:a.id||'',label:a.label||'',source:a.source||''}}
window.v6338PublicTitle=publicTitle;
function activeStorageKey(){let id='';try{id=String(v073User?.id||'')}catch(_){}return 'growLegends:v6338ActiveTitle:'+(id||'local')}
function persistTitles(){
 try{if(typeof persist==='function')persist(false);else localStorage.setItem(KEY,JSON.stringify(s))}catch(_){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(__){}}
 try{const st=titleState();localStorage.setItem(activeStorageKey(),JSON.stringify({id:st.activeId,label:st.activeLabel,source:st.activeSource}))}catch(_){}
}
async function publish(){
 try{if(typeof window.v649SyncDungeonProgress==='function')await window.v649SyncDungeonProgress(true)}catch(_){ }
 try{if(typeof v073SyncProfile==='function')await v073SyncProfile(true)}catch(_){ }
}
function setActive(id){
 const st=migrate();id=String(id||'');
 if(!id){st.activeId='';st.activeLabel='';st.activeSource='';persistTitles();void publish();syncOwnBadges();renderTitles();return true}
 const rec=st.unlocked[id];if(!rec)return false;
 st.activeId=id;st.activeLabel=String(rec.label||'');st.activeSource=String(rec.source||'');persistTitles();void publish();syncOwnBadges();renderTitles();
 try{v063Toast?.('👑 Titel ausgewählt','success',st.activeLabel)}catch(_){ }
 return true;
}
window.v6338SetActiveTitle=setActive;
function petDefs(){
 const defs=Array.isArray(window.v686PetDefinitions)?window.v686PetDefinitions:[];
 const titles=s?.v686PetAlbum?.titles||{};
 return defs.filter(p=>p?.id&&p?.title).map(p=>({id:'pet:'+p.id,label:p.title,icon:'🐾',category:'pet',desc:`Pet-Titel · ${p.name}`,unlocked:!!titles[p.id]}));
}
function allDefs(){
 const st=migrate();
 const ach=ACH.map(a=>({...a,category:'achievement',unlocked:!!s?.v106Achievements?.done?.[a.ach]}));
 const server=SERVER.map(a=>{const claim=serverClaims.get(a.id)||null;return {...a,category:'server',desc:a.req,unlocked:!!st.unlocked[a.id],claim}});
 const vip=vipActive()?[{id:'vip_member',label:'Grow VIP',icon:'👑',category:'vip',desc:'Exklusiver Titel während dein VIP-Pass aktiv ist.',unlocked:true}]:[];
 return [...vip,...petDefs(),...ach,...server];
}
function sourceLabel(d){return d.category==='vip'?'👑 VIP':d.category==='pet'?'🐾 PET':d.category==='achievement'?'🏆 ERFOLG':'🌐 SERVER-FIRST'}
function ensureBook(){
 const ov=document.getElementById('v106Overlay'),book=ov?.querySelector('.v106-book');if(!ov||!book)return null;
 let tabs=book.querySelector('.v6338-main-tabs');if(!tabs){tabs=document.createElement('div');tabs.className='v6338-main-tabs';tabs.innerHTML='<button type="button" class="v6338-main-tab active" data-v6338-main="ach">🏆 Erfolge</button><button type="button" class="v6338-main-tab" data-v6338-main="titles">👑 Titel</button>';book.querySelector('.v106-head')?.insertAdjacentElement('afterend',tabs)}
 let panel=book.querySelector('.v6338-title-panel');if(!panel){panel=document.createElement('section');panel.className='v6338-title-panel';panel.innerHTML='<div class="v6338-active" id="v6338ActiveTitle"></div><div class="v6338-title-filters" id="v6338TitleFilters"></div><div class="v6338-title-list" id="v6338TitleList"></div>';book.appendChild(panel)}
 tabs.querySelectorAll('[data-v6338-main]').forEach(btn=>btn.onclick=()=>showMain(btn.dataset.v6338Main));
 return {ov,book,tabs,panel};
}
function showMain(which){
 const x=ensureBook();if(!x)return;
 const titles=which==='titles',scrollTop=x.ov.scrollTop;
 x.ov.classList.toggle('v6338-titles-open',titles);
 x.tabs.querySelectorAll('[data-v6338-main]').forEach(b=>b.classList.toggle('active',(b.dataset.v6338Main==='titles')===titles));
 if(titles){renderTitles({preserveScroll:false});void syncServerTitles(false)}
 else {try{window.v6235IllegalBookRender?.()}catch(_){}}
 x.ov.scrollTop=scrollTop;
}
function renderTitles(opts={}){
 const x=ensureBook();if(!x)return;
 const keepScroll=opts.preserveScroll!==false,scrollTop=x.ov.scrollTop;
 const st=migrate(),defs=allDefs();
 const activeBox=x.panel.querySelector('#v6338ActiveTitle');
 activeBox.innerHTML=st.activeId?`<small>AKTIVER TITEL</small><b>👑 ${esc(st.activeLabel)}</b><span>Wird öffentlich bei deinem Spieler angezeigt.</span><div class="v6338-title-actions"><button type="button" data-v6338-clear>Titel ablegen</button></div>`:`<small>AKTIVER TITEL</small><b>Kein Titel ausgewählt</b><span>Wähle unten einen deiner freigeschalteten Titel aus.</span>`;
 activeBox.querySelector('[data-v6338-clear]')?.addEventListener('click',()=>setActive(''));
 const filters=[['all','📚 Alle'],...(vipActive()?[['vip','👑 VIP']]:[]),['pet','🐾 Pets'],['achievement','🏆 Erfolge'],['server','🌐 Server']];
 x.panel.querySelector('#v6338TitleFilters').innerHTML=filters.map(([id,l])=>`<button type="button" class="v6338-title-filter ${filter===id?'active':''}" data-v6338-filter="${id}">${l}</button>`).join('');
 x.panel.querySelectorAll('[data-v6338-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.v6338Filter;renderTitles()});
 const visible=defs.filter(d=>filter==='all'||d.category===filter);
 x.panel.querySelector('#v6338TitleList').innerHTML=visible.map(d=>{
   const rec=st.unlocked[d.id],owned=!!rec,selected=st.activeId===d.id,claim=d.claim;
   let state=selected?'AKTIV':owned?'FREI':'GESPERRT';
   if(d.category==='server'&&!owned&&claim?.user_id)state='VERGEBEN';
   const owner=(d.category==='server'&&claim?.user_id)?`<div class="v6338-title-owner">${String(claim.user_id)===String(v073User?.id)?'✅ Von dir beansprucht':`🏅 Server-Erster: ${esc(claim.character_name||'Spieler')}`}</div>`:'';
   return `<article class="v6338-title-card ${owned?'unlocked':''} ${selected?'active':''} ${d.category==='server'?'server':''}"><div class="v6338-title-head"><div class="v6338-title-name">${esc(d.icon||'👑')} ${esc(d.label)}</div><span class="v6338-title-state">${state}</span></div><div class="v6338-title-desc">${esc(d.desc||d.req||'')}</div><div class="v6338-title-meta">${sourceLabel(d)}${d.category==='server'?' · EINMALIG PRO SERVER':''}</div>${owner}<div class="v6338-title-actions">${owned?`<button type="button" class="primary" data-v6338-select="${esc(d.id)}" ${selected?'disabled':''}>${selected?'Ausgewählt':'Auswählen'}</button>`:''}</div></article>`;
 }).join('')||'<div class="empty">Noch keine Titel in dieser Kategorie.</div>';
 x.panel.querySelectorAll('[data-v6338-select]').forEach(b=>b.onclick=()=>setActive(b.dataset.v6338Select));
 const main=x.tabs.querySelector('[data-v6338-main="titles"]');if(main)main.textContent=`👑 Titel (${Object.keys(st.unlocked).length})`;
 if(keepScroll)x.ov.scrollTop=scrollTop;
}
async function syncServerTitles(force=false){
 if(syncBusy||(!force&&Date.now()-lastServerSync<15000))return false;
 try{
   if(typeof v073Init==='function'&&!(await v073Init()))return false;
   if(typeof v073Db==='undefined'||!v073Db||!v073User?.id||v073User.is_anonymous)return false;
   syncBusy=true;lastServerSync=Date.now();
   let remoteTitle=null;
   try{
     const ownProfile=await v073Db.from('profiles').select('dungeon_progress').eq('id',v073User.id).maybeSingle();
     remoteTitle=ownProfile?.data?.dungeon_progress?.public_title||null;
   }catch(_){}
   const claimsRes=await v073Db.from('server_title_claims').select('title_id,title_label,user_id,character_name,claimed_at');
   if(!claimsRes.error){serverClaims=new Map((claimsRes.data||[]).map(x=>[String(x.title_id),x]))}
   for(const def of SERVER){
     if(serverClaims.has(def.id)||!def.eligible())continue;
     const {data,error}=await v073Db.rpc('v6338_claim_server_first',{p_title_id:def.id});
     if(error){console.warn('V6.342 title claim',def.id,error);continue}
     if(data?.newly_claimed){try{v063Toast?.('👑 SERVER-TITEL!','success',def.label)}catch(_){ }}
   }
   const ownRes=await v073Db.from('player_titles').select('title_id,title_label,source,metadata,unlocked_at').eq('user_id',v073User.id);
   if(!ownRes.error){for(const row of ownRes.data||[])unlock(String(row.title_id),String(row.title_label||''),String(row.source||'server'),{server:true,unlockedAt:row.unlocked_at})}
   const st=titleState();
   if(!st.activeId&&remoteTitle?.id&&st.unlocked[String(remoteTitle.id)]){
     const rec=st.unlocked[String(remoteTitle.id)];
     st.activeId=String(remoteTitle.id);st.activeLabel=String(remoteTitle.label||rec?.label||'');st.activeSource=String(remoteTitle.source||rec?.source||'');
     persistTitles();
   }
   try{if(typeof v073SyncProfile==='function')await v073SyncProfile(true)}catch(_){ }
   try{if(typeof window.v649SyncDungeonProgress==='function')await window.v649SyncDungeonProgress(true)}catch(_){ }
   const claims2=await v073Db.from('server_title_claims').select('title_id,title_label,user_id,character_name,claimed_at');
   if(!claims2.error)serverClaims=new Map((claims2.data||[]).map(x=>[String(x.title_id),x]));
   persistTitles();renderTitles();syncOwnBadges();return true;
 }catch(e){console.warn('V6.342 server titles',e);return false}finally{syncBusy=false}
}
window.v6338SyncServerTitles=syncServerTitles;
function titleLabelFromProfile(p){return String(p?.dungeon_progress?.public_title?.label||'')}
function injectSocial(html,p){const label=titleLabelFromProfile(p);if(!label)return html;const needle='<div class="v4124-social-lines">';return String(html).replace(needle,`<div class="v6338-public-title">👑 ${esc(label)}</div>${needle}`)}
try{
 const base=window.v4130SocialRow||window.v073PlayerRow;
 if(typeof base==='function'&&!window.__V6338_SOCIAL_ROW__){const wrapped=(p,...args)=>injectSocial(base(p,...args),p);window.v4130SocialRow=wrapped;window.v073PlayerRow=(p,i=null,actions='')=>wrapped(p,i,actions,false);try{v073PlayerRow=window.v073PlayerRow}catch(_){ }window.__V6338_SOCIAL_ROW__=true}
}catch(_){ }
function syncOwnBadges(){
 const a=active();document.querySelectorAll('#character .v6338-own-title').forEach(n=>n.remove());
 if(a.label){const host=document.querySelector('#character .char-name,#character .char-title,#character .v690-char-name,#character .v366-char-name');if(host){const b=document.createElement('div');b.className='v6338-own-title';b.textContent='👑 '+a.label;host.insertAdjacentElement('afterend',b)}}
 const own=document.querySelector('#v072OwnProfile');if(own){own.querySelectorAll('.v6338-own-hall-title').forEach(n=>n.remove());if(a.label){const n=document.createElement('div');n.className='v6338-own-hall-title';n.textContent='👑 '+a.label;(own.querySelector('.v072-profile-name')||own.firstElementChild)?.insertAdjacentElement('afterend',n)}}
}
try{
 const base=window.v072RenderOwnProfile;
 if(typeof base==='function'&&!window.__V6338_OWN_HALL__){const wrapped=function(){const r=base.apply(this,arguments);syncOwnBadges();return r};window.v072RenderOwnProfile=wrapped;try{v072RenderOwnProfile=wrapped}catch(_){ }window.__V6338_OWN_HALL__=true}
}catch(_){ }
try{
 if(typeof v073ProfilePayload==='function'&&!window.__V6338_PROFILE_PAYLOAD__){const base=v073ProfilePayload;const wrapped=function(){const p=base.apply(this,arguments)||{};p.dungeon_progress=(p.dungeon_progress&&typeof p.dungeon_progress==='object')?{...p.dungeon_progress}:{};p.dungeon_progress.public_title=publicTitle();return p};v073ProfilePayload=wrapped;window.v073ProfilePayload=wrapped;window.__V6338_PROFILE_PAYLOAD__=true}
}catch(_){ }
try{
 const old=window.v106OpenBook||v106OpenBook;
 if(typeof old==='function'&&!window.__V6338_BOOK_WRAPPED__){const wrapped=function(){const r=old.apply(this,arguments);ensureBook();showMain('ach');renderTitles();return r};window.v106OpenBook=wrapped;try{v106OpenBook=wrapped}catch(_){ }window.__V6338_BOOK_WRAPPED__=true}
}catch(_){ }
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='hall')syncOwnBadges()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{migrate();syncOwnBadges();void syncServerTitles(true)},{passive:true});
window.addEventListener('growlegends:vip-state',()=>{migrate();syncOwnBadges();renderTitles();void publish()},{passive:true});
window.v6338VipRefresh=()=>{migrate();syncOwnBadges();renderTitles();void publish();return publicTitle()};
window.addEventListener('pageshow',()=>{migrate();syncOwnBadges();void syncServerTitles(false)},{passive:true});
window.v6338TitleDiagnostics=()=>({version:'V6.347',active:active(),unlocked:Object.keys(titleState().unlocked).length,serverClaims:[...serverClaims.keys()],petTitles:Object.keys(s?.v686PetAlbum?.titles||{}).length});
})();
