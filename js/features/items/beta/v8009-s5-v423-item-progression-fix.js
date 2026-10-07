(function(){
  /*
    Root cause fixed here:
    V4.22 added the level bonus once PER ATTRIBUTE. A two-stat item therefore
    received the level gain twice, while a one-stat item received it only once.
    That made e.g. a gray lower-level two-stat weapon beat a higher-level Rare.

    V4.23 gives every regular item ONE total stat budget per slot. Rarity and
    item level raise that budget; the item's template only decides how the same
    budget is distributed. Therefore, within the same class + slot:
      - higher level + same rarity => strictly stronger total attributes
      - higher rarity + same level => strictly stronger total attributes
      - higher level AND higher rarity => cannot become weaker
    Gems / scrolls / special effects remain attached and are not rerolled.
  */
  const VERSION='V4.29 Stable';
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  const RARITY={
    gray:{mult:1.00,flat:0}, green:{mult:1.16,flat:1}, blue:{mult:1.34,flat:2},
    purple:{mult:1.55,flat:3}, orange:{mult:1.78,flat:4}, cyan:{mult:2.02,flat:5}
  };

  function quality(it){
    if(it?.quality)return String(it.quality).toLowerCase();
    const r=String(it?.rarity||'').toLowerCase();
    return r.includes('myth')?'cyan':r.includes('legend')?'orange':r.includes('epic')?'purple':r.includes('rare')?'blue':r.includes('green')||r.includes('uncommon')?'green':'gray';
  }
  function cleanName(it){
    return String(it?.name||'')
      .replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/,'')
      .replace(/\s*\[Lv\.\d+\]\s*$/,'');
  }
  function poolFor(it){
    const cls=it?.classId||s.playerClass||'grower';
    return (typeof classGear!=='undefined'&&Array.isArray(classGear?.[cls]))?classGear[cls]:[];
  }
  function templateFor(it){
    const pool=poolFor(it), name=cleanName(it);
    return pool.find(x=>it?.id&&String(it.id).startsWith(String(x.id)))
      || pool.find(x=>it?.slot&&x.slot===it.slot&&(name===x.name||name.includes(x.name)))
      || null;
  }
  function baseBonus(it){
    const hit=templateFor(it);
    if(hit?.bonus)return Object.fromEntries(Object.entries(hit.bonus).filter(([k])=>COMBAT.includes(k)));
    if(it?.baseBonusV055&&typeof it.baseBonusV055==='object'){
      const b=Object.fromEntries(Object.entries(it.baseBonusV055).filter(([k])=>COMBAT.includes(k)));
      if(Object.keys(b).length)return b;
    }
    return null;
  }
  function slotBaseBudget(it,base){
    const pool=poolFor(it).filter(x=>x.slot===it?.slot);
    const totals=pool.map(x=>COMBAT.reduce((n,k)=>n+(Number(x?.bonus?.[k])||0),0)).filter(n=>n>0);
    const own=COMBAT.reduce((n,k)=>n+(Number(base?.[k])||0),0);
    return Math.max(1,own,...totals);
  }
  function distribute(base,total){
    const entries=Object.entries(base||{}).filter(([k,v])=>COMBAT.includes(k)&&(Number(v)||0)>0);
    if(!entries.length)return {};
    if(entries.length===1)return {[entries[0][0]]:Math.max(1,total)};
    const baseTotal=entries.reduce((n,[,v])=>n+Number(v),0)||1;
    const rows=entries.map(([k,v])=>{
      const raw=total*(Number(v)||0)/baseTotal;
      return {k,raw,val:Math.max(1,Math.floor(raw)),frac:raw-Math.floor(raw)};
    });
    let used=rows.reduce((n,x)=>n+x.val,0);
    if(used<total){
      rows.sort((a,b)=>b.frac-a.frac);
      for(let i=0;used<total;i=(i+1)%rows.length){rows[i].val++;used++;}
    }else if(used>total){
      rows.sort((a,b)=>a.frac-b.frac);
      for(let i=0;used>total&&i<rows.length*10;i++){
        const x=rows[i%rows.length];if(x.val>1){x.val--;used--;}
      }
    }
    return Object.fromEntries(rows.map(x=>[x.k,x.val]));
  }
  function targetBudget(it,base){
    const q=quality(it), meta=RARITY[q]||RARITY.gray;
    const lvl=Math.max(1,Number(it?.dropLevel)||Number(s.level)||1);
    const slotBase=slotBaseBudget(it,base);
    /* ONE level gain for the whole item, never once per stat. */
    return Math.max(1,Math.round(slotBase*meta.mult + (lvl-1)*0.72 + meta.flat));
  }
  function authenticatedServerItems(){
    try{return !!((typeof v073User!=='undefined'&&v073User?.id)||window.v073User?.id)}catch(_){return false}
  }
  function legacyLocalItemStateWritable(){
    /* V8.181: fail closed during boot. Until auth is explicitly resolved, an
       existing item may belong to a server-authoritative account and must not
       be rebalanced by this legacy curve. */
    return window.__V200_AUTH_READY__===true && !authenticatedServerItems();
  }
  function normalize(it){
    if(!legacyLocalItemStateWritable())return false;
    if(!it||it.type==='material'||!it.slot||it.setId)return false;
    const base=baseBonus(it);if(!base||!Object.keys(base).length)return false;
    const lvl=Math.max(1,Number(it.dropLevel)||Number(s.level)||1);
    const old=JSON.stringify(it.bonus||{});
    const fresh=distribute(base,targetBudget(it,base));

    /* Reapply permanent material bonuses exactly once after the native budget. */
    if(it.gem?.stat&&it.gem?.value&&COMBAT.includes(it.gem.stat)){
      fresh[it.gem.stat]=(Number(fresh[it.gem.stat])||0)+(Number(it.gem.value)||0);
    }
    const ench=it.enchant||(Array.isArray(it.enchants)?it.enchants[0]:null);
    if(ench?.effect==='luck'&&ench?.value){
      fresh.glueck=(Number(fresh.glueck)||0)+(Number(ench.value)||0);
    }

    /* Preserve non-combat metadata bonuses only. */
    const keep={};
    Object.entries(it.bonus||{}).forEach(([k,v])=>{if(!COMBAT.includes(k)&&k!=='growSkill')keep[k]=v});
    it.bonus={...fresh,...keep};
    it.baseBonusV055={...base};
    it.dropLevel=lvl;
    return old!==JSON.stringify(it.bonus);
  }
  function normalizeAll(){
    let changed=false;
    (s.inventory||[]).forEach(it=>{if(normalize(it))changed=true});
    Object.values(s.equipment||{}).forEach(it=>{if(normalize(it))changed=true});
    (s.weaponShop||[]).forEach(it=>{if(normalize(it))changed=true});
    (s.magicShop||[]).forEach(it=>{if(normalize(it))changed=true});
    return changed;
  }
  function total(it){
    return COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0);
  }

  /* Future v024-created regular gear is normalized immediately. */
  if(typeof v024Item==='function'&&!window.__v423ItemWrapped){
    const baseItem=v024Item;
    v024Item=function(){const it=baseItem.apply(this,arguments);normalize(it);return it};
    window.__v423ItemWrapped=true;
  }

  /* Final comparison owner: compare the actual five displayed combat stats.
     Gem/luck-roll values already live in bonus and are therefore counted once. */
  comparison=function(it){
    if(!it?.slot)return '';
    normalize(it);
    const old=s.equipment?.[it.slot];
    if(!old)return `<span class="better">▲ Freier Slot · Item Lv.${it.dropLevel||1}</span>`;
    normalize(old);
    const d=total(it)-total(old), lv=`Lv.${it.dropLevel||1} vs Lv.${old.dropLevel||1}`;
    return d>0?`<span class="better">▲ +${d} Gesamtwerte · ${lv}</span>`:
      d<0?`<span class="worse">▼ ${d} Gesamtwerte · ${lv}</span>`:
      `<span class="same">= Gleiche Gesamtwerte · ${lv}</span>`;
  };

  function repaintInventory(){
    [...document.querySelectorAll('#inventory .inv-item')].forEach((card,i)=>{
      const it=s.inventory?.[i];if(!it)return;
      const b=card.querySelector('.item-bonus');if(b&&typeof itemBonus==='function')b.textContent=itemBonus(it)||'Keine Boni';
      const c=card.querySelector('.compare');if(c)c.innerHTML=comparison(it);
    });
  }

  /* Older V331/V422 render wrappers still exist for other fixes. Run them,
     then restore V4.23 as the last authority and repaint the affected cards. */
  const baseInv=renderInventory;
  renderInventory=function(){
    normalizeAll();
    const r=baseInv.apply(this,arguments);
    normalizeAll();
    repaintInventory();
    return r;
  };

  if(typeof renderShop==='function'){
    const baseShop=renderShop;
    renderShop=function(){normalizeAll();return baseShop.apply(this,arguments)};
  }

  const baseEquip=window.equip;
  window.equip=function(i){
    if(s.inventory?.[i])normalize(s.inventory[i]);
    const r=baseEquip.apply(this,arguments);normalizeAll();
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    return r;
  };
  const baseUnequip=window.unequip;
  window.unequip=function(slot){
    if(s.equipment?.[slot])normalize(s.equipment[slot]);
    const r=baseUnequip.apply(this,arguments);normalizeAll();
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    return r;
  };

  /* V8.181: no boot migration/render of existing items. Generator wrappers
     above remain available for explicit legacy-local item creation. */
  const changed=legacyLocalItemStateWritable()?normalizeAll():false;
  if(changed){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
  }
  if(changed&&!s.v423ItemCurveNotice){
    s.v423ItemCurveNotice=true;
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    /* V4.86: obsolete one-time item migration notice retired; migration remains silent. */
  }

  document.querySelectorAll('.version').forEach(el=>el.textContent=VERSION);
  const line=document.querySelector('#v141VersionLine');if(line)line.textContent=VERSION;
  document.title='Grow Legends V4.29';
})();
