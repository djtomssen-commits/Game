/* ===== V4.02 Smaragd-Koloss canonical balance =====
   Goals:
   - Works at every level.
   - Boss target is derived from level + equipment quality/freshness, not the
     player's raw combat power. Over-skilling cannot trivialize the boss.
   - Worldboss uses a normalized 12% crit chance and fixed 1.65x crit damage.
     Player Glück/Crit skills/set bonuses do NOT increase worldboss crit rate.
   - Near-best gear still needs a favorable fight / crits.
   - Consecutive losses grant +2% hidden damage each, capped at +20%.
     A win resets the protection.
*/

function v290EnsureWorldBossState(){
  const wb=typeof v112EnsureWorldBossState==='function'
    ?v112EnsureWorldBossState()
    :(s.v110WorldBoss||(s.v110WorldBoss={day:'',freeUsed:false,wins:0,attempts:0}));

  wb.lossStreak=Math.max(
    0,
    Number(wb.lossStreak) ||
      ((Number(wb.wins)||0)===0 ? Math.min(10,Number(wb.attempts)||0) : 0)
  );
  return wb;
}

function v290GearReadiness(){
  const level=Math.max(1,Number(s.level)||1);
  const slots=['weapon','head','body','boots','ring','amulet'];
  const eq=s.equipment||{};
  const quality={
    gray:.55,
    green:.68,
    blue:.82,
    purple:.95,
    orange:1.00,
    cyan:1.00
  };

  let total=0;
  let equipped=0;

  slots.forEach(slot=>{
    const it=eq[slot];
    if(!it)return;

    equipped++;

    const q=quality[it.quality] ?? quality.gray;
    const itemLevel=Math.max(1,Number(it.dropLevel)||level);

    /* Current-level gear is ideal. Gear up to 10 levels old remains useful,
       but cannot count as best-in-slot forever. */
    const age=Math.max(0,level-itemLevel);
    const freshness=Math.max(.72,1-age*.028);

    total+=q*freshness;
  });

  return {
    ratio:Math.max(0,Math.min(1,total/slots.length)),
    equipped,
    slots:slots.length
  };
}

function v290WorldBossModel(){
  const level=Math.max(1,Number(s.level)||1);
  const gear=v290GearReadiness();
  const wb=v290EnsureWorldBossState();

  /* Level-derived theoretical hero. This is intentionally independent of
     manually stacked Crit/Glück and mostly independent of raw skill points. */
  const idealHp=760+level*12;
  const idealDamage=245+level*3.75;

  /* Equipment is the main gate. Full current purple gear ~= 95% readiness.
     Missing/old/low-quality gear lowers the fight substantially. */
  const readiness=gear.ratio;
  const playerHp=Math.round(idealHp);
  const playerBaseDamage=Math.round(
    idealDamage*(.72+.38*readiness)
  );

  /* Tuned against the same normalized model at every level:
     poor gear ~ very low chance, good gear ~ 20-30%,
     near-BiS ~ 40%, BiS ~ about 50%, before pity protection. */
  const bossHp=Math.round(idealDamage*9.375);
  const bossAtk=Math.round(idealHp*.11);

  const pitySteps=Math.min(10,Math.max(0,Number(wb.lossStreak)||0));
  const pityDamage=1+pitySteps*.02;

  return {
    level,
    gear,
    readiness,
    playerHp,
    playerBaseDamage,
    bossHp,
    bossAtk,
    pitySteps,
    pityDamage,
    critChance:.12,
    critMultiplier:1.65
  };
}

function v290ReadinessLabel(r){
  if(r>=.94)return ['Nahezu optimal','v290-ready-high'];
  if(r>=.82)return ['Sehr gut','v290-ready-high'];
  if(r>=.68)return ['Ordentlich','v290-ready-mid'];
  return ['Zu schwach','v290-ready-low'];
}

/* Replace the old adaptive scale. Raw combatPower/skill stacking no longer
   makes the boss stronger or weaker. */
v110BossScale=function(){
  const m=v290WorldBossModel();
  return {
    cp:typeof combatPower==='function'?combatPower():0,
    hp:m.playerHp,
    main:typeof v267PrimaryStat==='function'?v267PrimaryStat():v110MainStat(),
    gearScore:Math.round(m.readiness*100),
    bossHp:m.bossHp,
    bossAtk:m.bossAtk,
    v290:m
  };
};

/* Refresh keeps the existing UI, but adds an honest equipment readiness hint.
   Pity remains hidden numerically; only the player-facing encouragement is
   shown after repeated defeats. */
const v290BaseRefresh=v110Refresh;
v110Refresh=function(){
  v290EnsureWorldBossState();
  const r=v290BaseRefresh();
  const m=v290WorldBossModel();
  const panel=document.querySelector('#v110Overlay .v110-panel');
  if(panel){
    let box=panel.querySelector('#v290BossBalance');
    if(!box){
      box=document.createElement('div');
      box.id='v290BossBalance';
      box.className='v290-balance';
      const stats=panel.querySelector('.v110-stats');
      if(stats)stats.insertAdjacentElement('afterend',box);
      else panel.appendChild(box);
    }
    const [label,cls]=v290ReadinessLabel(m.readiness);
    box.innerHTML=
      `Ausrüstung für Level ${m.level}: <b class="${cls}">${label}</b> · `+
      `${m.gear.equipped}/${m.gear.slots} Slots<br>`+
      `Der Koloss normalisiert kritische Treffer. Crit-Skill kann ihn nicht umgehen.`+
      (m.pitySteps>=3?`<br><b>Der Koloss zeigt nach deinen Niederlagen erste Schwächen.</b>`:'');
  }
  return r;
};

/* Final fight owner. This replaces the old Glück-based crit formula. */
v110Fight=function(){
  if(!v110MysticEventActive())return v110Close();

  v110ResetDay();
  const wb=v290EnsureWorldBossState();

  if(wb.freeUsed){
    if((s.harzTaler||0)<10){
      return v063Toast(
        'Zu wenig Harz-Taler',
        'warn',
        'Ein weiterer Weltboss-Versuch kostet 10 Harz-Taler.'
      );
    }
    s.harzTaler-=10;
  }else{
    wb.freeUsed=true;
  }

  wb.attempts=(Number(wb.attempts)||0)+1;

  const m=v290WorldBossModel();
  let p=m.playerHp;
  let e=m.bossHp;
  let round=0;
  let crits=0;
  const log=[];

  const btn=document.querySelector('#v110Fight');
  if(btn)btn.disabled=true;

  const timer=setInterval(()=>{
    round++;

    const phase=e/m.bossHp<=.25?3:e/m.bossHp<=.60?2:1;
    const phaseMult=phase===3?1.48:phase===2?1.25:1;

    const phaseEl=document.querySelector('#v110Phase');
    if(phaseEl){
      phaseEl.textContent=
        phase===3?'☠️ LETZTE BLÜTE':
        phase===2?'💚 SMARAGD-RASEREI':
        'MYSTISCHES EVENT';
    }

    /* Narrow random damage range: gear decides whether the fight is viable,
       while normalized crits decide close fights. */
    let pDmg=Math.max(
      5,
      Math.round(
        m.playerBaseDamage *
        m.pityDamage *
        (.90+Math.random()*.20)
      )
    );

    /* IMPORTANT: fixed worldboss crit. No totalAttr('glueck'),
       v267CritChance(), set critChance or mystic critChance is read here. */
    if(Math.random()<m.critChance){
      crits++;
      pDmg=Math.round(pDmg*m.critMultiplier);
      log.push(`💥 Kritischer Treffer ${crits}: ${pDmg}`);
    }else{
      log.push(`⚔️ Du triffst für ${pDmg}.`);
    }

    e=Math.max(0,e-pDmg);

    if(e>0){
      const eDmg=Math.max(
        5,
        Math.round(m.bossAtk*phaseMult*(.90+Math.random()*.20))
      );
      p=Math.max(0,p-eDmg);
      log.push(
        `${phase===3?'☠️':phase===2?'💚':'🗿'} Koloss trifft für ${eDmg}.`
      );
    }

    const bossBar=document.querySelector('#v110BossHp');
    const playerBar=document.querySelector('#v110PlayerHp');
    const bossTxt=document.querySelector('#v110BossHpTxt');
    const playerTxt=document.querySelector('#v110PlayerHpTxt');
    const logEl=document.querySelector('#v110Log');

    if(bossBar)bossBar.style.width=`${e/m.bossHp*100}%`;
    if(playerBar)playerBar.style.width=`${p/m.playerHp*100}%`;
    if(bossTxt)bossTxt.textContent=`${e}/${m.bossHp}`;
    if(playerTxt)playerTxt.textContent=`${p}/${m.playerHp}`;
    if(logEl)logEl.textContent=log.slice(-8).join('\n');

    /* Keep the existing animated boss phases. */
    const scene=document.querySelector('#v111BossScene');
    if(scene){
      scene.classList.toggle('phase2',phase===2);
      scene.classList.toggle('phase3',phase===3);
    }

    if(e<=0||p<=0||round>=60){
      clearInterval(timer);
      if(btn)btn.disabled=false;

      if(e<=0){
        wb.wins=(Number(wb.wins)||0)+1;
        wb.lossStreak=0;

        let item;
        if(Math.random()<.06)item=v110MakeRareMysticSet();
        else item=v110MakeMysticItem();

        s.inventory.push(item);

        if(logEl){
          logEl.textContent=
            `🏆 DER SMARAGD-KOLOSS IST GEFALLEN!\n\n`+
            `Level ${m.level} · Ausrüstung ${Math.round(m.readiness*100)} % · `+
            `${crits} kritische Treffer\n\n`+
            `🔷 Garantierte mystische Beute:\n${item.name}\n`+
            `${itemBonus(item)}\n✨ ${item.mysticSpecial?.label||''}`;
        }

        v063Toast(
          '🔷 MYSTISCHER SIEG!',
          'success',
          `${item.name} erhalten!`
        );
      }else{
        wb.lossStreak=Math.min(10,(Number(wb.lossStreak)||0)+1);

        if(logEl){
          logEl.textContent=
            `☠️ Der Smaragd-Koloss hat dich besiegt.\n`+
            `Restleben: ${Math.round(e/m.bossHp*100)} % · `+
            `Kritische Treffer: ${crits}\n`+
            `Ausrüstungsstand: ${Math.round(m.readiness*100)} %.\n`+
            `Verbessere deine Ausrüstung und fordere ihn erneut heraus.`;
        }

        v063Toast(
          'Weltboss nicht bezwungen',
          'warn',
          'Der Koloss wird nach Niederlagen schrittweise verwundbarer.'
        );
      }

      persist();
      v110Refresh();
    }
  },430);
};

/* Current 51-attempt/no-win saves receive the capped protection immediately.
   Existing winners start at zero unless they already have a stored streak. */
v290EnsureWorldBossState();

const v290BaseRender=render;
render=function(){
  const r=v290BaseRender();
  v290EnsureWorldBossState();
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(()=>{
  try{
    v290EnsureWorldBossState();
    if(document.querySelector('#v110Overlay.show'))v110Refresh();
  }catch(e){}
},350);


const v290Line=document.querySelector('#v141VersionLine');
