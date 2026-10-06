(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
 const AVATARS=Object.freeze({...V080_AVATARS});

 const toast=(title,type,text)=>{try{if(typeof v063Toast==='function')return v063Toast(title,type,text)}catch(e){}try{if(typeof v115Alert==='function')return v115Alert(text||title)}catch(e){}};
 const clone=x=>{try{return typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x))}catch(e){return x&&typeof x==='object'?{...x}:x}};
 const isFrost=()=>String(s?.playerClass||'')==='frost';
 const classOk=it=>!it?.classId||String(it.classId)===String(s?.playerClass||'');
 const isWeapon=it=>!!it&&String(it.slot||'')==='weapon'&&it.type!=='gem'&&it.type!=='scroll'&&it.type!=='material';
 const enchantOf=it=>(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant)||null;

 /* ---------- Four matching canonical avatars ---------- */
 try{if(typeof V080_AVATARS==='object')Object.assign(V080_AVATARS,AVATARS)}catch(e){}
 function avatarFor(classId){return AVATARS[String(classId||'')]||AVATARS.grower}
 try{v080AvatarFor=avatarFor}catch(e){}window.v080AvatarFor=avatarFor;window.V4153_CLASS_AVATARS=Object.freeze({...AVATARS});

 /* ---------- New class definition ---------- */
 try{
  classes.frost={
   name:'Bekiffter Frost-Todesritter',icon:'❄️',
   text:'Eiskalter Zweiklingen-Ritter. Stärke und Ausdauer. Waffe I zählt voll; Waffe II gibt 10 % ihrer Werte und kann einen Nebenhandtreffer auslösen.',
   bonus:{staerke:4,ausdauer:3}
  };
 }catch(e){}
 try{
  skillDefs.frost=[
   {id:'wucht',icon:'❄️',name:'Frostwucht',unlock:2,desc:'Eisige Wuchttreffer auf Basis der Barbar-Mechanik.',perRank:'+3 % Wuchtschlag-Chance'},
   {id:'fell',icon:'🛡️',name:'Eispanzer',unlock:5,desc:'Reduziert eingehenden Schaden.',perRank:'-4 % erhaltener Schaden'},
   {id:'raserei',icon:'🌨️',name:'Frost-Raserei',unlock:8,desc:'Erhöht den verursachten Gesamtschaden.',perRank:'+4 % Gesamtschaden'}
  ];
 }catch(e){}
 try{
  classSets.frost={name:'Frostgruft',className:'Bekiffter Frost-Todesritter',bonuses:{2:'2 Teile: +5 Stärke',4:'4 Teile: +10 % Lebenspunkte',6:'6 Teile: +8 % Wuchtschlag-Chance'}};
 }catch(e){}
 const FROST_GEAR=[
  {id:'fr_blade_a',name:'Frostharz-Klinge',slot:'weapon',icon:'⚔️',price:245,classId:'frost',bonus:{staerke:6},baseBonusV055:{staerke:6}},
  {id:'fr_blade_b',name:'Nebelreif-Klinge',slot:'weapon',icon:'🗡️',price:245,classId:'frost',bonus:{staerke:6},baseBonusV055:{staerke:6}},
  {id:'fr_helm',name:'Krone der Eisgruft',slot:'head',icon:'👑',price:215,classId:'frost',bonus:{ausdauer:4,staerke:2},baseBonusV055:{ausdauer:4,staerke:2}},
  {id:'fr_armor',name:'Rüstung des Frostnebels',slot:'body',icon:'🛡️',price:315,classId:'frost',bonus:{ausdauer:7},baseBonusV055:{ausdauer:7}},
  {id:'fr_boots',name:'Reifstiefel',slot:'boots',icon:'🥾',price:195,classId:'frost',bonus:{staerke:3,ausdauer:2},baseBonusV055:{staerke:3,ausdauer:2}}
 ];
 try{classGear.frost=FROST_GEAR.map(x=>({...x,bonus:{...x.bonus},baseBonusV055:{...x.baseBonusV055}}));if(Array.isArray(allClassGear)&&!allClassGear.some(x=>x?.classId==='frost'))allClassGear.push(...classGear.frost)}catch(e){}
 try{if(Array.isArray(v030Jewelry)&&!v030Jewelry.some(x=>x?.id==='ring_frost'))v030Jewelry.push({id:'ring_frost',name:'Frostharz-Ring',slot:'ring',icon:'💍',classId:'frost',bonus:{staerke:4}})}catch(e){}
 try{if(typeof V110_MYSTIC_NAMES==='object')V110_MYSTIC_NAMES.frost=['Frostharz-Lich','❄️']}catch(e){}
 try{if(typeof SET_PATTERN==='object'&&!SET_PATTERN.frost)SET_PATTERN.frost=clone(SET_PATTERN.grower)}catch(e){}
 try{if(typeof MYSTIC_SET_PATTERN==='object'&&!MYSTIC_SET_PATTERN.frost)MYSTIC_SET_PATTERN.frost=clone(MYSTIC_SET_PATTERN.grower)}catch(e){}
 try{
  if(typeof V314_BRANCHES==='object'&&!V314_BRANCHES.frost){
   V314_BRANCHES.frost=clone(V314_BRANCHES.grower);
   const names=[['❄️ FROSTWUCHT','Eisige Wucht und direkter Schaden'],['🧊 EISPANZER','Leben und Schadensreduktion'],['🌨️ FROSTRASEREI','Mehrfachtreffer und Kampftrieb']];
   V314_BRANCHES.frost.forEach((b,i)=>{b.title=names[i][0];b.theme=names[i][1]});
  }
 }catch(e){}

 /* Frost set-items use the Barbar stat budget but remain genuine Frost items. */
 try{
  if(typeof makeSetItem==='function'&&!window.__v4153SetItem){
   const base=makeSetItem;
   const wrapped=function(classId,slot){
    if(String(classId)!=='frost')return base.apply(this,arguments);
    let it=base('grower',slot);if(!it)return it;
    it={...it,id:`set_frost_${slot}_${Date.now()}_${Math.random()}`,classId:'frost',setId:'frost',setName:'Frostgruft'};
    it.name=String(it.name||'').replace(/Harzbrecher/g,'Frostgruft');
    try{window.v447ApplyItemCurve?.(it)}catch(e){}
    return it;
   };
   try{makeSetItem=wrapped}catch(e){}window.makeSetItem=wrapped;window.__v4153SetItem=true;
  }
 }catch(e){}

 /* ---------- Save compatibility / second physical weapon slot ---------- */
 function ensureState(){
  s.equipment=(s.equipment&&typeof s.equipment==='object')?s.equipment:{};
  if(!Object.prototype.hasOwnProperty.call(s.equipment,'weapon2'))s.equipment.weapon2=null;
  try{if(s.equipment.weapon2&&typeof normalizeItem==='function')s.equipment.weapon2=normalizeItem(s.equipment.weapon2)}catch(e){}
 }
 try{
  if(typeof normalizeState==='function'&&!window.__v4153Normalize){const base=normalizeState;normalizeState=function(){const r=base.apply(this,arguments);ensureState();return r};try{window.normalizeState=normalizeState}catch(e){}window.__v4153Normalize=true}
 }catch(e){}
 ensureState();

 function ensureWeapon2Slot(){
  const ch=document.getElementById('character'),grid=ch?.querySelector('.equipment-grid');if(!ch||!grid)return null;
  const frost=isFrost();
  ch.classList.toggle('v4153-frost',frost);

  /* V4.159: Waffe II is a Frost-only UI element, not a generic equipment slot.
     Remove the DOM node completely for the other three classes so no historical
     renderer/CSS can accidentally make an empty second weapon slot visible. */
  if(!frost){
   document.getElementById('slot-weapon2')?.remove();
   grid.querySelectorAll('.v4153-dual-note').forEach(x=>x.remove());
   const primary=document.getElementById('slot-weapon')?.querySelector('.slot-label');
   if(primary && /Waffe I|100 %/.test(primary.textContent||''))primary.textContent='Waffe';
   return null;
  }

  let slot=document.getElementById('slot-weapon2');
  if(!slot){
   slot=document.createElement('div');slot.className='slot';slot.id='slot-weapon2';
   const first=grid.querySelector('.equip-col');const w=document.getElementById('slot-weapon');
   if(first){
    const anchor=(w?.parentElement===first)?w.nextSibling:null;
    if(anchor&&anchor.parentElement===first)first.insertBefore(slot,anchor);
    else first.appendChild(slot);
   }
  }
  let note=grid.querySelector('.v4153-dual-note');
  if(!note){note=document.createElement('div');note.className='v4153-dual-note';note.textContent='❄️ Zweiklingen-Balance: Waffe I zählt zu 100 %. Waffe II gibt 10 % ihrer Attribute/Verzauberungen und schaltet Nebenhandtreffer frei. Sie zählt weiterhin nicht als zweiter Set-Platz.';const center=grid.querySelector('.center-hero');center?.appendChild(note)}
  return slot;
 }
 ensureWeapon2Slot();
 try{if(typeof slotLabels==='object')slotLabels.weapon2=['⚔️','Waffe II']}catch(e){}

 /* A physical second set weapon still counts as ONE logical weapon-set slot. */
 try{
  if(typeof equippedSetCount==='function'&&!window.__v4153SetCount){
   const base=equippedSetCount;
   equippedSetCount=function(classId){
    if(!isFrost())return base.apply(this,arguments);
    const id=String(classId||'');let n=0;
    Object.entries(s.equipment||{}).forEach(([slot,it])=>{if(!it||it.setId!==id)return;if(slot==='weapon2')return;n++});
    const primary=s.equipment?.weapon,secondary=s.equipment?.weapon2;
    if(secondary?.setId===id&&primary?.setId!==id)n++;
    return n;
   };
   try{window.equippedSetCount=equippedSetCount}catch(e){}window.__v4153SetCount=true;
  }
 }catch(e){}

 /* Frost dual-wield rule: Waffe I is the real main weapon (100 %).
    Waffe II is a true offhand: only 10 % of its attribute/enchant delta is added.
    This makes a good second weapon useful without creating a second full item budget. */
 try{
  if(typeof totalAttr==='function'&&!window.__v4153DualTotal){
   const base=totalAttr;
   totalAttr=function(k){
    ensureState();const a=s.equipment.weapon,b=s.equipment.weapon2;
    if(!isFrost()||!a||!b)return base.apply(this,arguments);
    let main=0,off=0,none=0;
    try{
     s.equipment.weapon=a;s.equipment.weapon2=null;main=Number(base.apply(this,arguments))||0;
     s.equipment.weapon=null;s.equipment.weapon2=b;off=Number(base.apply(this,arguments))||0;
     s.equipment.weapon=null;s.equipment.weapon2=null;none=Number(base.apply(this,arguments))||0;
    }finally{s.equipment.weapon=a;s.equipment.weapon2=b}
    return Math.round((main+(off-none)*.10)*100)/100;
   };
   try{window.totalAttr=totalAttr}catch(e){}window.__v4153DualTotal=true;
  }
 }catch(e){}
 try{
  if(typeof v030EnchantSum==='function'&&!window.__v4153DualEnchant){
   const base=v030EnchantSum;
   v030EnchantSum=function(effect){
    ensureState();const a=s.equipment.weapon,b=s.equipment.weapon2;
    if(!isFrost()||!a||!b)return base.apply(this,arguments);
    let main=0,off=0,none=0;
    try{
     s.equipment.weapon=a;s.equipment.weapon2=null;main=Number(base.apply(this,arguments))||0;
     s.equipment.weapon=null;s.equipment.weapon2=b;off=Number(base.apply(this,arguments))||0;
     s.equipment.weapon=null;s.equipment.weapon2=null;none=Number(base.apply(this,arguments))||0;
    }finally{s.equipment.weapon=a;s.equipment.weapon2=b}
    return main+(off-none)*.10;
   };
   try{window.v030EnchantSum=v030EnchantSum}catch(e){}window.__v4153DualEnchant=true;
  }
 }catch(e){}

 /* Character equipment summary displays the SAME 100 % main + 10 % offhand rule. */
 try{
  if(typeof v123GearTotals==='function'){
   v123GearTotals=function(){
    const t={staerke:0,geschick:0,intelligenz:0,ausdauer:0,glueck:0},a=s.equipment?.weapon,b=s.equipment?.weapon2;
    Object.entries(s.equipment||{}).forEach(([slot,it])=>{if(!it||slot==='weapon'||slot==='weapon2')return;COMBAT.forEach(k=>t[k]+=Number(it?.bonus?.[k])||0)});
    if(isFrost()&&a&&b)COMBAT.forEach(k=>t[k]+=(Number(a?.bonus?.[k])||0)+(Number(b?.bonus?.[k])||0)*.10);
    else{const w=a||b;if(w)COMBAT.forEach(k=>t[k]+=Number(w?.bonus?.[k])||0)}
    COMBAT.forEach(k=>t[k]=Math.round(t[k]*100)/100);
    return t;
   };
   try{window.v123GearTotals=v123GearTotals}catch(e){}
  }
 }catch(e){}

 /* ---------- Manual equip / comparison ---------- */
 function normalizeGear(it){try{window.v447ApplyItemCurve?.(it)}catch(e){}try{v122NormalizeSocketState?.(it)}catch(e){}return it}
 function score(it){if(!it)return-1;normalizeGear(it);const gem=it?.gem,e=(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant);let base=COMBAT.reduce((n,k)=>{let v=Number(it?.bonus?.[k])||0;if(gem?.stat===k)v-=Number(gem.value)||0;if(k==='glueck'&&e?.effect==='luck')v-=Number(e.value)||0;return n+Math.max(0,v)},0);try{if(typeof window.v6201MysticCompareValue==='function')base+=Math.max(0,Number(window.v6201MysticCompareValue(it))||0)}catch(e){}return base}
 function chooseWeaponTarget(){if(!s.equipment.weapon)return'weapon';if(!s.equipment.weapon2)return'weapon2';return score(s.equipment.weapon2)<score(s.equipment.weapon)?'weapon2':'weapon'}
 try{
  if(typeof window.equip==='function'&&!window.__v4153Equip){
   const base=window.equip;
   window.equip=function(i){
    ensureState();const it=s.inventory?.[i];
    if(!isFrost()||!isWeapon(it))return base.apply(this,arguments);
    if(!classOk(it))return toast('Falsche Klasse','warn',`Dieses Item ist nur für ${typeof classLabel==='function'?classLabel(it.classId):it.classId}.`);
    normalizeGear(it);const target=chooseWeaponTarget(),old=s.equipment[target]||null;
    s.equipment[target]=it;s.inventory.splice(i,1);if(old)s.inventory.push(old);
    try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
    refreshAll('equip');
    return true;
   };
   window.__v4153Equip=true;
  }
 }catch(e){}

 try{
  if(typeof window.v470CompareItem==='function'&&!window.__v4153Compare){
   const base=window.v470CompareItem;
   window.v470CompareItem=function(it){
    if(!isFrost()||!isWeapon(it))return base.apply(this,arguments);
    normalizeGear(it);if(it.classId&&it.classId!=='frost')return{state:'worse',mark:'⛔',label:'FALSCHE KLASSE',diff:null,reason:'Nicht für deine Klasse',newTotal:score(it),oldTotal:0,baseDiff:0};
    const a=s.equipment?.weapon,b=s.equipment?.weapon2,old=!a?null:!b?null:(score(a)<=score(b)?a:b),nt=score(it),ot=old?score(old):0,diff=Math.round((nt-ot)*100)/100;
    if(!a||!b)return{state:'free',mark:'▲',label:'FREIER WAFFENSLOT',diff:null,reason:'Waffe II gibt 10 % Attribute und schaltet Nebenhandtreffer frei',newTotal:nt,oldTotal:ot,baseDiff:diff};
    return{state:diff>0?'better':diff<0?'worse':'same',mark:diff>0?'▲':diff<0?'▼':'◆',label:diff>0?'BESSER':diff<0?'SCHLECHTER':'GLEICH',diff,reason:'Vergleich mit der schwächeren Waffe · Waffe I 100 %, Waffe II 10 % Attribute',newTotal:nt,oldTotal:ot,baseDiff:diff};
   };
   window.__v4153Compare=true;
  }
 }catch(e){}

 /* V6.233: canonical V4.80 auto-equip now owns Frost dual-wield too.
    Do not wrap window.v480AutoEquip again here: both visible Auto-Equip buttons,
    account guards and deferred persistence must use the same canonical action. */
 try{window.__v4153AutoEquip=true}catch(e){}

 /* ---------- UI / avatar surfaces ---------- */
 function paintWeapon2(){
  ensureState();const root=ensureWeapon2Slot();if(!root)return;
  const ch=document.getElementById('character');ch?.classList.toggle('v4153-frost',isFrost());
  if(!isFrost())return;
  const it=s.equipment.weapon2;root.className='slot'+(it?.rarity?(' '+it.rarity):'');
  let art=it?.icon||'⚔️';try{const u=window.v466ItemArtUri?.(it)||'';if(u)art=`<img class="v466-item-art v470-slot-art" src="${u}" alt="${String(it?.name||'Waffe II').replace(/["<>]/g,'')}">`}catch(e){}
  root.innerHTML=`<div class="slot-icon">${art}</div><div class="slot-label">Waffe II · 10 % Attribute</div><div class="slot-name">${it?it.name:'Leer'}</div>${it?`<div class="tiny">${typeof itemBonus==='function'?itemBonus(it):''}</div><div class="slot-actions"><button class="mini-btn" onclick="unequip('weapon2')">Ablegen</button><button class="mini-btn" onclick="sellEquipped('weapon2')">💰 ${typeof sellValue==='function'?sellValue(it):0}</button></div>`:''}`;
  root.onclick=e=>{if(e.target.closest('button'))return;try{v123OpenItem('weapon2')}catch(_){}};
  const primary=document.getElementById('slot-weapon')?.querySelector('.slot-label');if(primary)primary.textContent='Waffe I · 100 %';
 }
 function paintIdentity(){
  const ch=document.getElementById('character');ch?.classList.toggle('v4153-frost',isFrost());
  if(!isFrost())return;
  const title=document.getElementById('avatarTitle'),sub=document.getElementById('avatarSubtitle');
  if(title){let n='';try{n=v071CleanName(s.characterName||'')}catch(e){n=String(s.characterName||'')};title.textContent=n||classes.frost.name}
  if(sub)sub.textContent='Bekiffter Frost-Todesritter · Zweiklingen des Eisnebels';
 }
 function liveAvatar(classId){
  const id=String(classId||'grower');
  try{
   /* After later class patches load, window.v080AvatarFor is the live authority.
      During this V4.159 script's own startup it still points to avatarFor, so
      there is no recursion and the historical classes keep working unchanged. */
   const fn=window.v080AvatarFor;
   if(typeof fn==='function' && fn!==avatarFor){
    const u=fn(id);
    if(u)return u;
   }
  }catch(e){}
  return avatarFor(id);
 }
 function refreshAvatars(){
  try{
   document.querySelectorAll('.v080-class-avatar-img').forEach(img=>{
    const u=liveAvatar(s.playerClass);
    if(u && img.getAttribute('src')!==u)img.src=u;
    img.alt=classes?.[s.playerClass]?.name||'Grow Legends Charakter';
   });
   document.querySelectorAll('[data-v029-class],[data-v200-class],[data-v4135-class],[data-v4136-class]').forEach(card=>{
    const id=card.dataset.v029Class||card.dataset.v200Class||card.dataset.v4135Class||card.dataset.v4136Class;
    const img=card.querySelector('img');
    const u=liveAvatar(id);
    if(img&&u&&img.getAttribute('src')!==u)img.src=u;
   });
   document.querySelectorAll('img').forEach(img=>{
    const raw=String(img.getAttribute('src')||'');
    if(raw.includes('barbar_avatar.png'))img.src=liveAvatar('grower');
    else if(raw.includes('schuetze_avatar.png'))img.src=liveAvatar('scout');
    else if(raw.includes('magier_avatar.png'))img.src=liveAvatar('bruiser');
   });
  }catch(e){}
 }
 function refreshAll(reason='refresh'){
  ensureWeapon2Slot();
  if(!document.getElementById('character')?.classList.contains('active'))return false;
  paintWeapon2();paintIdentity();refreshAvatars();
  try{window.v470PaintEquipmentSlots?.()}catch(e){}try{window.v4103DecorateItemSurfaces?.()}catch(e){}try{window.v459ArrangeCharacter?.()}catch(e){}try{window.v459CompactInventory?.()}catch(e){}
  /* V6.102: inventory already rendered by the active character renderer. */
  return true;
 }
 window.v4153RefreshClassAvatars=refreshAvatars;window.v4153RefreshFrostUi=refreshAll;

 /* Public profile slot label and PvP fallback class detection. */
 try{
  if(typeof v074EquipmentHtml==='function'&&!window.__v4153ProfileEquipment){const base=v074EquipmentHtml;v074EquipmentHtml=function(eq){if(!eq?.weapon2)return base.apply(this,arguments);const c={...eq,offhand:{...eq.weapon2,slot:'offhand'}};delete c.weapon2;return String(base(c)).replace(/Nebenhand/g,'Waffe II')};try{window.v074EquipmentHtml=v074EquipmentHtml}catch(e){}window.__v4153ProfileEquipment=true}
 }catch(e){}
 try{
  if(typeof v204ClassIdFromProfile==='function'&&!window.__v4153PvpClass){const base=v204ClassIdFromProfile;v204ClassIdFromProfile=function(p){if(p?.class_id==='frost')return'frost';const n=String(p?.class_name||'').toLowerCase();if(n.includes('frost')||n.includes('todesritter'))return'frost';return base.apply(this,arguments)};try{window.v204ClassIdFromProfile=v204ClassIdFromProfile}catch(e){}window.__v4153PvpClass=true}
 }catch(e){}
 try{if(typeof v072ClassName==='function'){const base=v072ClassName;v072ClassName=function(){return classes?.[s.playerClass]?.name||base.apply(this,arguments)};try{window.v072ClassName=v072ClassName}catch(e){}}}catch(e){}

 /* V8.009: shared character lifecycle owns repaint; no global render wrapper. */
 try{
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')refreshAll('nav-character')},{passive:true});window.__v4153Go='v7119-event';window.__v4153Render='retired'
 }catch(e){}

 function stamp(){}
 window.v4153ClassDiagnostics=()=>({version:V.short,classId:s?.playerClass,classes:Object.keys(classes||{}),avatar:liveAvatar(s?.playerClass),weapon1:!!s?.equipment?.weapon,weapon2:!!s?.equipment?.weapon2,effectiveStrength:typeof totalAttr==='function'?totalAttr('staerke'):null,setCount:typeof equippedSetCount==='function'?equippedSetCount(s?.playerClass):null});
 ensureState();ensureWeapon2Slot();refreshAll('startup');stamp();
 document.addEventListener('DOMContentLoaded',()=>{refreshAll('dom');stamp()},{once:true});
 window.addEventListener('growlegends:account-ready',()=>{ensureState();refreshAll('account-ready');stamp()});
 window.addEventListener('pageshow',()=>{refreshAll('pageshow');stamp()},{passive:true});
})();
