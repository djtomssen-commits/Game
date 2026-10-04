(()=>{
 'use strict';
 const VERSION='V4.103 Stable',SHORT='V4.103';
 const SLOT_LABEL={weapon:'Waffe',weapon2:'Waffe II',head:'Kopf',body:'Körper',chest:'Brust',hands:'Hände',legs:'Beine',boots:'Schuhe',feet:'Füße',ring:'Ring',amulet:'Amulett',offhand:'Nebenhand'};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clean=v=>String(v||'Item').replace(/^(Normal|Gewöhnlich|Rare|Selten|Episch|Legendär|Mystisch|Prismatisch):\s*/i,'').trim();
 const ITEM_REGISTRY=window.__V4103_ITEM_REGISTRY__ instanceof Map?window.__V4103_ITEM_REGISTRY__:new Map();
 window.__V4103_ITEM_REGISTRY__=ITEM_REGISTRY;
 function itemKey(it){
  if(!it)return'';
  try{return String(it.id||it.uid||it.item_id||[it.name||'',it.slot||'',it.quality||it.rarity||'',it.dropLevel||'',JSON.stringify(it.bonus||{}),it.gem?.name||'',it.enchant?.name||''].join('|'))}
  catch(e){return String(it?.name||'')}
 }
 function registerItem(it){const k=itemKey(it);if(k)ITEM_REGISTRY.set(k,it);return k}
 function itemFromKey(k){return ITEM_REGISTRY.get(String(k||''))||null}
 function prism(it){return !!(it&&(it.v488Prismatic===true||String(it.quality||'').toLowerCase()==='prismatic'||/prismatic/i.test(String(it.rarity||''))))}
 function qkey(it){if(prism(it))return'prismatic';try{return v240QualityKey(it)}catch(e){}const x=(String(it?.quality||'')+' '+String(it?.rarity||'')).toLowerCase();if(/cyan|myst|myth/.test(x))return'cyan';if(/orange|legend/.test(x))return'orange';if(/purple|epic/.test(x))return'purple';if(/blue|rare/.test(x))return'blue';if(/green|uncommon/.test(x))return'green';return'gray'}
 function qlabel(it){if(prism(it))return'Prismatisch';try{return v240QualityLabel(it)}catch(e){}return{gray:'Normal',green:'Gewöhnlich',blue:'Selten',purple:'Episch',orange:'Legendär',cyan:'Mystisch'}[qkey(it)]||'Normal'}
 function art(it){let u='';try{u=typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri(it):''}catch(e){}return u?`<img class="v466-item-art" src="${u}" alt="${esc(clean(it?.name))}">`:`<span class="v4103-item-fallback">${esc(it?.icon||'🎁')}</span>`}
 function baseStats(it){try{if(typeof v123BaseBonusText==='function')return v123BaseBonusText(it)}catch(e){}const map={staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück'};return Object.entries(it?.bonus||{}).filter(([,v])=>Number(v)).map(([k,v])=>`${Number(v)>=0?'+':''}${Math.round(Number(v))} ${map[k]||k}`).join(' · ')||'Keine Grundwerte'}
 function weaponDamageText(it){const mn=Number(it?.weaponDamageMin)||0,mx=Number(it?.weaponDamageMax)||0;return mn>0&&mx>=mn?`${Math.round(mn)}–${Math.round(mx)} Schaden`:''}
 function gemText(g){if(!g)return'';if(typeof g==='string')return g;let stat=g.stat||'';try{if(typeof v030StatLabel==='function')stat=v030StatLabel(stat)}catch(e){}return `${g.name||g.label||'Edelstein'}${Number(g.value)?` · +${g.value} ${stat}`:''}`}
 function enchText(e){if(!e)return'';if(typeof e==='string')return e;let val='';try{if(typeof v030EffectLabel==='function')val=v030EffectLabel(e.effect,e.value)}catch(_){}return `${e.name||e.label||'Verzauberung'}${val?` · ${val}`:''}`}
 function specialText(it){try{if(typeof v296MysticSpecialText==='function'&&it?.mysticSpecial)return v296MysticSpecialText(it)}catch(e){}try{if(typeof v299PublicMysticSpecial==='function')return v299PublicMysticSpecial(it)}catch(e){}const sp=it?.mysticSpecial||it?.mystic_special||it?.special;if(!sp)return'';return typeof sp==='string'?sp:String(sp.label||sp.name||'Mystischer Spezialeffekt')}
 function renderItem(it,opt={}){
  if(!it)return'';const q=qkey(it),slot=opt.slot||it.slot||'',lvl=Math.max(1,Math.min(300,Math.floor(Number(it.dropLevel||opt.level||0)||1))),e=it.enchant||(Array.isArray(it.enchants)?it.enchants[0]:null),sp=specialText(it),ctx=opt.context||'generic',ik=registerItem(it);
  return `<div class="v4103-item-card ${prism(it)?'v4103-prismatic':''} ${opt.extraClass||''}" data-v4103-item-current="1" data-v4103-item-key="${esc(ik)}" data-v4103-item-context="${esc(ctx)}" data-v4103-quality="${esc(q==='prismatic'?'prismatic':q)}"><div class="v4103-item-slot">${esc(SLOT_LABEL[slot]||slot||'Gegenstand')}</div><div class="v4103-item-head"><div class="v4103-item-art">${art(it)}</div><div><div class="v4103-item-name">${esc(it.name||'Gegenstand')}</div><div class="v4103-item-rarity">${esc(qlabel(it))}</div><div class="v4103-item-meta">Lv. ${lvl}${it.classId?` · ${esc(typeof classLabel==='function'?classLabel(it.classId):it.classId)}`:''}</div></div></div><div class="v4103-item-stats">${weaponDamageText(it)?`<div class="v4103-weapon-range">⚔️ ${esc(weaponDamageText(it))}</div>`:''}<div>${esc(baseStats(it))}</div></div><div class="v4103-item-upgrades">${it.gem?`<div class="v4103-item-chip gem">💎 ${esc(gemText(it.gem))}</div>`:''}${e?`<div class="v4103-item-chip enchant">📜 ${esc(enchText(e))}</div>`:''}${it.setName?`<div class="v4103-item-chip">◆ ${esc(it.setName)}-Set</div>`:''}${sp?`<div class="v4103-item-chip special">✨ ${esc(sp)}</div>`:''}${prism(it)?`<div class="v4103-item-chip prism">🌈 Prismatisch${it.v488Bound?' · gebunden':''}</div>`:''}</div></div>`;
 }
 window.v4103RenderItemCard=renderItem;
 window.v4103ItemQuality=qkey;

 /* Public profiles must preserve exactly the fields required by the modern renderer. */
 v074SafeEquipment=function(){const out={};Object.entries(s.equipment||{}).forEach(([slot,it])=>{if(!it)return;out[slot]={name:String(it.name||'Gegenstand').slice(0,120),icon:String(it.icon||'🎁').slice(0,24),slot:String(it.slot||slot).slice(0,24),classId:it.classId||null,quality:String(it.quality||'gray').slice(0,30),rarity:String(it.rarity||'').slice(0,40),dropLevel:Number(it.dropLevel)||null,bonus:{...(it.bonus||{})},gem:it.gem||null,enchant:it.enchant||(Array.isArray(it.enchants)?it.enchants[0]:null),setName:it.setName||null,mysticSpecial:it.mysticSpecial||it.mystic_special||it.special||null,v488Prismatic:it.v488Prismatic===true,v488EssencePct:Number(it.v488EssencePct)||0,v488Bound:it.v488Bound===true};});return out};
 v074EquipmentHtml=function(eq){const entries=Object.entries(eq||{}).filter(([,it])=>!!it);if(!entries.length)return'<div class="v072-empty">Keine Ausrüstung sichtbar.</div>';return `<div class="v4103-profile-equipment">${entries.map(([slot,it])=>renderItem({...it,slot:it.slot||slot},{slot,context:'player-profile'})).join('')}</div>`};
 try{window.v074SafeEquipment=v074SafeEquipment;window.v074EquipmentHtml=v074EquipmentHtml}catch(e){}

 /* Quest and dungeon item rewards share the exact same item presentation. */
 if(typeof v240ItemRewardHtml==='function'&&!window.__v4103RewardRenderer){v240ItemRewardHtml=function(it){return renderItem(it,{slot:it?.slot,context:'reward',extraClass:'v240-loot-item'});};try{window.v240ItemRewardHtml=v240ItemRewardHtml}catch(e){}window.__v4103RewardRenderer=true}

 function markCard(card,it,ctx){if(!card||!it)return;card.dataset.v4103ItemCurrent='1';card.dataset.v4103ItemKey=registerItem(it);card.dataset.v4103ItemContext=ctx;card.dataset.v4103Quality=qkey(it)}
 function putArt(box,it,forge=false){if(!box||!it)return;let u='';try{u=window.v466ItemArtUri?.(it)||''}catch(e){}if(!u)return;let img=box.querySelector(':scope > img.v466-item-art');if(!img){img=document.createElement('img');img.className='v466-item-art';box.replaceChildren(img)}img.src=u;img.alt=clean(it.name);if(forge)box.classList.add('v4103-forge-art')}
 function decorate(){
  const relevant=!!document.querySelector('#character.active,#shop.active,#forge.active,#harzForge.active,#v488Forge.active,#v074ProfileContent:not(:empty)');if(!relevant)return;
  try{document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((c,i)=>{const it=s.inventory?.[i];if(it){markCard(c,it,'inventory');putArt(c.querySelector('.v459-inv-icon'),it)}})}catch(e){}
  try{Object.entries(s.equipment||{}).forEach(([slot,it])=>{const c=document.getElementById('slot-'+slot);if(c&&it){markCard(c,it,'equipment');putArt(c.querySelector('.slot-icon'),it)}})}catch(e){}
  try{document.querySelectorAll('#v057WeaponGrid .shop-item').forEach((c,i)=>{const it=s.weaponShop?.[i];if(it){markCard(c,it,'weapon-shop');putArt(c.querySelector('.shop-icon,.v41-shop-icon'),it)}});document.querySelectorAll('#v057MagicGrid .shop-item').forEach((c,i)=>{const it=s.magicShop?.[i];if(it){markCard(c,it,'magic-shop');putArt(c.querySelector('.shop-icon,.v41-shop-icon'),it)}})}catch(e){}
  try{document.querySelectorAll('#character #v030Materials .inventory-grid > .inv-item').forEach((c,i)=>{const it=s.materials?.[i];if(it)markCard(c,it,'materials')})}catch(e){}
  try{document.querySelectorAll('#v488ForgeInventory [data-v488-key]').forEach(c=>{const key=String(c.dataset.v488Key||''),it=(s.inventory||[]).find(x=>String(x?.id||'')===key);if(it){markCard(c,it,'forge');const box=c.querySelector('.ico');if(box)putArt(box,it,true)}})}catch(e){}
  try{document.querySelectorAll('.v240-loot-item[data-v4103-item-current="1"],#v074ProfileContent .v4103-item-card').forEach(c=>c.dataset.v4103ItemCurrent='1')}catch(e){}
 }
 window.v4103DecorateItemSurfaces=decorate;


 const STAT_LABEL={
  staerke:'Stärke',ausdauer:'Ausdauer',geschick:'Geschick',intelligenz:'Intelligenz',glueck:'Glück',
  kraft:'Kraft',leben:'Leben',hp:'Lebenspunkte',schaden:'Schaden',armor:'Rüstung',ruestung:'Rüstung',
  crit:'Krit',krit:'Krit',kritisch:'Krit',lifesteal:'Lebensraub',lebensraub:'Lebensraub',
  dodge:'Ausweichen',ausweichen:'Ausweichen',block:'Block',tempo:'Tempo'
 };
 function statLabel(k){try{if(typeof window.v030StatLabel==='function')return window.v030StatLabel(k)}catch(e){}return STAT_LABEL[k]||String(k||'Wert').replace(/_/g,' ')}
 function enchantOf(it){return it?.enchant||(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:null)||null}
 function baseMap(it){
  const lock=it?.v429StatLock?.native;
  if(lock&&typeof lock==='object'){
   const out={};Object.entries(lock).forEach(([k,v])=>{const n=Number(v);if(Number.isFinite(n)&&n!==0)out[k]=n});return out;
  }
  const out={};Object.entries(it?.bonus||{}).forEach(([k,v])=>{const n=Number(v);if(Number.isFinite(n)&&n!==0)out[k]=n});
  const g=it?.gem;if(g?.stat&&Number(g.value)){out[g.stat]=(Number(out[g.stat])||0)-Number(g.value);if(!out[g.stat])delete out[g.stat]}
  const e=enchantOf(it);if(e?.effect==='luck'&&Number(e.value)){out.glueck=(Number(out.glueck)||0)-Number(e.value);if(!out.glueck)delete out.glueck}
  return out;
 }
 function totalCompareScore(it){
  if(!it)return 0;
  try{window.v447ApplyItemCurve?.(it)}catch(e){}
  const base=baseMap(it),cls=String(s?.playerClass||it?.classId||'grower');
  const primary=cls==='scout'?'geschick':(cls==='bruiser'||cls==='summoner')?'intelligenz':'staerke';
  const weights={staerke:.35,geschick:.35,intelligenz:.35,ausdauer:2,glueck:1,ruestung:1.2,armor:1.2};
  weights[primary]=6;
  let score=Object.entries(base).reduce((sum,[k,v])=>sum+(Number(v)||0)*(weights[k]??1),0);
  const g=it?.gem;
  if(g?.stat&&Number(g.value))score+=Number(g.value)*(weights[g.stat]??1);
  const e=enchantOf(it),v=Number(e?.value)||0;
  if(e?.effect==='primaryPct')score+=v*3.2;
  else if(e?.effect==='crit')score+=v*1.7;
  else if(e?.effect==='damageReduce')score+=v*2.2;
  else if(e?.effect==='luck')score+=v;
  try{
   if(typeof window.v6201MysticCompareValue==='function')score+=Math.max(0,Number(window.v6201MysticCompareValue(it))||0);
  }catch(e){}
  return Math.round(score*10)/10;
 }
 window.v4103TotalCompareScore=totalCompareScore;
 function fmtNum(n){const x=Number(n)||0;return `${x>0?'+':''}${Math.round(x*100)/100}`}
 function comparisonRows(clicked,equipped,isClicked){
  const a=baseMap(clicked),b=baseMap(equipped),keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
  const rows=[];
  const cmn=Number(clicked?.weaponDamageMin)||0,cmx=Number(clicked?.weaponDamageMax)||0,emn=Number(equipped?.weaponDamageMin)||0,emx=Number(equipped?.weaponDamageMax)||0;
  if(cmn>0&&cmx>=cmn){
   const ca=(cmn+cmx)/2,ea=emn>0&&emx>=emn?(emn+emx)/2:0,d=ca-ea,cls=d>0?'better':d<0?'worse':'same',arrow=d>0?'↑':d<0?'↓':'=',delta=d===0?'':` ${d>0?'+':''}${Math.round(d*10)/10} Ø`;
   rows.push(`<div class="v4103-compare-stat weapon"><span>Waffenschaden</span><b>${Math.round(cmn)}–${Math.round(cmx)}</b>${isClicked?`<em class="${cls}">${arrow}${delta}</em>`:''}</div>`);
  }
  if(!keys.length&&!rows.length)return '<div class="v4103-compare-empty">Keine Grundwerte</div>';
  rows.push(...keys.map(k=>{
   const cv=Number(a[k])||0,ev=Number(b[k])||0,d=cv-ev;
   const cls=d>0?'better':d<0?'worse':'same',arrow=d>0?'↑':d<0?'↓':'=',delta=d===0?'':` ${d>0?'+':''}${Math.round(d*100)/100}`;
   return `<div class="v4103-compare-stat"><span>${esc(statLabel(k))}</span><b>${fmtNum(cv)}</b>${isClicked?`<em class="${cls}">${arrow}${delta}</em>`:''}</div>`;
  }));
  return rows.join('');
 }
 function attachmentHtml(it,type){
  if(type==='gem'){
   if(!it?.gem)return '<div class="v4103-compare-none">Kein Stein eingesetzt</div>';
   return `<div class="v4103-compare-attach gem">💎 ${esc(gemText(it.gem))}</div>`;
  }
  const e=it?.enchant||(Array.isArray(it?.enchants)?it.enchants[0]:null);
  if(!e)return '<div class="v4103-compare-none">Keine VZ-Rolle eingesetzt</div>';
  return `<div class="v4103-compare-attach enchant">📜 ${esc(enchText(e))}</div>`;
 }
 function totalVerdictHtml(clicked,equipped){
  const cs=totalCompareScore(clicked),es=totalCompareScore(equipped),d=Math.round((cs-es)*10)/10;
  const cls=d>0?'better':d<0?'worse':'same',arrow=d>0?'↑':d<0?'↓':'=',label=d>0?'Insgesamt besser':d<0?'Insgesamt schlechter':'Insgesamt gleichwertig';
  const detail=d===0?'':` · ${d>0?'+':''}${d} Vergleichswert`;
  return `<div class="v4103-total-verdict ${cls}"><span>Gesamt inkl. Stein + VZ + Spezial</span><b>${arrow} ${label}${detail}</b></div>`;
 }
 function extraHtml(it){
  const rows=[];
  if(it?.setName)rows.push(`◆ ${esc(it.setName)}-Set`);
  const sp=specialText(it);if(sp)rows.push(`✨ ${esc(sp)}`);
  if(prism(it))rows.push(`🌈 Prismatisch${it.v488Bound?' · gebunden':''}`);
  return rows.length?`<div class="v4103-compare-extra">${rows.map(x=>`<div>${x}</div>`).join('')}</div>`:'';
 }
 function compareItemPanel(it,equipped,title,isClicked){
  if(!it)return `<section class="v4103-compare-item empty"><div class="v4103-compare-kicker">${esc(title)}</div><div class="v4103-compare-empty">Kein Item ausgerüstet</div></section>`;
  const slot=String(it.slot||'');
  return `<section class="v4103-compare-item ${isClicked?'clicked':'equipped'}" data-quality="${esc(qkey(it))}">
   <div class="v4103-compare-kicker">${esc(title)}</div>
   <div class="v4103-compare-head"><div class="v4103-compare-art">${art(it)}</div><div><div class="v4103-compare-name">${esc(it.name||'Gegenstand')}</div><div class="v4103-compare-meta">${esc(qlabel(it))} · ${esc(SLOT_LABEL[slot]||slot||'Gegenstand')}</div></div></div>
   <div class="v4103-compare-block"><strong>Grundwerte</strong>${comparisonRows(it,equipped,isClicked)}</div>
   <div class="v4103-compare-block"><strong>Stein</strong>${attachmentHtml(it,'gem')}</div>
   <div class="v4103-compare-block"><strong>VZ-Rolle</strong>${attachmentHtml(it,'enchant')}</div>
   ${isClicked?totalVerdictHtml(it,equipped):''}
   ${extraHtml(it)}
  </section>`;
 }
 function ensureCompareOverlay(){
  let ov=document.getElementById('v4103CompareOverlay');if(ov)return ov;
  ov=document.createElement('div');ov.id='v4103CompareOverlay';
  ov.innerHTML='<div class="v4103-compare-dialog" role="dialog" aria-modal="true"><button type="button" class="v4103-compare-close" aria-label="Schließen">×</button><div id="v4103CompareBody"></div></div>';
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest?.('.v4103-compare-close'))ov.classList.remove('show')});
  document.body.appendChild(ov);return ov;
 }
 function equippedFor(it){const slot=String(it?.slot||'');return slot?(s?.equipment?.[slot]||null):null}
 function inventoryIndexOf(it){
  const arr=Array.isArray(s?.inventory)?s.inventory:[];
  const key=itemKey(it);
  let idx=arr.findIndex(x=>x===it);
  if(idx<0)idx=arr.findIndex(x=>itemKey(x)===key);
  return idx;
 }
 function inventoryActionsHtml(it,context){
  if(String(context)!=='inventory')return '';
  const idx=inventoryIndexOf(it);
  if(idx<0)return '';
  let sell=0;try{sell=typeof sellValue==='function'?Number(sellValue(it))||0:0}catch(e){}
  return `<div class="v4103-compare-actions" data-index="${idx}">
    <button type="button" class="btn v4103-equip-item">Anlegen</button>
    <button type="button" class="btn gold v4103-sell-item">💰 ${Math.round(sell)}</button>
  </div>`;
 }
 function equipmentSlotOf(it){
  const key=itemKey(it);
  const entries=Object.entries(s?.equipment||{});
  let hit=entries.find(([,x])=>x===it);
  if(!hit)hit=entries.find(([,x])=>x&&itemKey(x)===key);
  return hit?.[0]||'';
 }
 function equipmentActionsHtml(it,context){
  if(String(context)!=='equipment')return '';
  const slot=equipmentSlotOf(it);
  if(!slot)return '';
  return `<div class="v4103-compare-actions" data-slot="${esc(slot)}">
    <button type="button" class="btn secondary v4103-unequip-item">Gegenstand ablegen</button>
  </div>`;
 }
 function bindCompareActions(ov,it,context){
  if(String(context)==='inventory'){
   const idx=inventoryIndexOf(it);if(idx<0)return;
   const equip=ov.querySelector('.v4103-equip-item');
   const sell=ov.querySelector('.v4103-sell-item');
   if(equip)equip.onclick=()=>{ov.classList.remove('show');try{window.equip?.(idx)}catch(e){}};
   if(sell)sell.onclick=()=>{ov.classList.remove('show');try{window.sellItem?.(idx)}catch(e){}};
   return;
  }
  if(String(context)==='equipment'){
   const slot=equipmentSlotOf(it);if(!slot)return;
   const unequipBtn=ov.querySelector('.v4103-unequip-item');
   if(unequipBtn)unequipBtn.onclick=()=>{ov.classList.remove('show');try{window.unequip?.(slot)}catch(e){}};
  }
 }
 function openCompare(it,context='generic'){
  if(!it)return false;
  try{window.v447ApplyItemCurve?.(it)}catch(e){}
  const ctx=String(context||'generic');
  const equipped=equippedFor(it);
  try{if(equipped)window.v447ApplyItemCurve?.(equipped)}catch(e){}
  registerItem(it);if(equipped)registerItem(equipped);
  const ov=ensureCompareOverlay(),body=ov.querySelector('#v4103CompareBody'),same=equipped&&itemKey(equipped)===itemKey(it);
  if(ctx==='equipment'){
   body.innerHTML=`<div class="v4103-compare-title">Angelegter Gegenstand</div>
    ${compareItemPanel(it,null,'Angelegt',false)}
    ${equipmentActionsHtml(it,ctx)}`;
  }else{
   body.innerHTML=`<div class="v4103-compare-title">Item vergleichen</div>
    ${compareItemPanel(equipped,null,same?'Angelegt · dieses Item':'Angelegt',false)}
    <div class="v4103-compare-divider"><span>VERGLEICH</span></div>
    ${compareItemPanel(it,equipped,same?'Angeklickt · identisch':'Angeklickt',true)}
    ${inventoryActionsHtml(it,ctx)}
    ${equipmentActionsHtml(it,ctx)}
    <div class="v4103-compare-legend"><span class="better">↑ besser</span><span class="worse">↓ schlechter</span><span class="same">= gleich</span><small>Stein und VZ-Rolle werden separat gezeigt und nicht in die Grundwert-Pfeile eingerechnet.</small></div>`;
  }
  ov.dataset.context=ctx;bindCompareActions(ov,it,ctx);ov.classList.add('show');return true;
 }
 window.v4103OpenItemCompare=openCompare;
 window.v4103CloseItemCompare=()=>document.getElementById('v4103CompareOverlay')?.classList.remove('show');
 if(!window.__V4103_COMPARE_DELEGATE__){
  window.__V4103_COMPARE_DELEGATE__=true;
  document.addEventListener('click',e=>{
   const t=e.target instanceof Element?e.target:null;if(!t)return;
   if(t.closest('button,a,input,select,textarea,label'))return;
   const card=t.closest('[data-v4103-item-current="1"][data-v4103-item-key],.v4103-item-card,.v240-loot-item,.v395-loot-card.item,#character #inventory .inv-item,#shop .shop-item');if(!card)return;
   let it=itemFromKey(card.dataset.v4103ItemKey);
   if(!it){
    const title=String(card.querySelector('.v4103-item-name,.v240-loot-name,.slot-name,.shop-name,b')?.textContent||'').trim();
    if(title){
     const pool=[...(s?.inventory||[]),...Object.values(s?.equipment||{}).filter(Boolean),...(s?.weaponShop||[]),...(s?.magicShop||[])];
     it=[...pool].reverse().find(x=>String(x?.name||'').trim()===title)||null;
     if(it){card.dataset.v4103ItemKey=registerItem(it);card.dataset.v4103ItemCurrent='1'}
    }
   }
   if(!it)return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openCompare(it,card.dataset.v4103ItemContext||'generic');
  },true);
 }


 /* Day-7 login reward: once the item has been credited to inventory, replace the text-only reveal with the same current card. */
 let loginBusy=false;
 function upgradeLoginReveal(){if(loginBusy)return;const box=document.getElementById('v484Reveal');if(!box||!box.classList.contains('show')||box.querySelector('[data-v4103-item-current="1"]'))return;const title=String(box.querySelector('h3')?.textContent||'').trim();if(!title)return;const it=[...(s.inventory||[])].reverse().find(x=>String(x?.name||'').trim()===title);if(!it)return;loginBusy=true;try{box.innerHTML=renderItem(it,{slot:it.slot,context:'daily-login'})}finally{loginBusy=false}}

 let queued=0;function queueDecorate(){if(queued)return;queued=requestAnimationFrame(()=>{queued=0;decorate();upgradeLoginReveal()})}
 try{if(typeof render==='function'&&!window.__v4103Render){const base=render;render=function(){const r=base.apply(this,arguments);queueDecorate();return r};try{window.render=render}catch(e){}window.__v4103Render=true}}catch(e){}
 try{if(typeof renderInventory==='function'&&!window.__v4103Inventory){const base=renderInventory;renderInventory=function(){const r=base.apply(this,arguments);queueDecorate();return r};try{window.renderInventory=renderInventory}catch(e){}window.__v4103Inventory=true}}catch(e){}
 try{if(typeof renderShop==='function'&&!window.__v4103Shop){const base=renderShop;renderShop=function(){const r=base.apply(this,arguments);queueDecorate();return r};try{window.renderShop=renderShop}catch(e){}window.__v4103Shop=true}}catch(e){}
 /* V6.97: body-wide item observer retired; render hooks remain. */

 /* Runtime UI audit: a visible known item surface may never silently fall back to legacy art. */
 function runtimeAudit(){decorate();const bad=[];const check=(sel,name)=>{const a=[...document.querySelectorAll(sel)].filter(x=>x.offsetParent!==null);a.forEach(x=>{if(x.dataset.v4103ItemCurrent!=='1')bad.push(name)})};check('#character #inventory .inventory-grid > .inv-item','Inventar');check('#shop .shop-item','Händler');check('#v488ForgeInventory [data-v488-key]','Harzschmiede');check('#v074ProfileContent .v4103-item-card','Spielerprofil');if(bad.length){try{const uid=String((typeof v073User!=='undefined'&&v073User?.id)||s?.__accountOwnerId||'local'),k='growLegendsQA:v4103:'+uid+':runtime',a=JSON.parse(localStorage.getItem(k)||'[]');const detail='Legacy Itemdarstellung erkannt: '+[...new Set(bad)].join(', ');if(!a.some(x=>x.code==='LEGACY_ITEM_RENDERER'&&x.detail===detail&&Date.now()-Number(x.at||0)<15000)){a.push({at:Date.now(),code:'LEGACY_ITEM_RENDERER',detail,severity:'error'});while(a.length>40)a.shift();localStorage.setItem(k,JSON.stringify(a))}}catch(e){}}return bad}
 window.v4103AuditItemUi=runtimeAudit;

 function stamp(){}
 decorate();upgradeLoginReveal();stamp();
 document.addEventListener('DOMContentLoaded',()=>{decorate();upgradeLoginReveal();stamp()},{once:true});
 window.addEventListener('growlegends:account-ready',()=>{decorate();upgradeLoginReveal();stamp()},{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='shop'||id==='forge'||id==='harzForge'){decorate();upgradeLoginReveal();stamp()}},{passive:true});
 window.addEventListener('pageshow',()=>{decorate();upgradeLoginReveal();stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){decorate();runtimeAudit();upgradeLoginReveal();stamp()}},{passive:true});
})();
