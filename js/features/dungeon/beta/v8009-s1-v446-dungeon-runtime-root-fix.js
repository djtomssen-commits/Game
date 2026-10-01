(function(){
  'use strict';
  if(window.__V446_DUNGEON_ROOT_FIX__) return;
  window.__V446_DUNGEON_ROOT_FIX__=true;

  const HOUR=3600000;

  /* =========================================================
     A) D9-VORSCHAU: Endlosschleife des alten MutationObservers stoppen.
     Der alte Observer entfernte/erzeugte in der Vorschau fortlaufend DOM
     und blockierte dadurch Timer und Kampf-Ticks auf Mobile.
     ========================================================= */
  try{
    const sec=document.getElementById('dungeon');
    sec?.__v441PreviewObserver?.disconnect?.();
    sec?.__v443D9LaunchObserver?.disconnect?.();
  }catch(e){}

  function previewActive(){
    return !!(
      window.__v441Dungeon9Preview?.active ||
      document.querySelector('#dungeonMapCard.v441-preview-mode')
    );
  }

  /* Sprint 2: retired production-dead D9 preview launcher and its
     renderDungeon wrapper. previewActive() remains as a safety guard for any
     stale preview state, while timer/combat ownership stays unchanged. */

  /* =========================================================
     B) TIMER: eine einzige Zeitquelle.
     Alle alten Painter dürfen weiter existieren, bekommen aber über
     dungeonWaitText exakt denselben Wert. rAF korrigiert sichtbare
     Timer sofort, falls ein alter Painter dazwischen schreibt.
     ========================================================= */
  function leftMs(){
    try{
      const last=Math.max(0,Number(s?.dungeonPass?.lastFree)||0);
      return Math.max(0,HOUR-(Date.now()-last));
    }catch(e){ return 0; }
  }

  function fmt(ms,withHours=false){
    const total=Math.max(0,Math.ceil((Number(ms)||0)/1000));
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const sec=total%60;
    if(withHours || h>0){
      return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    }
    return `${m}:${String(sec).padStart(2,'0')}`;
  }

  const exactWaitText=function(){
    const left=leftMs();
    return left<=0 ? 'Kostenloser Versuch bereit' : `Timer ${fmt(left,false)}`;
  };

  try{
    dungeonWaitText=exactWaitText;
    window.dungeonWaitText=exactWaitText;
  }catch(e){}

  let lastTimerSecond=-1;
  function paintTimer(force=false){
    try{
      const dungeon=document.getElementById('dungeon');
      if(!dungeon?.classList.contains('active')) return;
      if(previewActive()) return;

      const left=leftMs();
      const sec=Math.max(0,Math.ceil(left/1000));
      if(!force && sec===lastTimerSecond) return;
      lastTimerSecond=sec;

      const ticket=left<=0 ? 'Kostenloser Versuch bereit' : `Timer ${fmt(left,false)}`;
      document.querySelectorAll('[id="dungeonTicketText"]').forEach(el=>{
        if(el.textContent!==ticket) el.textContent=ticket;
      });

      const box=document.getElementById('v324DungeonCountdown');
      if(box){
        const di=Math.max(0,Math.min((dungeons?.length||1)-1,Number(s?.dungeon?.selected)||0));
        const done=typeof dungeonCompleted==='function' && dungeonCompleted(di);
        if(done){
          box.style.display='none';
        }else{
          box.style.display='block';
          if(left<=0){
            box.className='ready';
            box.textContent='✅ Nächster Dungeon-Kampf kostenlos bereit';
          }else{
            box.className='wait';
            box.textContent=`⏳ Nächster kostenloser Kampf in ${fmt(left,true)} · oder sofort für 1 Harz-Taler`;
          }
        }
      }
    }catch(e){}
  }

  /* V5.86: Countdown only repaints when the displayed second can change.
     This replaces the permanent 60-FPS rAF poll that competed with combat animation. */
  let v586TimerClock=0;
  function v586ScheduleTimer(){
    paintTimer(false);
    const left=leftMs();
    let wait=1000;
    if(left>0){
      const rem=Math.round(left%1000);
      wait=rem>70?rem+20:1000;
    }
    v586TimerClock=setTimeout(v586ScheduleTimer,Math.max(90,wait));
  }
  v586ScheduleTimer();
  window.addEventListener('pageshow',()=>paintTimer(true),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) paintTimer(true);
  },{passive:true});

  /* =========================================================
     C) KAMPF: Window-Capture ist vor allen alten document/onclick-
     Handlern. Der Kampf läuft mit requestAnimationFrame statt mit
     den historischen Timer-Ketten. Talentfehler werden abgefangen.
     ========================================================= */
  function ensureSkipFightButton(){
    const main=document.getElementById('fightBtn');
    const card=document.getElementById('dungeonBattleCard');
    if(!main||!card)return null;
    let btn=document.getElementById('v446SkipFight');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id='v446SkipFight';
      btn.className='btn secondary';
      btn.hidden=true;
      btn.textContent='⏩ KAMPF ÜBERSPRINGEN';
      main.insertAdjacentElement('afterend',btn);
    }
    return btn;
  }

  function currentFight(){
    const di=typeof v048DungeonIndex==='function'
      ? Number(v048DungeonIndex())
      : Math.max(0,Math.min((dungeons?.length||1)-1,Number(s?.dungeon?.selected)||0));

    const dungeon=dungeons?.[di];

    const idx=typeof v048RoomIndex==='function'
      ? Number(v048RoomIndex(di))
      : Math.max(0,Math.min(9,Number(s?.dungeon?.progress?.[di] ?? s?.dungeon?.room ?? 0)));

    return {di,dungeon,idx,enemy:dungeon?.enemies?.[idx]};
  }

  async function runFight(button){
    if(window.__V446_FIGHTING__ || previewActive()) return;

    let data=currentFight();
    if(!data.dungeon || !data.enemy) return;

    if(typeof dungeonCompleted==='function' && dungeonCompleted(data.di)){
      window.v063Toast?.('Dieser Dungeon ist bereits abgeschlossen.','warn');
      return;
    }
    if(typeof dungeonAvailable==='function' && !dungeonAvailable(data.di)){
      window.v063Toast?.('Dieser Dungeon ist noch nicht betretbar.','warn');
      return;
    }
    if(!s?.playerClass){
      window.v063Toast?.('Wähle zuerst deine Klasse.','warn');
      return;
    }

    let attempt=false;
    try{
      attempt=await consumeDungeonAttempt();
    }catch(err){
      console.error('V4.246 Versuch',err);
    }
    if(!attempt){
      paintTimer(true);
      return;
    }

    data=currentFight();
    const {di,dungeon,idx,enemy}=data;
    if(!dungeon || !enemy) return;

    window.__V446_FIGHTING__=true;
    try{battleBusy=true}catch(e){}

    const liveButton=document.getElementById('fightBtn') || button;
    if(liveButton){
      liveButton.disabled=true;
      liveButton.textContent='⚔️ KAMPF LÄUFT';
    }
    const skipButton=ensureSkipFightButton();
    if(skipButton){
      skipButton.hidden=false;
      skipButton.disabled=false;
      skipButton.textContent='⏩ KAMPF ÜBERSPRINGEN';
    }

    s.dungeon.lastActive=di;
    s.dungeon.lastActiveAt=Date.now();
    s.dungeon.view='battle';

    try{persist(false)}catch(e){}

    const bal=(()=>{
      try{
        if(typeof v025EnemyStats==='function') return v025EnemyStats(di,idx,enemy);
      }catch(e){}
      return {
        rec:Number(enemy.requiredLevel)||Number(dungeon.minLevel)||1,
        hp:Math.max(1,Number(enemy.hp)||100),
        attack:Math.max(3,Math.round((Number(enemy.hp)||100)/12))
      };
    })();

    const pFactor=(()=>{
      try{return typeof v060PlayerDamageFactor==='function' ? v060PlayerDamageFactor(bal.rec) : 1}
      catch(e){return 1}
    })();

    const eFactor=(()=>{
      try{return typeof v060EnemyDamageFactor==='function' ? v060EnemyDamageFactor(bal.rec) : 1}
      catch(e){return 1}
    })();

    const maxPlayer=Math.max(1,Number(maxHp())||1);
    const maxEnemy=Math.max(1,Number(bal.hp)||1);
    let playerHp=maxPlayer;
    let enemyHp=maxEnemy;
    let round=0;
    let playerTurn=true;
    let finished=false;
    let skipMode=false;
    const fightStartedAt=performance.now();
    let nextTurnAt=fightStartedAt;

    const playerBar=document.getElementById('playerHpBar');
    const enemyBar=document.getElementById('enemyHpBar');
    const playerText=document.getElementById('playerHpText');
    const enemyText=document.getElementById('enemyHpText');
    const log=document.getElementById('battleLog');
    const loot=document.getElementById('loot');

    if(loot) loot.innerHTML='';
    if(playerText) playerText.textContent=playerHp;
    if(enemyText) enemyText.textContent=enemyHp;
    if(playerBar) playerBar.style.width='100%';
    if(enemyBar) enemyBar.style.width='100%';
    if(log) log.textContent=`${enemy.name} · Empfohlen Lv. ${bal.rec}`;

    let talentState=null;
    try{
      if(typeof v318NewCombatState==='function'){
        talentState=v318NewCombatState('dungeon',maxPlayer);
      }
    }catch(err){
      console.warn('V4.246 Talentstatus übersprungen',err);
    }

    function syncBars(){
      if(playerText) playerText.textContent=Math.max(0,Math.round(playerHp));
      if(enemyText) enemyText.textContent=Math.max(0,Math.round(enemyHp));
      if(playerBar) playerBar.style.width=`${Math.max(0,Math.min(100,playerHp/maxPlayer*100))}%`;
      if(enemyBar) enemyBar.style.width=`${Math.max(0,Math.min(100,enemyHp/maxEnemy*100))}%`;
    }

    function finish(win){
      if(finished) return;
      finished=true;

      const finalize=()=>{
      window.__V446_FIGHTING__=false;
      try{battleBusy=false}catch(e){}

      const btn=document.getElementById('fightBtn') || liveButton;
      if(btn){
        btn.disabled=false;
        btn.textContent=win?'🏆 SIEG':'⚔️ ERNEUT KÄMPFEN';
      }
      const skip=document.getElementById('v446SkipFight');
      if(skip){skip.hidden=true;skip.disabled=true;skip.textContent='⏩ KAMPF ÜBERSPRINGEN'}
      try{if(window.__GL_DUNGEON_SKIP_FIGHT__===skipFight)window.__GL_DUNGEON_SKIP_FIGHT__=null}catch(_){}

      s.dungeon.view='reward';

      if(win){
        const baseXp=Math.max(0,Number(enemy.xp)||0);
        const baseGold=Math.max(0,Math.round(typeof window.v6168DungeonGold==='function'?window.v6168DungeonGold(Number(s?.level)||1,!!enemy.boss):(Number(enemy.gold)||0)));

        const xpEvent=(typeof v094XpEventActive==='function' && v094XpEventActive()) ? baseXp*2 : baseXp;
        const goldEvent=(typeof v274GoldEventActive==='function' && v274GoldEventActive()) ? baseGold*2 : baseGold;

        const actualGold=typeof v408GuildGold==='function'
          ? v408GuildGold(goldEvent)
          : goldEvent;

        const actualXp=typeof v408GuildPct==='function'
          ? Math.round(xpEvent*(1+v408GuildPct('xp')/100))
          : xpEvent;

        s.gold=(Number(s.gold)||0)+actualGold;
        // Dungeon XP must credit the same guild/event-adjusted value shown in the reward UI.
        addXp(actualXp);

        let rewardItem=null;
        let harzGain=0;

        try{
          if(enemy.boss){
            rewardItem=typeof v246MakeBossEpic==='function'
              ? v246MakeBossEpic()
              : makeClassLoot(s.playerClass||'grower','dungeon');

            if(rewardItem){
              if(!rewardItem.quality) rewardItem.quality='purple';
              s.inventory.push(rewardItem);
            }
          }else if(Math.random()<.22){
            if(Math.random()<.8){
              rewardItem=makeClassLoot(s.playerClass||'grower','dungeon');
            }else{
              const other=['grower','bruiser','scout','frost','summoner'].filter(x=>x!==s.playerClass);
              rewardItem=makeClassLoot(other[Math.floor(Math.random()*other.length)],'dungeon');
            }
            if(rewardItem) s.inventory.push(rewardItem);
          }
        }catch(err){
          console.error('V4.246 Loot',err);
        }

        if(enemy.boss){
          s.story.bossesDefeated=(Number(s.story.bossesDefeated)||0)+1;
          s.story.chapter=Math.min(4,1+Math.floor(s.story.bossesDefeated/2));

          if(Math.random()<.22){
            s.harzTaler=(Number(s.harzTaler)||0)+1;
            harzGain=1;
          }

          if(!Array.isArray(s.dungeon.completed)) s.dungeon.completed=[];
          if(!s.dungeon.completed.includes(di)) s.dungeon.completed.push(di);
          s.dungeon.room=9;
          s.dungeon.progress[di]=9;
        }else{
          s.dungeon.room=idx+1;
          s.dungeon.progress[di]=idx+1;
        }

        try{if(!window.GL_EVENTS)window.v411AwardGuildActivity?.('dungeon')}catch(e){}

        try{persist(false)}catch(e){}

        try{
          if(typeof v247ShowDungeonReward==='function'){
            v247ShowDungeonReward({
              dungeonIndex:di,
              roomIndex:idx,
              enemy,
              xp:actualXp,
              gold:actualGold,
              baseXp,
              baseGold,
              item:rewardItem,
              harz:harzGain,
              boss:!!enemy.boss
            });
          }else if(loot){
            loot.innerHTML=`<div class="loot good">🏆 Sieg! +${actualXp} XP · +${actualGold} Gold</div>`;
          }
        }catch(err){
          console.error('V4.246 Belohnung',err);
          if(loot) loot.innerHTML=`<div class="loot good">🏆 Sieg! +${actualXp} XP · +${actualGold} Gold</div>`;
        }

        if(log){
          log.textContent=enemy.boss
            ? 'Boss besiegt. Bestätige deine Belohnung.'
            : `Gegner ${idx+1} besiegt. Gegner ${idx+2} ist jetzt aktiv.`;
        }
      }else{
        try{persist(false)}catch(e){}
        if(loot){
          loot.innerHTML=`
            <div class="loot" style="color:#ff9895">💀 Niederlage. Verbessere Attribute oder Ausrüstung.</div>
            <button class="btn secondary" id="v446ReturnMap" style="width:100%;margin-top:10px">🗺️ Zurück zur Dungeon-Karte</button>
          `;
        }
        if(log) log.textContent=`Niederlage · Gegner empfohlen Lv. ${bal.rec}.`;

        try{window.v587ShowDungeonDefeat?.({dungeonIndex:di,roomIndex:idx,enemy,rec:bal.rec})}catch(e){console.error('V5.87 Niederlage-Overlay',e)}

        const back=document.getElementById('v446ReturnMap');
        if(back){
          back.onclick=()=>{
            s.dungeon.layer='dungeon';
            s.dungeon.view='map';
            try{persist(false)}catch(e){}
            try{
              if(typeof renderDungeon==='function')renderDungeon();
              else if(typeof v244RenderSelectedDungeonMap==='function')v244RenderSelectedDungeonMap();
            }catch(e){}
          };
        }
      }

      try{window.v069SyncCurrencies?.()}catch(e){}
      try{window.renderInventory?.()}catch(e){}
      paintTimer(true);
      };

      /* V6.229: a boss can legitimately be decided in one or two hits. Keep the
         calculated outcome unchanged, but do not let the reward/defeat overlay
         cover the actual final hit before the player can see it. Manual skip
         remains instant by design. */
      if(enemy?.boss && !skipMode){
        const elapsed=Math.max(0,performance.now()-fightStartedAt);
        const wait=Math.max(360,1200-elapsed);
        const pendingSkip=document.getElementById('v446SkipFight');
        if(pendingSkip)pendingSkip.disabled=true;
        if(log){
          log.textContent += win
            ? ' · Boss fällt – Kampf entschieden.'
            : ' · Der Boss entscheidet den Kampf.';
        }
        setTimeout(finalize,wait);
        return;
      }
      finalize();
    }

    function playerAttack(){
      round++;

      let primary=0;
      try{
        primary=typeof v029PrimaryStat==='function'
          ? Number(v029PrimaryStat())||0
          : Number(totalAttr('staerke'))||0;
      }catch(e){}

      const baseDamage=Math.max(
        3,
        Math.floor((primary*1.9+(Number(s.level)||1)*1.55+Math.random()*7)*Number(pFactor||1))
      );

      let damage=baseDamage;
      let heal=0;
      let crit=false;
      let label='TREFFER';

      try{
        if(talentState && typeof v318ResolvePlayerAttack==='function'){
          const a=v318ResolvePlayerAttack(talentState,{
            baseDamage,
            enemyHp,
            enemyMax:maxEnemy,
            playerHp,
            playerMax:maxPlayer,
            baseCrit:Math.min(.30,.04+(Number(totalAttr('glueck'))||0)*.012),
            setCrit:s.playerClass==='bruiser' ? (.07+Number(setBonusValue('critChance')||0)) : 0,
            baseWucht:(s.playerClass==='grower'||s.playerClass==='frost') ? (.13+Number(setBonusValue('wuchtChance')||0)) : 0,
            baseDouble:s.playerClass==='scout' ? (.15+Number(setBonusValue('doubleChance')||0)) : 0,
            setDoubleDamage:Number(setBonusValue('doubleDamage')||0)
          })||{};

          damage=Math.max(1,Math.round(Number(a.damage)||baseDamage));
          heal=Math.max(0,Math.round(Number(a.heal)||0));
          crit=!!a.crit;
          label=a.text||label;
        }
      }catch(err){
        console.warn('V4.246 Spieler-Talent fallback',err);
      }

      playerHp=Math.min(maxPlayer,playerHp+heal);
      enemyHp=Math.max(0,enemyHp-damage);

      if(!skipMode){
        try{animClass(document.getElementById('playerFighter'),'attack-right')}catch(e){}
        try{popDamage(document.getElementById('damageEnemy'),`-${damage}${crit?'!':''}`)}catch(e){}
      }

      syncBars();

      if(log&&!skipMode){
        log.textContent=`Runde ${round}: ${label} · ${damage} Schaden${heal?` · +${heal} LP`:''}`;
      }

      if(enemyHp<=0){
        finish(true);
        return false;
      }
      return true;
    }

    function enemyAttack(){
      let armor=0;
      try{armor=Number(totalAttr('ruestung'))||0}catch(e){}

      const baseDamage=Math.max(
        3,
        Math.floor((Number(bal.attack||5)+Math.random()*7-armor*.34)*Number(eFactor||1))
      );

      let damage=baseDamage;
      let heal=0;
      let counter=0;
      let prevent=false;
      let label='Gegner trifft';

      try{
        if(talentState && typeof v318ResolveEnemyAttack==='function'){
          const d=v318ResolveEnemyAttack(talentState,{
            damage:baseDamage,
            playerHp,
            playerMax:maxPlayer
          })||{};

          damage=Math.max(0,Math.round(Number(d.damage)||0));
          heal=Math.max(0,Math.round(Number(d.heal)||0));
          counter=Math.max(0,Math.round(Number(d.counterDamage)||0));
          prevent=!!d.preventLethal;
          label=d.text||label;
        }
      }catch(err){
        console.warn('V4.246 Gegner-Talent fallback',err);
      }

      playerHp=Math.min(maxPlayer,playerHp+heal);
      playerHp=Math.max(0,playerHp-damage);
      if(prevent && playerHp<=0) playerHp=1;

      if(counter) enemyHp=Math.max(0,enemyHp-counter);

      if(!skipMode){
        try{animClass(document.getElementById('enemyFighter'),'attack-left')}catch(e){}
        try{if(damage)popDamage(document.getElementById('damagePlayer'),`-${damage}`)}catch(e){}
      }

      syncBars();

      if(log&&!skipMode){
        const special=String(label||'').replace(/^Gegner trifft\s*·?\s*/i,'').trim();
        const enemyPart=/AUSGEWICHEN/i.test(String(label||''))
          ? 'Gegner: AUSGEWICHEN'
          : `Gegner: ${damage} Schaden${special&&special!=='Gegner trifft'?` · ${special}`:''}`;
        log.textContent+=` · ${enemyPart}${counter?` · Konter ${counter}`:''}${heal?` · +${heal} LP`:''}`;
      }

      if(enemyHp<=0){
        finish(true);
        return false;
      }
      if(playerHp<=0){
        finish(false);
        return false;
      }
      if(round>=45){
        finish((playerHp/maxPlayer)>(enemyHp/maxEnemy));
        return false;
      }
      return true;
    }

    function skipFight(){
      if(finished||skipMode)return;
      skipMode=true;
      nextTurnAt=Number.POSITIVE_INFINITY;
      const skip=document.getElementById('v446SkipFight');
      if(skip){skip.disabled=true;skip.textContent='⏩ KAMPF WIRD BERECHNET …'}
      let guard=0;
      while(!finished&&guard<100){
        guard++;
        const cont=playerTurn?playerAttack():enemyAttack();
        if(!cont||finished)break;
        playerTurn=!playerTurn;
      }
      syncBars();
      if(!finished)finish((playerHp/maxPlayer)>(enemyHp/maxEnemy));
    }
    window.__GL_DUNGEON_SKIP_FIGHT__=skipFight;

    /* Erster Schlag sofort. Danach rAF-Takt, unabhängig von den alten
       setTimeout/setInterval-Ketten und deren Runtime-Governor. */
    playerAttack();
    if(finished) return;

    playerTurn=false;                 // als Nächstes Gegner
    nextTurnAt=performance.now()+430;

    function frame(now){
      if(finished||skipMode) return;

      if(now>=nextTurnAt){
        try{
          if(playerTurn){
            if(!playerAttack()) return;
          }else{
            if(!enemyAttack()) return;
          }
        }catch(err){
          console.error('V4.246 Kampfrunde',err);
        }

        playerTurn=!playerTurn;
        nextTurnAt=now+430;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /*
    WINDOW-CAPTURE läuft vor document-capture und vor onclick.
    Dadurch hat nur dieser Kampf-Handler Besitz am Fight-Button.
  */
  window.addEventListener('click',function(ev){
    const skip=ev.target?.closest?.('#v446SkipFight');
    if(!skip)return;
    if(!document.getElementById('dungeon')?.classList.contains('active'))return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    try{window.__GL_DUNGEON_SKIP_FIGHT__?.()}catch(err){console.error('Dungeon Kampf überspringen',err)}
  },true);

  window.addEventListener('click',function(ev){
    const btn=ev.target?.closest?.('#fightBtn');
    if(!btn) return;
    if(!document.getElementById('dungeon')?.classList.contains('active')) return;
    if(previewActive()) return;

    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();

    runFight(btn).catch(err=>{
      console.error('V4.246 Kampfstart',err);
      window.__V446_FIGHTING__=false;
      try{battleBusy=false}catch(e){}
      const live=document.getElementById('fightBtn');
      if(live) live.disabled=false;
      paintTimer(true);
    });
  },true);

  paintTimer(true);
})();
