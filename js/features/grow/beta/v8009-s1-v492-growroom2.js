(function(){
 'use strict';
 const VERSION='V4.99 Stable',SHORT='V4.99';
 const GRADES=['C','B','A','S','S+'];
 const QMULT={C:.82,B:.92,A:1,S:1.14,'S+':1.30};
 const CARE=[
  {at:.20,icon:'💧',name:'Gießen',text:'Feuchtigkeit kontrollieren und die Pflanze sauber versorgen.'},
  {at:.45,icon:'💡',name:'Licht einstellen',text:'Lampe auf die aktuelle Wachstumsphase abstimmen.'},
  {at:.70,icon:'✂️',name:'Beschneiden',text:'Triebe pflegen und die Blüte gezielt unterstützen.'},
  {at:.88,icon:'🧪',name:'Nährstoffe',text:'Letzter Feinschliff vor der Ernte.'}
 ];
 const RANK={common:0,uncommon:1,rare:2,epic:3,legendary:4};
 const RARITY_LABEL={common:'Gewöhnlich',uncommon:'Ungewöhnlich',rare:'Selten',epic:'Episch',legendary:'Legendär'};
 const MUT={
  purple:{name:'Purple',icon:'💜',stats:{critChance:.02,critDamage:.08}},
  frost:{name:'Frostig',icon:'❄️',stats:{armorPen:.03,damagePct:.02}},
  black:{name:'Black',icon:'🌑',stats:{lifeSteal:.02,dotChance:.02}},
  golden:{name:'Golden',icon:'⭐',stats:{primaryPct:.03},gold:.20},
  emerald:{name:'Smaragd',icon:'💚',stats:{hpPct:.03,damageReduce:.015}},
  prismatic:{name:'Prismatisch',icon:'🌈',stats:{primaryPct:.04,hpPct:.02,critChance:.02},fragments:4}
 };
 const SEEDS={
  moss:{name:'White Widow',icon:'🌰',rarity:'common',growMs:20*60*1000,buy:180,sell:180,source:'Samen-Händler',affinity:'all',buffMins:55,stats:{primaryPct:.03,hpPct:.02}},
  lime:{name:'Northern Lights',icon:'🌰',rarity:'uncommon',growMs:45*60*1000,buy:520,sell:360,source:'Samen-Händler',affinity:'grower',buffMins:60,stats:{hpPct:.05,damageReduce:.02}},
  jack:{name:'Jack Herer',icon:'🌰',rarity:'uncommon',growMs:60*60*1000,buy:850,sell:620,source:'Samen-Händler',affinity:'all',buffMins:65,stats:{primaryPct:.04,armorPen:.02}},
  violet:{name:'Purple Haze',icon:'🟣',rarity:'rare',growMs:90*60*1000,buy:0,sell:900,source:'Quests',affinity:'scout',buffMins:70,stats:{critChance:.04,critDamage:.12}},
  blue:{name:'Blue Dream',icon:'🔵',rarity:'rare',growMs:2*60*60*1000,buy:0,sell:1180,source:'Quests',affinity:'bruiser',buffMins:75,stats:{damagePct:.04,dotChance:.03}},
  critical:{name:'Critical+',icon:'🟣',rarity:'rare',growMs:2.5*60*60*1000,buy:0,sell:1450,source:'Elite-Quests',affinity:'scout',buffMins:75,stats:{critChance:.05,critDamage:.15}},
  nebula:{name:'OG Kush',icon:'✨',rarity:'epic',growMs:3*60*60*1000,buy:0,sell:1900,source:'Dungeonboss',affinity:'grower',buffMins:80,stats:{wuchtChance:.05,lifeSteal:.02}},
  lemon:{name:'Lemon Haze',icon:'🍋',rarity:'epic',growMs:4*60*60*1000,buy:0,sell:2250,source:'Elite-Quest / Dungeon',affinity:'bruiser',buffMins:85,stats:{critChance:.04,damagePct:.04}},
  gorilla:{name:'Gorilla Glue',icon:'🦍',rarity:'epic',growMs:5*60*60*1000,buy:0,sell:3000,source:'Dungeonboss',affinity:'grower',buffMins:90,stats:{wuchtChance:.07,wuchtDamage:.12}},
  greencrack:{name:'Green Crack',icon:'⚡',rarity:'epic',growMs:5*60*60*1000,buy:0,sell:3200,source:'PvP / Gilde',affinity:'scout',buffMins:90,stats:{doubleChance:.06,dodgeChance:.03}},
  amnesia:{name:'Amnesia Haze',icon:'🌫️',rarity:'epic',growMs:6*60*60*1000,buy:0,sell:3800,source:'Elite-Quest / Dungeon',affinity:'bruiser',buffMins:95,stats:{damagePct:.07,critChainChance:.03,dotChance:.03}},
  emerald:{name:'Smaragd OG',icon:'💚',rarity:'legendary',growMs:8*60*60*1000,buy:0,sell:5200,source:'Gildenboss / seltene Events',affinity:'all',buffMins:110,stats:{primaryPct:.05,hpPct:.04,critChance:.03,armorPen:.03}},
  hy_widow_amnesia:{name:'Widownesia',icon:'🧬',rarity:'epic',growMs:4.5*60*60*1000,buy:0,sell:2800,source:'Genetik-Labor',affinity:'all',buffMins:90,stats:{primaryPct:.04,dotChance:.03}},
  hy_northern_purple:{name:'Northern Purple',icon:'🧬',rarity:'epic',growMs:4.5*60*60*1000,buy:0,sell:3000,source:'Genetik-Labor',affinity:'all',buffMins:90,stats:{hpPct:.04,critChance:.03}},
  hy_lemon_dream:{name:'Lemon Dream',icon:'🧬',rarity:'epic',growMs:5*60*60*1000,buy:0,sell:3400,source:'Genetik-Labor',affinity:'all',buffMins:95,stats:{critChance:.04,damagePct:.05}},
  hy_purple_gorilla:{name:'Purple Gorilla',icon:'🧬',rarity:'epic',growMs:5.5*60*60*1000,buy:0,sell:3900,source:'Genetik-Labor',affinity:'all',buffMins:100,stats:{wuchtChance:.05,critDamage:.10}},
  hy_critical_crack:{name:'Critical Crack',icon:'🧬',rarity:'epic',growMs:6*60*60*1000,buy:0,sell:4400,source:'Genetik-Labor',affinity:'all',buffMins:105,stats:{doubleChance:.05,armorPen:.03}},
  hy_emerald_kush:{name:'Emerald Kush',icon:'🧬',rarity:'legendary',growMs:8*60*60*1000,buy:0,sell:6500,source:'Genetik-Labor',affinity:'all',buffMins:120,stats:{primaryPct:.05,hpPct:.05,damageReduce:.02}}
 };
 function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function fmt(v){return Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE')}
 function toast(title,type='success',detail=''){try{if(typeof v063Toast==='function')return v063Toast(title,type,detail)}catch(e){} try{if(typeof growMessage==='function')growMessage((title+' '+detail).trim())}catch(e){}}
 function save(draw=false){try{persist(draw)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}} try{if(typeof v075WriteCloudSave==='function')setTimeout(()=>v075WriteCloudSave(false),0)}catch(e){}}
 function forge(){s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};s.v488Forge.fragments=Math.max(0,Math.floor(Number(s.v488Forge.fragments)||0));return s.v488Forge}
 function weekKey(){const d=new Date(),x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return `${x.getUTCFullYear()}-${String(Math.ceil((((x-y)/86400000)+1)/7)).padStart(2,'0')}`}
 function ensure(){
  s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};s.grow.plants=Array.isArray(s.grow.plants)?s.grow.plants:[];s.grow.equipment=(s.grow.equipment&&typeof s.grow.equipment==='object')?s.grow.equipment:{lamp:0,pots:0};
  s.grow.roomLevel=Math.min(4,Math.max(1,Math.floor(Number(s.grow.roomLevel)||1)));s.grow.equipment.lamp=Math.min(5,Math.max(0,Math.floor(Number(s.grow.equipment.lamp)||0)));s.grow.equipment.pots=Math.min(5,Math.max(0,Math.floor(Number(s.grow.equipment.pots)||0)));
  s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};const z=s.grow.v492;
  z.masteryXp=Math.max(0,Number(z.masteryXp)||0);z.discovered=(z.discovered&&typeof z.discovered==='object')?z.discovered:{};z.mutations=(z.mutations&&typeof z.mutations==='object')?z.mutations:{};z.bag=Array.isArray(z.bag)?z.bag.filter(Boolean):[];z.active=(z.active&&typeof z.active==='object')?z.active:null;z.stats=(z.stats&&typeof z.stats==='object')?z.stats:{};['harvested','perfect','mutationCount','splus','prismatic','seedsFound','guildDonations'].forEach(k=>z.stats[k]=Math.max(0,Math.floor(Number(z.stats[k])||0)));z.selectedPlantUid=String(z.selectedPlantUid||'');z.selectedSeed=SEEDS[z.selectedSeed]?z.selectedSeed:(SEEDS[s.grow.selectedSeed]?s.grow.selectedSeed:'moss');
  z.week=(z.week&&typeof z.week==='object')?z.week:{};if(z.week.key!==weekKey())z.week={key:weekKey(),harvested:0,perfect:0,mutations:0,claimed:false};
  Object.entries(SEEDS).forEach(([id,d])=>{s.grow.seeds[id]=Math.max(0,Math.floor(Number(s.grow.seeds[id])||0));if(s.grow.seeds[id]>0)z.discovered[id]=true;try{Object.assign(seedTypes[id]||{},d);if(!seedTypes[id])seedTypes[id]={...d}}catch(e){}});
  s.grow.selectedSeed=z.selectedSeed;
  s.grow.plants=s.grow.plants.map((p,i)=>{if(!p)return null;const id=SEEDS[p.seed]?p.seed:(SEEDS[p.seedId]?p.seedId:'moss');const start=Number(p.start)||Date.now();const duration=Math.max(10000,Number(p.duration)||Math.round(SEEDS[id].growMs*(typeof lampSpeed==='function'?lampSpeed():1)));return {...p,uid:String(p.uid||`grow_${start}_${i}_${Math.random().toString(36).slice(2,6)}`),seed:id,start,duration,care:Array.isArray(p.care)?[0,1,2,3].map(n=>!!p.care[n]):[false,false,false,false],mutation:p.mutation&&MUT[p.mutation]?p.mutation:null,mutationChecked:!!p.mutationChecked};});
  if(z.active&&Number(z.active.expiresAt)<=Date.now())z.active=null;
  return z;
 }
 function masteryLevel(){const xp=ensure().masteryXp;return Math.min(300,Math.max(1,Math.floor(Math.sqrt(xp/18))+1))}
 function masteryYield(){const l=masteryLevel();return 1+(l>=10?.01:0)+(l>=100?.02:0)}
 function masteryMutation(){const l=masteryLevel();return l>=200?.012:l>=100?.006:0}
 function masteryDuration(){const l=masteryLevel();return 1+(l>=50?.03:0)+(l>=150?.05:0)}
 function qualityFrom(p){const n=(p?.care||[]).filter(Boolean).length;return GRADES[Math.min(4,n)]}
 function progress(p,now=Date.now()){const wm=Math.max(.80,Math.min(1.30,Number(window.GL_WEATHER?.bonus?.growMul)||1));return Math.max(0,Math.min(1,((now-Number(p.start||0))*wm)/Math.max(1,Number(p.duration)||1)))}
 function stage(p){const x=progress(p);return x>=1?['4. Erntebereit','Bereit!','✨🌿']:x>=.70?['3. Blüte',left(p),'🌺']:x>=.35?['2. Wachstum',left(p),'🌿']:['1. Keimling',left(p),'🌱']}
 function left(p){const wm=Math.max(.80,Math.min(1.30,Number(window.GL_WEATHER?.bonus?.growMul)||1)),readyAt=(Number(p.start)||0)+Math.round((Number(p.duration)||0)/wm),ms=Math.max(0,readyAt-Date.now()),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),sec=Math.floor(ms%60000/1000);return h?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${m}:${String(sec).padStart(2,'0')}`}
 function careState(p){const x=progress(p),done=p.care||[];let available=-1,missed=0;for(let i=0;i<CARE.length;i++){const end=i===CARE.length-1?1:CARE[i+1].at;if(done[i])continue;if(x>=end){missed++;continue}if(x>=CARE[i].at&&x<end){available=i;break}}return{available,missed}}
 function mutationVisible(p){return !!p.mutation&&progress(p)>=.70}
 function rollMutation(p){if(window.__V7064_GROW_SERVER_MODE__)return false;if(p.mutationChecked)return false;if(progress(p)<.70)return false;p.mutationChecked=true;const care=(p.care||[]).filter(Boolean).length,rar=RANK[SEEDS[p.seed]?.rarity]||0,ch=.018+care*.009+rar*.004+masteryMutation();if(Math.random()>=ch)return true;const r=Math.random()*100;let id=r<2?'prismatic':r<17?'emerald':r<35?'golden':r<55?'purple':r<75?'frost':r<90?'black':'emerald';if(id==='emerald'&&masteryLevel()<200&&Math.random()<.6)id='purple';p.mutation=id;const z=ensure();z.mutations[`${p.seed}:${id}`]=true;z.stats.mutationCount++;if(id==='prismatic')z.stats.prismatic++;z.week.mutations++;toast(`${MUT[id].icon} Mutation entdeckt!`,'success',`${SEEDS[p.seed].name} · ${MUT[id].name}`);return true}
 function estimatedGold(p){const d=SEEDS[p.seed]||SEEDS.moss,q=qualityFrom(p),lvl=Math.max(1,Math.min(300,Number(s.level)||1)),qMul=QMULT[q]||1,pot=(typeof potYield==='function'?potYield():1),base=d.buy>0?Number(d.buy||0):0;let value;if(typeof window.v6168GrowHarvestGold==='function'){value=base+window.v6168GrowHarvestGold(lvl,Number(d.growMs)||60000,String(d.rarity||'common'),qMul,pot,masteryYield())}else{const lvlMul=.75+lvl*.0032;value=base+Number(d.sell||0)*.12*qMul*lvlMul*pot*masteryYield()}if(p.mutation==='golden')value*=1.20;value*=Math.max(.8,Math.min(1.3,Number(window.GL_WEATHER?.bonus?.yieldMul)||1));return Math.max(0,Math.round(value))}
 function xpFor(p){const d=SEEDS[p.seed]||SEEDS.moss,q=qualityFrom(p),lvl=Math.max(1,Math.min(300,Number(s.level)||1)),mins=Math.max(1,Number(d.growMs||60000)/60000),qMul=({C:.75,B:.85,A:1,S:1.10,'S+':1.20})[q]||1,rMul=({common:1,uncommon:1.05,rare:1.10,epic:1.15,legendary:1.25})[d.rarity]||1;return Math.max(1,Math.round(mins*(.8+lvl*.004)*qMul*rMul))}
 function fragFor(p){const q=qualityFrom(p),rar=SEEDS[p.seed]?.rarity||'common',grade={C:0,B:0,A:1,S:2,'S+':4}[q]||0,rarity={common:0,uncommon:0,rare:1,epic:2,legendary:3}[rar]||0,mutation=p.mutation?1:0,prism=p.mutation==='prismatic'?3:0;return Math.max(0,grade+rarity+mutation+prism)}
 window.v492GrowFragmentYield=fragFor;
 function className(id){return id==='grower'?'Bud-Barbar':id==='scout'?'Blatt-Schütze':id==='bruiser'?'Bong-Magier':id==='frost'?'Bekiffter Frost-Todesritter':id==='summoner'?'Harzruferin':'Alle Klassen'}
 function affinityStars(d){return d.affinity==='all'?'⭐⭐⭐⭐':d.affinity===s.playerClass?'⭐⭐⭐⭐⭐':'⭐⭐⭐'}
 function statsText(st){const map={primaryPct:'Hauptattribut',hpPct:'Leben',damagePct:'Schaden',critChance:'Crit-Chance',critDamage:'Crit-Schaden',damageReduce:'Schadensreduktion',wuchtChance:'Wucht-Chance',wuchtDamage:'Wucht-Schaden',doubleChance:'Doppeltreffer',dodgeChance:'Ausweichen',lifeSteal:'Lebensraub',armorPen:'Durchdringung',dotChance:'Rauch/DOT-Chance',critChainChance:'Crit-Kette'};return Object.entries(st||{}).filter(([,v])=>Number(v)).map(([k,v])=>`+${Math.round(Number(v)*1000)/10}% ${map[k]||k}`).join(' · ')}
 function bloomStats(b){const d=SEEDS[b.seed]||SEEDS.moss,m=QMULT[b.quality]||1,aff=(d.affinity==='all'||d.affinity===s.playerClass)?1.1:1,st={};Object.entries(d.stats||{}).forEach(([k,v])=>st[k]=(st[k]||0)+Number(v)*m*aff);if(b.mutation&&MUT[b.mutation])Object.entries(MUT[b.mutation].stats||{}).forEach(([k,v])=>st[k]=(st[k]||0)+Number(v)*m);return st}
 window.v7097BloomBuffText=b=>statsText(bloomStats(b));
 const V494_GROW_CAPS={primaryPct:.08,hpPct:.08,damagePct:.08,critChance:.06,critDamage:.18,damageReduce:.04,wuchtChance:.08,wuchtDamage:.15,doubleChance:.07,dodgeChance:.05,lifeSteal:.03,armorPen:.05,dotChance:.05,critChainChance:.04};
 const V494_TOTAL_CAPS={primaryPct:.40,hpPct:.62,damagePct:.62,critChance:.45,critDamage:.95,damageReduce:.38,wuchtChance:.30,doubleChance:.30,dodgeChance:.40,lifeSteal:.12,armorPen:.35};
 function v494Visible(el){if(!el)return false;try{return getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'}catch(e){return el.style?.display!=='none'}}
 function v494GrowModeFactor(){
  try{
   const forced=Number(window.__v494ModeFactorOverride);
   if(Number.isFinite(forced))return Math.max(0,Math.min(1,forced));
   if(document.querySelector('#pvp.active'))return 0;
   if(document.querySelector('#guild.active')){
    if(v494Visible(document.querySelector('#v254GuildWar')))return 0;
    if(v494Visible(document.querySelector('#v254GuildBoss')))return .50;
   }
   if(document.querySelector('#endgame.active'))return .50;
   if(document.querySelector('#v110Overlay.show'))return .35;
   if(document.querySelector('#dungeon.active'))return .60;
  }catch(e){}
  return 1;
 }
 window.v494GrowModeFactor=v494GrowModeFactor;
 function currentBuffStats(){
  const z=ensure(),a=z.active;if(!a||Number(a.expiresAt)<=Date.now())return null;
  const raw=bloomStats(a),factor=v494GrowModeFactor(),out={};
  Object.entries(raw||{}).forEach(([k,v])=>{
   const n=Math.max(0,Number(v)||0),cap=Number(V494_GROW_CAPS[k]);
   out[k]=(Number.isFinite(cap)?Math.min(cap,n):n)*factor;
  });
  return out;
 }
 function buffLeft(){const a=ensure().active;if(!a)return'Kein Buff aktiv';const ms=Math.max(0,a.expiresAt-Date.now()),m=Math.floor(ms/60000),sec=Math.floor(ms%60000/1000);return `${m}:${String(sec).padStart(2,'0')}`}
 function addSeed(id,n=1,reason='Fund'){if(window.__V7064_GROW_SERVER_MODE__)return 0;ensure();if(!SEEDS[id])return;s.grow.seeds[id]=(Number(s.grow.seeds[id])||0)+n;const z=ensure();z.discovered[id]=true;z.stats.seedsFound+=n;save(false);toast(`🌰 ${SEEDS[id].name}`,'success',`${reason}: +${n} Samen`);try{renderGrow()}catch(e){}}
 function randomSeed(pool){const a=pool.filter(id=>SEEDS[id]);return a[Math.floor(Math.random()*a.length)]||'moss'}
 function v4109ApplySeedPurchase(state,id){
  const d=SEEDS[id];
  if(!state||!d||!Number(d.buy))return {ok:false,reason:'not-buyable'};
  state.grow=(state.grow&&typeof state.grow==='object')?state.grow:{};
  state.grow.seeds=(state.grow.seeds&&typeof state.grow.seeds==='object')?state.grow.seeds:{};
  const gold=Math.max(0,Number(state.gold)||0),price=Math.max(0,Number(d.buy)||0);
  if(gold<price)return {ok:false,reason:'gold',gold,price};
  state.gold=gold-price;
  state.grow.seeds[id]=Math.max(0,Math.floor(Number(state.grow.seeds[id])||0))+1;
  state.grow.v492=(state.grow.v492&&typeof state.grow.v492==='object')?state.grow.v492:{};
  state.grow.v492.discovered=(state.grow.v492.discovered&&typeof state.grow.v492.discovered==='object')?state.grow.v492.discovered:{};
  state.grow.v492.discovered[id]=true;
  return {ok:true,id,price,stock:state.grow.seeds[id],gold:state.gold};
 }
 function v4109RefreshSeedPurchaseUi(){
  /* V4.160: Samen-Kauf muss Gold und Vorrat sofort live anzeigen. */
  try{renderGrow()}catch(e){}
  try{if(typeof v495RenderSeedInventory==='function')v495RenderSeedInventory()}catch(e){}

  /* v069SyncCurrencies synchronisiert historisch nur Harz-Taler. Gold daher
     bewusst direkt aus dem aktuellen State in alle bekannten HUDs schreiben. */
  try{
   const gold=Math.max(0,Math.floor(Number(s.gold)||0));
   const top=document.querySelector('#gold');
   if(top){
    /* Event-Badge darf erhalten bleiben: nur den ersten Textknoten ersetzen,
       falls das Element bereits zusätzliche Badge-Kinder enthält. */
    const textNode=[...top.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
    if(textNode)textNode.nodeValue=String(gold);
    else top.insertBefore(document.createTextNode(String(gold)),top.firstChild||null);
   }
   const shop=document.querySelector('#shopGold');
   if(shop)shop.textContent=String(gold);
   const modern=document.querySelector('#v358Gold');
   if(modern)modern.textContent='🪙 '+gold.toLocaleString('de-DE');
   document.querySelectorAll('[data-gold-value],.gold-value').forEach(el=>{
    if(el && !el.closest('#v231QuestReward,#v237HarvestReward,#v247DungeonReward'))el.textContent=String(gold);
   });
  }catch(e){console.warn('V4.160 Gold live sync',e)}

  try{if(typeof v069SyncCurrencies==='function')v069SyncCurrencies()}catch(e){}
 }
 function buySeed(id){
  /* V7.128 fail-closed: under Grow server authority, local seed purchases are forbidden.
     The window-capture V7065 owner must route the click to v6358_buy_seed. */
  if(window.v7081UseAuthority?.('grow')){
   try{console.warn('[V7.128] blocked legacy local seed purchase',String(id||''))}catch(_){ }
   return false;
  }
  ensure();const d=SEEDS[id];
  if(!d||!d.buy)return toast('Dieser Samen ist nicht käuflich','info',d?.source||'Nur als Beute erhältlich.');
  if((Number(s.gold)||0)<d.buy)return toast('Nicht genug Gold','warn',`${d.name} kostet ${fmt(d.buy)} Gold.`);
  const r=v4109ApplySeedPurchase(s,id);if(!r.ok)return;
  save(false);
  v4109RefreshSeedPurchaseUi();
  try{queueMicrotask(()=>{try{if(typeof v495RenderSeedInventory==='function')v495RenderSeedInventory()}catch(e){}})}catch(e){}
  toast(`🌰 ${d.name} gekauft`,'success',`Vorrat: ${r.stock}`)
 }
 window.v4109ApplySeedPurchase=v4109ApplySeedPurchase;window.v4109RefreshSeedPurchaseUi=v4109RefreshSeedPurchaseUi;
 function selectSeed(id){if(!SEEDS[id])return;ensure().selectedSeed=id;s.grow.selectedSeed=id;save(false);renderGrow()}
 window.buySeed=buySeed;window.selectSeed=selectSeed;try{buySeedAction=buySeed;selectSeedAction=selectSeed}catch(e){}
 function plant(slot=null){const z=ensure(),id=z.selectedSeed,d=SEEDS[id];if(!d)return;if((s.grow.seeds[id]||0)<1)return toast('Keine Samen','warn',`${d.name} ist leer. Quelle: ${d.source}`);const cap=typeof growCapacity==='function'?growCapacity():Math.min(6,1+(s.grow.roomLevel-1)*2),plants=s.grow.plants;let idx=slot==null?plants.findIndex(x=>!x):Number(slot);if(idx<0)idx=plants.length;if(idx>=cap||plants[idx])return toast('Pflanzenplatz nicht verfügbar','warn','Wähle einen freien, freigeschalteten Topf.');while(plants.length<=idx)plants.push(null);plants[idx]={uid:`v492_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,seed:id,start:Date.now(),duration:Math.round(d.growMs*(typeof lampSpeed==='function'?lampSpeed():1)),care:[false,false,false,false],mutation:null,mutationChecked:false};s.grow.seeds[id]--;z.discovered[id]=true;z.selectedPlantUid=plants[idx].uid;try{if(s.v106Achievements?.stats)s.v106Achievements.stats.plantsGrown=(Number(s.v106Achievements.stats.plantsGrown)||0)+1}catch(e){}save(false);renderGrow();try{const glPlant=plants[idx];const glWeatherMul=Math.max(.80,Math.min(1.30,Number(window.GL_WEATHER?.bonus?.growMul)||1));const glReadyAt=(Number(glPlant?.start)||Date.now())+Math.round((Number(glPlant?.duration)||0)/glWeatherMul);if(typeof window.glPushDebug==='function')window.glPushDebug('V4.92 Pflanze direkt erkannt ✅\nPush wird geplant…\nsend_at: '+new Date(glReadyAt).toISOString(),true);if(typeof window.glSyncGrowPushJob==='function'){void window.glSyncGrowPushJob(glReadyAt)}else{setTimeout(()=>{try{if(typeof window.glSyncGrowPushJob==='function')void window.glSyncGrowPushJob(glReadyAt)}catch(e){}},300)}if(typeof window.glSyncGrowCarePushJob==='function'){void window.glSyncGrowCarePushJob()}else{setTimeout(()=>{try{if(typeof window.glSyncGrowCarePushJob==='function')void window.glSyncGrowCarePushJob()}catch(e){}},400)}}catch(e){console.warn('[GL Push] v492 direct plant sync',e)}try{if(typeof v106CheckAchievements==='function')v106CheckAchievements()}catch(e){}toast(`🌱 ${d.name} gepflanzt`,'success','Pflegefenster erscheinen während des Wachstums. Nichts verdorrt, wenn du eines verpasst.')}
 function carePlant(uid,intendedIndex=null){const z=ensure(),p=s.grow.plants.find(x=>x&&x.uid===uid);if(!p)return;const cs=careState(p),raw=Number(intendedIndex),bound=Number.isInteger(raw)&&raw>=0&&raw<CARE.length;let idx=bound?raw:cs.available;if(idx<0||idx>=CARE.length)return toast('Keine Pflegeaktion verfügbar','info',progress(p)>=1?'Die Pflanze ist bereits erntereif.':'Später wieder nachsehen.');p.care=Array.isArray(p.care)?[0,1,2,3].map(n=>!!p.care[n]):[false,false,false,false];if(p.care[idx])return toast('Pflege bereits erledigt','info',`${CARE[idx].name} wurde schon gespeichert.`);const x=progress(p),end=idx===CARE.length-1?1:CARE[idx+1].at,endAt=Number(p.start||0)+Number(p.duration||0)*end,graceMs=12000;if(bound&&x>=end&&Date.now()-endAt>graceMs){const live=careState(p);if(live.available>=0)idx=live.available;else return toast('Pflegefenster gerade gewechselt','info','Die angezeigte Aktion war nicht mehr aktuell. Der Growroom wurde neu geladen.');}p.care[idx]=true;p.careDoneAt=Array.isArray(p.careDoneAt)?p.careDoneAt.slice(0,4):[0,0,0,0];while(p.careDoneAt.length<4)p.careDoneAt.push(0);p.careDoneAt[idx]=Date.now();z.selectedPlantUid=p.uid;rollMutation(p);save(false);renderGrow();try{if(typeof window.glSyncGrowCarePushJob==='function')void window.glSyncGrowCarePushJob()}catch(e){console.warn('[GL Push] care resync',e)}}
 function addBloom(p){const z=ensure(),q=qualityFrom(p),b={id:`bloom_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,seed:p.seed,quality:q,mutation:p.mutation||null,createdAt:Date.now(),refined:false};z.bag.push(b);return'bag'}
 function tryMaterial(){try{const chance=.012;if(Math.random()>=chance)return'';if(Math.random()<.5&&typeof v030Gems!=='undefined'&&v030Gems.length){const g=v030Gems[Math.floor(Math.random()*v030Gems.length)],v=Math.max(1,Math.floor((g.min+g.max)/2));s.materials=Array.isArray(s.materials)?s.materials:[];s.materials.push({uid:`grow_gem_${Date.now()}`,baseId:g.id,type:'gem',name:g.name,icon:g.icon,quality:'green',rarity:'uncommon',stat:g.stat,value:v,price:0});return` · 💎 ${g.name}`}if(typeof v030Scrolls!=='undefined'&&v030Scrolls.length){const r=v030Scrolls[Math.floor(Math.random()*v030Scrolls.length)],v=Math.max(1,Math.floor((r.min+r.max)/2));s.materials=Array.isArray(s.materials)?s.materials:[];s.materials.push({uid:`grow_scroll_${Date.now()}`,baseId:r.id,type:'scroll',name:r.name,icon:r.icon,quality:'green',rarity:'uncommon',effect:r.effect,value:v,price:0});return` · 📜 ${r.name}`}}catch(e){}return''}
 function harvest(){ensure();const now=Date.now(),ready=s.grow.plants.filter(p=>p&&progress(p,now)>=1);if(!ready.length)return toast('Noch nichts erntereif','info','Der Growroom zeigt dir an, sobald eine Ernte bereit ist.');try{if(window.GL_EVENTS)window.GL_EVENTS.emit('growHarvested',{plants:ready,count:ready.length},ready.map(p=>String(p?.uid||p?.seed||'')).sort().join('|'));else{window.v6130OnGrowHarvest?.(ready);window.v688PetGrowHarvest?.(ready)}}catch(e){console.warn('V4.161 growHarvested event',e)}let gold=0,xp=0,fr=0,perfect=0,muts=0,splus=0,extra='';ready.forEach(p=>{if(!p.mutationChecked){p.mutationChecked=false;rollMutation(p)}const q=qualityFrom(p);gold+=estimatedGold(p);xp+=xpFor(p);fr+=fragFor(p);if(q==='S+'){perfect++;splus++}if(p.mutation)muts++;addBloom(p);extra+=tryMaterial()});try{const wr=window.GL_WEATHER_applyHarvestBonus?.(ready);if(wr?.text)extra+=wr.text}catch(e){console.warn('Live-Wetter Erntebonus',e)}try{if(typeof v077ModifyYield==='function')gold=v077ModifyYield(gold)}catch(e){}try{if(typeof v077ModifyGold==='function')gold=v077ModifyGold(gold,'harvest')}catch(e){}try{if(typeof window.v688ApplyPetHarvestBonus==='function')gold=window.v688ApplyPetHarvestBonus(gold)}catch(e){}try{gold=typeof v408GuildGold==='function'?v408GuildGold(gold):gold}catch(e){}s.gold=(Number(s.gold)||0)+gold;try{addXp(xp)}catch(e){s.xp=(Number(s.xp)||0)+xp}forge().fragments+=fr;const z=ensure();z.masteryXp+=ready.reduce((n,p)=>n+12+GRADES.indexOf(qualityFrom(p))*5+(RANK[SEEDS[p.seed]?.rarity]||0)*3+(p.mutation?8:0),0);z.stats.harvested+=ready.length;z.stats.perfect+=perfect;z.stats.splus+=splus;z.week.harvested+=ready.length;z.week.perfect+=perfect;s.grow.plants=s.grow.plants.map(p=>p&&progress(p,now)>=1?null:p);while(s.grow.plants.length&&!s.grow.plants[s.grow.plants.length-1])s.grow.plants.pop();z.selectedPlantUid=(s.grow.plants.find(Boolean)||{}).uid||'';save(false);try{if(typeof v069SyncCurrencies==='function')v069SyncCurrencies()}catch(e){}try{if(typeof v106CheckAchievements==='function')v106CheckAchievements()}catch(e){}renderGrow();try{if(typeof window.glSyncGrowCarePushJob==='function')void window.glSyncGrowCarePushJob()}catch(e){console.warn('[GL Push] harvest care resync',e)}toast('✂️ Ernte abgeschlossen','success',`${ready.length} Pflanze${ready.length===1?'':'n'} · +${fmt(gold)} Gold · +${fmt(xp)} EXP · +${fr} Samenfragmente${perfect?` · ${perfect} Perfect Grow`:''}${muts?` · ${muts} Mutation${muts===1?'':'en'}`:''}${extra}`)}
 async function activateBloom(i){
  const z=ensure(),idx=Number(i),pick=z.bag[idx];if(!pick)return;
  const pickId=pick.id,d=SEEDS[pick.seed]||SEEDS.moss,active=z.active&&Number(z.active.expiresAt)>Date.now()?z.active:null;
  if(active){
   const oldD=SEEDS[active.seed]||SEEDS.moss;
   const text=`Aktiv ist noch ${oldD.name} (${buffLeft()}).\n\nMit ${d.name} ersetzen? Der Rest des bisherigen Buffs verfällt.`;
   let ok=false;
   try{ok=typeof v115Confirm==='function'?await v115Confirm(text,{title:'🌿 Aktiven Grow-Buff ersetzen?',type:'confirm',okText:'Buff ersetzen'}):window.confirm(text)}catch(e){ok=false}
   if(!ok)return;
  }
  const live=ensure(),liveIndex=live.bag.findIndex(x=>x&&x.id===pickId),b=live.bag[liveIndex];if(liveIndex<0||!b)return;
  const liveD=SEEDS[b.seed]||SEEDS.moss,mins=Math.round(liveD.buffMins*masteryDuration());
  live.active={...b,expiresAt:Date.now()+mins*60000};live.bag.splice(liveIndex,1);
  save(false);renderGrow();paintCharacter();toast(`🌿 ${liveD.name} aktiviert`,'success',`${b.quality}${b.mutation?` · ${MUT[b.mutation].name}`:''} · ${mins} Min.`)
 }
 async function donate(i){const z=ensure(),b=z.bag[Number(i)];if(!b)return;const today=new Date().toISOString().slice(0,10);if(z.lastGuildDonation===today)return toast('Gilden-Gewächshaus','info','Heute hast du bereits eine Blüte gespendet. Morgen kannst du erneut Gilden-EP beitragen.');try{if((typeof v254Membership==='undefined'||!v254Membership)&&typeof window.v4105EnsureGuildState==='function')await window.v4105EnsureGuildState();if(typeof v254Membership==='undefined'||!v254Membership)return toast('Keine aktive Gilde','warn','Deine Gildenmitgliedschaft konnte nicht geladen werden. Bitte Verbindung prüfen.');if(typeof v073Db==='undefined'||!v073Db)return toast('Gilde nicht verbunden','warn','Für echte Gilden-EP ist eine Online-Verbindung nötig.');const rpc=typeof v073Db.__v474GuildRawRpc==='function'?v073Db.__v474GuildRawRpc:v073Db.rpc.bind(v073Db);const {data,error}=await rpc('v411_add_guild_activity',{p_kind:'quest'});if(error)throw error;const row=Array.isArray(data)?data[0]:data,aw=Math.max(0,Number(row?.awarded)||0);if(aw<=0)return toast('Gilden-EP nicht vergeben','info','Tageslimit erreicht oder keine aktive Gildenmitgliedschaft. Deine Blüte bleibt erhalten.');z.bag.splice(Number(i),1);z.lastGuildDonation=today;z.stats.guildDonations++;if(typeof v254Guild!=='undefined'&&v254Guild&&Number.isFinite(Number(row?.guild_xp)))v254Guild.guild_xp=Number(row.guild_xp);save(false);renderGrow();toast('🏰 Gilden-Gewächshaus','success',`${SEEDS[b.seed].name} gespendet · +${aw} Gilden-EP`) }catch(e){toast('Gilden-Gewächshaus','warn',String(e?.message||'Gilden-EP konnten nicht gebucht werden.'))}}
 function claimWeek(){const z=ensure(),w=z.week;if(w.claimed)return;const ok=w.harvested>=20&&w.perfect>=5&&w.mutations>=1;if(!ok)return toast('Wochenbeitrag noch offen','info','Ziel: 20 Ernten · 5 Perfect Grows · 1 Mutation.');w.claimed=true;s.harzTaler=(Number(s.harzTaler)||0)+2;forge().fragments+=25;addSeed(randomSeed(['violet','blue','critical']),1,'Wochenbeitrag');save(false);renderGrow();toast('🏰 Wochenbeitrag erfüllt','success','+2 Harz-Taler · +25 Samenfragmente · +1 seltener Samen')}
 function detailPlant(){const z=ensure();return s.grow.plants.find(p=>p&&p.uid===z.selectedPlantUid)||s.grow.plants.find(Boolean)||null}
 function ogCard(){return''}
 const V497_PLANT_ART={
  seedling:'assets/v7198-base64/49aed1d1c8035f5d2123.webp',
  growth:'assets/v7198-base64/c9ec3c217b81f805555c.webp',
  flower:'assets/v7198-base64/9880ab938246ad3b3dec.webp',
  harvest:'assets/v7198-base64/31d47d1bdc5a6c5800cb.webp'
 };
 function v497PlantArt(p,detail=false){
  const x=progress(p),stageKey=x>=1?'harvest':x>=.70?'flower':x>=.35?'growth':'seedling',mut=mutationVisible(p)?String(p.mutation||''):'',seed=String(p.seed||'moss');
  return `<div class="v497-plant-art ${detail?'detail':''} v497-stage-${stageKey} v497-seed-${esc(seed)} ${mut?`v497-mut-${esc(mut)}`:''}"><img src="${V497_PLANT_ART[stageKey]}" alt="${esc(SEEDS[seed]?.name||'Pflanze')} · ${stageKey}"></div>`
 }
 function seedCard(id,d){const z=ensure(),stock=s.grow.seeds[id]||0,sel=z.selectedSeed===id,known=!!z.discovered[id],buy=d.buy>0;return `<div class="v492-seed v492-r-${d.rarity} ${sel?'selected':''} ${!known&&!stock?'locked':''}" data-v492-seed="${id}"><span class="stock">×${stock}</span><div class="seedico">${d.icon}</div><b>${esc(d.name)}</b><small>${RARITY_LABEL[d.rarity]} · ${Math.round(d.growMs/60000)} Min.</small><small class="src">${esc(d.source)}</small><small>${affinityStars(d)} ${d.affinity==='all'?'Flexibel':className(d.affinity)}</small>${buy?`<button class="btn secondary buy" data-v492-buy="${id}">Kaufen · ${fmt(d.buy)} G</button>`:''}</div>`}
 function plantCard(p,i,cap){
  if(i>=cap)return `<button class="v492-plant locked"><div class="plantico">🔒</div><b>Topf ${i+1}</b><small>Raum-Upgrade nötig</small></button>`;
  if(!p)return `<button class="v492-plant empty" data-v492-plant="${i}"><div class="plantico">🪴</div><b>Freier Topf ${i+1}</b><small>${esc(SEEDS[ensure().selectedSeed].name)} pflanzen</small></button>`;
  const st=stage(p),cs=careState(p),x=progress(p),q=qualityFrom(p),mut=mutationVisible(p)?MUT[p.mutation]:null;
  p.care=Array.isArray(p.care)?[0,1,2,3].map(n=>!!p.care[n]):[false,false,false,false];
  const careDone=p.care.filter(Boolean).length;
  const careMini=`<span class="v4114-care-mini" aria-label="Pflege ${careDone} von 4">${CARE.map((_,n)=>{const end=n===CARE.length-1?1:CARE[n+1].at,miss=!p.care[n]&&x>=end,avail=!p.care[n]&&!miss&&cs.available===n;return `<i class="${p.care[n]?'done':miss?'missed':avail?'available':''}"></i>`}).join('')}</span>`;
  const careAction=cs.available>=0
    ?`<span class="v4114-slot-care" role="button" tabindex="0" data-v4114-care="${esc(p.uid)}" data-v4114-care-index="${cs.available}" title="${esc(CARE[cs.available].name)} jetzt durchführen">${CARE[cs.available].icon} ${esc(CARE[cs.available].name)} · ${careDone}/4</span>`
    :`<span class="v4114-slot-care done" title="Aktuell keine Pflegeaktion verfügbar">🌿 Pflege ${careDone}/4</span>`;
  return `<button class="v492-plant ${ensure().selectedPlantUid===p.uid?'selected':''} ${x>=1?'ready':''} ${cs.available>=0?'care':''}" data-v492-detail="${esc(p.uid)}">${careMini}<span class="mut">${mut?.icon||''}</span>${v497PlantArt(p)}<b>${esc(SEEDS[p.seed].name)}</b><small data-v492-time="${esc(p.uid)}">${st[0]} · ${st[1]}</small><div class="v492-mini-bar"><i data-v492-pbar="${esc(p.uid)}" style="width:${Math.round(x*100)}%"></i></div><span class="v492-quality">${q}${cs.available>=0?' · Pflege!':''}</span>${careAction}</button>`;
 }
 function detailHtml(p){if(!p){const id=ensure().selectedSeed,d=SEEDS[id];return `<div class="v492-details"><div class="v492-detail-name">${esc(d.name)}</div><div class="v492-detail-sub">${RARITY_LABEL[d.rarity]} · Quelle: ${esc(d.source)}</div><div class="v492-stage"><b>🌰 Samen ausgewählt</b><div class="v492-detail-sub">${Math.round(d.growMs/60000)} Minuten Grundzeit · ${affinityStars(d)} für ${d.affinity==='all'?'alle Klassen':className(d.affinity)}</div></div><div class="v492-quality-big"><span><small>CHARAKTERBUFF</small><br><span class="v492-detail-sub">nach der Ernte</span></span><b>${esc(statsText(d.stats))}</b></div><div class="v492-care"><div class="v492-care-title">🌱 Bereit zum Pflanzen</div><p>Freien Topf in der Mitte antippen. Pflege ist optional: Die Pflanze verdorrt niemals, aber gute Pflege verbessert Qualität und Belohnung.</p></div></div>`}const d=SEEDS[p.seed],x=progress(p),st=stage(p),q=qualityFrom(p),cs=careState(p),avail=cs.available>=0?CARE[cs.available]:null,mut=mutationVisible(p)?MUT[p.mutation]:null;return `<div class="v492-details"><div class="v497-detail-head">${v497PlantArt(p,true)}<div><div class="v492-detail-name">${mut?mut.icon+' ':''}${esc(d.name)}</div><div class="v492-detail-sub">${RARITY_LABEL[d.rarity]} · ${affinityStars(d)} ${d.affinity==='all'?'Flexibel':className(d.affinity)}${mut?` · ${esc(mut.name)} Mutation`:''}</div></div></div><div class="v492-stage"><b data-v492-detail-time="${esc(p.uid)}">${st[0]} · ${st[1]}</b><div class="v492-progress"><i data-v492-detail-bar="${esc(p.uid)}" style="width:${Math.round(x*100)}%"></i></div></div><div class="v492-quality-big"><span><small>QUALITÄT</small><br><span class="v492-stars">${'★'.repeat(Math.max(1,GRADES.indexOf(q)+1))}</span></span><b>${q}</b></div><div class="v492-yield v497-yield"><div><small>GOLD</small><b>🪙 ${fmt(estimatedGold(p))}</b></div><div><small>CHARAKTER-EXP</small><b>⭐ ${fmt(xpFor(p))}</b></div><div><small>SAMENFRAGMENTE</small><b>💠 ${fragFor(p)}</b></div></div><div class="v492-care"><div class="v492-care-title">${avail?`${avail.icon} Pflegeaktion verfügbar`:(x>=1?'✂️ Erntebereit':'🌿 Pflege-Status')}</div><p>${avail?avail.text:(x>=1?'Ernte jetzt und sichere Qualität, Buff und mögliche Mutation.':cs.missed?`${cs.missed} Pflegechance${cs.missed===1?'':'n'} verpasst. Nichts geht verloren.`:'Die nächste Pflegeaktion erscheint automatisch während des Wachstums.')}</p>${avail?`<button class="btn" data-v492-care="${esc(p.uid)}" data-v492-care-index="${cs.available}">${avail.icon} ${avail.name} · Qualität steigern</button>`:''}</div><div class="v492-perfect"><div class="v492-perfect-top"><span>🔥 PERFECT GROW</span><span>${(p.care||[]).filter(Boolean).length}/4</span></div><div class="v492-care-pips">${CARE.map((_,i)=>{const miss=!p.care[i]&&x>=(i===3?1:CARE[i+1].at),avail=!p.care[i]&&!miss&&cs.available===i;return `<i class="${p.care[i]?'done':miss?'missed':avail?'available':''}"></i>`}).join('')}</div></div></div>`}
 function activeHtml(){const z=ensure(),a=z.active;let og='';try{const ob=typeof v077Buff==='function'?v077Buff():null;if(ob)og=`<div class="v492-buff-lines" style="color:#f0c96e">🎁 OG-Sonderbuff: ${esc(v077BuffLabel(ob.type))} · ${esc(v077Fmt(ob.until-Date.now()))}</div>`}catch(e){}if(!a)return `<div class="v492-active-row"><div class="v492-hero">${s.playerClass==='scout'?'🏹':s.playerClass==='bruiser'?'🧙':s.playerClass==='summoner'?'🕯️':s.playerClass==='frost'?'❄️':'🪓'}</div><div class="v492-active"><b>Keine aktive Sorte</b><small>Ernte gute Pflanzen und aktiviere eine Blüte aus deinem Grow-Beutel.</small>${og}</div></div>`;const d=SEEDS[a.seed],m=a.mutation?MUT[a.mutation]:null;return `<div class="v492-active-row"><div class="v492-hero">${m?.icon||'🌿'}</div><div class="v492-active"><b>${esc(d.name)} · ${a.quality}${m?` · ${esc(m.name)}`:''}</b><small>Aktiv: ${buffLeft()}</small><div class="v492-buff-lines">${esc(statsText(bloomStats(a)))}</div><div class="v494-balance-note">⚖️ Dungeon 60 % · Nebelriss/Gildenboss 50 % · Smaragd-Koloss 35 % · PvP/Gildenkrieg 0 %</div>${og}</div></div>`}
 function bagHtml(){const z=ensure();return z.bag.length?z.bag.map((b,i)=>{const d=SEEDS[b.seed],m=b.mutation?MUT[b.mutation]:null,buff=statsText(bloomStats(b))||'Kein Kampfbonus',mins=Math.max(1,Math.round(Number(d?.buffMins)||15));return `<div class="v492-bloom"><div class="ico">${m?.icon||'🌿'}</div><b>${esc(d.name)}</b><small>${b.quality}${m?` · ${esc(m.name)}`:''}</small><small class="v7107-bloom-effect">⚡ ${esc(buff)}</small><small class="v7107-bloom-time">⏱ ${mins} Min. aktiv</small><button class="btn" data-v492-activate="${i}">Aktivieren</button><button class="btn secondary" data-v492-donate="${i}">🏰 Spenden</button></div>`}).join(''):`<div class="v492-bloom"><div class="ico">🎒</div><b>Leer</b><small>Blüten werden im neuen Stapel-Lager gesammelt</small></div>`}
 function renderGrow2(){
  const screen=document.querySelector('#grow');if(!screen)return;
  const active=screen.classList.contains('active');
  const auth=!!window.v7081UseAuthority?.('grow');
  const hyd=window.v7070GrowHydrationDiagnostics?.();
  if(auth&&!active)return;
  if(auth&&hyd&&!hyd.hydrated){void window.v7070GrowHydrationRefresh?.();return;}
  const z=ensure();let dirty=false;s.grow.plants.forEach(p=>{if(p&&rollMutation(p))dirty=true});if(dirty)save(false);const cap=typeof growCapacity==='function'?growCapacity():6,plants=s.grow.plants,ready=plants.filter(p=>p&&progress(p)>=1).length,care=plants.filter(p=>p&&careState(p).available>=0).length,disc=Object.keys(z.discovered).filter(k=>z.discovered[k]).length,mutc=Object.keys(z.mutations).filter(k=>z.mutations[k]).length,p=detailPlant(),w=z.week,weekOk=w.harvested>=20&&w.perfect>=5&&w.mutations>=1;screen.innerHTML=`<div class="v492-grow"><div class="v492-sign"><div><h2>Growroom</h2><small>ZÜCHTEN · PFLEGEN · MUTIEREN · CHARAKTER STÄRKEN</small></div></div>${typeof window.GL_WEATHER_growCard==='function'?window.GL_WEATHER_growCard():''}<div class="v492-topstats"><div class="v492-stat"><small>GROW-MEISTERSCHAFT</small><b>Lv. ${masteryLevel()}</b></div><div class="v492-stat ${care?'attn':''}"><small>PFLEGE BEREIT</small><b>${care}</b></div><div class="v492-stat ${ready?'attn':''}"><small>ERNTE BEREIT</small><b>${ready}</b></div><div class="v492-stat"><small>SAMENFRAGMENTE</small><b>💠 ${fmt(forge().fragments)}</b></div></div><div class="v493-mobile-tools"><button type="button" class="v493-seed-toggle" data-v493-seeds>🌰 Samenlager</button><span>Tippe einen Topf an → Details erscheinen darunter</span></div><div class="v492-main"><div class="v492-panel v492-seed-panel"><div class="v492-panel-head"><span>🌿 Samenlager</span><span>${disc}/${Object.keys(SEEDS).length} Sorten</span></div><div class="v492-seed-scroll"><div class="v492-seed-grid">${Object.entries(SEEDS).map(([id,d])=>seedCard(id,d)).join('')}</div></div></div><div class="v492-scene"><div class="v492-scene-label">🌱 Growroom Lv. ${s.grow.roomLevel} · ${plants.filter(Boolean).length}/${cap} Töpfe</div><div class="v492-plants">${Array.from({length:6},(_,i)=>plantCard(plants[i],i,cap)).join('')}</div></div><div class="v492-panel v492-detail-panel"><div class="v492-panel-head"><span>🌿 Pflanzendetails</span><span>${p?'Live':'Samen'}</span></div>${detailHtml(p)}${ready?`<div style="padding:0 7px 8px"><button class="btn gold" data-v492-harvest style="width:100%">✂️ ${ready}× ernten</button></div>`:''}</div></div><div class="v492-bottom"><div class="v492-card"><h3>📕 Sortenbuch & Gilden-Gewächshaus</h3><div class="v492-book-progress"><div class="book">📗</div><div><b>${disc} Sorten · ${mutc} Mutationen</b><small>Perfect Grows ${z.stats.perfect} · S+ ${z.stats.splus}</small><div class="v492-bookbar"><i style="width:${Math.min(100,Math.round((disc+mutc)/(Object.keys(SEEDS).length+18)*100))}%"></i></div></div></div><div class="v492-actions"><button class="btn secondary" data-v492-book>Sortenbuch öffnen</button><button class="btn ${weekOk&&!w.claimed?'gold':'secondary'}" data-v492-week ${w.claimed?'disabled':''}>🏰 Wochenbeitrag</button></div><small style="display:block;margin-top:6px;color:#97a994;font-size:6px">Diese Woche: ${w.harvested}/20 Ernten · ${w.perfect}/5 Perfect · ${w.mutations}/1 Mutation${w.claimed?' · ✅ Belohnung geholt':''}</small></div></div><div class="v492-upgrades"><div class="v492-upgrade"><b>💡 Lampe · Lv. ${s.grow.equipment.lamp}/5</b><small>−8 % Wachstumszeit je Level.</small><button class="btn secondary" data-v492-upgrade="lamp" ${s.grow.equipment.lamp>=5?'disabled':''}>${s.grow.equipment.lamp>=5?'MAX':`Upgrade · ${fmt(120+s.grow.equipment.lamp*140)} G`}</button></div><div class="v492-upgrade"><b>🪴 Töpfe · Lv. ${s.grow.equipment.pots}/5</b><small>+10 % Ertrag je Level.</small><button class="btn secondary" data-v492-upgrade="pots" ${s.grow.equipment.pots>=5?'disabled':''}>${s.grow.equipment.pots>=5?'MAX':`Upgrade · ${fmt(130+s.grow.equipment.pots*150)} G`}</button></div><div class="v492-upgrade"><b>🏗️ Raum · Lv. ${s.grow.roomLevel}/4</b><small>Mehr gleichzeitig nutzbare Pflanzenplätze.</small><button class="btn secondary" data-v492-room ${s.grow.roomLevel>=4?'disabled':''}>${s.grow.roomLevel>=4?'MAX':`Upgrade · ${fmt(150*s.grow.roomLevel)} G`}</button></div></div></div>`;try{window.v6163GrowTabs?.mountNow?.()}catch(e){}paintIndicators();paintCharacter();ensureOverlay();window.__v492GrowSig=statusSig()}
 function ensureOverlay(){let ov=document.getElementById('v492GrowBook');if(ov)return ov;ov=document.createElement('div');ov.id='v492GrowBook';ov.className='v492-overlay';ov.innerHTML='<div class="v492-modal"><div class="v492-modal-head"><h2>📗 Sortenbuch</h2><button class="v492-modal-close" data-v492-close>✕</button></div><div id="v492GrowBookBody"></div></div>';document.body.appendChild(ov);ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-v492-close]'))ov.classList.remove('show')});return ov}
 function openBook(){const z=ensure(),ov=ensureOverlay(),body=ov.querySelector('#v492GrowBookBody');body.innerHTML=`<div class="v492-book-grid">${Object.entries(SEEDS).map(([id,d])=>{const known=!!z.discovered[id],ms=Object.entries(MUT).filter(([mid])=>z.mutations[`${id}:${mid}`]).map(([,m])=>m.icon+' '+m.name);return `<div class="v492-book-item ${known?'':'unknown'}"><div class="ico">${known?d.icon:'❔'}</div><b>${known?esc(d.name):'Unbekannte Sorte'}</b><small>${RARITY_LABEL[d.rarity]} · ${esc(d.source)}</small><small>${known?`${affinityStars(d)} ${d.affinity==='all'?'Alle Klassen':className(d.affinity)}`:'Noch nicht entdeckt'}</small><div class="v492-mut-list">${ms.length?ms.join('<br>'):'Keine Mutation entdeckt'}</div></div>`}).join('')}</div>`;ov.classList.add('show')}
 function paintIndicators(){const plants=ensure()&&s.grow.plants||[],ready=plants.filter(p=>p&&progress(p)>=1).length,care=plants.filter(p=>p&&careState(p).available>=0).length;document.querySelectorAll('.top-menu-item[data-screen="grow"]').forEach(el=>el.classList.toggle('v492-attn',!!(ready||care)));const world=document.querySelector('#world .v366-world')||document.querySelector('#world');if(world){let box=world.querySelector('#v492HomeGrowStatus');if(!box){box=document.createElement('div');box.id='v492HomeGrowStatus';box.className='v492-home-grow';box.onclick=()=>{try{typeof v032Go==='function'?v032Go('grow'):null}catch(e){}};world.appendChild(box)}const growing=plants.filter(Boolean).length;box.innerHTML=`<b>🌱 Growroom · ${ready?`${ready} Ernte bereit`:care?`${care} Pflegeaktion${care===1?'':'en'} verfügbar`:`${growing} Pflanze${growing===1?'':'n'} wachsen`}</b><small>${ready||care?'Jetzt nachsehen lohnt sich.':'Deine Pflanzen wachsen weiter, auch wenn du offline bist.'}</small>`}}
 function paintCharacter(){const root=document.querySelector('#character');if(!root)return;let card=root.querySelector('#v492CharGrowBuff');const anchor=root.querySelector('#v106BookBtn')||root.querySelector('.center-hero')||root.firstElementChild;if(!anchor)return;if(!card){card=document.createElement('div');card.id='v492CharGrowBuff';card.className='v492-char-buff';anchor.insertAdjacentElement('afterend',card)}const z=ensure(),a=z.active;if(!a){card.innerHTML='<div class="top"><b>🌿 Aktive Sorte</b><small>Kein Grow-Buff</small></div><div class="lines">Im Growroom eine geerntete Blüte aktivieren.</div>';return}const d=SEEDS[a.seed],m=a.mutation?MUT[a.mutation]:null;card.innerHTML=`<div class="top"><b>${m?.icon||'🌿'} ${esc(d.name)} · ${a.quality}</b><small>${buffLeft()}</small></div><div class="lines">${esc(statsText(bloomStats(a)))}</div>`}
 function upgrade(k){try{if(typeof v232UpgradeGrow==='function')v232UpgradeGrow(k);else if(typeof upgradeGrowAction==='function')upgradeGrowAction(k)}catch(e){}queueMicrotask(renderGrow2)}
 function roomUpgrade(){try{if(typeof v232UpgradeRoom==='function')v232UpgradeRoom();else if(typeof upgradeRoomAction==='function')upgradeRoomAction()}catch(e){}queueMicrotask(renderGrow2)}
 function installAchievements(){try{if(typeof V106_ACH==='undefined'||!Array.isArray(V106_ACH)||V106_ACH.some(x=>x?.[0]==='grow492_first'))return;V106_ACH.push(
   ['grow492_first','Grüner Daumen','Ernte deine erste Pflanze im Growroom 2.0.',()=>ensure().stats.harvested,1],
   ['grow492_25','Großzüchter','Ernte 25 Pflanzen.',()=>ensure().stats.harvested,25],
   ['grow492_perfect','Perfekter Grow','Schaffe deinen ersten Perfect Grow (S+).',()=>ensure().stats.perfect,1],
   ['grow492_perfect25','Meisterzüchter','Schaffe 25 Perfect Grows.',()=>ensure().stats.perfect,25],
   ['grow492_mut','Was wächst denn da?','Entdecke deine erste Mutation.',()=>ensure().stats.mutationCount,1],
   ['grow492_mut10','Genetiker','Entdecke 10 Mutationen.',()=>ensure().stats.mutationCount,10],
   ['grow492_book8','Botaniker','Entdecke 8 verschiedene Sorten.',()=>Object.keys(ensure().discovered).filter(k=>ensure().discovered[k]).length,8],
   ['grow492_prism','Regenbogen im Keller','Entdecke eine prismatische Mutation.',()=>ensure().stats.prismatic,1]
  )}catch(e){console.warn('V4.92 achievements',e)}}
 function installBuffBridge(){try{if(typeof v319ExactTalentStats==='function'&&!v319ExactTalentStats.__v494){const base=v319ExactTalentStats;const wrapped=function(){const o=base.apply(this,arguments)||{};const b=currentBuffStats();if(b)Object.entries(b).forEach(([k,v])=>o[k]=(Number(o[k])||0)+Number(v||0));Object.entries(V494_TOTAL_CAPS).forEach(([k,cap])=>{if(Number.isFinite(Number(o[k])))o[k]=Math.min(Number(cap),Math.max(0,Number(o[k])||0))});return o};wrapped.__v494=true;wrapped.__v492=true;v319ExactTalentStats=wrapped;try{window.v319ExactTalentStats=wrapped}catch(e){}}}catch(e){console.warn('V4.96 buff bridge',e)}}
 /* V8.009: legacy Quest/Dungeon/PvP reward wrappers retired.
    GL_EVENTS is prebooted before Growroom and is the sole cross-feature reward source. */
 function installEventDrops(){
  if(!window.GL_EVENTS||window.__V6140_GROW_SEED_EVENTS__)return;window.__V6140_GROW_SEED_EVENTS__=true;
  window.GL_EVENTS.on('questCompleted',ev=>{try{if(window.__V7064_GROW_SERVER_MODE__)return;const q=ev.quest||{},elite=!!ev.elite||!!q.v310Elite||/elite/i.test(String(q.v309Role||q.v310BaseRole||q.v392Kind||''));if(Math.random()<(elite?.42:.24)){const id=elite?randomSeed(['critical','lemon','amnesia','violet','blue']):randomSeed(['moss','lime','jack','violet','blue']);addSeed(id,1,elite?'Elite-Quest':'Quest')}}catch(e){console.warn('V4.161 quest seed event',e)}});
  window.GL_EVENTS.on('dungeonWon',ev=>{try{if(window.__V7064_GROW_SERVER_MODE__)return;const boss=!!ev.boss;if(Math.random()>=(boss?.36:.07))return;const id=boss?randomSeed(['nebula','gorilla','lemon','amnesia']):randomSeed(['violet','blue','jack']);s.grow.seeds[id]=(Number(s.grow.seeds[id])||0)+1;ensure().discovered[id]=true;ensure().stats.seedsFound++;save(false);setTimeout(()=>{const extra=document.querySelector('#v247DungeonRewardExtra');if(extra&&!extra.querySelector('.v492-dungeon-seed'))extra.insertAdjacentHTML('beforeend',`<div class="v247-dungeon-line v492-dungeon-seed">🌰 Samen gefunden: ${esc(SEEDS[id].name)}</div>`)},0)}catch(e){console.warn('V4.161 dungeon seed event',e)}});
  window.GL_EVENTS.on('pvpWon',()=>{try{if(window.__V7064_GROW_SERVER_MODE__)return;if(Math.random()<.20)addSeed('greencrack',1,'PvP-Sieg')}catch(e){console.warn('V4.161 pvp seed event',e)}});
  window.GL_EVENTS.on('guildBossWon',ev=>{try{window.v492GuildBossSeedReward?.(ev.result||{won:true})}catch(e){console.warn('V4.161 guild boss seed event',e)}});
 }

 /* Gildenboss -> Growroom: only an actually claimed reward can grant a seed.
    Victory has the real chance at Smaragd OG; participation can very rarely grant Green Crack. */
 window.v492GuildBossSeedReward=function(result){try{ensure();const won=!!result?.won;if(won){if(Math.random()<.38)addSeed(Math.random()<.14?'emerald':randomSeed(['gorilla','amnesia','greencrack']),1,'Gildenboss')}else if(Math.random()<.06)addSeed('greencrack',1,'Gildenboss-Teilnahme')}catch(e){console.warn('V4.92 guild boss grow reward',e)}};
 function v495EnsureSeedInventory(){
  let ov=document.getElementById('v495SeedInventory');
  if(ov)return ov;
  ov=document.createElement('div');ov.id='v495SeedInventory';ov.className='v495-seed-overlay';
  ov.innerHTML=`<div class="v495-seed-modal" role="dialog" aria-modal="true" aria-label="Samenlager"><div class="v495-seed-head"><div><small>🌿 GROWROOM-INVENTAR</small><h2>🌰 Samenlager</h2><p>Wähle einen Samen für den nächsten freien Topf.</p></div><div class="v6312-seed-head-actions"><div class="v6312-seed-gold" title="Dein aktueller Goldbestand"><span>🪙 GOLD</span><b id="v6312SeedGold">0</b></div><button type="button" class="v495-seed-close" data-v495-seed-close aria-label="Samenlager schließen">✕</button></div></div><div class="v495-seed-meta" id="v495SeedMeta"></div><div class="v495-seed-grid" id="v495SeedGrid"></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{
   const t=e.target instanceof Element?e.target:null;if(!t)return;
   if(t===ov||t.closest('[data-v495-seed-close]')){e.preventDefault();v495CloseSeedInventory();return}
   const seed=t.closest('[data-v492-seed]');
   if(seed&&!t.closest('[data-v492-buy]'))v495CloseSeedInventory();
   if(t.closest('[data-v492-buy],[data-v492-og]'))queueMicrotask(v495RenderSeedInventory);
  });
  return ov;
 }
 function v495SeedSourceHint(id,d){
  if(d.buy>0)return `🪙 Beim Samen-Händler für ${fmt(d.buy)} Gold`;
  const map={violet:'📜 Normale Quests / Wochenbeitrag',blue:'📜 Normale Quests / Wochenbeitrag',critical:'🔴 Elite-Quests / Wochenbeitrag',nebula:'☠️ Dungeonbosse',lemon:'🔴 Elite-Quests / Dungeon',gorilla:'☠️ Dungeonbosse / Gildenboss',greencrack:'⚔️ PvP-Siege / Gildenboss',amnesia:'🔴 Elite-Quests / Dungeon / Gildenboss',emerald:'🏰 Gildenboss / seltene Events'};
  return map[id]||`🎁 ${d.source}`;
 }
 function v495SeedInventoryCard(id,d){
  const z=ensure(),stock=Math.max(0,Number(s.grow.seeds[id])||0),selected=z.selectedSeed===id,owned=stock>0,buy=Number(d.buy)>0;
  const selectState=selected?'<div class="v495-selected">✓ AUSGEWÄHLT</div>':owned?'<div class="v495-choose">Antippen zum Auswählen</div>':buy?'<div class="v495-find">Noch nicht im Lager</div>':'<div class="v495-find">Noch nicht im Lager</div>';
  const buyButton=buy?`<button class="btn secondary v495-buy" data-v492-buy="${id}">Kaufen · ${fmt(d.buy)} G</button>`:'';
  const selectable=(owned||selected)?`data-v492-seed="${id}"`:'';
  return `<div class="v495-seed-card v492-r-${d.rarity} ${selected?'selected':''} ${!owned&&!buy?'locked':''}" ${selectable}><span class="v495-stock">×${stock}</span><div class="v495-seed-icon">${d.icon}</div><div class="v495-seed-name">${esc(d.name)}</div><div class="v495-rarity">${RARITY_LABEL[d.rarity]} · ${Math.round(d.growMs/60000)} Min.</div><div class="v495-source">${esc(v495SeedSourceHint(id,d))}</div><div class="v495-affinity">${affinityStars(d)} ${d.affinity==='all'?'Alle Klassen':className(d.affinity)}</div><div class="v495-buff">🌿 ${esc(statsText(d.stats))}</div>${selectState}${buyButton}</div>`;
 }
 window.v4109SelectedSeedKeepsBuyButton=function(id='moss'){
  const d=SEEDS[id];if(!d||!Number(d.buy))return false;const z=ensure(),oldZ=z.selectedSeed,oldG=s.grow.selectedSeed;
  try{z.selectedSeed=id;s.grow.selectedSeed=id;return v495SeedInventoryCard(id,d).includes(`data-v492-buy="${id}"`)}
  finally{z.selectedSeed=oldZ;s.grow.selectedSeed=oldG}
 };
 function v495RenderSeedInventory(){
  const ov=v495EnsureSeedInventory(),z=ensure(),grid=ov.querySelector('#v495SeedGrid'),meta=ov.querySelector('#v495SeedMeta');if(!grid||!meta)return;
  const owned=Object.keys(SEEDS).filter(id=>(Number(s.grow.seeds[id])||0)>0).length,total=Object.keys(SEEDS).length,units=Object.keys(SEEDS).reduce((n,id)=>n+(Number(s.grow.seeds[id])||0),0);
  meta.innerHTML=`<span><b>${units}</b> Samen</span><span><b>${owned}/${total}</b> Sorten im Lager</span><span>Ausgewählt: <b>${esc(SEEDS[z.selectedSeed]?.name||'White Widow')}</b></span>`;
  const goldEl=ov.querySelector('#v6312SeedGold');if(goldEl)goldEl.textContent=fmt(Math.max(0,Number(s.gold)||0));
  grid.innerHTML=Object.entries(SEEDS).map(([id,d])=>v495SeedInventoryCard(id,d)).join('');
 }
 function v495OpenSeedInventory(){
  const ov=v495EnsureSeedInventory();v495RenderSeedInventory();ov.classList.add('show');document.body.classList.add('v495-seed-open');document.querySelector('.v492-grow')?.classList.remove('v493-seeds-open');const b=document.querySelector('[data-v493-seeds]');if(b)b.textContent='🌰 Samenlager';
 }
 function v495CloseSeedInventory(){const ov=document.getElementById('v495SeedInventory');if(ov)ov.classList.remove('show');document.body.classList.remove('v495-seed-open');document.querySelector('.v492-grow')?.classList.remove('v493-seeds-open');const b=document.querySelector('[data-v493-seeds]');if(b)b.textContent='🌰 Samenlager'}
 window.v495OpenSeedInventory=v495OpenSeedInventory;window.v495CloseSeedInventory=v495CloseSeedInventory;window.v495RenderSeedInventory=v495RenderSeedInventory;
 function selectPlantDetail(uid){
  const z=ensure(),id=String(uid||''),p=s.grow.plants.find(x=>x&&String(x.uid)===id);
  if(!p)return;
  z.selectedPlantUid=id;
  try{s.grow.selectedPlantUid=id}catch(e){}
  document.querySelectorAll('#grow .v492-plant[data-v492-detail]').forEach(card=>{
   card.classList.toggle('selected',String(card.dataset.v492Detail||'')===id);
  });
  const panel=document.querySelector('#grow .v492-detail-panel');
  if(panel){
   const ready=s.grow.plants.filter(x=>x&&progress(x)>=1).length;
   panel.innerHTML=`<div class="v492-panel-head"><span>🌿 Pflanzendetails</span><span>Live</span></div>${detailHtml(p)}${ready?`<div style="padding:0 7px 8px"><button class="btn gold" data-v492-harvest style="width:100%">✂️ ${ready}× ernten</button></div>`:''}`;
   try{livePaint()}catch(e){}
  }
 }
 function statusSig(){ensure();return s.grow.plants.map(p=>{if(!p)return'-';const x=progress(p),bucket=x>=1?4:x>=.70?3:x>=.35?2:1,cs=careState(p);return `${p.uid}:${bucket}:${cs.available}:${qualityFrom(p)}:${p.mutation||''}`}).join('|')}
 function livePaint(){try{s.grow.plants.forEach(p=>{if(!p)return;const st=stage(p),pct=Math.round(progress(p)*100);document.querySelectorAll(`[data-v492-time="${CSS.escape(p.uid)}"]`).forEach(el=>el.textContent=`${st[0]} · ${st[1]}`);document.querySelectorAll(`[data-v492-pbar="${CSS.escape(p.uid)}"]`).forEach(el=>el.style.width=pct+'%');document.querySelectorAll(`[data-v492-detail-time="${CSS.escape(p.uid)}"]`).forEach(el=>el.textContent=`${st[0]} · ${st[1]}`);document.querySelectorAll(`[data-v492-detail-bar="${CSS.escape(p.uid)}"]`).forEach(el=>el.style.width=pct+'%')});const a=ensure().active;if(a){const c=document.querySelector('#v492CharGrowBuff .top small');if(c)c.textContent=buffLeft()}}catch(e){}}
 function stamp(){}
 document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.closest('[data-v492-og]')){e.preventDefault();e.stopImmediatePropagation();const a=t.closest('[data-v492-og]').dataset.v492Og;try{if(a==='buy')return v077BuySeed();if(a==='plant')return v077Plant();if(a==='harvest')return v077Harvest()}catch(err){return toast('Wundertüte OG','warn','Spezial-Samen konnte nicht ausgeführt werden.')}}if(t.closest('[data-v492-buy]')){e.preventDefault();e.stopImmediatePropagation();return buySeed(t.closest('[data-v492-buy]').dataset.v492Buy)}if(t.closest('[data-v492-seed]')&&!t.closest('[data-v492-buy]')){e.preventDefault();return selectSeed(t.closest('[data-v492-seed]').dataset.v492Seed)}if(t.closest('[data-v492-plant]')){e.preventDefault();return plant(Number(t.closest('[data-v492-plant]').dataset.v492Plant))}if(t.closest('[data-v492-detail]')){e.preventDefault();return selectPlantDetail(t.closest('[data-v492-detail]').dataset.v492Detail)}if(t.closest('[data-v492-care]')){const b=t.closest('[data-v492-care]');return carePlant(b.dataset.v492Care,Number(b.dataset.v492CareIndex))};if(t.closest('[data-v492-harvest]'))return harvest();if(t.closest('[data-v492-activate]'))return activateBloom(t.closest('[data-v492-activate]').dataset.v492Activate);if(t.closest('[data-v492-donate]'))return void donate(t.closest('[data-v492-donate]').dataset.v492Donate);if(t.closest('[data-v492-book]'))return openBook();if(t.closest('[data-v492-week]'))return claimWeek();if(t.closest('[data-v492-upgrade]'))return upgrade(t.closest('[data-v492-upgrade]').dataset.v492Upgrade);if(t.closest('[data-v492-room]'))return roomUpgrade()},true);
 ensure();try{if(typeof v077InjectGrow==='function')v077InjectGrow=function(){}}catch(e){}installAchievements();installBuffBridge();installEventDrops();
 renderGrow=renderGrow2;window.renderGrow=renderGrow2;
 function syncGrowUi(){try{
  const grow=document.querySelector('#grow');if(!grow||!grow.classList.contains('active'))return;
  const auth=!!window.v7081UseAuthority?.('grow'),hyd=window.v7070GrowHydrationDiagnostics?.();
  if(auth&&hyd&&!hyd.hydrated){void window.v7070GrowHydrationRefresh?.();return;}
  const has=!!grow.querySelector('.v492-grow'),sig=statusSig();
  if(!has||sig!==window.__v492GrowSig)renderGrow2();else livePaint();
 }catch(e){}}
 function tick(){
  if(document.hidden)return;
  const growActive=!!document.querySelector('#grow')?.classList.contains('active');
  const charActive=!!document.querySelector('#character')?.classList.contains('active');
  /* V7.193: under enforced server authority this legacy timer is UI-only.
     It must never roll mutations or persist gameplay state locally. */
  if(window.v7081UseAuthority?.('grow')){
   if(growActive)syncGrowUi();
   if(charActive){paintIndicators();paintCharacter()}
   stamp();return;
  }
  ensure();let changed=false;s.grow.plants.forEach(p=>{if(p&&rollMutation(p))changed=true});if(changed)save(false);syncGrowUi();
  if(!growActive){paintIndicators();if(charActive)paintCharacter()}stamp();
 }
 let tickSeconds=0;
 setInterval(()=>{
  if(document.hidden)return;
  tickSeconds=(tickSeconds+1)%5;
  try{if(document.querySelector('#grow')?.classList.contains('active'))syncGrowUi()}catch(e){}
  if(tickSeconds===0)tick();
 },1000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){syncGrowUi();paintIndicators();paintCharacter();stamp()}},{passive:true});
 window.addEventListener('pageshow',()=>{syncGrowUi();paintIndicators();paintCharacter();stamp()},{passive:true});
 installAchievements();installBuffBridge();installEventDrops();syncGrowUi();paintIndicators();paintCharacter();stamp();
})();
