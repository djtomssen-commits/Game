
/* ===== V4.02 PvP battle presentation like Dungeon ===== */

function v209EnsureBattleUi(){
  if(document.querySelector('#v209PvpBattleOverlay'))return;

  const overlay=document.createElement('div');
  overlay.id='v209PvpBattleOverlay';
  overlay.innerHTML=`
    <div class="v209-battle-card">
      <div class="v209-battle-head">
        <h3>⚔️ PvP-Kampf</h3>
        <span class="pill">NEBEL-ARENA</span>
      </div>

      <div class="v209-stage battle-stage">
        <div class="v209-damage damage left" id="v209DamagePlayer"></div>
        <div class="v209-damage damage right" id="v209DamageEnemy"></div>

        <div class="v209-fighter fighter player" id="v209PlayerFighter">
          <div class="v209-avatar fighter-avatar"><img id="v209PlayerAvatar" alt=""></div>
          <div class="v209-fighter-name fighter-name" id="v209PlayerName">Du</div>
          <div class="v209-fighter-sub" id="v209PlayerSub"></div>
          <div class="v209-hpbar hpbar"><div class="v209-hpfill hpfill" id="v209PlayerHpBar"></div></div>
          <div class="v209-hptext"><span id="v209PlayerHpText">0</span> HP</div>
        </div>

        <div class="v209-fighter fighter enemy enemy-side" id="v209EnemyFighter">
          <div class="v209-avatar fighter-avatar"><img id="v209EnemyAvatar" alt=""></div>
          <div class="v209-fighter-name fighter-name" id="v209EnemyName">Gegner</div>
          <div class="v209-fighter-sub" id="v209EnemySub"></div>
          <div class="v209-hpbar hpbar"><div class="v209-hpfill hpfill" id="v209EnemyHpBar"></div></div>
          <div class="v209-hptext"><span id="v209EnemyHpText">0</span> HP</div>
        </div>
      </div>

      <div class="v209-log battle-log" id="v209BattleLog">Der Kampf beginnt …</div>

      <div class="v209-result" id="v209BattleResult">
        <div class="v209-result-title" id="v209ResultTitle"></div>
        <div class="v209-rewards">
          <div class="v209-reward"><span>Gold</span><b id="v209RewardGold">0</b></div>
          <div class="v209-reward"><span>Erfahrung</span><b id="v209RewardXp">0</b></div>
          <div class="v209-reward"><span>PvP-Buds</span><b id="v209RewardBuds">0</b></div>
        </div>
        <button type="button" class="btn v209-return-btn" id="v209ReturnPvp">
          Belohnung bestätigen
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  document.querySelector('#v209ReturnPvp').onclick=()=>{
    overlay.classList.remove('show');
    v204Opponent=null;
    v032Go('pvp');
    setTimeout(v204RefreshStats,0);
  };
}

function v209Anim(el,cls){
  if(!el)return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls),500);
}
function v209Pop(el,text){
  if(!el)return;
  try{
    const raw=String(text||'');
    if(/KRIT|WUCHT|DOPPEL|MAGIE|HINRICHTUNG/i.test(raw))window.v6111Sfx?.('crit');
    else if(/AUSGEWICHEN|DODGE/i.test(raw))window.v6111Sfx?.('dodge');
    else if(/BLOCK|BARRIERE|SCHILD/i.test(raw))window.v6111Sfx?.('block');
    else if(/HEIL|LEBENSRAUB|\+\d+\s*(HP|LP)/i.test(raw))window.v6111Sfx?.('heal');
    else window.v6111Sfx?.(String(el.id||'').toLowerCase().includes('player')?'enemyHit':'hit');
  }catch(e){}
  el.textContent=text;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}
function v209OpenBattle(enemy){
  v209EnsureBattleUi();

  const overlay=document.querySelector('#v209PvpBattleOverlay');
  const myClass=s.playerClass||'grower';
  const enemyClass=v204ClassIdFromProfile(enemy);

  document.querySelector('#v209PlayerAvatar').src=v080AvatarFor(myClass);
  document.querySelector('#v209EnemyAvatar').src=v080AvatarFor(enemyClass);

  document.querySelector('#v209PlayerName').textContent=s.characterName||'Du';
  document.querySelector('#v209EnemyName').textContent=enemy.character_name||'Gegner';

  document.querySelector('#v209PlayerSub').textContent=
    `${classes[myClass]?.name||''} · Lv. ${s.level} · Kampfkraft ${combatPower()}`;

  document.querySelector('#v209EnemySub').textContent=
    `${enemy.class_name||classes[enemyClass]?.name||''} · Lv. ${enemy.level} · Kampfkraft ${enemy.combat_power}`;

  document.querySelector('#v209BattleResult').className='v209-result';
  document.querySelector('#v209BattleLog').textContent='Der Kampf beginnt …';

  overlay.classList.add('show');try{window.v6111Sfx?.('battleStart')}catch(e){}
}

async function v209FinishBattle(win,enemy,gold,xp){
  let buds=0;

  try{
    const {data,error}=await v073Db.rpc(
      'v205_finish_pvp',
      {p_target_user:enemy.id,p_won:!!win}
    );
    if(error)throw error;

    const row=Array.isArray(data)?data[0]:data;
    if(row){
      v204SyncLocalStatsFromProfile(row);
      buds=Number(row.buds_awarded)||0;
      s.v204Pvp.lastBudReward=buds;
    }
  }catch(e){
    console.error('V4.02 finish PvP',e);
    v063Toast('PvP-Ergebnis konnte nicht gespeichert werden','error',e?.message||'');
  }

  if(win){
    s.gold+=gold;
    addXp(xp);
  }else{
    const lossGold=Math.round(gold*.35);
    const lossXp=Math.round(xp*.45);
    s.gold+=lossGold;
    addXp(lossXp);
    gold=lossGold;
    xp=lossXp;
    buds=0;
  }

  s.v106Achievements??={done:{},stats:{}};
  s.v106Achievements.stats??={};
  s.v106Achievements.stats.pvpFights=(s.v106Achievements.stats.pvpFights||0)+1;
  if(win)s.v106Achievements.stats.pvpWins=(s.v106Achievements.stats.pvpWins||0)+1;

  try{v106CheckAchievements(false)}catch(e){}
  persist();

  try{await v075WriteCloudSave(true)}catch(e){}
  try{await v073SyncProfile(true)}catch(e){}

  const result=document.querySelector('#v209BattleResult');
  const title=document.querySelector('#v209ResultTitle');

  result.className=`v209-result show ${win?'win':'loss'}`;
  title.textContent=win?'🏆 SIEG':'💀 NIEDERLAGE';try{window.v6111Sfx?.(win?'win':'lose')}catch(e){}

  document.querySelector('#v209RewardGold').textContent=`+${gold}`;
  document.querySelector('#v209RewardXp').textContent=`+${xp}`;
  document.querySelector('#v209RewardBuds').textContent=win?`+${buds}`:'0';

  document.querySelector('#v209BattleLog').textContent=
    win
      ? `${enemy.character_name} wurde besiegt. Deine Belohnung wartet auf dich.`
      : `${enemy.character_name} gewinnt den Kampf. PvP-Buds wurden nicht abgezogen.`;

  v204BattleBusy=false;
  v204CooldownLeft=await v204LoadCooldown();
}

v204Fight=async function(){
  if(v204BattleBusy || !v204Opponent)return;

  const enemy={...v204Opponent};
  const fightBtn=document.querySelector('#v204FightBtn');

  if(fightBtn){
    fightBtn.disabled=true;
    fightBtn.textContent='Kampf wird gestartet…';
  }

  try{
    const {data,error}=await v073Db.rpc(
      'v206_start_pvp',
      {p_target_user:enemy.id}
    );

    if(error)throw error;

    const row=Array.isArray(data)?data[0]:data;

    if(!row?.allowed){
      if(row?.remaining_seconds){
        v204CooldownLeft=Number(row.remaining_seconds)*1000;
        v204RenderPage();
      }

      v063Toast(
        'Kampf konnte nicht gestartet werden',
        'warn',
        row?.message||'Der Gegner ist nicht mehr verfügbar.'
      );

      if(fightBtn){
        fightBtn.disabled=false;
        fightBtn.textContent='⚔️ Kampf starten';
      }
      return;
    }

  }catch(e){
    console.error('V4.02 fight start',e);
    v063Toast('PvP nicht bereit','error',e?.message||'Kampf konnte nicht gestartet werden.');

    if(fightBtn){
      fightBtn.disabled=false;
      fightBtn.textContent='⚔️ Kampf starten';
    }
    return;
  }

  v204BattleBusy=true;
  v204CooldownLeft=V204_COOLDOWN;

  v209OpenBattle(enemy);

  const myPower=Math.max(1,combatPower());
  const enPower=Math.max(1,enemy.combat_power);
  const myClass=s.playerClass||'grower';
  const enClass=typeof v204ClassIdFromProfile==='function'?v204ClassIdFromProfile(enemy):(enemy.class_id||'grower');
  const myFrostOffhand=myClass==='frost'&&!!s.equipment?.weapon&&!!s.equipment?.weapon2;
  const enFrostOffhand=enClass==='frost'&&!!enemy?.equipment?.weapon&&!!enemy?.equipment?.weapon2;

  let myHp=Math.max(120,maxHp());
  let enHp=Math.max(120,Math.round(100+enemy.level*11+enPower*.35));

  const maxMy=myHp;
  const maxEn=enHp;

  const pBar=document.querySelector('#v209PlayerHpBar');
  const eBar=document.querySelector('#v209EnemyHpBar');
  const pTxt=document.querySelector('#v209PlayerHpText');
  const eTxt=document.querySelector('#v209EnemyHpText');
  const log=document.querySelector('#v209BattleLog');

  pBar.style.width='100%';
  eBar.style.width='100%';
  pTxt.textContent=myHp;
  eTxt.textContent=enHp;

  let round=0;

  const win=await new Promise(resolve=>{
    const step=()=>{
      round++;

      const enemyDodged=enClass==='scout'&&Math.random()<.05;
      const myCrit=!enemyDodged&&Math.random()<(.12+(myClass==='bruiser'?.05:0));
      const myBase=Math.max(6,Math.round((myPower*.10+8)*(.84+Math.random()*.32)));
      let myDmg=myBase;
      if(myCrit)myDmg=Math.round(myDmg*1.55);
      if(myClass==='grower')myDmg=Math.round(myDmg*1.05);
      let myOffhand=0;
      if(!enemyDodged&&myFrostOffhand&&Math.random()<.08){
        myOffhand=Math.max(1,Math.round(myBase*.40));
        myDmg+=myOffhand;
      }
      if(enemyDodged)myDmg=0;

      v209Anim(document.querySelector('#v209PlayerFighter'),'attack-right');

      setTimeout(()=>{
        enHp=Math.max(0,enHp-myDmg);
        eBar.style.width=`${(enHp/maxEn)*100}%`;
        eTxt.textContent=enHp;
        v209Pop(document.querySelector('#v209DamageEnemy'),enemyDodged?'AUSGEWICHEN':`${myCrit?'KRIT! ':''}-${myDmg}${myOffhand?' + Nebenhand':''}`);
        enemyDodged ? window.v617PvpDodge?.(document.querySelector('#v209EnemyFighter')) : v209Anim(document.querySelector('#v209EnemyFighter'),'hit');

        log.textContent=enemyDodged
          ?`Runde ${round}: ${enemy.character_name} weicht dem Angriff aus.`
          :`Runde ${round}: ${s.characterName} trifft ${enemy.character_name} für ${myDmg} Schaden${myCrit?' – kritischer Treffer!':''}${myOffhand?` · Nebenhand +${myOffhand}`:''}.`;

        if(enHp<=0){
          resolve(true);
          return;
        }

        setTimeout(()=>{
          const myDodged=myClass==='scout'&&Math.random()<.05;
          const enCrit=!myDodged&&Math.random()<(.08+(enClass==='bruiser'?.05:0));
          const enBase=Math.max(6,Math.round((enPower*.10+8)*(.84+Math.random()*.32)));
          let enDmg=enBase;
          if(enCrit)enDmg=Math.round(enDmg*1.45);
          if(enClass==='grower')enDmg=Math.round(enDmg*1.05);
          let enOffhand=0;
          if(!myDodged&&enFrostOffhand&&Math.random()<.08){
            enOffhand=Math.max(1,Math.round(enBase*.40));
            enDmg+=enOffhand;
          }
          if(myDodged)enDmg=0;

          v209Anim(document.querySelector('#v209EnemyFighter'),'attack-left');

          setTimeout(()=>{
            myHp=Math.max(0,myHp-enDmg);
            pBar.style.width=`${(myHp/maxMy)*100}%`;
            pTxt.textContent=myHp;
            v209Pop(document.querySelector('#v209DamagePlayer'),myDodged?'AUSGEWICHEN':`${enCrit?'KRIT! ':''}-${enDmg}${enOffhand?' + Nebenhand':''}`);
            myDodged ? window.v617PvpDodge?.(document.querySelector('#v209PlayerFighter')) : v209Anim(document.querySelector('#v209PlayerFighter'),'hit');

            log.textContent+=myDodged
              ?` ${s.characterName} weicht aus.`
              :` ${enemy.character_name} verursacht ${enDmg} Schaden${enCrit?' – kritisch!':''}${enOffhand?` · Nebenhand +${enOffhand}`:''}.`;

            if(myHp<=0){
              resolve(false);
              return;
            }

            if(round>=30){
              resolve((myHp/maxMy)>=(enHp/maxEn));
              return;
            }

            setTimeout(step,430);

          },280);

        },430);

      },280);
    };

    setTimeout(step,500);
  });

  const gold=Math.max(
    25,
    Math.round(35+s.level*7+(win?combatPower()*.035:combatPower()*.01))
  );

  const xp=Math.max(
    10,
    Math.round(18+s.level*4+(win?s.level*2:s.level))
  );

  await v209FinishBattle(win,enemy,gold,xp);
};

/* Keep opponent card button bound to final battle function. */
const v209BaseRenderOpponent=v204RenderOpponent;
v204RenderOpponent=function(){
  const r=v209BaseRenderOpponent();
  const fight=document.querySelector('#v204FightBtn');
  if(fight)fight.onclick=v204Fight;
  return r;
};

const v209BaseRender=render;
render=function(){
  return v209BaseRender();
};

setTimeout(v209EnsureBattleUi,120);
