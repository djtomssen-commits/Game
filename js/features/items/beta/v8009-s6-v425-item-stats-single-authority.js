(function(){
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
    const pool=poolFor(it),name=cleanName(it);
    return pool.find(x=>it?.id&&String(it.id).startsWith(String(x.id)))
      ||pool.find(x=>it?.slot&&x.slot===it.slot&&(name===x.name||name.includes(x.name)))
      ||null;
  }
  function baseBonus(it){
    /* Template is first authority so older wrappers cannot poison baseBonusV055. */
    const hit=templateFor(it);
    if(hit?.bonus){
      const b={}; COMBAT.forEach(k=>{if((Number(hit.bonus[k])||0)>0)b[k]=Number(hit.bonus[k])});
      if(Object.keys(b).length)return b;
    }
    if(it?.baseBonusV055&&typeof it.baseBonusV055==='object'){
      const b={}; COMBAT.forEach(k=>{if((Number(it.baseBonusV055[k])||0)>0)b[k]=Number(it.baseBonusV055[k])});
      if(Object.keys(b).length)return b;
    }
    /* Last-resort legacy item: freeze its current combat distribution as base. */
    if(it?.bonus&&typeof it.bonus==='object'){
      const b={}; COMBAT.forEach(k=>{if((Number(it.bonus[k])||0)>0)b[k]=Number(it.bonus[k])});
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
    const rows=entries.map(([k,v])=>{const raw=total*Number(v)/baseTotal;return{k,raw,val:Math.max(1,Math.floor(raw)),frac:raw-Math.floor(raw)}});
    let used=rows.reduce((n,x)=>n+x.val,0);
    rows.sort((a,b)=>b.frac-a.frac);
    for(let i=0;used<total;i=(i+1)%rows.length){rows[i].val++;used++}
    rows.sort((a,b)=>a.frac-b.frac);
    for(let i=0;used>total&&i<rows.length*20;i++){const x=rows[i%rows.length];if(x.val>1){x.val--;used--}}
    return Object.fromEntries(rows.map(x=>[x.k,x.val]));
  }
  function targetBudget(it,base){
    const meta=RARITY[quality(it)]||RARITY.gray;
    const lvl=Math.max(1,Number(it?.dropLevel)||Number(s.level)||1);
    return Math.max(1,Math.round(slotBaseBudget(it,base)*meta.mult+(lvl-1)*0.72+meta.flat));
  }
  function canonical(it){
    if(!it||it.type==='material'||!it.slot||it.setId)return false;
    const base=baseBonus(it); if(!base)return false;
    const before=JSON.stringify(it.bonus||{});
    const fresh=distribute(base,targetBudget(it,base));
    if(it.gem?.stat&&it.gem?.value&&COMBAT.includes(it.gem.stat))fresh[it.gem.stat]=(Number(fresh[it.gem.stat])||0)+Number(it.gem.value||0);
    const ench=it.enchant||(Array.isArray(it.enchants)?it.enchants[0]:null);
    if(ench?.effect==='luck'&&ench?.value)fresh.glueck=(Number(fresh.glueck)||0)+Number(ench.value||0);
    const keep={}; Object.entries(it.bonus||{}).forEach(([k,v])=>{if(!COMBAT.includes(k)&&k!=='growSkill')keep[k]=v});
    it.bonus={...fresh,...keep};
    it.baseBonusV055={...base};
    it.dropLevel=Math.max(1,Number(it.dropLevel)||Number(s.level)||1);
    return before!==JSON.stringify(it.bonus);
  }
  function all(){
    let changed=false;
    (s.inventory||[]).forEach(it=>{if(canonical(it))changed=true});
    Object.values(s.equipment||{}).forEach(it=>{if(canonical(it))changed=true});
    (s.weaponShop||[]).forEach(it=>{if(canonical(it))changed=true});
    (s.magicShop||[]).forEach(it=>{if(canonical(it))changed=true});
    return changed;
  }
  function total(it){return COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0)}

  function paintInventory(){
    [...document.querySelectorAll('#inventory .inv-item')].forEach((card,i)=>{
      const it=s.inventory?.[i];if(!it)return;
      const b=card.querySelector('.item-bonus');if(b&&typeof itemBonus==='function')b.textContent=itemBonus(it)||'Keine Boni';
      const c=card.querySelector('.compare');if(c&&typeof comparison==='function')try{c.innerHTML=comparison(it)}catch(e){}
    });
  }
  function paintEquipment(){
    if(typeof slotLabels==='undefined')return;
    Object.keys(slotLabels).forEach(sl=>{
      const el=document.querySelector('#slot-'+sl),it=s.equipment?.[sl];if(!el||!it)return;
      const tiny=el.querySelector('.tiny');if(tiny&&typeof itemBonus==='function')tiny.textContent=itemBonus(it)||'Keine Boni';
    });
    try{document.querySelector('#power')&&(document.querySelector('#power').textContent=combatPower())}catch(e){}
    try{document.querySelector('#charPower')&&(document.querySelector('#charPower').textContent=combatPower())}catch(e){}
    try{document.querySelector('#charHp')&&(document.querySelector('#charHp').textContent=maxHp())}catch(e){}
  }

  /* Final comparison uses exactly the same persisted values as equipment. */
  comparison=function(it){
    if(!it?.slot)return '';
    canonical(it);
    const old=s.equipment?.[it.slot];
    if(!old)return `<span class="better">▲ Freier Slot · Item Lv.${it.dropLevel||1}</span>`;
    canonical(old);
    const d=total(it)-total(old),lv=`Lv.${it.dropLevel||1} vs Lv.${old.dropLevel||1}`;
    return d>0?`<span class="better">▲ +${d} Gesamtwerte · ${lv}</span>`:d<0?`<span class="worse">▼ ${d} Gesamtwerte · ${lv}</span>`:`<span class="same">= Gleiche Gesamtwerte · ${lv}</span>`;
  };

  /* Old render wrappers may still mutate stats while painting. Let them finish,
     then restore canonical DATA and repaint BOTH locations from that same data. */
  /* Character/Inventory cleanup Phase 1: V425's per-inventory render authority is retired.
     Its one-time canonicalization and other compatibility hooks remain. V429, loaded afterwards,
     is the final immutable stat owner for inventory/equipment renders. */

  const baseRender=window.render||render;
  const finalRender=function(){
    all();
    const r=baseRender.apply(this,arguments);
    all();
    paintInventory();
    paintEquipment();
    return r;
  };
  try{window.render=finalRender;render=finalRender}catch(e){}

  const baseEquip=window.equip;
  window.equip=function(i){
    if(s.inventory?.[i])canonical(s.inventory[i]);
    const r=baseEquip.apply(this,arguments);
    all();
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{finalRender()}catch(e){}
    return r;
  };
  const baseUnequip=window.unequip;
  window.unequip=function(slot){
    if(s.equipment?.[slot])canonical(s.equipment[slot]);
    const r=baseUnequip.apply(this,arguments);
    all();
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{finalRender()}catch(e){}
    return r;
  };

  all();
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
  try{finalRender()}catch(e){console.error('V4.25 item stat authority',e)}

  function stamp(){}
  stamp();
})();
