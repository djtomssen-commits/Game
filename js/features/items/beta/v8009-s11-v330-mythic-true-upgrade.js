(function(){
  function v330IsMystic(it){return !!it && (it.quality==='cyan'||it.rarity==='mythic'||it.mysticSetId)}
  function v330CombatKeys(){return ['staerke','geschick','intelligenz','ausdauer','glueck']}
  function v330Sum(it){return v330CombatKeys().reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0)}
  function v330Primary(){
    try{return v125PrimaryKey()}catch(e){
      return s.playerClass==='scout'?'geschick':(s.playerClass==='bruiser'||s.playerClass==='summoner')?'intelligenz':'staerke'
    }
  }

  /* A mythic drop may never be worse than the currently equipped item in the
     same slot. It gets a real stat upgrade, not just a cosmetic rarity badge. */
  function v330Guarantee(it){
    if(!v330IsMystic(it)||!it.slot)return false;
    const eq=s.equipment?.[it.slot];
    const lvl=Math.max(1,Number(it.dropLevel)||Number(s.level)||1);
    it.bonus={...(it.bonus||{})};
    let changed=false;

    /* Keep the normal cyan curve from V4.02 first. */
    try{ if(typeof v325FixMystic==='function') changed=!!v325FixMystic(it)||changed; }catch(e){}

    if(eq && eq!==it){
      const oldTotal=v330Sum(eq);
      let newTotal=v330Sum(it);
      const minimum=oldTotal + Math.max(2,Math.ceil(oldTotal*0.08));

      if(newTotal<minimum){
        const need=minimum-newTotal;
        const primary=v330Primary();
        const preferred=(Number(it.bonus[primary])||0)>0
          ?primary
          :(v330CombatKeys().find(k=>(Number(it.bonus[k])||0)>0)||primary);
        it.bonus[preferred]=(Number(it.bonus[preferred])||0)+need;
        changed=true;
      }

      /* Also stop the same primary stat from being dramatically below the old
         piece just because the mythic template uses another stat split. */
      const primary=v330Primary();
      const oldPrimary=Number(eq.bonus?.[primary])||0;
      const newPrimary=Number(it.bonus?.[primary])||0;
      if(oldPrimary>0 && newPrimary<Math.ceil(oldPrimary*0.9)){
        it.bonus[primary]=Math.ceil(oldPrimary*0.9);
        changed=true;
      }
    }

    it.dropLevel=lvl;
    it.quality='cyan';
    it.rarity='mythic';
    return changed;
  }

  function v330RepairAll(){
    let changed=false;
    (s.inventory||[]).forEach(it=>{if(v330Guarantee(it))changed=true});
    if(changed){
      try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    }
    return changed;
  }

  /* V8.179: persisted inventory is server-owned; no boot-time repair. */

  /* Future mythic drops are guaranteed before the player sees them. */
  if(typeof v110MakeMysticItem==='function'){
    const old=v110MakeMysticItem;
    v110MakeMysticItem=function(){
      const it=old.apply(this,arguments);v330Guarantee(it);return it;
    };
  }
  if(typeof v110MakeRareMysticSet==='function'){
    const old=v110MakeRareMysticSet;
    v110MakeRareMysticSet=function(){
      const it=old.apply(this,arguments);v330Guarantee(it);return it;
    };
  }

  /* Comparison owner: compare the actual five combat attributes, whole numbers. */
  if(typeof v081ItemCompareLine==='function'){
    v081ItemCompareLine=function(it){
      if(!it?.slot || it.type==='material')return '';
      const eq=s.equipment?.[it.slot];
      if(!eq)return '<div class="v081-item-compare up">▲ Noch nichts in diesem Slot angelegt</div>';
      const a=v330Sum(it), b=v330Sum(eq), d=Math.round(a-b);
      const levelInfo=`Lv.${Math.max(1,Number(it.dropLevel)||1)} vs Lv.${Math.max(1,Number(eq.dropLevel)||1)}`;
      if(d>0)return `<div class="v081-item-compare up">▲ +${d} Gesamtwerte · ${levelInfo}</div>`;
      if(d<0)return `<div class="v081-item-compare down">▼ ${d} Gesamtwerte · ${levelInfo}</div>`;
      return `<div class="v081-item-compare same">◆ ±0 Gesamtwerte · ${levelInfo}</div>`;
    };
  }

  /* Character/Inventory cleanup Phase 1: the old V330 per-render mythic repair is retired.
     Existing items are repaired once above; future mystic generators remain wrapped. Stable item
     stats are owned later by V429, so render-time stat mutation must not run anymore. */

  /* No startup render: this module no longer mutates persisted state. */
  const line=document.querySelector('#v141VersionLine');
})();
