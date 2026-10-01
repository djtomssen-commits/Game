(()=>{
'use strict';
if(window.__V6130_GENETICS_CLASSSET__)return;window.__V6130_GENETICS_CLASSSET__=true;
const V=window.GROW_LEGENDS_VERSION||{short:'V4.165',label:'V4.165 Anbauturm',number:'4.165'};const VERSION=V.label,SHORT=V.short;
const RECIPES={
 widow_amnesia:{name:'Widownesia',a:'moss',b:'amnesia',hybrid:'hy_widow_amnesia',essence:'Widownesia-Essenz'},
 northern_purple:{name:'Northern Purple',a:'lime',b:'violet',hybrid:'hy_northern_purple',essence:'Northern-Purple-Essenz'},
 lemon_dream:{name:'Lemon Dream',a:'lemon',b:'blue',hybrid:'hy_lemon_dream',essence:'Lemon-Dream-Essenz'},
 purple_gorilla:{name:'Purple Gorilla',a:'violet',b:'gorilla',hybrid:'hy_purple_gorilla',essence:'Purple-Gorilla-Essenz'},
 critical_crack:{name:'Critical Crack',a:'critical',b:'greencrack',hybrid:'hy_critical_crack',essence:'Critical-Crack-Essenz'},
 emerald_kush:{name:'Emerald Kush',a:'emerald',b:'nebula',hybrid:'hy_emerald_kush',essence:'Emerald-Kush-Essenz'}
};
const SLOT_CFG={
 boots:{icon:'🥾',label:'Stiefel',recipe:'widow_amnesia',buds:100,fragments:50,gold:10000,essence:1},
 head:{icon:'🪖',label:'Kopfschutz',recipe:'northern_purple',buds:250,fragments:70,gold:15000,essence:1},
 ring:{icon:'💍',label:'Ring',recipe:'lemon_dream',buds:400,fragments:90,gold:22000,essence:1},
 body:{icon:'🛡️',label:'Rüstung',recipe:'purple_gorilla',buds:650,fragments:120,gold:35000,essence:2},
 amulet:{icon:'📿',label:'Amulett',recipe:'critical_crack',buds:900,fragments:150,gold:50000,essence:2},
 weapon:{icon:'⚔️',label:'Waffe',recipe:'emerald_kush',buds:1200,fragments:200,gold:75000,essence:3}
};
const SET_SLOT_ICONS={
 grower:{head:'🪖',weapon:'🪓',body:'🛡️',boots:'🥾',ring:'💍',amulet:'📿'},
 scout:{head:'🥷',weapon:'🏹',body:'🥼',boots:'👟',ring:'💍',amulet:'📿'},
 bruiser:{head:'🧙',weapon:'🔮',body:'🥋',boots:'👢',ring:'💠',amulet:'🧿'},
 frost:{head:'🪖',weapon:'🪓',body:'🛡️',boots:'🥾',ring:'💍',amulet:'📿'},
 summoner:{head:'🧙',weapon:'🪄',body:'🥋',boots:'👢',ring:'💍',amulet:'🧿'}
};
function normalizedClassId(id){return ['grower','scout','bruiser','frost','summoner'].includes(String(id))?String(id):'grower'}
function setSlotIcon(slot,classId=currentClass()){const cls=normalizedClassId(classId);return SET_SLOT_ICONS[cls]?.[slot]||SLOT_CFG[slot]?.icon||'🧩'}
function setSlotArt(slot,classId=currentClass()){
 const cls=normalizedClassId(classId),set=(()=>{try{return classSets?.[cls]?.name||'Klassenset'}catch(_){return'Klassenset'}})();
 const sample={name:`${set}: ${SLOT_CFG[slot]?.label||slot}`,slot,classId:cls,quality:'purple',rarity:'epic',setId:cls,setName:set,bonus:{}};
 try{return window.v4115ComicItemArtUri?.(sample)||window.v466ItemArtUri?.(sample)||window.v4106ComicItemArtUri?.(sample)||''}catch(_){return''}
}
function setSlotVisual(slot,classId=currentClass()){const u=setSlotArt(slot,classId);return u?`<img class="v466-item-art" src="${u}" alt="${esc(SLOT_CFG[slot]?.label||slot)}">`:setSlotIcon(slot,classId)}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
function seed(id){try{return seedTypes?.[id]||null}catch(_){return null}}
function seedName(id){return seed(id)?.name||id}
function state(){
 if(typeof s==='undefined'||!s)return null;
 s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
 s.grow.v6130=(s.grow.v6130&&typeof s.grow.v6130==='object')?s.grow.v6130:{};const z=s.grow.v6130;
 z.essences=(z.essences&&typeof z.essences==='object')?z.essences:{};z.crosses=(z.crosses&&typeof z.crosses==='object')?z.crosses:{};
 z.totalCrosses=Math.max(0,Math.floor(Number(z.totalCrosses)||0));z.totalEssences=Math.max(0,Math.floor(Number(z.totalEssences)||0));
 if(z.pending&&(!RECIPES[z.pending.recipe]||typeof z.pending!=='object'))z.pending=null;
 return z;
}
function save(){try{persist(false)}catch(_){ }try{if(typeof v075WriteCloudSave==='function')queueMicrotask(()=>v075WriteCloudSave(false))}catch(_){}}
function toast(t,type='success',d=''){try{return v063Toast(t,type,d)}catch(_){}}
function ownedOrGrowing(id){const stock=Math.max(0,Number(s?.grow?.seeds?.[id])||0);const growing=Array.isArray(s?.grow?.plants)&&s.grow.plants.some(p=>p&&p.seed===id);return stock>0||growing}
function qualityByCare(p){const n=Array.isArray(p?.care)?p.care.filter(Boolean).length:0;return ['C','B','A','S','S+'][Math.min(4,n)]}
function installAchievements(){try{if(typeof V106_ACH==='undefined'||!Array.isArray(V106_ACH))return;const old=V106_ACH.findIndex(x=>x?.[0]==='seed10');if(old>=0)V106_ACH.splice(old,1);if(!V106_ACH.some(x=>x?.[0]==='genetics1'))V106_ACH.push(['genetics1','Grüne Wissenschaft','Schließe deine erste erfolgreiche Kreuzung ab.',()=>Math.max(0,Number(s?.grow?.v6130?.totalCrosses)||0),1],['genetics10','Stabiler Stammbaum','Schließe 10 erfolgreiche Kreuzungen ab.',()=>Math.max(0,Number(s?.grow?.v6130?.totalCrosses)||0),10])}catch(e){console.warn('V4.160 genetics achievements',e)}}
function beginCross(id){const z=state(),r=RECIPES[id];if(!z||!r)return;if(z.pending)return toast('Kreuzung läuft bereits','info',`${RECIPES[z.pending.recipe]?.name||'Genetik'} zuerst abschließen.`);const missing=[r.a,r.b].filter(x=>!ownedOrGrowing(x));if(missing.length)return toast('Elternsorte fehlt','warn',`Du brauchst ${missing.map(seedName).join(' + ')} als Samen oder bereits wachsende Pflanze.`);z.pending={recipe:id,aDone:false,bDone:false,startedAt:Date.now()};save();renderLabIfOpen();try{window.v6163GrowTabs?.refresh?.()}catch(_){};toast('🧬 Kreuzung angesetzt','success',`${seedName(r.a)} + ${seedName(r.b)} · beide mindestens Qualität S ernten.`)}
function onHarvest(ready){const z=state();if(!z||!Array.isArray(ready)||!ready.length)return;
 let changed=false;
 const p=z.pending,r=p&&RECIPES[p.recipe];
 if(r){let low=false;for(const plant of ready){if(!plant)continue;const matchesA=plant.seed===r.a,matchesB=plant.seed===r.b;if(!matchesA&&!matchesB)continue;const good=(Array.isArray(plant.care)?plant.care.filter(Boolean).length:0)>=3;if(!good){low=true;continue}if(matchesA&&!p.aDone){p.aDone=true;changed=true}if(matchesB&&!p.bDone){p.bDone=true;changed=true}}
   if(p.aDone&&p.bDone){s.grow.seeds[r.hybrid]=Math.max(0,Number(s.grow.seeds[r.hybrid])||0)+1;z.crosses[p.recipe]=Math.max(0,Number(z.crosses[p.recipe])||0)+1;z.totalCrosses++;z.pending=null;changed=true;toast('🧬 Kreuzung gelungen!','success',`+1 ${r.name} Hybrid-Samen · jetzt anbauen und mindestens S ernten.`);installAchievements();try{v106CheckAchievements?.()}catch(_){}}
   else if(changed)toast('🧬 Genetikfortschritt','success',`${p.aDone?'✅':'⬜'} ${seedName(r.a)} · ${p.bDone?'✅':'⬜'} ${seedName(r.b)}`);else if(low)toast('Genetik: Qualität zu niedrig','info','Für die Kreuzung zählt nur Qualität S oder S+.');
 }
 for(const plant of ready){const entry=Object.entries(RECIPES).find(([,x])=>x.hybrid===plant?.seed);if(!entry)continue;const [id,rr]=entry;if((Array.isArray(plant.care)?plant.care.filter(Boolean).length:0)<3){toast('Hybrid nicht stabil genug','info',`${rr.name} benötigt Qualität S oder S+ für eine Essenz.`);continue}z.essences[id]=Math.max(0,Number(z.essences[id])||0)+1;z.totalEssences++;changed=true;toast('🧬 Genetik-Essenz gewonnen','success',`+1 ${rr.essence} · für die Klassenset-Schmiede.`)}
 if(changed){save();queueMicrotask(()=>{try{decorateGrow();renderLabIfOpen();renderSetIfOpen();window.v6163GrowTabs?.refresh?.()}catch(_){ }})}
}
window.v6130OnGrowHarvest=onHarvest;if(window.GL_EVENTS&&!window.__V6140_GENETICS_EVENT__){window.__V6140_GENETICS_EVENT__=true;window.GL_EVENTS.on('growHarvested',ev=>onHarvest(ev.plants||[]));}
function pendingHtml(){const z=state(),p=z?.pending;if(!p)return '<div class="v6130-pending"><b>🧬 Keine Kreuzung aktiv</b><div class="v6130-stock">Wähle unten ein Rezept. Danach müssen beide Elternsorten jeweils mindestens mit Qualität S geerntet werden.</div></div>';const r=RECIPES[p.recipe];return `<div class="v6130-pending"><b>🧬 Aktive Kreuzung: ${esc(r.name)}</b><div class="v6130-progress"><div class="v6130-prog ${p.aDone?'done':''}">${p.aDone?'✅':'⬜'} ${esc(seedName(r.a))} · mindestens S</div><div class="v6130-prog ${p.bDone?'done':''}">${p.bDone?'✅':'⬜'} ${esc(seedName(r.b))} · mindestens S</div></div><div class="v6130-stock">Sind beide Eltern bestätigt, erhältst du genau 1 Hybrid-Samen. Der Hybrid muss anschließend selbst mindestens auf S gezogen werden, um seine Schmiede-Essenz zu gewinnen.</div></div>`}
function ensureLab(){let ov=document.getElementById('v6130GeneticsOverlay');if(ov)return ov;ov=document.createElement('div');ov.id='v6130GeneticsOverlay';ov.innerHTML='<div class="v6130-lab"><div class="v6130-head"><div><h2>🧬 Genetik-Labor</h2><small>KREUZEN · HYBRID ZIEHEN · ESSENZ GEWINNEN</small></div><button type="button" class="v6130-x" data-v6130-close>✕</button></div><div id="v6130LabBody"></div></div>';document.body.appendChild(ov);ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-v6130-close]'))ov.classList.remove('show')});return ov}
function recipeCard(id,r){const z=state(),active=z?.pending?.recipe===id,blocked=!!z?.pending&&!active,aok=ownedOrGrowing(r.a),bok=ownedOrGrowing(r.b),ess=Math.max(0,Number(z?.essences?.[id])||0),hy=Math.max(0,Number(s?.grow?.seeds?.[r.hybrid])||0);return `<div class="v6130-recipe ${aok&&bok&&!blocked?'ready':''}"><h3>${esc(r.name)}</h3><div class="v6130-parentline"><span class="v6130-parent">🌰 ${esc(seedName(r.a))}<br><small>×${Math.max(0,Number(s?.grow?.seeds?.[r.a])||0)}</small></span><span class="v6130-plus">＋</span><span class="v6130-parent">🌰 ${esc(seedName(r.b))}<br><small>×${Math.max(0,Number(s?.grow?.seeds?.[r.b])||0)}</small></span></div><div class="v6130-out">Ergebnis<strong>🧬 ${esc(r.name)} Hybrid</strong></div><div class="v6130-stock"><span class="${aok?'ok':'bad'}">${aok?'✓':'✕'} ${esc(seedName(r.a))}</span> · <span class="${bok?'ok':'bad'}">${bok?'✓':'✕'} ${esc(seedName(r.b))}</span><br>Hybrid-Samen: <b>${hy}</b> · Essenzen: <b>${ess}</b> · Kreuzungen: <b>${Math.max(0,Number(z?.crosses?.[id])||0)}</b></div><button type="button" data-v6130-cross="${id}" ${blocked||active||!aok||!bok?'disabled':''}>${active?'Kreuzung läuft':blocked?'Andere Kreuzung aktiv':'Kreuzung ansetzen'}</button></div>`}
function labBodyHtml(){return `${pendingHtml()}<div class="v6130-help"><b>So funktioniert es:</b> Elternsorten müssen vorhanden oder bereits eingepflanzt sein. Nach dem Start erntest du beide Eltern mit Qualität <b>S oder S+</b>. Dann entsteht ein echter Hybrid-Samen im Samenlager. Erst wenn du diesen Hybrid ebenfalls mit <b>S/S+</b> erntest, erhältst du die Genetik-Essenz für ein Klassenset-Teil.</div><div class="v6130-grid">${Object.entries(RECIPES).map(([id,r])=>recipeCard(id,r)).join('')}</div>`}
function renderLab(){const ov=ensureLab(),body=ov.querySelector('#v6130LabBody');if(!body)return;body.innerHTML=labBodyHtml()}
function openLab(){renderLab();ensureLab().classList.add('show')}
function renderLabIfOpen(){if(document.getElementById('v6130GeneticsOverlay')?.classList.contains('show'))renderLab()}
function decorateGrow(){try{window.v6163GrowTabs?.refresh?.()}catch(_){}}
function buds(){return Math.max(0,Math.floor(Number(s?.v204Pvp?.buds)||0))}
function fragments(){return Math.max(0,Math.floor(Number(s?.v488Forge?.fragments)||0))}
function levelFactor(){return 1+Math.floor((Math.max(1,Number(s?.level)||1)-1)/50)*.25}
function slotCost(slot){const c=SLOT_CFG[slot],f=levelFactor(),lvl=Math.max(1,Number(s?.level)||1);return {...c,gold:Math.max(1,Math.round(typeof window.v6168ClassSetGoldCost==='function'?window.v6168ClassSetGoldCost(slot,lvl):(c.gold*f))),fragments:Math.round(c.fragments*(1+(f-1)*.65))}}
function currentClass(){return normalizedClassId(s?.playerClass)}
function setInfo(){const cls=currentClass();try{return classSets?.[cls]||{name:'Klassenset',bonuses:{}}}catch(_){return{name:'Klassenset',bonuses:{}}}}
function equippedSet(){const cls=currentClass();return Object.values(s?.equipment||{}).filter(it=>it?.setId===cls).length}
async function confirmBox(text,title){try{if(typeof v115Confirm==='function')return await v115Confirm(text,{title,type:'confirm',okText:'Set-Teil schmieden'})}catch(_){ }return window.confirm(text)}
let v6130CraftBusy=false;
async function craftSet(slot){
 if(v6130CraftBusy)return;
 const firstState=state(),firstCost=slotCost(slot),firstRecipe=RECIPES[firstCost.recipe];if(!firstState||!firstRecipe)return;
 const firstEss=Math.max(0,Number(firstState.essences[firstCost.recipe])||0);
 if(buds()<firstCost.buds)return toast('PvP-Rang noch zu niedrig','warn',`Du brauchst mindestens ${fmt(firstCost.buds)} PvP-Buds. Sie werden nicht ausgegeben.`);
 if(firstEss<firstCost.essence)return toast('Genetik-Essenz fehlt','warn',`${firstRecipe.essence}: ${firstEss}/${firstCost.essence}`);
 if(fragments()<firstCost.fragments)return toast('Samenfragmente fehlen','warn',`${fmt(fragments())}/${fmt(firstCost.fragments)}`);
 if((Number(s.gold)||0)<firstCost.gold)return toast('Gold fehlt','warn',`${fmt(Number(s.gold)||0)}/${fmt(firstCost.gold)}`);
 v6130CraftBusy=true;
 try{
   const ok=await confirmBox(`${firstCost.label} des ${setInfo().name}-Sets herstellen?\n\n${firstCost.essence}× ${firstRecipe.essence}\n${fmt(firstCost.fragments)} Samenfragmente\n${fmt(firstCost.gold)} Gold\nPvP-Freischaltung: ${fmt(firstCost.buds)} Buds (werden NICHT verbraucht)\n\nDas Item wird für dein aktuelles Level hergestellt.`,`🧬 ${setInfo().name}: ${firstCost.label}`);if(!ok)return;
   /* Re-read every resource after the async confirmation. This closes stale-state races. */
   const z=state(),c=slotCost(slot),r=RECIPES[c.recipe];if(!z||!r)return;
   const haveEss=Math.max(0,Number(z.essences[c.recipe])||0),liveFragments=fragments(),liveGold=Math.max(0,Number(s.gold)||0),liveBuds=buds();
   if(liveBuds<c.buds)return toast('PvP-Rang hat sich geändert','warn',`Benötigt: ${fmt(c.buds)} PvP-Buds.`);
   if(haveEss<c.essence)return toast('Genetik-Essenz nicht mehr verfügbar','warn',`${r.essence}: ${haveEss}/${c.essence}`);
   if(liveFragments<c.fragments)return toast('Samenfragmente nicht mehr ausreichend','warn',`${fmt(liveFragments)}/${fmt(c.fragments)}`);
   if(liveGold<c.gold)return toast('Gold nicht mehr ausreichend','warn',`${fmt(liveGold)}/${fmt(c.gold)}`);
   z.essences[c.recipe]=haveEss-c.essence;s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};s.v488Forge.fragments=liveFragments-c.fragments;s.gold=liveGold-c.gold;
   let item=null;
   try{
     window.__GL_CLASSSET_FORGE_CRAFT__=true;
     item=makeSetItem(currentClass(),slot);
   }catch(e){console.warn('V4.164 makeSetItem',e)}
   finally{window.__GL_CLASSSET_FORGE_CRAFT__=false}
   if(!item){z.essences[c.recipe]=haveEss;s.v488Forge.fragments+=c.fragments;s.gold+=c.gold;return toast('Herstellung fehlgeschlagen','error','Set-Item konnte nicht erzeugt werden. Kosten wurden zurückgegeben.')}
   item.v6130Crafted=true;item.v6130GeneticRecipe=c.recipe;s.inventory=Array.isArray(s.inventory)?s.inventory:[];s.inventory.push(item);save();try{v069SyncCurrencies?.()}catch(_){ }try{v441PaintResources?.()}catch(_){ }try{render?.()}catch(_){ }toast('🧩 Klassenset hergestellt!','success',`${item.icon||'🎁'} ${item.name} · im Inventar`);queueMicrotask(()=>{decorateForge();openSetPanel()})
 }finally{v6130CraftBusy=false}
}
function setCard(slot){const c=slotCost(slot),r=RECIPES[c.recipe],z=state(),e=Math.max(0,Number(z?.essences?.[c.recipe])||0),b=buds(),f=fragments(),g=Math.max(0,Number(s?.gold)||0),unlock=b>=c.buds,ok=unlock&&e>=c.essence&&f>=c.fragments&&g>=c.gold,slotVisual=setSlotVisual(slot);return `<div class="v6130-set-card ${unlock?'unlocked':''}"><div class="top"><div class="ico">${slotVisual}</div><div><h4>${esc(c.label)}</h4><small>${esc(r.name)}-Rezept</small></div></div><div class="recipe">🧬 ${c.essence}× ${esc(r.essence)}<br>⚔️ Freischaltung ab ${fmt(c.buds)} PvP-Buds · <b>Buds werden nicht verbraucht.</b></div><div class="v6130-costs"><div class="v6130-cost ${e>=c.essence?'ok':'bad'}">🧬 Essenz<b>${e}/${c.essence}</b></div><div class="v6130-cost ${f>=c.fragments?'ok':'bad'}">💠 Fragmente<b>${fmt(f)}/${fmt(c.fragments)}</b></div><div class="v6130-cost ${g>=c.gold?'ok':'bad'}">🪙 Gold<b>${fmt(g)}/${fmt(c.gold)}</b></div><div class="v6130-cost ${unlock?'ok':'bad'}">⚔️ PvP-Buds<b>${fmt(b)}/${fmt(c.buds)}</b></div></div><button type="button" data-v6130-craft="${slot}" ${ok?'':'disabled'}>${unlock?'Set-Teil herstellen':'PvP-Rezept gesperrt'}</button></div>`}
function panelHtml(){const si=setInfo(),bon=si.bonuses||{},z=state();return `<div class="v6130-set-head"><h3>🧩 ${esc(si.name)} · Klassenset</h3><p>GEZIELT HERSTELLEN · GENETIK + SCHMIEDE + PVP</p><div class="v6130-set-bonuses">${Object.values(bon).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><div class="v6130-set-res"><div><small>⚔️ PvP-Buds</small><b>${fmt(buds())}</b></div><div><small>💠 Samenfragmente</small><b>${fmt(fragments())}</b></div><div><small>🧩 Set getragen</small><b>${equippedSet()}/6</b></div></div><div class="v6130-set-grid">${Object.keys(SLOT_CFG).map(setCard).join('')}</div><div class="v6130-note"><b>Exklusiv in der Harzschmiede:</b> Fertige Klassenset-Teile droppen nicht mehr zufällig aus Quests, Dungeons oder PvP. Aktivitäten können selten zusätzliche Samenfragmente liefern; die passende Genetik-Essenz und PvP-Freischaltung bleiben Pflicht. Mystische Gegenstände bleiben weiterhin exklusiv für den mystischen Boss. Die Gold- und Fragmentkosten steigen in 50-Level-Stufen mit deinem Charakterlevel.</div>`}
function openSetPanel(){const body=document.querySelector('#forge .v667-forge-body');if(!body)return;body.classList.add('v6130-set-mode');let p=body.querySelector('#v6130ClassSetPanel');if(!p){p=document.createElement('div');p.id='v6130ClassSetPanel';body.appendChild(p)}p.innerHTML=panelHtml();body.querySelectorAll('.v667-tab').forEach(x=>x.classList.toggle('active',x.classList.contains('v6130-set-tab')))}
function renderSetIfOpen(){const body=document.querySelector('#forge .v667-forge-body');if(body?.classList.contains('v6130-set-mode'))openSetPanel()}
function decorateForge(){const body=document.querySelector('#forge .v667-forge-body'),tabs=body?.querySelector('.v667-tabs');if(!body||!tabs)return;if(!tabs.querySelector('.v6130-set-tab')){const b=document.createElement('button');b.type='button';b.className='v667-tab v6130-set-tab';b.dataset.v6130Settab='1';b.innerHTML='<span class="ic">🧩</span><span>KLASSENSET<small>Genetik · PvP · Fragmente</small></span>';tabs.appendChild(b)}}
function stamp(){}
document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.closest('[data-v6130-open]')){e.preventDefault();return openLab()}if(t.closest('[data-v6130-cross]')){e.preventDefault();return beginCross(t.closest('[data-v6130-cross]').dataset.v6130Cross)}if(t.closest('[data-v6130-settab]')){e.preventDefault();e.stopPropagation();return openSetPanel()}if(t.closest('[data-v6130-craft]')){e.preventDefault();return void craftSet(t.closest('[data-v6130-craft]').dataset.v6130Craft)}if(t.closest('#forge [data-v667-tab]')){document.querySelector('#forge .v667-forge-body')?.classList.remove('v6130-set-mode');decorateForge()}},true);
function refreshForge(){try{decorateForge();renderSetIfOpen()}catch(_){}}
state();installAchievements();refreshForge();stamp();
document.addEventListener('DOMContentLoaded',()=>{state();installAchievements();refreshForge();stamp()},{once:true});
window.addEventListener('pageshow',()=>{refreshForge();stamp()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{state();installAchievements();decorateGrow();refreshForge();stamp()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='forge')refreshForge()},{passive:true});
window.v6130GeneticsConfig={recipes:RECIPES,slots:SLOT_CFG};window.v6130RenderLabHtml=()=>labBodyHtml();
window.v6130QA=()=>({version:VERSION,pending:state()?.pending||null,totalCrosses:state()?.totalCrosses||0,totalEssences:state()?.totalEssences||0,buds:buds(),fragments:fragments(),growButton:!!document.querySelector('[data-v6130-open]'),forgeTab:!!document.querySelector('.v6130-set-tab'),hybrids:Object.values(RECIPES).map(r=>({id:r.hybrid,known:!!seed(r.hybrid),stock:Number(s?.grow?.seeds?.[r.hybrid])||0}))});
})();
