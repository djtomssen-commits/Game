(()=>{
'use strict';
if(window.__V6239_WEEKLY_CHEST__)return;
window.__V6239_WEEKLY_CHEST__=true;

const THRESHOLDS=[0,100,220,360,520,700,900,1120,1380,1700];
const MAX_XP=THRESHOLDS[THRESHOLDS.length-1];
const MAX_LEVEL=10;
const XP={
 questQuick:6,questNormal:8,questHeavy:10,questElite:20,
 dungeon:5,dungeonBoss:12,pvp:8,growPlant:2,growOrder:6,
 towerFloor:1,towerEliteBonus:2,towerBossBonus:5,
 worldboss:15,guildboss:15
};

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
const clone=v=>{try{return structuredClone(v)}catch(_){try{return JSON.parse(JSON.stringify(v))}catch(e){return v}}};

function berlinParts(){
 try{
  const ps=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const m={};for(const p of ps)if(p.type!=='literal')m[p.type]=p.value;
  const y=Number(m.year),mo=Number(m.month),d=Number(m.day),ord=Math.floor(Date.UTC(y,mo-1,d)/86400000),dow=new Date(Date.UTC(y,mo-1,d)).getUTCDay();
  return{y,mo,d,ord,dow,key:`${m.year}-${m.month}-${m.day}`}
 }catch(_){
  const x=new Date(),y=x.getFullYear(),mo=x.getMonth()+1,d=x.getDate(),ord=Math.floor(Date.UTC(y,mo-1,d)/86400000),dow=new Date(Date.UTC(y,mo-1,d)).getUTCDay();
  return{y,mo,d,ord,dow,key:`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
 }
}
function ordKey(ord){
 const d=new Date(ord*86400000);
 return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`
}
function keyLabel(key){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key||''));if(!m)return String(key||'');
 return `${m[3]}.${m[2]}.${m[1]}`
}
function weekInfo(){
 const d=berlinParts(),offset=(d.dow+6)%7,mondayOrd=d.ord-offset,nextMondayOrd=mondayOrd+7;
 return{...d,mondayOrd,nextMondayOrd,mondayKey:ordKey(mondayOrd),nextMondayKey:ordKey(nextMondayOrd)}
}
function currentLevel(xp){
 xp=Math.max(0,Number(xp)||0);let lv=1;
 for(let i=1;i<THRESHOLDS.length;i++)if(xp>=THRESHOLDS[i])lv=i+1;
 return Math.max(1,Math.min(MAX_LEVEL,lv))
}
function levelProgress(xp){
 xp=Math.max(0,Math.min(MAX_XP,Number(xp)||0));const lv=currentLevel(xp);
 if(lv>=MAX_LEVEL)return{level:lv,pct:100,from:MAX_XP,to:MAX_XP,current:xp,next:0};
 const from=THRESHOLDS[lv-1],to=THRESHOLDS[lv],span=Math.max(1,to-from);
 return{level:lv,pct:Math.max(0,Math.min(100,(xp-from)/span*100)),from,to,current:xp,next:Math.max(0,to-xp)}
}
function initialTowerFloor(){
 try{
  const r=s?.tower?.run;
  return r?.active?Math.max(0,Number(r.cleared)||Math.max(0,(Number(r.floor)||1)-1)):0
 }catch(_){return 0}
}
function state(){
 s.v6239WeeklyChest=(s.v6239WeeklyChest&&typeof s.v6239WeeklyChest==='object')?s.v6239WeeklyChest:{};
 const z=s.v6239WeeklyChest,w=weekInfo();
 if(!z.cycleKey){z.cycleKey=w.mondayKey;if(z.towerMaxFloor==null)z.towerMaxFloor=initialTowerFloor();}
 z.xp=Math.max(0,Math.min(MAX_XP,Number(z.xp)||0));
 z.maxLevelEver=Math.max(1,Math.floor(Number(z.maxLevelEver)||1));
 z.totalOpened=Math.max(0,Math.floor(Number(z.totalOpened)||0));
 z.lifetimeXp=Math.max(0,Math.floor(Number(z.lifetimeXp)||0));
 z.towerMaxFloor=Math.max(0,Math.floor(Number(z.towerMaxFloor)||0));
 z.seenTokens=Array.isArray(z.seenTokens)?z.seenTokens.slice(-140):[];
 z.daily=(z.daily&&typeof z.daily==='object')?z.daily:{key:w.key,pvpWins:0,plants:0};
 if(z.daily.key!==w.key)z.daily={key:w.key,pvpWins:0,plants:0};
 if(z.pending&&typeof z.pending==='object'){
  z.pending.rewards=Array.isArray(z.pending.rewards)?z.pending.rewards:[];
  z.pending.openedAt=Math.max(0,Number(z.pending.openedAt)||0);
 }
 return z
}
function persistChest(redraw=false){
 try{persist(redraw)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
 try{if(typeof v075WriteCloudSave==='function')setTimeout(()=>v075WriteCloudSave(false),0)}catch(_){}
}
function tierFor(level){return Math.max(1,Math.min(5,Math.ceil(Math.max(1,Number(level)||1)/2)))}
function chestArt(){
 return `<div class="v6239-chest-art"><span class="lid"></span><span class="body"></span><span class="band-a"></span><span class="band-b"></span><span class="lock"></span><span class="leaf">🌿</span></div>`
}
function materialQuality(level){return level>=9?'purple':level>=6?'blue':'green'}
function makeMaterial(level){
 const q=materialQuality(level),isGem=Math.random()<.55;
 try{
  if(isGem&&typeof v030Gems!=='undefined'&&v030Gems.length){
   const g=v030Gems[Math.floor(Math.random()*v030Gems.length)],boost={green:1,blue:2,purple:3}[q]||0;
   const value=Math.max(1,Math.round(((Number(g.min)||1)+(Number(g.max)||2))/2)+boost);
   return{uid:`wc_gem_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,baseId:g.id,type:'gem',name:g.name,icon:g.icon,quality:q,rarity:qualityMeta(q).cls,stat:g.stat,value,price:0,source:'weekly_chest'}
  }
  if(typeof v030Scrolls!=='undefined'&&v030Scrolls.length){
   const r=v030Scrolls[Math.floor(Math.random()*v030Scrolls.length)],boost={green:0,blue:1,purple:2}[q]||0;
   const value=Math.max(1,Math.round(((Number(r.min)||1)+(Number(r.max)||2))/2)+boost);
   return{uid:`wc_scroll_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,baseId:r.id,type:'scroll',name:r.name,icon:r.icon,quality:q,rarity:qualityMeta(q).cls,effect:r.effect,value,price:0,source:'weekly_chest'}
  }
 }catch(_){}
 return{uid:`wc_mat_${Date.now()}`,baseId:'gem_harzkern',type:'gem',name:'Harzkern-Stein',icon:'🟠',quality:q,rarity:q==='purple'?'epic-purple':q==='blue'?'rare-blue':'uncommon',stat:'staerke',value:q==='purple'?6:q==='blue'?4:3,price:0,source:'weekly_chest'}
}
function seedReward(level){
 const pools=level>=8
  ?['critical','nebula','lemon','gorilla','greencrack','amnesia']
  :level>=6?['violet','blue','critical','lemon']:['lime','jack','violet','blue'];
 const id=pools[Math.floor(Math.random()*pools.length)]||'violet';
 return{id,qty:level>=9?2:1}
}
function makeGear(level){
 const cls=['grower','scout','bruiser','frost','summoner'].includes(String(s?.playerClass))?String(s.playerClass):'grower';
 let q=level>=9?'purple':'blue';
 if(level>=10&&Math.random()<.20)q='orange';
 try{
  const pool=(typeof classGear!=='undefined'&&Array.isArray(classGear?.[cls])&&classGear[cls].length)?classGear[cls]:classGear?.grower||[];
  const base=pool[Math.floor(Math.random()*Math.max(1,pool.length))];
  if(base&&typeof v024Item==='function'){
   const it=v024Item(base,'normal',q);
   it.classId=cls;it.price=0;it.source='weekly_chest';it.weeklyChest=true;
   try{window.v447ApplyItemCurve?.(it)}catch(_){}
   return it
  }
  if(typeof makeClassLoot==='function'){
   const it=makeClassLoot(cls,'normal');it.quality=q;it.rarity=qualityMeta(q).cls;it.source='weekly_chest';it.weeklyChest=true;it.price=0;
   try{window.v447ApplyItemCurve?.(it)}catch(_){}
   return it
  }
 }catch(e){console.warn('V6.239 weekly gear',e)}
 return null
}
function buildRewards(level){
 level=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)));
 const pl=Math.max(1,Math.floor(Number(s?.level)||1)),rows=[];
 const gold=Math.max(100,Math.round((180+pl*45)*(1+(level-1)*.16)));
 rows.push({id:'gold',type:'gold',amount:gold,label:`${fmt(gold)} Gold`,claimed:false});
 if(level>=2){
  const fragments=15+Math.max(0,level-2)*4;
  rows.push({id:'fragments',type:'fragments',amount:fragments,label:`${fragments} Samenfragmente`,claimed:false})
 }
 if(level>=3){
  const timeSeeds=level>=10?4:level>=8?3:level>=6?2:1;
  rows.push({id:'time',type:'time',amount:timeSeeds,label:`${timeSeeds} Zeit-Samen`,claimed:false});
  const mat=makeMaterial(level);
  rows.push({id:'material',type:'material',item:mat,label:mat.name,claimed:false})
 }
 if(level>=4){
  const sd=seedReward(level),def=(typeof SEEDS!=='undefined'&&SEEDS?.[sd.id])||(typeof seedTypes!=='undefined'&&seedTypes?.[sd.id])||{};
  rows.push({id:'seed',type:'seed',seed:sd.id,amount:sd.qty,label:`${sd.qty}× ${def.name||'Samen'}`,claimed:false})
 }
 const harz=(level>=5?1:0)+(level>=8?1:0)+(level>=10?1:0);
 if(harz)rows.push({id:'harz',type:'harz',amount:harz,label:`${harz} Harz-Taler`,claimed:false});
 if(level>=7){
  const gear=makeGear(level);if(gear)rows.push({id:'gear',type:'gear',item:gear,label:gear.name,claimed:false})
 }
 return rows
}
function freezeIfDue(){
 const z=state(),w=weekInfo();
 if(z.pending)return false;
 if(z.cycleKey===w.mondayKey)return false;
 const level=currentLevel(z.xp);
 z.maxLevelEver=Math.max(z.maxLevelEver,level);
 z.pending={
  id:`weekly_${z.cycleKey}_${Date.now()}`,
  cycleKey:z.cycleKey,
  frozenAt:Date.now(),
  xp:z.xp,
  level,
  rewards:buildRewards(level),
  openedAt:0
 };
 persistChest(false);
 try{v063Toast?.('🧰 Wochen-Truhe bereit!','success',`Level ${level} · Öffne deine Belohnungen.`)}catch(_){}
 return true
}
function startFreshCycle(){
 const z=state(),w=weekInfo();
 z.cycleKey=w.mondayKey;
 z.xp=0;
 z.towerMaxFloor=initialTowerFloor();
 z.daily={key:w.key,pvpWins:0,plants:0};
 z.seenTokens=[];
 z.pending=null;
 persistChest(false);
}
function seen(token){
 token=String(token||'');if(!token)return false;
 const z=state();if(z.seenTokens.includes(token))return true;
 z.seenTokens.push(token);z.seenTokens=z.seenTokens.slice(-140);
 return false
}
function addXp(raw,source='Aktivität',token=''){
 if(window.__V7135_ACTIVITY_FEEDBACK_SERVER__&&window.v7081UseAuthority?.('weekly'))return 0;
 freezeIfDue();
 const z=state();
 if(z.pending)return 0;
 if(token&&seen(token))return 0;
 const oldLevel=currentLevel(z.xp),amount=Math.max(0,Math.floor(Number(raw)||0));
 if(!amount||z.xp>=MAX_XP)return 0;
 const gain=Math.min(amount,MAX_XP-z.xp);
 z.xp+=gain;z.lifetimeXp+=gain;
 const level=currentLevel(z.xp);z.maxLevelEver=Math.max(z.maxLevelEver,level);
 persistChest(false);
 if(level>oldLevel){
  try{window.v6111Sfx?.('reward')}catch(_){}
  try{v063Toast?.(`🧰 Wochen-Truhe Level ${level}!`,'success',`${source} · +${gain} Truhen-EXP`)}catch(_){}
 }else{
  try{v063Toast?.(`🧰 +${gain} Truhen-EXP`,'success',source)}catch(_){}
 }
 refreshHome();
 if(document.getElementById('v6239WeeklyChestOverlay')?.classList.contains('show'))renderOverlay();
 return gain
}
function activity(type,detail={},token=''){
 type=String(type||'');
 const z=state(),w=weekInfo();
 if(z.daily.key!==w.key)z.daily={key:w.key,pvpWins:0,plants:0};
 if(type==='quest'){
  const q=detail?.quest||detail||{},elite=!!detail?.elite||!!q.v310Elite||/elite/i.test(String(q.v309Role||q.v310BaseRole||q.v392Kind||''));
  if(elite)return addXp(XP.questElite,'Elite-Quest',token||`quest:${q.id||q.ends||Date.now()}`);
  const kind=String(q.v392Kind||q.v309Role||q.v310BaseRole||'normal').toLowerCase();
  return addXp(kind==='fast'||kind==='quick'?XP.questQuick:kind==='hard'||kind==='heavy'?XP.questHeavy:XP.questNormal,kind==='hard'||kind==='heavy'?'Schwere Quest':kind==='fast'||kind==='quick'?'Schnelle Quest':'Quest',token||`quest:${q.id||q.ends||Date.now()}`)
 }
 if(type==='dungeon'){
  const boss=!!detail?.boss;return addXp(boss?XP.dungeonBoss:XP.dungeon,boss?'Dungeonboss':'Dungeon',token||`dungeon:${detail?.winsAfter||Date.now()}`)
 }
 if(type==='pvp'){
  if(z.daily.pvpWins>=5)return 0;
  z.daily.pvpWins++;
  return addXp(XP.pvp,`PvP-Sieg ${z.daily.pvpWins}/5 heute`,token||`pvp:${detail?.fightsAfter||detail?.winsAfter||Date.now()}`)
 }
 if(type==='grow'){
  const plants=Array.isArray(detail?.plants)?detail.plants:[];
  const remaining=Math.max(0,8-z.daily.plants),count=Math.min(remaining,plants.length);
  if(count<=0)return 0;
  z.daily.plants+=count;
  const sig=plants.slice(0,count).map(p=>p?.uid||p?.start||p?.seed||'p').join(',');
  return addXp(count*XP.growPlant,`${count} Pflanze${count===1?'':'n'} geerntet · ${z.daily.plants}/8 heute`,token||`grow:${sig}`)
 }
 if(type==='growOrder')return addXp(XP.growOrder,'Grow-Auftrag abgegeben',token||`growOrder:${detail?.id||Date.now()}`);
 if(type==='worldboss')return addXp(XP.worldboss,'Smaragd-Koloss besiegt',token||`worldboss:${detail?.wins||Date.now()}`);
 if(type==='guildboss')return addXp(XP.guildboss,'Gildenboss besiegt',token||`guildboss:${Date.now()}`);
 return 0
}
function towerFloor(floor,type='normal',run=null){
 freezeIfDue();const z=state();if(z.pending)return 0;
 floor=Math.max(0,Math.floor(Number(floor)||0));if(!floor||floor<=z.towerMaxFloor)return 0;
 const diff=floor-z.towerMaxFloor;z.towerMaxFloor=floor;
 let gain=diff*XP.towerFloor,label=`Anbauturm · Etage ${floor}`;
 if(type==='elite'){gain+=XP.towerEliteBonus;label+=' · Elite'}
 if(type==='boss'){gain+=XP.towerBossBonus;label+=' · Boss'}
 return addXp(gain,label,`tower:${z.cycleKey}:${floor}:${type}`)
}
function previewRows(level){
 const rows=[
  [1,'🪙 Goldbeutel','Grundbelohnung · Gold skaliert mit Spieler- und Truhenlevel','0 EXP'],
  [2,'💠 Samenfragmente','15 Fragmente · Gold steigt weiter','100 EXP'],
  [3,'🌱 1 Zeit-Samen','1 Zeit-Samen + Material mindestens Grün · 19 Fragmente','220 EXP'],
  [4,'🌰 Samen freigeschaltet','1 Zeit-Samen + 1 Grow-Samen + Material Grün+ · 23 Fragmente','360 EXP'],
  [5,'🟢 1 Harz-Taler','1 Zeit-Samen + insgesamt 1 Harz-Taler · 27 Fragmente','520 EXP'],
  [6,'🌱 2 Zeit-Samen','2 Zeit-Samen + Material mindestens Blau + stärkerer Samenpool · 31 Fragmente','700 EXP'],
  [7,'🎁 Ausrüstung Blau+','2 Zeit-Samen + 1 Klassen-Ausrüstung mindestens Blau · 35 Fragmente','900 EXP'],
  [8,'🌱 3 Zeit-Samen','3 Zeit-Samen + insgesamt 2 Harz-Taler + stärkster Samenpool · 39 Fragmente','1.120 EXP'],
  [9,'🟣 Epische Stufe','3 Zeit-Samen + episches Material + epische Ausrüstung + 2 Grow-Samen · 43 Fragmente','1.380 EXP'],
  [10,'👑 MAX-Truhe','4 Zeit-Samen + 3 Harz-Taler + 20 % Legendär-Chance + 2 Grow-Samen · 47 Fragmente','1.700 EXP']
 ];
 return `<div class="v6243-level-guide">${rows.map(r=>`<div class="v6243-level-row ${Number(level)===r[0]?'current':''}"><span class="lv">LV. ${r[0]}</span><div><b>${r[1]}</b><small>${esc(r[2])}</small></div><em>${r[3]}</em></div>`).join('')}</div>`
}
function rewardArt(r){
 if(r.type==='gold')return'🪙';
 if(r.type==='fragments')return'💠';
 if(r.type==='harz')return'🟢';
 if(r.type==='time')return'🌱';
 if(r.type==='seed'){const d=(typeof SEEDS!=='undefined'&&SEEDS?.[r.seed])||(typeof seedTypes!=='undefined'&&seedTypes?.[r.seed]);return d?.icon||'🌰'}
 if(r.type==='material'&&r.item){
  try{const u=window.v6144MaterialArt?.(r.item);if(u)return `<img src="${u}" alt="${esc(r.item.name||'Material')}">`}catch(_){}
  return r.item.icon||'💎'
 }
 if(r.type==='gear'&&r.item){
  try{const h=window.v6107ItemImgHtml?.(r.item,'v6239-reward-item');if(h)return h}catch(_){}
  try{const u=window.v466ItemArtUri?.(r.item);if(u)return `<img src="${u}" alt="${esc(r.item.name||'Ausrüstung')}">`}catch(_){}
  return r.item.icon||'🎁'
 }
 return'🎁'
}
function rewardSub(r){
 if(r.type==='gold')return'Währung';
 if(r.type==='fragments')return'Harzschmiede';
 if(r.type==='harz')return'Premium-Währung';
 if(r.type==='time')return'Questzeit überspringen';
 if(r.type==='seed')return'Growroom';
 if(r.type==='material')return `${qualityMeta?.(r.item?.quality||'green')?.label||'Material'} · ${r.item?.type==='scroll'?'Schriftrolle':'Edelstein'}`;
 if(r.type==='gear')return `${qualityMeta?.(r.item?.quality||'blue')?.label||'Ausrüstung'} · Lv.${Number(r.item?.dropLevel)||Number(s?.level)||1}`;
 return''
}
function grantReward(r){
 if(!r||r.claimed)return false;
 if(r.type==='gold')s.gold=(Number(s.gold)||0)+(Number(r.amount)||0);
 else if(r.type==='fragments'){s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};s.v488Forge.fragments=Math.max(0,Number(s.v488Forge.fragments)||0)+(Number(r.amount)||0)}
 else if(r.type==='harz')s.harzTaler=(Number(s.harzTaler)||0)+(Number(r.amount)||0);
 else if(r.type==='time')s.timeSeeds=Math.max(0,Number(s.timeSeeds)||0)+(Number(r.amount)||0);
 else if(r.type==='seed'){s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};s.grow.seeds[r.seed]=Math.max(0,Number(s.grow.seeds[r.seed])||0)+(Number(r.amount)||1);try{if(s.grow.v492?.discovered)s.grow.v492.discovered[r.seed]=true}catch(_){}}
 else if(r.type==='material'){s.materials=Array.isArray(s.materials)?s.materials:[];s.materials.push(clone(r.item))}
 else if(r.type==='gear'){s.inventory=Array.isArray(s.inventory)?s.inventory:[];s.inventory.push(clone(r.item))}
 else return false;
 r.claimed=true;r.claimedAt=Date.now();
 return true
}
function finishIfEmpty(){
 const z=state(),p=z.pending;if(!p)return false;
 if(p.rewards.some(r=>!r.claimed))return false;
 z.totalOpened++;
 z.lastOpened={at:Date.now(),cycleKey:p.cycleKey,level:p.level,xp:p.xp};
 startFreshCycle();
 try{v063Toast?.('🧰 Neue Truhen-Woche gestartet','success','Die Truhe ist wieder verschlossen und sammelt bis nächsten Montag EXP.')}catch(_){}
 return true
}
function claimReward(id){
 const z=state(),p=z.pending;if(!p||!p.openedAt)return;
 const r=p.rewards.find(x=>x.id===id);if(!r||r.claimed)return;
 if(grantReward(r)){
  persistChest(false);
  try{v069SyncCurrencies?.()}catch(_){}
  try{v441PaintResources?.()}catch(_){}
  finishIfEmpty();
  renderOverlay();refreshHome()
 }
}
function claimAll(){
 const z=state(),p=z.pending;if(!p||!p.openedAt)return;
 let n=0;for(const r of p.rewards)if(grantReward(r))n++;
 if(!n)return;
 persistChest(false);
 try{v069SyncCurrencies?.()}catch(_){}
 try{v441PaintResources?.()}catch(_){}
 finishIfEmpty();
 renderOverlay();refreshHome()
}
function ensureOverlay(){
 let ov=document.getElementById('v6239WeeklyChestOverlay');if(ov)return ov;
 ov=document.createElement('div');ov.id='v6239WeeklyChestOverlay';
 ov.innerHTML='<div class="v6239-wc-modal"><div class="v6239-wc-head"><div><small>GOOD WEED · BETTER LEGENDS</small><h2>🧰 Wochen-Truhe</h2></div><button class="v6239-wc-close" type="button" data-v6239-close>✕</button></div><div class="v6239-wc-body" id="v6239WeeklyChestBody"></div></div>';
 document.body.appendChild(ov);
 ov.addEventListener('click',e=>{
  if(e.target===ov||e.target.closest('[data-v6239-close]')){ov.classList.remove('show');return}
  const open=e.target.closest('[data-v6239-open]');if(open){const p=state().pending;if(p&&!p.openedAt){p.openedAt=Date.now();persistChest(false);try{window.v6111Sfx?.('reward')}catch(_){}renderOverlay();refreshHome()}return}
  const one=e.target.closest('[data-v6239-claim]');if(one){claimReward(one.dataset.v6239Claim);return}
  if(e.target.closest('[data-v6239-claim-all]')){claimAll();return}
 });
 return ov
}
function activityHtml(){
 return `<div class="v6239-wc-activity"><h4>So levelt die Truhe</h4><div class="v6239-wc-activity-grid">
  <div>⚡ Schnell-Quest <b>+6</b> · Quest <b>+8</b> · Schwer <b>+10</b></div>
  <div>🔴 Elite-Quest <b>+20</b> · Dungeon <b>+5</b> · Boss <b>+12</b></div>
  <div>🏆 PvP-Sieg <b>+8</b> · max. 5 Siege/Tag</div>
  <div>🌿 Ernte <b>+2/Pflanze</b> · max. 8 Pflanzen/Tag</div>
  <div>📋 Grow-Auftrag <b>+6</b> · Weltboss <b>+15</b> · Gildenboss <b>+15</b></div>
  <div>🗼 Turm <b>+1/neue Etage</b> · Elite +2 · Boss +5</div>
 </div></div>`
}
function renderOverlay(){
 freezeIfDue();const z=state(),ov=ensureOverlay(),body=ov.querySelector('#v6239WeeklyChestBody');if(!body)return;
 const w=weekInfo(),p=z.pending,lp=levelProgress(z.xp),level=p?.level||lp.level,tier=tierFor(level);
 const ready=!!p,opened=!!p?.openedAt;
 const nextText=ready?'Wochenabschluss bereit':`Nächste Öffnung: Montag, ${keyLabel(w.nextMondayKey)}`;
 const xpText=ready?`${fmt(p.xp)} Wochen-EXP eingefroren`:level>=MAX_LEVEL?'MAX erreicht':`${fmt(z.xp)} / ${fmt(lp.to)} EXP`;
 body.innerHTML=`
  <div class="v6239-wc-hero">
   <div class="v6239-wc-bigchest ${ready?'ready':''}" style="--wc-metal:${tier>=5?'#e0b94f':tier>=4?'#74a93c':tier>=3?'#b17b36':'#80745d'}">${chestArt()}</div>
   <div class="v6239-wc-title">
    <small>${ready?'MONTAGS-TRUHE ÖFFNUNGSBEREIT':'AKTUELLE TRUHEN-WOCHE'}</small>
    <h3>Truhen-Level ${level}${level>=MAX_LEVEL?' · MAX':''}</h3>
    <p>${ready?'Dein Wochenstand ist eingefroren. Neue Truhen-EXP gibt es erst, wenn diese Truhe vollständig geleert wurde.':'Spiele ganz normal weiter. Jede wichtige Aktivität füllt diese Truhe bis zum nächsten Montag.'}</p>
    <div class="v6239-wc-stats">
      <div class="v6239-wc-stat"><small>LEVEL</small><b>${level} / 10</b></div>
      <div class="v6239-wc-stat"><small>WOCHEN-EXP</small><b>${fmt(p?.xp??z.xp)}</b></div>
      <div class="v6239-wc-stat"><small>STATUS</small><b>${ready?'ÖFFNEN':'SAMMELT'}</b></div>
    </div>
   </div>
  </div>
  <div class="v6239-wc-progress-top"><span>${xpText}</span><b>${ready?'100 % eingefroren':level>=MAX_LEVEL?'MAX':`${Math.round(lp.pct)} % bis Level ${Math.min(10,level+1)}`}</b></div>
  <div class="v6239-wc-progress"><i style="width:${ready?100:lp.pct}%"></i></div>
  <div class="v6239-wc-note"><b>Montag-Regel:</b> ${ready?'Die alte Truhe wartet auf dich. Solange sie nicht geöffnet und geleert ist, startet keine neue Woche.':`${nextText}. Am Montag wird der erreichte Stand eingefroren – nichts wird automatisch gelöscht.`}</div>
  ${ready&&!opened?`<button class="v6239-wc-open ready" data-v6239-open>🔓 TRUHE ÖFFNEN · LEVEL ${level}</button>`:''}
  ${ready&&opened?`
    <div class="v6239-wc-section-title"><span>📦 Truhen-Inventar</span><small>${p.rewards.filter(r=>!r.claimed).length} Belohnungen übrig</small></div>
    <div class="v6239-wc-grid">${p.rewards.map(r=>`<div class="v6239-wc-slot ${esc(r.type)} ${r.claimed?'claimed':''}">
      <div class="v6239-wc-art">${rewardArt(r)}</div>
      <b>${esc(r.label||'Belohnung')}</b>
      <small>${esc(rewardSub(r))}</small>
      <button data-v6239-claim="${esc(r.id)}" ${r.claimed?'disabled':''}>${r.claimed?'✓ Abgeholt':'Nehmen'}</button>
    </div>`).join('')}</div>
    <button class="v6239-wc-all" data-v6239-claim-all ${p.rewards.every(r=>r.claimed)?'disabled':''}>🎁 ALLES ABHOLEN</button>
  `:!ready?`
    <div class="v6239-wc-section-title"><span>🎁 Belohnungen · Level 1–10</span><small>deine aktuelle Stufe ist markiert</small></div>
    <div class="v6239-wc-preview">${previewRows(level)}</div>
  `:''}
  ${activityHtml()}
 `;
}
function openOverlay(){
 freezeIfDue();const ov=ensureOverlay();renderOverlay();ov.classList.add('show')
}
function homeHtml(){
 freezeIfDue();const z=state(),p=z.pending,lp=levelProgress(z.xp),level=p?.level||lp.level,tier=tierFor(level);
 const status=p?'🔓 MONTAG · ÖFFNEN':level>=MAX_LEVEL?'MAX · wartet auf Montag':`+${fmt(lp.next)} EXP bis Lv.${level+1}`;
 const displayXp=Math.max(0,Math.round(Number(p?.xp??z.xp)||0));
 const expTarget=p?MAX_XP:(level>=MAX_LEVEL?MAX_XP:lp.to);
 return `<button type="button" class="v6239-weekly-chest tier-${tier} ${p?'ready':''}" data-weekly-chest aria-label="Wochen-Truhe · Level ${level}${p?' · Öffnen':''}">
  ${chestArt()}
  <span class="v6239-home-level">LV. ${level}${level>=MAX_LEVEL?' MAX':''}${p?' · 🔓':''}</span>
  <span class="v6241-home-exp">EXP ${fmt(displayXp)} / ${fmt(expTarget)}</span>
  <span class="v6239-home-bar"><i style="width:${p?100:lp.pct}%"></i></span>
 </button>`
}
function signature(){
 freezeIfDue();const z=state(),p=z.pending;
 return [z.cycleKey,z.xp,currentLevel(z.xp),p?.id||'',p?.openedAt||0,p?.rewards?.filter(r=>!r.claimed).length||0,z.towerMaxFloor,z.daily?.key,z.daily?.pvpWins,z.daily?.plants].join(':')
}
function refreshHome(){
 try{
  const world=document.getElementById('world');
  if(world?.classList.contains('active')&&typeof v085InstallWorld==='function')requestAnimationFrame(()=>v085InstallWorld(false))
 }catch(_){}
}
function installEvents(){
 const bus=window.GL_EVENTS;if(!bus||typeof bus.on!=='function'||window.__V6239_WEEKLY_CHEST_EVENTS__)return false;
 window.__V6239_WEEKLY_CHEST_EVENTS__=true;
 bus.on('questCompleted',ev=>activity('quest',ev,`chest:${ev.token||ev.quest?.id||ev.quest?.ends||Date.now()}`));
 bus.on('dungeonWon',ev=>activity('dungeon',ev,`chest:${ev.token||ev.winsAfter||Date.now()}`));
 bus.on('pvpWon',ev=>activity('pvp',ev,`chest:${ev.token||ev.fightsAfter||ev.winsAfter||Date.now()}`));
 bus.on('growHarvested',ev=>activity('grow',ev,`chest:${ev.token||'grow'}:${(ev.plants||[]).map(p=>p?.uid||p?.start||'').join(',')}`));
 bus.on('guildBossWon',ev=>activity('guildboss',ev,`chest:${ev.token||ev.result?.round_id||ev.result?.boss_id||Date.now()}`));
 return true
}

window.v6239WeeklyChestHomeHtml=homeHtml;
window.v6239WeeklyChestSignature=signature;
window.v6239OpenWeeklyChest=openOverlay;
window.v6239WeeklyChestActivity=activity;
window.v6239WeeklyChestTowerFloor=towerFloor;
window.v6239WeeklyChestDiagnostics=()=>{freezeIfDue();const z=state(),w=weekInfo();return{
 cycleKey:z.cycleKey,currentMonday:w.mondayKey,nextMonday:w.nextMondayKey,xp:z.xp,level:currentLevel(z.xp),
 pending:clone(z.pending),daily:clone(z.daily),towerMaxFloor:z.towerMaxFloor,totalOpened:z.totalOpened,
 thresholds:THRESHOLDS.slice(),weights:{...XP}
}};

freezeIfDue();
installEvents();
document.addEventListener('DOMContentLoaded',()=>{freezeIfDue();installEvents();refreshHome()},{once:true});
window.addEventListener('pageshow',()=>{freezeIfDue();installEvents();refreshHome()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{
 try{document.getElementById('v6239WeeklyChestOverlay')?.classList.remove('show')}catch(_){}
 setTimeout(()=>{freezeIfDue();installEvents();refreshHome()},90)
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){freezeIfDue();refreshHome()}});
setTimeout(()=>{freezeIfDue();installEvents();refreshHome()},120);
})();
