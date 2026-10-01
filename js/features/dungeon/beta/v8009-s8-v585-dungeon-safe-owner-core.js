(function(){
  'use strict';
  if(window.__V585_DUNGEON_SAFE_OWNER__)return;
  window.__V585_DUNGEON_SAFE_OWNER__=true;

  const $=q=>document.querySelector(q);
  const clean=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  let lastLog='';

  function fxKind(txt){
    const t=String(txt||'').toUpperCase();
    if(/AUSGEWICHEN/.test(t))return'dodge';
    if(/KRIT|PERFEKTER SCHUSS|HINRICHTUNG/.test(t))return'crit';
    if(/WUCHT|BRUTALE ERNTE/.test(t))return'wucht';
    if(/RASEREI|SALVE|GRÜNER HAGEL|ZWILLINGSSCHNITT/.test(t))return'rage';
    if(/FROST|KÄLTE|REIF|EIS|NULLPUNKT|SEELEN|NEBENHAND/.test(t))return'frost';
    if(/RAUCH|NEBEL|DETONATION|SUPERNOVA|DOT/.test(t))return'magic';
    if(/BARRIERE|GEBLOCKT|ZWEITE LUFT|REDUZIERT|SCHILD|ÜBERLEBT/.test(t))return'guard';
    if(/HEIL|LEBENSRAUB| LP/.test(t))return'heal';
    return'';
  }

  function info(){
    let di=0,ri=0,d=null,e=null,rec=1;
    try{di=typeof v048DungeonIndex==='function'?Number(v048DungeonIndex()):Math.max(0,Number(s?.dungeon?.selected)||0)}catch(_){ }
    try{ri=typeof v048RoomIndex==='function'?Number(v048RoomIndex(di)):Math.max(0,Math.min(9,Number(s?.dungeon?.progress?.[di]??s?.dungeon?.room??0)))}catch(_){ }
    try{d=window.dungeons?.[di]||dungeons?.[di]||null;e=d?.enemies?.[ri]||null;rec=Number(e?.requiredLevel||d?.minLevel||1)||1;if(typeof v025EnemyStats==='function')rec=Number(v025EnemyStats(di,ri,e)?.rec)||rec}catch(_){ }
    return{di,ri,d,e,rec};
  }

  function config(di){
    try{return window.__V468_CFG__?.[String(di+1)]||window.__V468_CFG__?.[di+1]||null}catch(_){return null}
  }

  function background(di){
    const c=config(di),bg=String(c?.bg||'');
    if(bg&&!/^data:/i.test(bg))return `linear-gradient(180deg,rgba(1,5,3,.10),rgba(1,4,2,.42)),url("${bg}")`;
    const a=c?.accent||'#58c965',b=c?.accent2||'#23472c';
    const aa=/^#[0-9a-f]{6}$/i.test(a)?a+'38':'#58c96538';
    const bb=/^#[0-9a-f]{6}$/i.test(b)?b+'38':'#23472c38';
    return `radial-gradient(ellipse at 50% 18%,${aa} 0%,transparent 35%),radial-gradient(ellipse at 82% 58%,${bb} 0%,transparent 31%),linear-gradient(180deg,#0b1710 0%,${b} 48%,#050906 100%)`;
  }

  function ensureShell(){
    const card=$('#dungeonBattleCard'),stage=$('#battleStage');
    if(!card||!stage)return;
    card.classList.add('v575-combat');

    /* No runtime observer/painter stack. Remove leftovers once and leave the
       canonical fight DOM alone while a duel is running. */
    card.querySelectorAll(':scope > .v572-battle-head,:scope > .v573-head,:scope > .v574-head,:scope > .v572-event-log,:scope > .v573-event-log,:scope > .v574-log').forEach(n=>n.remove());
    stage.querySelectorAll('.v573-enemy-art,.v574-enemy-art,.v573-arena-title,.v573-round,.v573-proc-strip,.v574-stage-title,.v574-round,.v574-proc-strip').forEach(n=>n.remove());

    const {di,ri,d,e,rec}=info(),c=config(di);
    let head=card.querySelector(':scope > .v575-head');
    if(!head){head=document.createElement('div');head.className='v575-head';card.prepend(head)}
    const dname=clean(c?.title||d?.name||d?.title||`Dungeon ${di+1}`)||`Dungeon ${di+1}`;
    const headHtml=`<div class="v575-head-main"><div class="v575-kicker">DUNGEON KAMPF · GEGNER ${ri+1}/10</div><b class="v575-title">${dname}</b></div><div class="v575-recommend">Empfohlen Lv. ${Math.round(rec)}</div>`;
    if(head.innerHTML!==headHtml)head.innerHTML=headHtml;

    let title=stage.querySelector('.v575-stage-title');
    if(!title){title=document.createElement('div');title.className='v575-stage-title';stage.appendChild(title)}
    title.textContent='DUNGEON DUELL · E586';
    if(!stage.querySelector('.v575-round')){const r=document.createElement('div');r.className='v575-round';r.textContent='BEREIT';stage.appendChild(r)}
    if(!stage.querySelector('.v575-proc-strip')){const p=document.createElement('div');p.className='v575-proc-strip';stage.appendChild(p)}

    if(!card.querySelector(':scope > .v575-log')){
      const l=document.createElement('div');l.className='v575-log';
      l.innerHTML='<div class="v575-log-title"><span>📜 Kampfverlauf</span><small>letzte Runden</small></div><div class="v575-log-lines"></div>';
      stage.insertAdjacentElement('afterend',l);
    }

    /* Phase 2C: background ownership moved to the canonical dungeon visual owner. */
    const enemyName=$('#enemyBattleName');if(enemyName){const n=clean(c?.enemy?.[ri]||(ri===9?c?.boss:'')||e?.short||e?.name||'Dungeon-Gegner');if(enemyName.textContent!==n)enemyName.textContent=n}
    const playerName=$('#playerFighter .fighter-name');
    if(playerName){
      let cls='Legende';try{cls=window.classes?.[s?.playerClass]?.name||classes?.[s?.playerClass]?.name||cls}catch(_){ }
      const wanted=`${clean(s?.characterName||'Du')} · ${clean(cls)} · Lv. ${Number(s?.level)||1}`;
      if(clean(playerName.textContent)!==wanted)playerName.innerHTML=`${clean(s?.characterName||'Du')} · ${clean(cls)} · Lv. <span id="battleLevel">${Number(s?.level)||1}</span>`;
    }
  }

  function renderLog(text){
    const box=$('#dungeonBattleCard .v575-log-lines');if(!box||!text)return;
    const m=String(text).match(/Runde\s+(\d+)/i);
    const chip=$('#dungeonBattleCard .v575-round');
    if(!m){
      if(/Niederlage/i.test(text)){if(chip)chip.textContent='NIEDERLAGE';$('#dungeonBattleCard')?.classList.add('v577-defeat')}
      else if(/besiegt|Sieg|Belohnung/i.test(text)){if(chip)chip.textContent='SIEG';$('#dungeonBattleCard')?.classList.add('v577-victory')}
      return;
    }
    const round=Number(m[1])||0,body=clean(text).replace(/^Runde\s+\d+\s*:\s*/i,'');
    let row=box.querySelector(`[data-round="${round}"]`);
    if(!row){row=document.createElement('div');row.dataset.round=String(round);box.prepend(row)}
    row.className='v575-log-line '+fxKind(body);
    row.innerHTML=`<b>R${round}</b><span>${body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>`;
    while(box.children.length>4)box.lastElementChild.remove();
    if(chip)chip.textContent=`RUNDE ${round}`;
  }

  function bindLog(){
    const src=$('#battleLog');if(!src||src.__v585Bound)return;
    src.__v585Bound=true;
    const paint=()=>{const t=clean(src.textContent);if(!t||t===lastLog)return;lastLog=t;renderLog(t)};
    new MutationObserver(paint).observe(src,{childList:true,characterData:true,subtree:true});
    paint();
  }

  function sync(){
    try{
      const dungeon=$('#dungeon'),card=$('#dungeonBattleCard');
      if(!dungeon?.classList.contains('active')||!card)return;
      ensureShell();bindLog();
    }catch(e){console.error('V5.85 visual owner',e)}
  }
  /* Phase 2.2: expose the already-existing battle HUD owner so the canonical
     dungeon dispatcher can invoke it directly. This replaces the retired
     renderDungeon wrapper without creating another render layer. */
  window.v585SyncDungeonBattle=sync;

  /* One slow maintenance tick only. No resolver wrappers, no subtree observer,
     no render wrapper, no combat timer, and no requestAnimationFrame owner. */
  /* V5.86: no periodic full-card repaint. Sync only after actual dungeon renders
     or user/navigation events. */
  /* Sprint 2: renderDungeon wrapper retired. The canonical D2 battle
     pipeline invokes window.v585SyncDungeonBattle() directly. */
  document.addEventListener('click',ev=>{if(ev.target?.closest?.('#dungeon'))setTimeout(sync,0)},{passive:true});
  window.addEventListener('pageshow',sync,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()},{passive:true});
  setTimeout(sync,0);
})();
