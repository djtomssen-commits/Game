(function(){
  const VERSION='V4.29 Stable';

  function keyOf(x){
    if(!x)return '';
    return String(
      x.id||x.uid||
      [x.name||'',x.type||'',x.slot||'',x.quality||'',x.value||'',JSON.stringify(x.bonus||{})].join('|')
    );
  }

  function snapshot(){
    return {
      active:s.quests?.active?{...s.quests.active}:null,
      harz:Math.max(0,Number(s.harzTaler)||0),
      timeSeeds:Math.max(0,Number(s.timeSeeds)||0),
      inv:new Set((Array.isArray(s.inventory)?s.inventory:[]).map(keyOf)),
      mats:new Set((Array.isArray(s.materials)?s.materials:[]).map(keyOf)),
      unlocked:new Set((Array.isArray(s.dungeon?.unlocked)?s.dungeon.unlocked:[]).map(Number))
    };
  }

  function card(type,icon,title,sub){
    return `<div class="v395-loot-card ${type}">
      <div class="ico">${icon}</div>
      <b>${title}</b>
      <span>${sub||''}</span>
    </div>`;
  }

  function repaint(before){
    const overlay=document.querySelector('#v231QuestReward');
    const extra=document.querySelector('#v231QuestRewardExtra');
    if(!overlay||!extra||!before?.active)return;

    const rows=[];

    const seedGain=Math.max(0,(Number(s.timeSeeds)||0)-before.timeSeeds);
    if(seedGain>0){
      rows.push(card('seed','🌱',`+${seedGain} Zeit-Samen`,`Neuer Bestand: ${Number(s.timeSeeds)||0}`));
    }

    const harzGain=Math.max(0,(Number(s.harzTaler)||0)-before.harz);
    if(harzGain>0){
      rows.push(card('harz','🟢',`+${harzGain} Harz-Taler`,`Premium-Beute`));
    }

    (Array.isArray(s.inventory)?s.inventory:[]).forEach(it=>{
      if(before.inv.has(keyOf(it)))return;
      const quality=typeof qualityMeta==='function'
        ?qualityMeta(it.quality||'gray')?.label
        :(it.quality||it.rarity||'Item');
      const q=String(it.quality||'gray').toLowerCase();
      rows.push(card(
        `item q-${q}`,
        window.v6107ItemImgHtml?.(it,'v395-loot-art')||it.icon||'🎁',
        it.name||'Item gefunden',
        `${quality||'Item'}${it.slot?` · ${it.slot}`:''}`
      ));
    });

    (Array.isArray(s.materials)?s.materials:[]).forEach(it=>{
      if(before.mats.has(keyOf(it)))return;

      if(it.type==='gem'){
        const stat=typeof v030StatLabel==='function'?v030StatLabel(it.stat):String(it.stat||'Bonus');
        rows.push(card(
          'gem',
          it.icon||'💎',
          it.name||'Edelstein',
          `${stat} +${Math.max(0,Number(it.value)||0)}`
        ));
      }else if(it.type==='scroll'){
        const effect=typeof v030EffectLabel==='function'
          ?v030EffectLabel(it.effect,Math.max(0,Number(it.value)||0))
          :`+${Math.max(0,Number(it.value)||0)}`;
        rows.push(card(
          'scroll',
          it.icon||'📜',
          it.name||'Verzauberungsrolle',
          effect
        ));
      }else{
        rows.push(card('item',it.icon||'🎁',it.name||'Material','Zusätzliche Beute'));
      }
    });

    const nowUnlocked=new Set((Array.isArray(s.dungeon?.unlocked)?s.dungeon.unlocked:[]).map(Number));
    [...nowUnlocked].forEach(i=>{
      if(before.unlocked.has(i))return;
      const d=dungeons?.[i];
      rows.push(card(
        'key',
        '🗿',
        d?.keyName||'Schlüsselstein',
        d?.name?`${d.name} freigeschaltet`:'Dungeon freigeschaltet'
      ));
    });

    extra.style.display='';
    extra.innerHTML=
      `<div class="v395-loot-title">🎁 Deine Beute</div>`+
      (rows.length
        ?`<div class="v395-loot-grid">${rows.join('')}</div>`
        :`<div class="v395-no-extra">Keine zusätzliche Beute bei dieser Quest.</div>`);

    overlay.classList.add('show');
  }

  /* V8.009: claim wrapper retired.
     v394 owns the late Local/Mirror reward step and calls these helpers directly
     after its Zeit-Samen roll, so the popup still sees the complete reward state. */
  window.v395QuestRewardSnapshot=snapshot;
  window.v395RepaintQuestReward=repaint;

  setTimeout(()=>{
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  },700);
})();
