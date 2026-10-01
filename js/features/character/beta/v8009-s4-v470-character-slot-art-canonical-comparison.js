(function(){
  const VERSION='V4.70 Stable',SHORT='V4.70';
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  let paintingSlots=false,paintingCompare=false,shopRendering=false;

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function normalize(it){
    if(!it||typeof it!=='object')return it;
    try{if(typeof v447ApplyItemCurve==='function')v447ApplyItemCurve(it)}catch(e){}
    return it;
  }
  function normalizeShopItems(){
    try{(s?.weaponShop||[]).forEach(normalize)}catch(e){}
    try{(s?.magicShop||[]).forEach(normalize)}catch(e){}
  }
  function enchantOf(it){return (Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant)||null}
  function nativeMap(it){
    normalize(it);
    if(it?.v429StatLock?.native&&typeof it.v429StatLock.native==='object'){
      const out={};COMBAT.forEach(k=>{const v=Number(it.v429StatLock.native[k])||0;if(v)out[k]=v});return out;
    }
    const out={},gem=it?.gem,e=enchantOf(it);
    COMBAT.forEach(k=>{
      let v=Number(it?.bonus?.[k])||0;
      if(gem?.stat===k)v-=Number(gem.value)||0;
      if(k==='glueck'&&e?.effect==='luck')v-=Number(e.value)||0;
      if(v)out[k]=v;
    });
    return out;
  }
  function nativeTotal(it){const m=nativeMap(it);return COMBAT.reduce((n,k)=>n+(Number(m[k])||0),0)}
  function pointTotal(it){normalize(it);return COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0)}
  function addonTotal(it){return pointTotal(it)-nativeTotal(it)}
  function mysticCompareValue(it){
    if(!it?.mysticSpecial)return 0;
    try{
      if(typeof window.v6201MysticCompareValue==='function')return Math.max(0,Number(window.v6201MysticCompareValue(it))||0);
    }catch(e){}
    /* Safe early fallback until the final mystic bridge is installed. */
    const sp=it.mysticSpecial||{},v=Math.max(0,Number(sp.value)||0),key=String(sp.key||'');
    if(!v)return 0;
    const cls=String(s?.playerClass||'grower'),pk=(cls==='scout'?'geschick':(cls==='bruiser'||cls==='summoner')?'intelligenz':'staerke');
    let primary=0,endurance=0;
    try{primary=Math.max(1,Number(totalAttr(pk))||1);endurance=Math.max(1,Number(totalAttr('ausdauer'))||1)}catch(e){primary=50;endurance=30}
    const baseHp=Math.max(1,80+endurance*8+(Number(s?.level)||1)*5),hpEq=baseHp/8;
    if(key==='mainPct')return primary*v;
    if(key==='hpPct')return hpEq*v;
    if(key==='critChance')return primary*v*.75;
    if(key==='critDamage')return primary*v*.20;
    if(key==='wuchtChance')return primary*v*.55;
    if(key==='doubleChance')return primary*v*.45;
    if(key==='dodgeChance')return hpEq*v*.80;
    return primary*v*.35;
  }
  function effectiveTotal(it){return nativeTotal(it)+mysticCompareValue(it)}
  function specialCount(it){
    let n=0;const e=enchantOf(it);
    if(e&&e.effect!=='luck')n++;
    if(it?.mysticSpecial)n++;
    return n;
  }
  function compare(it){
    if(!it?.slot||it.type==='material'||it.type==='gem'||it.type==='scroll')return null;
    normalize(it);
    if(it.classId&&s?.playerClass&&it.classId!==s.playerClass){
      return {state:'worse',mark:'⛔',label:'FALSCHE KLASSE',diff:null,reason:'Nicht für deine Klasse',newTotal:pointTotal(it),oldTotal:0,baseDiff:0};
    }
    const old=s?.equipment?.[it.slot]||null;
    const nativeNew=nativeTotal(it),mysticNew=mysticCompareValue(it),nt=nativeNew+mysticNew;
    if(!old){
      const reason=mysticNew>0?'Grundwerte + mystischer Spezialeffekt · Stein/Rolle separat':'Grundwerte ohne Stein/Rolle';
      return {state:'free',mark:'▲',label:'FREIER SLOT',diff:null,reason,newTotal:nt,oldTotal:0,baseDiff:nativeNew,mysticNew,mysticOld:0,nativeNew,nativeOld:0};
    }
    normalize(old);
    const nativeOld=nativeTotal(old),mysticOld=mysticCompareValue(old),ot=nativeOld+mysticOld;
    const diff=Math.round((nt-ot)*100)/100,baseDiff=Math.round((nativeNew-nativeOld)*100)/100;
    let state='same',mark='◆',label='GLEICH',reason='Gleicher Effektivwert · Stein/Rolle separat';
    if(diff>0){state='better';mark='▲';label='BESSER';reason=(mysticNew||mysticOld)?'Grundwerte + mystischer Spezialeffekt · Stein/Rolle separat':'Bessere Grundwerte · Stein/Rolle nicht eingerechnet'}
    else if(diff<0){state='worse';mark='▼';label='SCHLECHTER';reason=(mysticNew||mysticOld)?'Grundwerte + mystischer Spezialeffekt · Stein/Rolle separat':'Schlechtere Grundwerte · Stein/Rolle nicht eingerechnet'}
    else if(specialCount(it)||specialCount(old)){reason='Effektivwert gleich · mystischer Effekt berücksichtigt · Stein/Rolle separat'}
    return {state,mark,label,diff,reason,newTotal:nt,oldTotal:ot,baseDiff,mysticNew,mysticOld,nativeNew,nativeOld};
  }
  window.v470CompareItem=compare;

  function signed(n){n=Math.round((Number(n)||0)*100)/100;return n>0?'+'+n:String(n)}
  function compactComparisonHtml(it,cls='v090-shop-compare'){
    const c=compare(it);if(!c)return'';
    const css=c.state==='free'?'empty':c.state;
    if(c.state==='free')return `<div class="${cls} ${css}">▲ FREIER SLOT · Verbesserung</div>`;
    if(c.diff==null)return `<div class="${cls} ${css}">${esc(c.label)} · ${esc(c.reason)}</div>`;
    const metric=(Number(c.mysticNew||0)>0||Number(c.mysticOld||0)>0)?'Effektivwert':'Grundwerte';
    return `<div class="${cls} ${css}">${c.mark} ${c.label} · ${signed(c.diff)} ${metric}</div>`;
  }
  try{v090ComparisonHtml=function(it){return compactComparisonHtml(it,'v090-shop-compare')};window.v090ComparisonHtml=v090ComparisonHtml}catch(e){}
  try{v089ShopComparison=function(it){return compactComparisonHtml(it,'v089-shop-compare')};window.v089ShopComparison=v089ShopComparison}catch(e){}

  const detailedComparison=function(it){
    const c=compare(it);if(!c)return'';
    if(c.state==='free')return '<span class="better">▲ Freier Slot · direkte Verbesserung</span>';
    if(c.diff==null)return `<span class="worse">⛔ ${esc(c.reason)}</span>`;
    const css=c.state==='better'?'better':c.state==='worse'?'worse':'same';
    const metric=(Number(c.mysticNew||0)>0||Number(c.mysticOld||0)>0)?'Effektivwert':'Grundwerte';
    return `<span class="${css}">${c.mark} ${esc(c.label)} · ${signed(c.diff)} ${metric} · ${esc(c.reason)}</span>`;
  };
  try{comparison=detailedComparison;window.comparison=detailedComparison}catch(e){}

  function paintInventoryComparisons(){
    if(paintingCompare)return;paintingCompare=true;
    try{
      document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((card,i)=>{
        const it=s?.inventory?.[i],c=compare(it);
        card.classList.remove('v460-better','v460-worse','v460-same','v460-free');
        if(!c){card.querySelectorAll('.v460-compare-flag').forEach(x=>x.remove());delete card.dataset.v470CompareKey;return}
        card.classList.add('v460-'+c.state);
        const diff=c.state==='free'?'+?':c.diff==null?'—':signed(c.diff);
        const key=[c.state,c.mark,diff,c.reason,c.label].join('|');
        const final=card.querySelector('.v460-compare-flag.v470-final-compare');
        const legacy=[...card.querySelectorAll('.v460-compare-flag:not(.v470-final-compare)')];
        legacy.forEach(x=>x.remove());
        if(final&&card.dataset.v470CompareKey===key){
          card.title=`${c.label} · ${c.diff==null?'':signed(c.diff)+' · '}${c.reason}`;
          return;
        }
        if(final)final.remove();
        const flag=document.createElement('div');flag.className='v460-compare-flag v470-final-compare';
        flag.innerHTML=`<span class="v460-diff">${esc(c.mark+' '+diff)}</span><span class="v460-reason">${esc(c.reason)}</span>`;
        card.appendChild(flag);card.dataset.v470CompareKey=key;
        card.title=`${c.label} · ${c.diff==null?'':signed(c.diff)+' · '}${c.reason}`;
      });
    }finally{paintingCompare=false}
  }

  function artUri(it){try{return typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri(it):''}catch(e){return''}}
  function paintOneSlot(slot){
    const root=document.querySelector('#slot-'+slot);if(!root)return;
    const box=root.querySelector('.slot-icon');if(!box)return;
    const it=s?.equipment?.[slot]||null;
    root.classList.toggle('v470-equipped',!!it);
    if(!it)return;
    const uri=artUri(it);
    if(uri){
      const current=box.querySelector(':scope > img.v470-slot-art,:scope > img.v466-item-art');
      if(current&&box.dataset.v470Uri===uri&&box.childElementCount===1)return;
      const img=document.createElement('img');img.className='v466-item-art v470-slot-art';img.src=uri;img.alt=String(it.name||'Item');img.decoding='async';
      box.replaceChildren(img);box.dataset.v470Art='1';box.dataset.v470Uri=uri;
    }else if(box.textContent!==String(it.icon||'🎁')){
      box.textContent=it.icon||'🎁';delete box.dataset.v470Uri;
    }
  }
  function paintEquipmentSlots(){
    if(paintingSlots)return;paintingSlots=true;
    try{['head','weapon','ring','body','boots','amulet'].forEach(paintOneSlot)}finally{paintingSlots=false}
  }
  window.v470PaintEquipmentSlots=paintEquipmentSlots;

  /* A freshly generated replacement offer must be normalized BEFORE its text and
     comparison are rendered. This keeps shop -> purchase -> inventory identical. */
  try{
    if(typeof renderShop==='function'&&!window.__v470ShopWrapped){
      const base=renderShop;
      renderShop=function(){
        if(shopRendering)return base.apply(this,arguments);
        shopRendering=true;
        try{normalizeShopItems();return base.apply(this,arguments)}
        finally{shopRendering=false;requestAnimationFrame(()=>{paintInventoryComparisons();paintEquipmentSlots()})}
      };
      window.renderShop=renderShop;window.__v470ShopWrapped=true;
    }
  }catch(e){}

  /* Normalize the exact offer once more before V4.66 clones it into the inventory. */
  try{
    if(typeof window.v030BuyWeapon==='function'&&!window.__v470BuyWeaponWrapped){
      const base=window.v030BuyWeapon;
      window.v030BuyWeapon=function(i){normalize(s?.weaponShop?.[Number(i)]);return base.apply(this,arguments)};
      window.__v470BuyWeaponWrapped=true;
    }
    if(typeof window.v030BuyMagic==='function'&&!window.__v470BuyMagicWrapped){
      const base=window.v030BuyMagic;
      window.v030BuyMagic=function(i){normalize(s?.magicShop?.[Number(i)]);return base.apply(this,arguments)};
      window.__v470BuyMagicWrapped=true;
    }
  }catch(e){}

  try{
    if(typeof renderInventory==='function'&&!window.__v470InventoryWrapped){
      const base=renderInventory;
      renderInventory=function(){const r=base.apply(this,arguments);paintInventoryComparisons();paintEquipmentSlots();return r};
      window.renderInventory=renderInventory;window.__v470InventoryWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof window.v459CompactInventory==='function'&&!window.__v470CompactWrapped){
      const base=window.v459CompactInventory;
      window.v459CompactInventory=function(){const r=base.apply(this,arguments);paintInventoryComparisons();paintEquipmentSlots();return r};
      window.__v470CompactWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof window.equip==='function'&&!window.__v470EquipWrapped){
      const base=window.equip;
      window.equip=function(){const r=base.apply(this,arguments);requestAnimationFrame(()=>{paintEquipmentSlots();paintInventoryComparisons();try{renderShop()}catch(e){}});return r};
      window.__v470EquipWrapped=true;
    }
    if(typeof window.unequip==='function'&&!window.__v470UnequipWrapped){
      const base=window.unequip;
      window.unequip=function(){const r=base.apply(this,arguments);requestAnimationFrame(()=>{paintEquipmentSlots();paintInventoryComparisons();try{renderShop()}catch(e){}});return r};
      window.__v470UnequipWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof render==='function'&&!window.__v470RenderWrapped){
      const base=render;
      render=function(){normalizeShopItems();const r=base.apply(this,arguments);if(document.getElementById('character')?.classList.contains('active')){paintEquipmentSlots();paintInventoryComparisons()}stamp();return r};
      window.render=render;window.__v470RenderWrapped=true;
    }
  }catch(e){}
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character'){paintEquipmentSlots();paintInventoryComparisons()}});
  window.__v470GoWrapped='v7119-event';

  function installObservers(){
    const eq=document.querySelector('#character .equipment-grid');
    if(eq&&eq.dataset.v470Observed!=='1'){
      eq.dataset.v470Observed='1';
      const mo=new MutationObserver(()=>{if(!document.getElementById('character')?.classList.contains('active'))return;if(!paintingSlots)queueMicrotask(paintEquipmentSlots)});
      mo.observe(eq,{childList:true,subtree:true});window.__V470_SLOT_OBSERVER__=mo;
    }
    const inv=document.querySelector('#character #inventory .inventory-grid');
    if(inv&&inv.dataset.v470CompareObserved!=='1'){
      inv.dataset.v470CompareObserved='1';
      const mo=new MutationObserver(()=>{if(!document.getElementById('character')?.classList.contains('active'))return;if(!paintingCompare)queueMicrotask(paintInventoryComparisons)});
      mo.observe(inv,{childList:true,subtree:true});window.__V470_COMPARE_OBSERVER__=mo;
    }
  }
  function stamp(){}
  function settle(){
    normalizeShopItems();paintEquipmentSlots();paintInventoryComparisons();installObservers();stamp();
  }

  window.v470TestComparisonConsistency=function(it){
    const a=compare(it);if(!a)return null;
    let clone=null;try{clone=typeof structuredClone==='function'?structuredClone(it):JSON.parse(JSON.stringify(it))}catch(e){clone={...it,bonus:{...(it?.bonus||{})}}}
    normalize(clone);const b=compare(clone);
    return {before:a,afterClone:b,consistent:JSON.stringify(a)===JSON.stringify(b)};
  };

  try{if(typeof renderShop==='function')renderShop()}catch(e){}
  settle();
  document.addEventListener('DOMContentLoaded',settle,{once:true});
  window.addEventListener('pageshow',settle,{passive:true});
  window.addEventListener('growlegends:account-ready',settle,{passive:true});
})();
