/* ===== V4.02 visuals only: preserve V4.02/V4.02 balance & V4.02 fight math ===== */
function v252ClassVisual(){
  const map={
    grower:{face:'🧔‍♂️',weapon:'🪓',mark:'🌿',kind:'melee',name:'Bud-Barbar'},
    scout:{face:'🧝‍♂️',weapon:'🏹',mark:'🍃',kind:'arrow',name:'Blatt-Schütze'},
    bruiser:{face:'🧙‍♂️',weapon:'🪄',mark:'🔮',kind:'magic',name:'Bong-Magier'},
    frost:{face:'🥶',weapon:'⚔️',mark:'❄️',kind:'melee',name:'Bekiffter Frost-Todesritter'},
    summoner:{face:'🧙‍♀️',weapon:'🪄',mark:'👻',kind:'magic',name:'Harzruferin'}
  };
  return map[s.playerClass]||map.grower;
}
function v252EnemyVisual(){
  const di=v048DungeonIndex();
  const ri=v048RoomIndex(di);
  const e=dungeons?.[di]?.enemies?.[ri]||{};
  return {enemy:e,boss:!!e.boss||ri===9};
}
function v252EnsureFx(stage){
  if(!stage)return;
  if(!stage.querySelector('.v252-battle-fog'))stage.insertAdjacentHTML('afterbegin','<div class="v252-battle-fog"></div><div class="v252-battle-vs">DUNGEON DUELL</div><div class="v252-round-chip" id="v252RoundChip">BEREIT</div><div class="v252-screen-flash"></div><div class="v252-impact"></div><div class="v252-slash"></div><div class="v252-projectile"></div>');
}
function v252DecorateFighter(el,side){
  if(!el)return;
  const isPlayer=side==='player';
  const cv=v252ClassVisual();
  const ev=v252EnemyVisual();
  const avatar=el.querySelector('.fighter-avatar');
  const name=el.querySelector('.fighter-name');
  if(!avatar)return;
  const canonicalVisualOwner=!!window.__GL_DUNGEON_VISUAL_OWNER_PHASE2F__;
  if(isPlayer){
    /* Phase 1.2 cleanup: the canonical visual owner is the only code allowed to
       replace fighter artwork. Keep legacy HUD/name/FX logic, but never wipe the
       real player image with the old emoji fallback. */
    if(!canonicalVisualOwner)avatar.textContent=cv.face;
    if(name)name.innerHTML=`${cv.name} · Lv. <span id="battleLevel">${Number(s.level)||1}</span>`;
  }else{
    const v252HasRealEnemy=!!avatar.querySelector('.gl-dungeon-enemy-art,.gl-dungeon-d1-art,.v573-enemy-art,.v574-enemy-art,.v599-treant-art,.v600-treant-art');
    /* Same rule for opponents: old emoji may only exist when the canonical asset
       system is genuinely unavailable (e.g. a historic standalone build). */
    if(!canonicalVisualOwner&&!v252HasRealEnemy)avatar.textContent=ev.enemy?.icon||'👹';
    el.classList.toggle('v252-boss',ev.boss);
    if(name)name.textContent=ev.enemy?.name||'Dungeon-Gegner';
  }
  if(!el.querySelector('.v252-aura')){
    const shell=document.createElement('div');
    shell.className='v252-fighter-shell';
    while(el.firstChild)shell.appendChild(el.firstChild);
    el.appendChild(shell);
    shell.insertAdjacentHTML('afterbegin','<div class="v252-aura"></div><div class="v252-shadow"></div>');
    const av=shell.querySelector('.fighter-avatar');
    if(av){
      const weapon=document.createElement('div');weapon.className='v252-weapon';
      weapon.textContent=isPlayer?cv.weapon:(ev.enemy?.boss?'👑':'');
      av.parentElement.appendChild(weapon);
      const mark=document.createElement('div');mark.className='v252-class-mark';
      mark.textContent=isPlayer?cv.mark:(ev.boss?'☠️':'');
      av.parentElement.appendChild(mark);
    }
  }else if(isPlayer){
    const weapon=el.querySelector('.v252-weapon');if(weapon)weapon.textContent=cv.weapon;
    const mark=el.querySelector('.v252-class-mark');if(mark)mark.textContent=cv.mark;
  }
}
function v252ModernizeBattle(){
  const card=document.querySelector('#dungeonBattleCard');
  const stage=document.querySelector('#battleStage');
  if(!card||!stage)return false;
  v252EnsureFx(stage);
  v252DecorateFighter(document.querySelector('#playerFighter'),'player');
  v252DecorateFighter(document.querySelector('#enemyFighter'),'enemy');
  card.classList.toggle('v252-boss-fight',v252EnemyVisual().boss);
  return true;
}
function v252FxNode(cls){return document.querySelector(`#battleStage .${cls}`)}
function v252PulseNode(el,cl,ms=500){if(!el)return;el.classList.remove(cl);void el.offsetWidth;el.classList.add(cl);setTimeout(()=>el.classList.remove(cl),ms)}
function v252AttackFx(attacker,cl){
  const cv=v252ClassVisual();
  const player=attacker?.id==='playerFighter';
  const stage=document.querySelector('#battleStage');if(!stage)return;
  if(player){
    if(cv.kind==='melee'){
      const slash=v252FxNode('v252-slash');if(slash){slash.style.left='62%';slash.style.top='46%';v252PulseNode(slash,'show',430)}
    }else{
      const p=v252FxNode('v252-projectile');if(p){p.className=`v252-projectile ${cv.kind} player-shot`;setTimeout(()=>p.className='v252-projectile',430)}
    }
  }else{
    const p=v252FxNode('v252-projectile');if(p){p.className='v252-projectile enemy-shot';setTimeout(()=>p.className='v252-projectile',430)}
  }
}
function v252HitFx(target){
  const impact=v252FxNode('v252-impact');
  if(impact){
    impact.className='v252-impact';
    if(target?.id==='enemyFighter'){
      const kind=v252ClassVisual().kind;if(kind==='magic')impact.classList.add('magic');if(kind==='arrow')impact.classList.add('arrow');
      impact.style.left='72%';
    }else impact.style.left='28%';
    impact.style.top='47%';v252PulseNode(impact,'show',470);
  }
  v252PulseNode(v252FxNode('v252-screen-flash'),'show',280);
}
/* Existing final fight already calls these two helpers. Enrich them visually, do not change timing/math. */
const v252BaseAnimClass=animClass;
animClass=function(el,cl,ms=400){
  try{
    if(cl==='attack-right'||cl==='attack-left')v252AttackFx(el,cl);
    if(cl==='hit')v252HitFx(el);
  }catch(e){}
  return v252BaseAnimClass(el,cl,ms);
};
const v252BasePopDamage=popDamage;
popDamage=function(el,text){
  if(el){
    const crit=/KRIT|WUCHT|DOPPEL|MAGIE|!$/i.test(String(text||''));
    try{
      if(String(el.id||'')==='damagePlayer')window.v6111Sfx?.('enemyHit');
      else window.v6111Sfx?.(crit?'crit':'hit');
    }catch(e){}
    el.classList.toggle('v252-crit',crit);
    setTimeout(()=>el.classList.remove('v252-crit'),760);
  }
  try{
    const chip=document.querySelector('#v252RoundChip');
    if(chip)chip.textContent=/KRIT/i.test(String(text||''))?'KRITISCHER TREFFER':'TREFFER';
  }catch(e){}
  return v252BasePopDamage(el,text);
};
/* Phase 3: opponent refresh + fight-install wrappers retired.
   The canonical Dungeon owner now calls v246RefreshDungeonOpponent(),
   v252ModernizeBattle() and v253DecorateBattle() explicitly in one order. */
