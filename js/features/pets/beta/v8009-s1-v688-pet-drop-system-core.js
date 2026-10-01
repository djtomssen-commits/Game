(function(){
'use strict';
if(window.__V688_PET_DROP_SYSTEM__)return;
window.__V688_PET_DROP_SYSTEM__=true;
window.__V699_PET_PERFORMANCE_REBUILD__=true;

const GROUPS={
  grow:['bud_hase','hash_igel','trichom_frosch','bud_buddy','ganja_gecko','bong_schildkroete','nebel_otter'],
  quest:['rauch_fuchs','blatt_eule','haze_hase','og_katze','chill_kraehe','kush_waschbaer','kief_maulwurf'],
  dungeon:['skunkster','harz_baer','bud_dachs','sporen_luchs','shatter_wolf','nebel_fuchs']
};
const SOURCE_LABEL={grow:'🌱 Growroom',quest:'📜 Quests',elite:'🔴 Elite-Quest',dungeon:'👹 Dungeon',dungeon_boss:'👑 Dungeon-Boss',endgame:'🌀 Nebelriss',endgame_boss:'👑 Riss-Endboss',mythic_boss:'💎 Mystischer Boss'};
const QC={normal:{label:'Normal',color:'#aeb6b2'},green:{label:'Grün',color:'#47d45b'},blue:{label:'Blau',color:'#36a8ff'},purple:{label:'Lila',color:'#c65cff'},orange:{label:'Legendär',color:'#ffb020'},cyan:{label:'Mythisch',color:'#31e7e2'}};
const STANDARD_Q=['normal','green','blue','purple','orange'];
const WEIGHTS={grow:{normal:55,green:25,blue:12,purple:6,orange:2},quest:{normal:45,green:27,blue:16,purple:8,orange:4},elite:{normal:25,green:25,blue:20,purple:18,orange:12},dungeon:{normal:35,green:27,blue:18,purple:12,orange:8},dungeon_boss:{normal:25,green:25,blue:20,purple:17,orange:13}};

function pets(){return Array.isArray(window.v686PetDefinitions)?window.v686PetDefinitions:[]}
const petMap=()=>window.__v699PetMap||(window.__v699PetMap=new Map(pets().map(p=>[p.id,p])));
function pet(id){return petMap().get(id)||null}
function album(){
  if(typeof s==='undefined'||!s)return null;
  s.v686PetAlbum=(s.v686PetAlbum&&typeof s.v686PetAlbum==='object')?s.v686PetAlbum:{};
  s.v686PetAlbum.found=(s.v686PetAlbum.found&&typeof s.v686PetAlbum.found==='object')?s.v686PetAlbum.found:{};
  s.v686PetAlbum.dropState=(s.v686PetAlbum.dropState&&typeof s.v686PetAlbum.dropState==='object')?s.v686PetAlbum.dropState:{};
  s.v686PetAlbum.unseen=Math.max(0,Number(s.v686PetAlbum.unseen)||0);
  s.v686PetAlbum.titles=(s.v686PetAlbum.titles&&typeof s.v686PetAlbum.titles==='object')?s.v686PetAlbum.titles:{};
  s.v686PetAlbum.newFinds=Array.isArray(s.v686PetAlbum.newFinds)?s.v686PetAlbum.newFinds:[];
  s.v686PetAlbum.pendingFindPopups=Array.isArray(s.v686PetAlbum.pendingFindPopups)?s.v686PetAlbum.pendingFindPopups:[];
  return s.v686PetAlbum;
}
function dropState(){
  const a=album();if(!a)return {};
  const d=a.dropState;
  d.standardSinceLegendary=Math.max(0,Number(d.standardSinceLegendary)||0);
  d.mythicBossMisses=Math.max(0,Number(d.mythicBossMisses)||0);
  d.lastQuestToken=String(d.lastQuestToken||'');
  d.lastDungeonWin=Math.max(0,Number(d.lastDungeonWin)||0);
  d.lastMythicBossWin=Math.max(0,Number(d.lastMythicBossWin)||0);
  return d;
}
const V6104_SHADOW_PREFIX='growLegends:petAlbum:v6104:';
const V6104_LEGACY_SHADOW='growLegends:petAlbum:v6104'; /* V6.234: retired, never merged automatically. */

function petOwnerUid(){
  try{
    const auth=(typeof v073User!=='undefined'&&v073User&&!v073User.is_anonymous)?String(v073User.id||''):'';
    const owner=String(s?.__accountOwnerId||'');
    const social=String(s?.social?.playerId||'');
    if(!auth)return '';
    if(window.__V200_AUTH_READY__!==true)return '';
    if(owner!==auth||social!==auth)return '';
    return auth;
  }catch(_){return ''}
}
function petShadowKey(){
  const uid=petOwnerUid();
  return uid?V6104_SHADOW_PREFIX+uid:'';
}
function petStateOwned(){
  return !!petOwnerUid();
}

function save(){
  try{persist(false)}catch(_){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(__){}}
}
function has(pid,q){return !!s?.v686PetAlbum?.found?.[pid]?.[q]}

function validFindEntry(x){
  return !!x&&typeof x==='object'&&!!pet(String(x.petId||''))&&!!QC[String(x.quality||'')]&&has(String(x.petId||''),String(x.quality||''));
}
function findKey(pid,q){return String(pid||'')+'|'+String(q||'')}

function normalizeFindLedgers(){
  const a=album();if(!a)return null;
  const uniq=new Map();
  for(const x of a.newFinds||[]){
    if(!validFindEntry(x))continue;
    const key=findKey(x.petId,x.quality);
    const old=uniq.get(key);
    if(!old||Number(x.foundAt||0)>Number(old.foundAt||0))uniq.set(key,x);
  }

  if(!uniq.size && Number(a.unseen)>0){
    const all=[];
    const found=a.found||{};
    for(const p of pets()){
      for(const q of Object.keys(QC)){
        const rec=found?.[p.id]?.[q];
        if(rec)all.push({petId:p.id,quality:q,source:String(rec.source||''),foundAt:Number(rec.foundAt)||0});
      }
    }
    all.sort((x,y)=>Number(y.foundAt||0)-Number(x.foundAt||0));
    all.slice(0,Math.min(Number(a.unseen)||0,all.length)).forEach(x=>uniq.set(findKey(x.petId,x.quality),x));
  }

  a.newFinds=[...uniq.values()].sort((x,y)=>Number(y.foundAt||0)-Number(x.foundAt||0));
  a.unseen=a.newFinds.length;

  const pending=new Map();
  for(const x of a.pendingFindPopups||[]){
    if(!validFindEntry(x))continue;
    const key=findKey(x.petId,x.quality);
    if(!pending.has(key))pending.set(key,x);
  }
  a.pendingFindPopups=[...pending.values()];
  return a;
}

function saveShadow(){
  try{
    const key=petShadowKey(),uid=petOwnerUid();
    if(!key||!uid)return false;
    const a=normalizeFindLedgers()||album();if(!a)return false;
    localStorage.setItem(key,JSON.stringify({
      ownerId:uid,
      ts:Date.now(),
      found:a.found||{},
      titles:a.titles||{},
      newFinds:a.newFinds||[],
      pendingFindPopups:a.pendingFindPopups||[]
    }));
    return true;
  }catch(_){return false}
}

function mergeShadow(){
  const key=petShadowKey(),uid=petOwnerUid();
  if(!key||!uid)return false;

  let sh=null;
  try{sh=JSON.parse(localStorage.getItem(key)||'null')}catch(_){}
  if(!sh||typeof sh!=='object')return false;

  /* V6.234: a shadow may never cross account boundaries. */
  if(String(sh.ownerId||'')!==uid){
    console.warn('V6.234 blocked foreign Pet shadow',{shadowOwner:String(sh.ownerId||''),uid});
    return false;
  }
  if(!petStateOwned())return false;

  const a=album();if(!a)return false;
  let changed=false;
  const sf=sh.found&&typeof sh.found==='object'?sh.found:{};

  for(const [pid,row] of Object.entries(sf)){
    if(!pet(pid)||!row||typeof row!=='object')continue;
    a.found[pid]=(a.found[pid]&&typeof a.found[pid]==='object')?a.found[pid]:{};
    for(const [q,rec] of Object.entries(row)){
      if(!QC[q]||!rec)continue;
      const cur=a.found[pid][q];
      if(!cur||Number(rec.foundAt||0)>Number(cur.foundAt||0)){
        a.found[pid][q]=rec;
        changed=true;
      }
    }
  }

  if(sh.titles&&typeof sh.titles==='object'){
    for(const [pid,title] of Object.entries(sh.titles)){
      if(title&&!a.titles[pid]){a.titles[pid]=title;changed=true}
    }
  }

  const existingNew=new Map((a.newFinds||[]).filter(validFindEntry).map(x=>[findKey(x.petId,x.quality),x]));
  for(const x of Array.isArray(sh.newFinds)?sh.newFinds:[]){
    if(!x||!has(x.petId,x.quality))continue;
    const k=findKey(x.petId,x.quality);
    if(!existingNew.has(k)){existingNew.set(k,x);changed=true}
  }
  a.newFinds=[...existingNew.values()];

  const existingPending=new Map((a.pendingFindPopups||[]).filter(validFindEntry).map(x=>[findKey(x.petId,x.quality),x]));
  for(const x of Array.isArray(sh.pendingFindPopups)?sh.pendingFindPopups:[]){
    if(!x||!has(x.petId,x.quality))continue;
    const k=findKey(x.petId,x.quality);
    if(!existingPending.has(k)){existingPending.set(k,x);changed=true}
  }
  a.pendingFindPopups=[...existingPending.values()];

  normalizeFindLedgers();
  if(changed){
    window.v686InvalidatePetCache?.();
    save();
  }
  return changed;
}

window.v6104PetUnseen=function(){
  const a=normalizeFindLedgers();
  return Math.max(0,Number(a?.unseen)||0);
};
function legendaryComplete(p){return STANDARD_Q.every(q=>has(p.id,q))}
function titleComplete(p){return [...STANDARD_Q,'cyan'].every(q=>has(p.id,q))}
function sourceForPet(pid){if(GROUPS.grow.includes(pid))return'grow';if(GROUPS.quest.includes(pid))return'quest';if(GROUPS.dungeon.includes(pid))return'dungeon';return'quest'}
function sourceGroup(source){return source==='elite'?'quest':(['dungeon_boss','endgame','endgame_boss'].includes(source)?'dungeon':source)}
function missingIds(source,q){const found=s?.v686PetAlbum?.found||{};return (GROUPS[source]||[]).filter(id=>pet(id)&&!found?.[id]?.[q])}
function anyMissing(source){const found=s?.v686PetAlbum?.found||{};return (GROUPS[source]||[]).some(id=>STANDARD_Q.some(q=>!found?.[id]?.[q]))}
function weightedQuality(source,forcedLegendary=false){
  const weights=WEIGHTS[source]||WEIGHTS.quest,group=sourceGroup(source);
  if(forcedLegendary&&missingIds(group,'orange').length)return'orange';
  const available=STANDARD_Q.filter(q=>missingIds(group,q).length);if(!available.length)return null;
  let total=available.reduce((n,q)=>n+(Number(weights[q])||0),0),r=Math.random()*Math.max(1,total);
  for(const q of available){r-=Number(weights[q])||0;if(r<=0)return q}
  return available[available.length-1]||null;
}
function pick(arr){return arr.length?arr[Math.floor(Math.random()*arr.length)]:null}

function ensurePopup(){
  let ov=document.getElementById('v688PetPopup');if(ov)return ov;
  ov=document.createElement('div');ov.id='v688PetPopup';
  ov.innerHTML='<div class="v688-card"><div class="v688-kicker"></div><div class="v688-icon"></div><h3></h3><div class="v688-quality"></div><div class="v688-source-text"></div><div class="v688-reward-text"></div><div class="v688-actions"><button type="button" data-v688-close>Schließen</button><button type="button" class="primary" data-v688-album>Zum Album</button></div></div>';
  document.body.appendChild(ov);
  ov.querySelector('[data-v688-close]').onclick=()=>finishPopup(false);
  ov.querySelector('[data-v688-album]').onclick=()=>finishPopup(true);
  ov.addEventListener('click',e=>{if(e.target===ov)finishPopup(false)});
  return ov;
}
let popupQueue=[],popupBusy=false,currentPopup=null;
let petRuntimeOwner='';

function clearPetRuntime(reason='account-switch'){
  popupQueue.length=0;
  popupBusy=false;
  currentPopup=null;
  try{document.getElementById('v688PetPopup')?.classList.remove('show')}catch(_){}
  try{window.v686InvalidatePetCache?.()}catch(_){}
  try{
    const b=document.getElementById('v686PetAlbumBtn');
    b?.classList.remove('v688-unseen');
    b?.querySelector('.v688-book-count')?.remove();
  }catch(_){}
  return reason;
}
function syncPetRuntimeOwner(){
  const uid=petOwnerUid();
  if(!uid)return '';
  if(petRuntimeOwner&&petRuntimeOwner!==uid)clearPetRuntime('owner-changed');
  petRuntimeOwner=uid;
  return uid;
}
function queuePopup(data){
  if(!data)return;
  popupQueue.push(data);
  if(!popupBusy)nextPopup();
}
function removePendingPopup(key){
  if(!key)return;
  const a=album();if(!a)return;
  const before=a.pendingFindPopups.length;
  a.pendingFindPopups=a.pendingFindPopups.filter(x=>findKey(x.petId,x.quality)!==key);
  if(a.pendingFindPopups.length!==before){saveShadow();save()}
}
function nextPopup(){
  const data=popupQueue.shift();if(!data){popupBusy=false;currentPopup=null;return}popupBusy=true;currentPopup=data;
  const ov=ensurePopup(),card=ov.querySelector('.v688-card');card.style.setProperty('--v688q',data.color||'#62d765');
  ov.querySelector('.v688-kicker').textContent=data.kicker||'🐾 PET SAMMELALBUM';
  ov.querySelector('.v688-icon').textContent=data.icon||'🐾';
  ov.querySelector('h3').textContent=data.title||'Belohnung';
  ov.querySelector('.v688-quality').textContent=data.subtitle||'';
  ov.querySelector('.v688-source-text').textContent=data.source||'';
  ov.querySelector('.v688-reward-text').innerHTML=data.body||'';
  ov.querySelector('[data-v688-album]').style.display=data.hideAlbum?'none':'block';
  ov.classList.add('show');
  /* Do NOT acknowledge the find here. If a render/reload interrupts this popup,
     the pending ledger must survive so it can be shown again. */
}
function finishPopup(openAlbum){
  const data=currentPopup;currentPopup=null;
  document.getElementById('v688PetPopup')?.classList.remove('show');
  if(data?.pendingKey)removePendingPopup(data.pendingKey);
  if(openAlbum){try{window.v686OpenPetAlbum?.()}catch(_){}}
  setTimeout(nextPopup,120);
}
function updateDot(){
  const unseen=window.v6104PetUnseen?.()??0;

  const b=document.getElementById('v686PetAlbumBtn');
  if(b){
    b.classList.toggle('v688-unseen',unseen>0);
    const info=b.querySelector('.info');
    if(info)info.textContent=unseen?`${unseen} neuer Fund${unseen===1?'':'e'} · 20 Begleiter · Boni + Titel`:'20 Begleiter · 6 Qualitäten · Boni + Titel';
    let count=b.querySelector('.v688-book-count');
    if(unseen>0){
      if(!count){count=document.createElement('span');count.className='v688-book-count';b.appendChild(count)}
      count.textContent=`NEU ${unseen}`;
    }else count?.remove();
  }

  const q=document.querySelector('#world .v6103-quickbar [data-pets]');
  if(q){
    let badge=q.querySelector('.v6103-badge');
    if(unseen>0){
      if(!badge){badge=document.createElement('i');badge.className='v6103-badge';q.appendChild(badge)}
      badge.textContent=String(unseen);
    }else badge?.remove();
  }
}
window.v6104UpdatePetIndicators=updateDot;

function popupDataForFind(x){
  const p=pet(x?.petId),q=QC[x?.quality];if(!p||!q)return null;
  return {
    kicker:'🐾 NEUES PET GEFUNDEN',
    icon:p.emoji||'🐾',
    title:p.name,
    subtitle:q.label,
    color:q.color,
    source:`Quelle: ${SOURCE_LABEL[x.source]||x.source||'Unbekannt'}`,
    body:`Neue Qualitätsstufe für dein Sammelalbum.<br><b>${q.label}</b> wurde bei ${p.name} dauerhaft freigeschaltet.`,
    pendingKey:findKey(x.petId,x.quality)
  };
}
function recoverPendingPopups(){
  const a=normalizeFindLedgers();if(!a||!a.pendingFindPopups.length)return;
  const already=new Set(popupQueue.map(x=>x.pendingKey).filter(Boolean));
  if(currentPopup?.pendingKey)already.add(currentPopup.pendingKey);
  for(const x of a.pendingFindPopups){
    const key=findKey(x.petId,x.quality);
    if(already.has(key))continue;
    const data=popupDataForFind(x);
    if(data){already.add(key);queuePopup(data)}
  }
}
function decorateAlbum(){
  const ov=document.getElementById('v686PetAlbumOverlay');if(!ov)return;
  const summary=ov.querySelector('.v686-summary');
  if(summary&&!ov.querySelector('.v688-drop-guide')){const g=document.createElement('div');g.className='v688-drop-guide';g.innerHTML='<b>🐾 Wo findest du Pets?</b> &nbsp; 🌱 Growroom · 📜 Quests/Elite · 👹 Dungeons. <strong>Mythisch</strong> gibt es ausschließlich beim mystischen Boss. Bereits gefundene Pet-Qualitäten können nie doppelt droppen.';summary.insertAdjacentElement('afterend',g)}
  const fresh=new Set((normalizeFindLedgers()?.newFinds||[]).map(x=>findKey(x.petId,x.quality)));
  ov.querySelectorAll('.v686-pet-row').forEach(row=>{
    const id=row.querySelector('.v686-qslot[data-pet]')?.dataset.pet,host=row.querySelector('.v686-pet-id');
    if(id&&host&&!host.querySelector('.v688-source')){
      const badge=document.createElement('span');badge.className='v688-source';badge.textContent=SOURCE_LABEL[sourceForPet(id)]||sourceForPet(id);host.appendChild(badge);
    }
    row.querySelectorAll('.v686-qslot[data-pet][data-q]').forEach(slot=>{
      slot.classList.toggle('v6104-new-find',fresh.has(findKey(slot.dataset.pet,slot.dataset.q)));
    });
  });
}
window.v688DecoratePetAlbum=decorateAlbum;

function grantWithRewards(pid,q,source){
  const p=pet(pid);if(!p||!QC[q])return false;
  const beforeBonus=legendaryComplete(p),beforeTitle=titleComplete(p);
  const base=window.__v688BaseGrant||window.v686GrantPet;
  const ok=base(pid,q,source,{deferSave:true,deferRender:true,silent:true});
  if(!ok||!has(pid,q))return false;
  try{window.v6111Sfx?.('pet')}catch(e){}

  const a=album(),rec=a?.found?.[pid]?.[q]||{};
  const entry={petId:pid,quality:q,source:String(source||rec.source||''),foundAt:Number(rec.foundAt)||Date.now()};
  const key=findKey(pid,q);

  a.newFinds=(a.newFinds||[]).filter(x=>findKey(x.petId,x.quality)!==key);
  a.newFinds.unshift(entry);
  a.pendingFindPopups=(a.pendingFindPopups||[]).filter(x=>findKey(x.petId,x.quality)!==key);
  a.pendingFindPopups.push(entry);
  normalizeFindLedgers();

  const afterBonus=legendaryComplete(p),afterTitle=titleComplete(p);
  if(afterTitle)a.titles[p.id]=p.title;

  window.v686InvalidatePetCache?.();
  saveShadow();
  save();
  /* V6.113: publish the new Pet stats without blocking the drop popup. */
  setTimeout(()=>{try{if(typeof v073SyncProfile==='function')void v073SyncProfile(true)}catch(_){ }},0);
  updateDot();
  window.v686RefreshPetAlbum?.(true);
  recoverPendingPopups();

  if(!beforeBonus&&afterBonus)queuePopup({
    kicker:'✨ SAMMEL-BONUS FREIGESCHALTET',icon:'🏆',title:p.name,
    subtitle:'Normal → Legendär komplett',color:'#f2c45f',
    source:'Dauerhafter Bonus aktiv',
    body:`Deine Reihe ist bis Legendär vollständig.<br><b>${p.bonus?.label?`+${p.bonus.value}${p.bonus.label}`:'Sammel-Bonus'}</b> ist jetzt dauerhaft aktiv.`
  });
  if(!beforeTitle&&afterTitle)queuePopup({
    kicker:'👑 TITEL FREIGESCHALTET',icon:'👑',title:p.title,
    subtitle:`${p.name} · alle 6 Qualitäten`,color:'#31e7e2',
    source:'Normal · Grün · Blau · Lila · Legendär · Mythisch',
    body:'Du hast die komplette Pet-Reihe einschließlich Mythisch gesammelt.'
  });
  return true;
}
if(typeof window.v686GrantPet==='function'&&!window.__v688BaseGrant){window.__v688BaseGrant=window.v686GrantPet;window.v686GrantPet=grantWithRewards}

function standardRoll(source,chance,qualityProfile){
  const group=sourceGroup(source);if(!GROUPS[group]||!anyMissing(group)||Math.random()>=chance)return null;
  const d=dropState(),q=weightedQuality(qualityProfile||source,d.standardSinceLegendary>=25);if(!q)return null;
  const id=pick(missingIds(group,q));if(!id||!window.v686GrantPet(id,q,source))return null;
  if(q==='orange')d.standardSinceLegendary=0;else d.standardSinceLegendary++;
  save();return {petId:id,quality:q,source};
}

window.v688PetGrowHarvest=function(readyPlants){
  const rows=Array.isArray(readyPlants)?readyPlants:[];
  for(const p of rows){const care=Array.isArray(p?.care)?p.care.filter(Boolean).length:0;standardRoll('grow',Math.min(.06,.02+Math.min(4,care)*.01),'grow')}
};
function questToken(q){return String(q?.id||q?.uid||q?.ends||'')+'|'+String(q?.ends||'')}
function questPaid(q){return !!q&&(!s?.quests?.active||s.quests.active!==q)}
function afterQuest(q,ready){
  if(!ready||!q||!questPaid(q))return;const d=dropState(),token=questToken(q);if(!token||d.lastQuestToken===token)return;
  d.lastQuestToken=token;save();const elite=!!q.v310Elite||/elite/i.test(String(q.v309Role||q.v310BaseRole||q.v392Kind||''));standardRoll(elite?'elite':'quest',elite?.12:.04,elite?'elite':'quest');
}
function wrapQuest(name){
  try{
    let fn=name==='claimQuest'?(typeof claimQuest==='function'?claimQuest:null):(typeof v233ClaimQuest==='function'?v233ClaimQuest:null);if(typeof fn!=='function'||fn.__v688PetDrop)return;
    const wrapped=function(){const q=s?.quests?.active,ready=!!q&&Date.now()>=Number(q.ends||0),prev=window.__v688XpContext;window.__v688XpContext='quest';let r;try{r=fn.apply(this,arguments)}finally{window.__v688XpContext=prev}const done=()=>afterQuest(q,ready);if(r&&typeof r.then==='function')r.finally(done);else queueMicrotask(done);return r};
    wrapped.__v688PetDrop=true;if(name==='claimQuest'){claimQuest=wrapped;window.claimQuest=wrapped}else{v233ClaimQuest=wrapped;window.v233ClaimQuest=wrapped}
  }catch(e){console.warn('V6.99 quest pet hook',e)}
}
if(window.GL_EVENTS){window.GL_EVENTS.on('questCompleted',ev=>{const q=ev.quest||{},elite=!!ev.elite||!!q.v310Elite||/elite/i.test(String(q.v309Role||q.v310BaseRole||q.v392Kind||''));standardRoll(elite?'elite':'quest',elite?.12:.04,elite?'elite':'quest')})}else{wrapQuest('claimQuest');wrapQuest('v233ClaimQuest')}

function dungeonWins(){try{if(typeof v336CanonicalDungeonWins==='function')return Math.max(0,Number(v336CanonicalDungeonWins())||0);return Math.max(0,Number(s?.v106Achievements?.stats?.dungeonWins)||0)}catch(_){return 0}}
function dungeonPos(){try{const dp=typeof v074DungeonProgress==='function'?v074DungeonProgress():{completed:[...(s?.dungeon?.completed||[])],progress:{...(s?.dungeon?.progress||{})},selected:Number(s?.dungeon?.selected)||0,room:Number(s?.dungeon?.room)||0};if(typeof v081DungeonPosition==='function')return v081DungeonPosition(dp)}catch(_){}return{dungeonNumber:(Number(s?.dungeon?.selected)||0)+1,enemyNumber:(Number(s?.dungeon?.room)||0)+1}}
function checkDungeonWin(before,pos){
  const after=dungeonWins();if(after<=before)return;const d=dropState();if(after<=d.lastDungeonWin)return;d.lastDungeonWin=after;save();
  const dn=Math.max(1,Math.min(20,Number(pos?.dungeonNumber)||1)),boss=Math.max(1,Number(pos?.enemyNumber)||1)>=10,chance=boss?.12:Math.min(.06,.03+((dn-1)/19)*.03);standardRoll(boss?'dungeon_boss':'dungeon',chance,boss?'dungeon_boss':'dungeon');
}
if(window.GL_EVENTS){window.GL_EVENTS.on('dungeonWon',ev=>{const dn=Math.max(1,Math.min(20,Number(ev.dungeonNumber)||1)),boss=!!ev.boss,chance=boss?.12:Math.min(.06,.03+((dn-1)/19)*.03);standardRoll(boss?'dungeon_boss':'dungeon',chance,boss?'dungeon_boss':'dungeon')})}else{try{
  if(typeof fightDungeon==='function'&&!fightDungeon.__v688PetDrop){
    const base=fightDungeon;const wrapped=async function(){const before=dungeonWins(),pos=dungeonPos(),pg=window.__v688GoldContext,px=window.__v688XpContext;window.__v688GoldContext='dungeon';window.__v688XpContext='dungeon';try{const r=await base.apply(this,arguments);checkDungeonWin(before,pos);setTimeout(()=>checkDungeonWin(before,pos),700);return r}finally{window.__v688GoldContext=pg;window.__v688XpContext=px}};wrapped.__v688PetDrop=true;fightDungeon=wrapped;window.fightDungeon=wrapped;
  }
}catch(e){console.warn('V6.99 dungeon pet hook',e)}}

function mythicRoll(){
  const found=s?.v686PetAlbum?.found||{},pool=pets().filter(p=>!found?.[p.id]?.cyan);if(!pool.length)return null;
  const d=dropState(),guaranteed=d.mythicBossMisses>=29,chance=Math.min(1,.01+d.mythicBossMisses*.0015);
  if(!guaranteed&&Math.random()>=chance){d.mythicBossMisses++;save();return null}
  const p=pick(pool);if(!p)return null;if(window.v686GrantPet(p.id,'cyan','mythic_boss')){d.mythicBossMisses=0;save();return{petId:p.id,quality:'cyan',source:'mythic_boss'}}return null;
}
function bossWins(){return Math.max(0,Number(s?.v110WorldBoss?.wins)||0)}
function checkBossWin(before){const after=bossWins();if(after<=before)return;const d=dropState();if(after<=d.lastMythicBossWin)return;d.lastMythicBossWin=after;save();mythicRoll()}
try{
  if(typeof v110Fight==='function'&&!v110Fight.__v688PetDrop){const base=v110Fight;const wrapped=function(){const before=bossWins(),r=base.apply(this,arguments);setTimeout(()=>checkBossWin(before),900);setTimeout(()=>checkBossWin(before),2800);return r};wrapped.__v688PetDrop=true;v110Fight=wrapped;window.v110Fight=wrapped}
}catch(e){console.warn('V6.99 mythic boss pet hook',e)}

/* O(1) cached bonus lookup. The 20-pet scan only happens when the collection changes. */
function bonusMap(){try{return window.v686GetPetBonusCache?.()||{}}catch(_){return {}}}
function petBonus(type){return Math.max(0,Number(bonusMap()[type])||0)}
window.v688PetBonus=petBonus;

try{if(typeof v408GuildGold==='function'&&!v408GuildGold.__v688PetBonus){const base=v408GuildGold;const wrapped=function(value){let out=Number(base.apply(this,arguments))||0;if(out>0){const b=bonusMap();let pct=Number(b.gold)||0;if(window.__v688GoldContext==='dungeon')pct+=Number(b.dungeon_gold)||0;if(pct>0)out=Math.round(out*(1+pct/100))}return out};wrapped.__v688PetBonus=true;v408GuildGold=wrapped;window.v408GuildGold=wrapped}}catch(e){console.warn('V6.99 gold bonus',e)}
try{if(typeof addXp==='function'&&!addXp.__v688PetBonus){const base=addXp;const wrapped=function(value){let n=Number(value)||0;if(n>0){const b=bonusMap();let pct=Number(b.xp)||0;if(window.__v688XpContext==='quest')pct+=Number(b.quest_xp)||0;if(pct>0)n=Math.round(n*(1+pct/100))}const args=[...arguments];args[0]=n;return base.apply(this,args)};wrapped.__v688PetBonus=true;addXp=wrapped;try{window.addXp=wrapped}catch(_){}}}catch(e){console.warn('V6.99 xp bonus',e)}
try{if(typeof totalAttr==='function'&&!totalAttr.__v688PetBonus){const base=totalAttr;const wrapped=function(key){let out=Number(base.apply(this,arguments))||0,b=bonusMap(),k=String(key||'').toLowerCase();if(k==='staerke'||k==='stärke'||k==='strength')out+=Number(b.strength)||0;else if(k==='geschick'||k==='dex')out+=Number(b.dex)||0;else if(k==='ausdauer'||k==='stamina')out+=Number(b.stamina)||0;else if(k==='intelligenz'||k==='int')out+=Number(b.int)||0;return out};wrapped.__v688PetBonus=true;totalAttr=wrapped;try{window.totalAttr=wrapped}catch(_){}}}catch(e){console.warn('V6.99 attr bonus',e)}
try{if(typeof maxHp==='function'&&!maxHp.__v688PetBonus){const base=maxHp;const wrapped=function(){return Math.max(1,Math.round((Number(base.apply(this,arguments))||1)+(Number(bonusMap().hp)||0)))};wrapped.__v688PetBonus=true;maxHp=wrapped;try{window.maxHp=wrapped}catch(_){}}}catch(e){console.warn('V6.99 hp bonus',e)}
try{if(typeof v271DampfCap==='function'&&!v271DampfCap.__v688PetBonus){const base=v271DampfCap;const wrapped=function(){return Math.max(1,Math.round((Number(base.apply(this,arguments))||100)+(Number(bonusMap().dampf)||0)))};wrapped.__v688PetBonus=true;v271DampfCap=wrapped;try{window.v271DampfCap=wrapped}catch(_){}}}catch(e){console.warn('V6.99 dampf bonus',e)}
window.v688ApplyPetHarvestBonus=function(value){const n=Math.max(0,Number(value)||0),pct=Number(bonusMap().harvest)||0;return pct>0?Math.round(n*(1+pct/100)):n};
try{if(typeof v318ResolvePlayerAttack==='function'&&!v318ResolvePlayerAttack.__v688PetBonus){const base=v318ResolvePlayerAttack;const wrapped=function(st,ctx){const b=bonusMap(),c={...(ctx||{})},crit=Number(b.crit)||0;if(crit>0)c.baseCrit=(Number(c.baseCrit)||0)+crit/100;const r=base.call(this,st,c)||{},dmg=Number(b.damage)||0;if(dmg>0)r.damage=Math.max(1,Math.round((Number(r.damage)||1)*(1+dmg/100)));return r};wrapped.__v688PetBonus=true;v318ResolvePlayerAttack=wrapped;try{window.v318ResolvePlayerAttack=wrapped}catch(_){}}}catch(e){console.warn('V6.99 combat bonus',e)}
try{if(typeof v319ExactTalentStats==='function'&&!v319ExactTalentStats.__v688PetBonus){const base=v319ExactTalentStats;const wrapped=function(){const o=base.apply(this,arguments)||{},dodge=Number(bonusMap().dodge)||0;if(dodge>0)o.dodgeChance=Math.min(.45,(Number(o.dodgeChance)||0)+dodge/100);return o};wrapped.__v688PetBonus=true;v319ExactTalentStats=wrapped;try{window.v319ExactTalentStats=wrapped}catch(_){}}}catch(e){console.warn('V6.99 dodge bonus',e)}

window.v686TryPetDrop=function(source='quest',meta={}){const src=String(source||'quest');if(src==='mythic_boss')return mythicRoll();if(src==='grow'){const care=Math.max(0,Math.min(4,Number(meta.care)||0));return standardRoll('grow',Math.min(.06,.02+care*.01),'grow')}if(src==='elite'||src==='elite_quest')return standardRoll('elite',.12,'elite');if(src==='dungeon_boss')return standardRoll('dungeon_boss',.12,'dungeon_boss');if(src==='dungeon'){const dn=Math.max(1,Math.min(20,Number(meta.dungeonNumber)||1));return standardRoll('dungeon',Math.min(.06,.03+((dn-1)/19)*.03),'dungeon')}return standardRoll('quest',.04,'quest')};
window.v688PetEndgameWin=function(riftNumber,boss=false){const rn=Math.max(1,Math.min(9,Number(riftNumber)||1)),t=(rn-1)/8,isBoss=!!boss,chance=isBoss?(.12+t*.03):(.05+t*.02);return standardRoll(isBoss?'endgame_boss':'endgame',chance,isBoss?'dungeon_boss':'dungeon')};
window.v688PetDropConfig={groups:GROUPS,weights:WEIGHTS,chances:{grow:'2–6 % pro geernteter Pflanze (+1 Prozentpunkt je erledigter Pflege, max. 4)',quest:'4 %',elite:'12 %',dungeon:'3–6 % Gegner 1–9, abhängig von Dungeon 1–20',dungeonBoss:'12 %',endgame:'5–7 % normale Nebelriss-Gegner, abhängig von Riss 1–9',endgameBoss:'12–15 % Nebelriss-Endboss, abhängig von Riss 1–9',mythicBoss:'1 % Basis +0,15 Prozentpunkte pro sieglosem Pet-Roll; 30. Fehlversuchsschutz'},legendaryPity:'Nach 25 normalen Pet-Funden ohne Legendär ist der nächste erfolgreiche Standard-Pet-Fund Legendär, sofern in dieser Quelle noch eines fehlt.',duplicateRule:'Jede Pet-Qualität pro Tier exakt einmal.',performance:'V6.99 cache + event-driven album; no Pet MutationObserver'};

pets().forEach(p=>{p.source=sourceForPet(p.id)});
function clearNewFinds(){
  const a=album();if(!a)return;
  normalizeFindLedgers();
  if(!a.newFinds.length&&a.unseen===0)return;
  a.newFinds=[];
  a.unseen=0;
  saveShadow();save();updateDot();
  try{window.v686RefreshPetAlbum?.(true)}catch(_){}
}

document.addEventListener('click',e=>{
  if(e.target?.closest?.('#v686PetAlbumOverlay .v686-close'))setTimeout(clearNewFinds,0);
},true);

document.addEventListener('DOMContentLoaded',()=>{
  album();
  normalizeFindLedgers();
  window.v686InvalidatePetCache?.();
  updateDot();
  /* No shadow merge before authenticated account ownership is verified. */
},{once:true});

window.addEventListener('pageshow',()=>{
  if(syncPetRuntimeOwner()){
    mergeShadow();
    normalizeFindLedgers();
    window.v686InvalidatePetCache?.();
    updateDot();
    setTimeout(recoverPendingPopups,120);
  }
},{passive:true});

window.addEventListener('growlegends:account-ready',()=>{
  setTimeout(()=>{
    if(!syncPetRuntimeOwner())return;
    mergeShadow();
    normalizeFindLedgers();
    window.v686InvalidatePetCache?.();
    updateDot();
    recoverPendingPopups();
    /* Create/update only this account's scoped reliability shadow. */
    saveShadow();
  },160);
});

setTimeout(()=>{
  if(!syncPetRuntimeOwner())return;
  mergeShadow();
  normalizeFindLedgers();
  updateDot();
  recoverPendingPopups();
},240);

/* V6.234: clear stale in-memory Pet UI before a different account is finalized.
   This does not touch either account's saved collection. */
try{
  if(typeof v200FinalizeUser==='function'&&!window.__v6234PetFinalizeGuard){
    const base=v200FinalizeUser;
    v200FinalizeUser=async function(user){
      try{
        const next=(!user||user.is_anonymous)?'':String(user.id||'');
        const current=petRuntimeOwner||petOwnerUid();
        if(next&&current&&next!==current){
          clearPetRuntime('finalize-account-switch');
          petRuntimeOwner='';
        }
      }catch(_){}
      return await base.apply(this,arguments);
    };
    try{window.v200FinalizeUser=v200FinalizeUser}catch(_){}
    window.__v6234PetFinalizeGuard=true;
  }
}catch(e){console.warn('V6.234 Pet account switch guard',e)}

window.v6234PetAccountDiagnostics=()=>({
  activeUid:petOwnerUid(),
  stateOwner:String(s?.__accountOwnerId||''),
  socialOwner:String(s?.social?.playerId||''),
  authReady:window.__V200_AUTH_READY__===true,
  runtimeOwner:petRuntimeOwner,
  scopedShadowKey:petShadowKey(),
  legacyShadowPresent:(()=>{try{return localStorage.getItem(V6104_LEGACY_SHADOW)!==null}catch(_){return false}})(),
  scopedShadowPresent:(()=>{try{const k=petShadowKey();return !!k&&localStorage.getItem(k)!==null}catch(_){return false}})()
});

window.v6104ClearPetNewFinds=clearNewFinds;
})();
