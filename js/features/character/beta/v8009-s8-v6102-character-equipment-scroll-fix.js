(function(){
'use strict';
if(window.__V6102_CHARACTER_EQUIPMENT_SCROLL_FIX__)return;
window.__V6102_CHARACTER_EQUIPMENT_SCROLL_FIX__=true;

const SLOT_META={
  head:['🧢','Kopf'],
  weapon:['⚔️','Waffe'],
  weapon2:['⚔️','Waffe II'],
  ring:['💍','Ring'],
  body:['🥋','Rüstung'],
  boots:['🥾','Schuhe'],
  amulet:['📿','Amulett']
};

function esc(s){
  return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function isFrost(){return String(s?.playerClass||'')==='frost'}
function itemLevel(it){
  const n=Number(it?.level??it?.dropLevel??it?.itemLevel??it?.reqLevel??it?.sourceLevel??0);
  return Number.isFinite(n)&&n>0?Math.round(n):Math.max(1,Number(s?.level)||1);
}
function artHtml(it,fallback){
  if(!it)return esc(fallback);
  try{
    const uri=window.v466ItemArtUri?.(it)||'';
    if(uri)return `<img class="v466-item-art v470-slot-art" src="${esc(uri)}" alt="${esc(it.name||'Item')}" loading="eager" decoding="sync">`;
  }catch(e){}
  return esc(it.icon||fallback||'🎁');
}
function move(parent,node){
  if(parent&&node&&node.parentElement!==parent)parent.appendChild(node);
}

function paintSlots(){
  const character=document.getElementById('character');
  if(!character)return false;

  try{window.v510BuildCharacter?.()}catch(e){}
  if(isFrost()){
    try{window.v4153RefreshFrostUi?.('v6102-slot-ensure')}catch(e){}
  }

  const root=document.getElementById('v510HeroRoot');
  const left=root?.querySelector('.v510-left');
  const right=root?.querySelector('.v510-right');

  ['slot-head','slot-weapon','slot-weapon2','slot-ring'].forEach(id=>{
    if(id==='slot-weapon2'&&!isFrost())return;
    move(left,document.getElementById(id));
  });
  ['slot-body','slot-boots','slot-amulet'].forEach(id=>move(right,document.getElementById(id)));

  Object.entries(SLOT_META).forEach(([slot,[fallback,label]])=>{
    if(slot==='weapon2'&&!isFrost())return;
    const el=document.getElementById('slot-'+slot);
    if(!el)return;

    const it=s?.equipment?.[slot]||null;
    const cls='slot'+(it?.rarity?(' '+String(it.rarity)):'');
    if(el.className!==cls)el.className=cls;
    const enchant=(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant);
    const sig=JSON.stringify({
      slot,name:it?.name||'',rarity:it?.rarity||'',quality:it?.quality||'',level:it?itemLevel(it):0,
      icon:it?.icon||'',bonus:it?.bonus||null,gem:it?.gem||null,enchant:enchant||null,
      setName:it?.setName||'',mysticSpecial:it?.mysticSpecial||null,
      sell:it&&typeof sellValue==='function'?sellValue(it):0
    });
    if(el.dataset.v6102Sig!==sig||!el.querySelector('.slot-icon')||(it&&!el.querySelector('.v514-slot-level'))){
      el.innerHTML=
        `<div class="slot-icon">${artHtml(it,fallback)}</div>`+
        `<div class="slot-label">${esc(slot==='weapon2'?'Waffe II · 10 % Attribute':label)}</div>`+
        `<div class="slot-name">${esc(it?it.name:'Leer')}</div>`+
        (it?`<div class="tiny">${typeof itemBonus==='function'?itemBonus(it):''}</div>`:'')+
        (it?.mysticSpecial?`<div class="v296-mystic-special">✨ Spezialeffekt: ${typeof v296MysticSpecialText==='function'?esc(v296MysticSpecialText(it)):''}</div>`:'')+
        (it?.setName?`<div class="set-tag">${esc(it.setName)}-Set</div>`:'')+
        (it?`<div class="slot-actions"><button class="mini-btn" onclick="unequip('${slot}')">Ablegen</button><button class="mini-btn" onclick="sellEquipped('${slot}')">💰 ${typeof sellValue==='function'?sellValue(it):0}</button></div>`:'')+
        (it?`<div class="v514-slot-level">Lv.${itemLevel(it)}</div>`:'');
      el.dataset.v6102Sig=sig;
      window.__V7126_CHARACTER_CHURN__.slotWrites++;
    }

    if(slot==='weapon2'){
      el.onclick=e=>{
        if(e.target.closest('button'))return;
        try{v123OpenItem('weapon2')}catch(_){}
      };
    }
  });

  try{window.v470PaintEquipmentSlots?.()}catch(e){}
  /* V7.127: v510BuildCharacter already ran at the start of this pass. */
  try{window.v4156PaintClassPassive?.()}catch(e){}
  /* Final layout owner MUST run last, otherwise older hero code can put the
     passive back into the hidden .v510-secondary donor. */
  try{window.v514ApplyHeroReference?.()}catch(e){}
  return true;
}
window.v6102PaintEquipmentSlots=paintSlots;

const fast=window.v6101RenderOpenedScreen;
if(typeof fast==='function'&&!fast.__v6102Slots){
  const wrapped=function(id){
    const r=fast.apply(this,arguments);
    if(String(id)==='character'){
      requestAnimationFrame(()=>{
        paintSlots();
        try{window.v515PolishHero?.()}catch(e){}
      });
    }
    return r;
  };
  wrapped.__v6102Slots=true;
  window.v6101RenderOpenedScreen=wrapped;
}

['equip','unequip','sellEquipped'].forEach(name=>{
  try{
    const fn=window[name];
    if(typeof fn!=='function'||fn.__v6102Slots)return;
    const wrapped=function(){
      const r=fn.apply(this,arguments);
      requestAnimationFrame(paintSlots);
      return r;
    };
    wrapped.__v6102Slots=true;
    window[name]=wrapped;
    try{
      if(name==='equip')equip=wrapped;
      if(name==='unequip')unequip=wrapped;
      if(name==='sellEquipped')sellEquipped=wrapped;
    }catch(e){}
  }catch(e){}
});

document.addEventListener('DOMContentLoaded',paintSlots,{once:true});
window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))paintSlots()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{if(document.getElementById('character')?.classList.contains('active'))paintSlots()},{passive:true});

window.v6102EquipmentDiagnostics=function(){
  return ['head','weapon','weapon2','ring','body','boots','amulet'].map(slot=>({
    slot,
    equipped:!!s?.equipment?.[slot],
    dom:!!document.getElementById('slot-'+slot),
    visible:slot==='weapon2'?isFrost():true,
    parent:document.getElementById('slot-'+slot)?.parentElement?.className||''
  }));
};
})();
