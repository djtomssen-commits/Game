
/* ===== V4.02 exact rarity mapping ===== */

const V240_RARITY_CLASSES=[
  'common-gray','common-green','rare-blue','epic-purple',
  'legendary-orange','mystic-cyan',
  /* historical raw rarity classes that can conflict visually */
  'common','uncommon','rare','epic','legendary','mythic',
  'gray','green','blue','purple','orange','cyan'
];

function v240QualityKey(it){
  const q=String(it?.quality||'').toLowerCase();

  /* quality is authoritative whenever present */
  if(['gray','green','blue','purple','orange','cyan'].includes(q)){
    return q;
  }

  const r=String(it?.rarity||'').toLowerCase();

  if(/myst|cyan/.test(r))return 'cyan';
  if(/legend|orange/.test(r))return 'orange';
  if(/epic|purple|lila/.test(r))return 'purple';
  if(/rare|blue/.test(r))return 'blue';
  if(/uncommon|green|gewöhn|gewoehn/.test(r))return 'green';

  return 'gray';
}

function v240QualityClass(it){
  return {
    gray:'common-gray',
    green:'common-green',
    blue:'rare-blue',
    purple:'epic-purple',
    orange:'legendary-orange',
    cyan:'mystic-cyan'
  }[v240QualityKey(it)]||'common-gray';
}

function v240QualityLabel(it){
  const q=v240QualityKey(it);
  try{
    return qualityMeta(q)?.label||q;
  }catch(e){
    return {
      gray:'Normal',
      green:'Gewöhnlich',
      blue:'Rare',
      purple:'Episch',
      orange:'Legendär',
      cyan:'Mystisch'
    }[q]||'Normal';
  }
}

/*
  Fix inventory visual state after every render.
  This removes stale "epic"/"purple" classes before applying the item's
  actual quality, so a gray/normal item can never inherit a purple border.
*/
function v240RepairInventoryRarity(){
  const cards=document.querySelectorAll('#character #inventory .inv-item');

  cards.forEach((card,i)=>{
    const it=s.inventory?.[i];
    if(!it)return;

    V240_RARITY_CLASSES.forEach(c=>card.classList.remove(c));
    card.classList.add(v240QualityClass(it));

    const badge=card.querySelector('.rarity-badge');
    if(badge){
      badge.textContent=v240QualityLabel(it);
    }
  });
}

/* Character/Inventory cleanup Phase 1: V240 per-render rarity repair retired.
   v240RepairInventoryRarity remains available and V6.84 replaces it with the canonical repair. */


/* ===== Quest reward with actual item card ===== */

function v240Esc(v){
  return String(v??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function v240ItemRewardHtml(it){
  const cls=v240QualityClass(it);
  const label=v240QualityLabel(it);
  const stats=typeof itemBonus==='function'
    ?itemBonus(it)
    :'';
  const classText=it?.classId
    ?`Klasse: ${typeof classLabel==='function'?classLabel(it.classId):it.classId}`
    :'';
  const setText=it?.setName
    ?`${it.setName}-Set`
    :'';
  const level=Number(it?.dropLevel)||Number(s.level)||1;

  return `
    <div class="v240-loot-item ${cls}">
      <div class="v240-loot-main">
        <div class="v240-loot-icon">${v240Esc(it?.icon||'🎁')}</div>
        <div>
          <div class="v240-loot-name">${v240Esc(it?.name||'Unbekanntes Item')}</div>
          <div class="v240-loot-rarity">${v240Esc(label)}</div>
        </div>
      </div>
      <div class="v240-loot-stats">
        ${v240Esc(stats||'Keine Boni')}
      </div>
      ${it?.mysticSpecial?`<div class="v296-mystic-special">✨ Spezialeffekt: ${v240Esc(v296MysticSpecialText(it))}</div>`:''}
      <div class="v240-loot-meta">
        Lv. ${level}
        ${classText?` · ${v240Esc(classText)}`:''}
        ${setText?` · ${v240Esc(setText)}`:''}
      </div>
    </div>
  `;
}


/*
  Replace V4.02 reward collector so item rows keep the full item object.
*/
v235CollectRewardExtras=function(before){
  const extras=[];

  const beforeItems=new Set(before.inventory);
  const afterItems=Array.isArray(s.inventory)?s.inventory:[];

  afterItems.forEach(it=>{
    if(!beforeItems.has(v235InventoryKey(it))){
      extras.push({
        type:'item',
        item:it,
        text:`🎁 ${it.name||'Item gefunden'}`
      });
    }
  });

  const harzGain=Math.max(
    0,
    (Number(s.harzTaler)||0)-Number(before.harz||0)
  );

  if(harzGain>0){
    extras.push({
      type:'harz',
      text:`🟢 +${harzGain} Harz-Taler`
    });
  }

  const afterUnlocked=new Set(
    Array.isArray(s.dungeon?.unlocked)
      ?s.dungeon.unlocked.map(Number)
      :[]
  );

  [...afterUnlocked].forEach(i=>{
    if(!before.unlocked.has(i)){
      const d=dungeons?.[i];
      extras.push({
        type:'key',
        text:d
          ?`🗿 ${d.keyName||'Schlüsselstein'} · ${d.name} freigeschaltet`
          :`🗿 Dungeon ${i+1} freigeschaltet`
      });
    }
  });

  const afterKeys=
    (s.dungeon?.keys && typeof s.dungeon.keys==='object')
      ?s.dungeon.keys
      :{};

  Object.entries(afterKeys).forEach(([raw,value])=>{
    if(!value || before.keys[String(raw)])return;

    const i=Number(raw);
    const d=dungeons?.[i];

    extras.push({
      type:'key',
      text:d
        ?`🗿 Schlüsselstein gefunden · ${d.name}`
        :`🗿 Schlüsselstein für Dungeon ${i+1} gefunden`
    });
  });

  const seen=new Set();

  return extras.filter(x=>{
    if(x.type==='item'){
      const k=`item:${v235InventoryKey(x.item)}`;
      if(seen.has(k))return false;
      seen.add(k);
      return true;
    }

    const normalized=String(x.text||'')
      .replace(/Schlüsselstein gefunden · /,'')
      .replace(/.+ · /,'')
      .trim();

    const key=`${x.type}:${normalized}`;

    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
};


v235ShowQuestReward=function(before){
  const q=before.q;
  const overlay=v231EnsureQuestReward();

  const name=document.querySelector('#v231QuestRewardName');
  const xp=document.querySelector('#v231QuestRewardXp');
  const gold=document.querySelector('#v231QuestRewardGold');
  const extra=document.querySelector('#v231QuestRewardExtra');

  const baseXp=Number(q.v094BaseXp ?? q.xp ?? 0);
  const eventDouble=
    typeof v094XpEventActive==='function' &&
    v094XpEventActive();

  const paidXp=eventDouble
    ?Math.round(baseXp*2)
    :baseXp;

  if(name)name.textContent=q.name||'Auftrag abgeschlossen';
  if(xp)xp.textContent=`+${Math.max(0,paidXp)}`;
  if(gold)gold.textContent=`+${Math.max(0,Number(q.gold)||0)}`;

  const extras=v235CollectRewardExtras(before);

  if(extra){
    extra.style.display='';

    if(extras.length){
      extra.innerHTML=extras.map(row=>{
        if(row.type==='item' && row.item){
          return v240ItemRewardHtml(row.item);
        }

        const cls=
          row.type==='key'
            ?'v233-loot-key'
            :row.type==='harz'
              ?'v235-loot-harz'
              :'';

        return `<div class="v233-loot-line ${cls}">${v240Esc(row.text)}</div>`;
      }).join('');
    }else{
      extra.innerHTML=`
        <div class="v233-loot-line">
          Keine zusätzliche Beute gefunden.
        </div>
      `;
    }
  }

  overlay.classList.add('show');

  try{
    renderInventory();
    v240RepairInventoryRarity();
  }catch(e){}
};


/* V8.009: no delayed startup inventory/version repaint.
   Inventory rarity is repaired directly when the reward/inventory owner renders. */
