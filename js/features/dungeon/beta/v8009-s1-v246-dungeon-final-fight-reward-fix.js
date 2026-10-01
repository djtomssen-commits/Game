/* ===== V4.02 canonical dungeon opponent + reward fix ===== */

/*
  One authoritative opponent repaint.
  This prevents a defeated enemy from remaining visible when the next
  room is selected.
*/
function v246RefreshDungeonOpponent(){
  const di=v048DungeonIndex();
  const ri=v048RoomIndex(di);
  const d=dungeons?.[di];
  const e=d?.enemies?.[ri];

  if(!d || !e)return false;

  const completed=dungeonCompleted(di);
  const bal=v025EnemyStats(di,ri,e);

  const name=document.querySelector('#enemyName');
  const battleName=document.querySelector('#enemyBattleName');
  const icon=document.querySelector('#enemyIcon');
  const tier=document.querySelector('#enemyTier');
  const hp=document.querySelector('#enemyHpText');
  const hpBar=document.querySelector('#enemyHpBar');
  const playerHp=document.querySelector('#playerHpText');
  const playerBar=document.querySelector('#playerHpBar');
  const level=document.querySelector('#battleLevel');
  const log=document.querySelector('#battleLog');
  const loot=document.querySelector('#loot');

  if(name){
    name.textContent=completed
      ?'Dungeon versiegelt'
      :e.name;
  }

  if(battleName){
    battleName.textContent=completed
      ?'Abgeschlossen'
      :(e.short||e.name);
  }

  if(icon){
    /* Canonical dungeon artwork owns the avatar once installed. Never replace
       its child image with legacy emoji text during a combat refresh. */
    const canonicalArt=icon.querySelector?.(':scope > .gl-dungeon-enemy-art,:scope > .gl-dungeon-d1-art');
    if(!canonicalArt){
      icon.textContent=completed
        ?'⛓️'
        :(e.icon||'👹');
    }
  }

  if(tier){
    tier.textContent=completed
      ?'GESCHLOSSEN'
      :(e.boss
        ?`BOSS · Empfohlen Lv. ${bal.rec}`
        :`Gegner ${ri+1} · Empfohlen Lv. ${bal.rec}`);
  }

  if(hp){
    hp.textContent=completed?'0':String(bal.hp);
  }

  if(hpBar){
    hpBar.style.width=completed?'0%':'100%';
  }

  if(playerHp){
    playerHp.textContent=String(maxHp());
  }

  if(playerBar){
    playerBar.style.width='100%';
  }

  if(level){
    level.textContent=String(s.level);
  }

  if(log && !battleBusy){
    log.textContent=completed
      ?'Dieser Dungeon wurde abgeschlossen.'
      :`${e.name} wartet auf dich.`;
  }

  if(loot){
    loot.innerHTML='';
  }

  return true;
}


/*
  Boss loot:
  - 100% one Epic item
  - 12% genuine class set item
  - otherwise normal class item forced to purple Epic
*/
function v246MakeBossEpic(){
  if(Math.random()<.12){
    const slot=setBases[
      Math.floor(Math.random()*setBases.length)
    ].slot;

    return makeSetItem(
      s.playerClass||'grower',
      slot
    );
  }

  const it=makeClassLoot(
    s.playerClass||'grower',
    'normal'
  );

  const meta=qualityMeta('purple');

  /*
    Recalculate from the base item bonuses so this is a genuine Epic,
    not merely a purple CSS label.
  */
  const base=(classGear[s.playerClass||'grower']||classGear.grower)
    .find(x=>x.slot===it.slot && x.icon===it.icon) ||
    (classGear[s.playerClass||'grower']||classGear.grower)
      .find(x=>x.slot===it.slot);

  if(base){
    const boost=Math.max(
      0,
      Math.floor((s.level-1)/3)
    );

    it.bonus=Object.fromEntries(
      Object.entries(base.bonus).map(
        ([k,v])=>[k,v+meta.mult+boost]
      )
    );

    const plainName=String(base.name||it.name)
      .replace(/^.*?:\s*/,'')
      .replace(/\s*\[Lv\.\d+\]\s*$/,'');

    it.name=`${meta.label}: ${plainName} [Lv.${s.level}]`;
  }

  it.quality='purple';
  it.rarity=meta.cls;
  it.dropLevel=s.level;

  return it;
}


function v246DungeonRewardItemHtml(found,boss=false){
  let inner='';

  try{
    inner=v240ItemRewardHtml(found);
  }catch(e){
    inner=`
      <div class="loot">
        🎁 ${v240Esc(found?.name||'Item gefunden')}
        <br><span class="tiny">${v240Esc(itemBonus(found))}</span>
      </div>
    `;
  }

  return `
    <div class="v246-dungeon-item">
      ${boss
        ?'<div class="v246-boss-guarantee">💜 BOSS-BELOHNUNG · GARANTIERT EPIC</div>'
        :''
      }
      ${inner}
    </div>
  `;
}


/*
  Final fight handler.
  Based on the tested V4.02 async-safe combat flow, but:
  - refreshes the current opponent before every attempt
  - guarantees one Epic on every dungeon boss
  - uses the full visual item reward card
  - keeps Gold/XP/Harz/progress/completion logic unchanged
*/
function v246InstallFight(){
  const btn=document.querySelector('#fightBtn');
  if(!btn)return;

  btn.onclick=async()=>{
    if(battleBusy)return;

    /*
      IMPORTANT: Read current room only now.
      Never reuse a stale enemy object from the previous fight.
    */
    v246RefreshDungeonOpponent();

    const di=v048DungeonIndex();
    const d=dungeons?.[di];
    const idx=v048RoomIndex(di);
    const e=d?.enemies?.[idx];

    if(!d||!e)return;

    if(dungeonCompleted(di)){
      if(typeof v063Toast==='function'){
        v063Toast(
          'Dieser Dungeon ist bereits abgeschlossen.',
          'warn'
        );
      }
      return;
    }

    if(!dungeonAvailable(di)){
      if(typeof v063Toast==='function'){
        v063Toast(
          'Dieser Dungeon ist noch nicht betretbar.',
          'warn'
        );
      }
      return;
    }

    if(!s.playerClass){
      if(typeof v063Toast==='function'){
        v063Toast(
          'Wähle zuerst deine Klasse.',
          'warn'
        );
      }
      return;
    }

    const attemptAllowed=
      await consumeDungeonAttempt();

    if(!attemptAllowed)return;

    /*
      Cloud/local state could have changed while the confirmation dialog
      was open. Re-read room and opponent before combat.
    */
    const fightDi=v048DungeonIndex();
    const fightIdx=v048RoomIndex(fightDi);
    const fightDungeon=dungeons?.[fightDi];
    const fightEnemy=fightDungeon?.enemies?.[fightIdx];

    if(!fightDungeon||!fightEnemy)return;

    /* V4.159: Hall of Haze must reflect the dungeon actually fought, not a merely viewed map. */
    s.dungeon.lastActive=fightDi;
    s.dungeon.lastActiveAt=Date.now();
    s.dungeon.view='battle';

    try{persist(false)}catch(e){
      try{
        localStorage.setItem(
          KEY,
          JSON.stringify(s)
        );
      }catch(_){}
    }

    v246RefreshDungeonOpponent();

    battleBusy=true;
    btn.disabled=true;

    const loot=document.querySelector('#loot');
    if(loot)loot.innerHTML='';

    const bal=v025EnemyStats(
      fightDi,
      fightIdx,
      fightEnemy
    );

    const pFactor=
      v060PlayerDamageFactor(bal.rec);

    const eFactor=
      v060EnemyDamageFactor(bal.rec);

    const maxP=maxHp();

    let pHp=maxP;
    let eHp=bal.hp;
    let round=0;

    const pBar=document.querySelector('#playerHpBar');
    const eBar=document.querySelector('#enemyHpBar');
    const pTxt=document.querySelector('#playerHpText');
    const eTxt=document.querySelector('#enemyHpText');
    const log=document.querySelector('#battleLog');

    if(pTxt)pTxt.textContent=pHp;
    if(eTxt)eTxt.textContent=eHp;
    if(pBar)pBar.style.width='100%';
    if(eBar)eBar.style.width='100%';

    if(log){
      log.textContent=
        `${fightEnemy.name} · Empfohlen Lv. ${bal.rec}`;
    }

    const showResult=win=>{
      battleBusy=false;
      btn.disabled=false;
      try{
        document.querySelector('#dungeonBattleCard')?.classList.remove('v252-fighting');
        const chip=document.querySelector('#v252RoundChip');if(chip)chip.textContent='BEREIT';
      }catch(_){ }
      s.dungeon.view='reward';

      if(win){
        const v286DungeonXpBase=Math.max(0,Number(fightEnemy.xp)||0);
        const v286DungeonGoldBase=Math.max(0,Number(fightEnemy.gold)||0);
        const v286DungeonXp=
          (typeof v094XpEventActive==='function' && v094XpEventActive())
            ?v286DungeonXpBase*2
            :v286DungeonXpBase;
        const v286DungeonGold=
          (typeof v274GoldEventActive==='function' && v274GoldEventActive())
            ?v286DungeonGoldBase*2
            :v286DungeonGoldBase;

        const v415DungeonGoldActual=
          typeof v408GuildGold==='function'
            ?v408GuildGold(v286DungeonGold)
            :v286DungeonGold;
        const v415DungeonXpActual=
          typeof v408GuildPct==='function'
            ?Math.round(v286DungeonXp*(1+v408GuildPct('xp')/100))
            :v286DungeonXp;

        s.gold+=v415DungeonGoldActual;
        addXp(v286DungeonXp);

        let rewardHtml=`
          <div class="loot good">
            Sieg! +${v415DungeonXpActual} XP${v286DungeonXp!==v286DungeonXpBase?' · 2× EVENT':''}
            · +${v415DungeonGoldActual} Gold${v286DungeonGold!==v286DungeonGoldBase?' · 2× EVENT':''}
          </div>
        `;

        let v247RewardItem=null;
        let v247HarzGain=0;

        /*
          Normal enemy: existing 22% item chance.
          Boss: guaranteed one Epic.
        */
        if(fightEnemy.boss){
          const found=v246MakeBossEpic();

          if(found){
            v247RewardItem=found;
            s.inventory.push(found);
            rewardHtml+=v246DungeonRewardItemHtml(
              found,
              true
            );
          }
        }else if(Math.random()<.22){
          let found;

          if(Math.random()<.8){
            found=makeClassLoot(
              s.playerClass||'grower',
              'dungeon'
            );
          }else{
            const other=[
              'grower',
              'bruiser',
              'scout'
            ].filter(x=>x!==s.playerClass);

            found=makeClassLoot(
              other[
                Math.floor(Math.random()*other.length)
              ],
              'dungeon'
            );
          }

          if(found){
            v247RewardItem=found;
            s.inventory.push(found);
            rewardHtml+=v246DungeonRewardItemHtml(
              found,
              false
            );
          }
        }

        if(fightEnemy.boss){
          s.story.bossesDefeated=
            (Number(s.story.bossesDefeated)||0)+1;

          s.story.chapter=Math.min(
            4,
            1+Math.floor(
              s.story.bossesDefeated/2
            )
          );

          if(Math.random()<.22){
            s.harzTaler++;
            v247HarzGain=1;

            rewardHtml+=`
              <div class="loot">
                🟢 Harz-Taler gefunden!
              </div>
            `;
          }

          if(!s.dungeon.completed.includes(fightDi)){
            s.dungeon.completed.push(fightDi);
          }

          s.dungeon.room=9;
          s.dungeon.progress[fightDi]=9;

          rewardHtml+=`
            <div class="loot good">
              Dungeon abgeschlossen!
              Der Eingang wurde versiegelt.
            </div>
          `;
        }else{
          /*
            Advance first, persist second.
            The next render now always reads the new room.
          */
          s.dungeon.room=fightIdx+1;
          s.dungeon.progress[fightDi]=fightIdx+1;
        }

        /*
          V4.02: show the reward in the same presentation style as quests.
          The old inline loot text is no longer the primary reward message.
        */
        if(loot)loot.innerHTML='';

        try{
          v247ShowDungeonReward({
            dungeonIndex:fightDi,
            roomIndex:fightIdx,
            enemy:fightEnemy,
            xp:v415DungeonXpActual,
            gold:v415DungeonGoldActual,
            baseXp:v286DungeonXpBase,
            baseGold:v286DungeonGoldBase,
            item:v247RewardItem,
            harz:v247HarzGain,
            boss:!!fightEnemy.boss
          });
        }catch(e){
          console.error('V4.02 dungeon reward modal',e);
          if(loot)loot.innerHTML=rewardHtml;
        }

        if(log){
          log.textContent=fightEnemy.boss
            ?'Boss besiegt. Bestätige deine Belohnung.'
            :`Gegner ${fightIdx+1} besiegt. Gegner ${fightIdx+2} ist jetzt aktiv.`;
        }
      }else{
        if(loot){
          loot.innerHTML=`
            <div class="loot" style="color:#ff9895">
              Niederlage. Der Gegner war zu stark.
            </div>
            <button
              class="btn secondary"
              id="v246ReturnMap"
              style="width:100%;margin-top:10px">
              Zurück zur 10er-Karte
            </button>
          `;
        }

        if(log){
          log.textContent=
            `Niederlage · Gegner empfohlen Lv. ${bal.rec}.`;
        }
      }

      try{persist(false)}catch(e){
        try{
          localStorage.setItem(
            KEY,
            JSON.stringify(s)
          );
        }catch(_){}
      }

      try{v069SyncCurrencies()}catch(e){}
      try{renderInventory()}catch(e){}

      const back=
        document.querySelector('#v246ReturnMap');

      if(back){
        back.onclick=()=>{
          s.dungeon.layer='dungeon';
          s.dungeon.view='map';

          const lootBox=
            document.querySelector('#loot');

          if(lootBox)lootBox.innerHTML='';

          try{persist(false)}catch(e){}

          /* Phase 2.4: route the return through the canonical renderer. */
          if(typeof renderDungeon==='function')renderDungeon();
          else v244RenderSelectedDungeonMap();

          window.scrollTo({
            top:0,
            behavior:'smooth'
          });
        };
      }
    };


    const talentFight=v318NewCombatState('dungeon',maxP);

    const step=()=>{
      if(!battleBusy)return;
      round++;

      const primary=
        typeof v029PrimaryStat==='function'
          ?v029PrimaryStat()
          :totalAttr('staerke');

      const baseDamage=Math.max(
        3,
        Math.floor(
          (
            primary*1.9+
            s.level*1.55+
            Math.random()*7
          )*pFactor
        )
      );

      const attack=v318ResolvePlayerAttack(talentFight,{
        baseDamage,
        enemyHp:eHp,
        enemyMax:bal.hp,
        playerHp:pHp,
        playerMax:maxP,
        baseCrit:Math.min(.30,.04+totalAttr('glueck')*.012),
        setCrit:s.playerClass==='bruiser'?( .07+setBonusValue('critChance') ):0,
        baseWucht:(s.playerClass==='grower'||s.playerClass==='frost')?( .13+setBonusValue('wuchtChance') ):0,
        baseDouble:s.playerClass==='scout'?( .15+setBonusValue('doubleChance') ):0,
        setDoubleDamage:setBonusValue('doubleDamage')
      });

      let pDmg=attack.damage;
      pHp=Math.min(maxP,pHp+attack.heal);
      eHp=Math.max(0,eHp-pDmg);

      animClass(document.querySelector('#playerFighter'),'attack-right');

      setTimeout(()=>{
        if(!battleBusy)return;

        if(eTxt)eTxt.textContent=eHp;
        if(eBar)eBar.style.width=`${Math.max(0,eHp/bal.hp*100)}%`;
        if(pTxt)pTxt.textContent=pHp;
        if(pBar)pBar.style.width=`${Math.max(0,pHp/maxP*100)}%`;

        popDamage(
          document.querySelector('#damageEnemy'),
          `-${pDmg}${attack.crit?'!':''}`
        );

        if(log){
          log.textContent=
            `Runde ${round}: ${attack.text} · ${pDmg} Schaden`+
            (attack.heal?` · +${attack.heal} LP`:'');
        }

        if(eHp<=0)return showResult(true);

        setTimeout(()=>{
          if(!battleBusy)return;

          const armor=totalAttr('ruestung');
          let rawEnemyDamage=Math.max(
            3,
            Math.floor(
              (
                bal.attack+
                Math.random()*7-
                armor*.34
              )*eFactor
            )
          );

          const defense=v318ResolveEnemyAttack(talentFight,{
            damage:rawEnemyDamage,
            playerHp:pHp,
            playerMax:maxP
          });

          rawEnemyDamage=defense.damage;
          pHp=Math.min(maxP,pHp+defense.heal);
          pHp=Math.max(0,pHp-rawEnemyDamage);

          if(defense.preventLethal && pHp<=0)pHp=1;

          animClass(document.querySelector('#enemyFighter'),'attack-left');

          if(defense.counterDamage>0){
            eHp=Math.max(0,eHp-defense.counterDamage);
            if(eTxt)eTxt.textContent=eHp;
            if(eBar)eBar.style.width=`${Math.max(0,eHp/bal.hp*100)}%`;
          }

          if(pTxt)pTxt.textContent=pHp;
          if(pBar)pBar.style.width=`${Math.max(0,pHp/maxP*100)}%`;

          if(rawEnemyDamage){
            popDamage(document.querySelector('#damagePlayer'),`-${rawEnemyDamage}`);
          }

          if(log){
            log.textContent+=
              ` · ${defense.text}`+
              (defense.counterDamage?` · Konter ${defense.counterDamage}`:'')+
              (defense.heal?` · +${defense.heal} LP`:'');
          }

          if(eHp<=0)return showResult(true);
          if(pHp<=0)return showResult(false);

          if(round>=45){
            return showResult(pHp/maxP > eHp/bal.hp);
          }

          setTimeout(step,330);
        },300);
      },280);
    };

    step();
  };
}


/*
  Bind the final fight owner after all old render wrappers.
*/
/* Phase 2 retired: v246 renderDungeon battle wrapper.
   Canonical battle rendering calls the opponent refresh directly. */

/*
  The V4.02 detail-map current-room button eventually calls renderDungeon().
  The wrapper above guarantees that the freshly selected opponent is painted
  before the player can press ANGREIFEN.
*/
setTimeout(()=>{
  try{
    if(
      document.querySelector('#dungeon')?.classList.contains('active')
    ){
      if(
        s.dungeon?.layer==='dungeon' &&
        s.dungeon?.view==='battle'
      ){
        v246RefreshDungeonOpponent();
        v246InstallFight();
      }
    }
  }catch(e){}

  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},560);
