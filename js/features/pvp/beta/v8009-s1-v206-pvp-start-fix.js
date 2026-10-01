
/* ===== V4.02 PvP: matchmaking and fight-start separated ===== */

/*
  Cooldown now uses started_at only.
  Old accidental search rows have started_at = NULL and therefore do not count.
*/
v204LoadCooldown=async function(){
  if(!v200DurableUser())return 0;

  try{
    const {data,error}=await v073Db
      .from('pvp_attacks')
      .select('started_at')
      .eq('attacker_id',v073User.id)
      .not('started_at','is',null)
      .order('started_at',{ascending:false})
      .limit(1);

    if(error || !data?.length || !data[0]?.started_at)return 0;

    return Math.max(
      0,
      V204_COOLDOWN - (Date.now()-new Date(data[0].started_at).getTime())
    );
  }catch(e){
    console.warn('V4.02 cooldown',e);
    return 0;
  }
};

/*
  Search only returns a candidate.
  No attack row is created and no cooldown starts here.
*/
v204FindOpponent=async function(){
  if(v204BattleBusy || v204CooldownLeft>0)return;
  if(!v200DurableUser()){
    v063Toast('PvP benötigt einen Account','warn');
    return;
  }

  const btn=document.querySelector('#v204FindBtn');
  if(btn){
    btn.disabled=true;
    btn.textContent='🔎 Passenden Gegner suchen…';
  }

  try{
    await v073SyncProfile(true);

    const {data,error}=await v073Db.rpc('v206_find_pvp_match');
    if(error)throw error;

    const row=Array.isArray(data)?data[0]:data;

    if(!row?.allowed){
      if(row?.remaining_seconds){
        v204CooldownLeft=Number(row.remaining_seconds)*1000;
        v204RenderPage();
        return;
      }

      v063Toast(
        'Kein passender Gegner gefunden',
        'warn',
        'Momentan ist kein Spieler in deinem Level-/Kampfkraftbereich verfügbar.'
      );
      return;
    }

    v204Opponent={
      id:row.target_id,
      character_name:row.character_name,
      class_id:row.class_id,
      class_name:row.class_name,
      level:Number(row.level)||1,
      combat_power:Number(row.combat_power)||1,
      pvp_buds:Number(row.pvp_buds)||0
    };

    s.v204Pvp.lastOpponent=v204Opponent.id;

    /*
      IMPORTANT:
      no cooldown here.
    */
    v204CooldownLeft=0;
    v204RenderOpponent();

    const log=document.querySelector('#v204BattleLog');
    if(log){
      log.innerHTML=`
        <span class="v206-match-note ready">
          Gegner gefunden. Noch wurde kein Versuch verbraucht.
          Der 30-Minuten-Cooldown startet erst bei „Kampf starten“.
        </span>`;
    }

    v204RenderPage();

  }catch(e){
    console.error('V4.02 matchmaking',e);

    const msg=/v206_find_pvp_match|function.*does not exist/i.test(String(e?.message||''))
      ? 'Bitte zuerst V206_PVP_START_SQL.sql in Supabase ausführen.'
      : (e?.message||'Matchmaking fehlgeschlagen.');

    v063Toast('PvP nicht bereit','error',msg);

  }finally{
    if(btn && !v204Opponent)v204RenderPage();
  }
};

/*
  Server registers the attack only when the user explicitly presses Fight.
*/
v204Fight=async function(){
  if(v204BattleBusy || !v204Opponent)return;

  const enemy=v204Opponent;
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

        v063Toast(
          'PvP-Cooldown aktiv',
          'warn',
          `Noch ${v204Fmt(v204CooldownLeft)}`
        );
      }else{
        v063Toast(
          'Kampf konnte nicht gestartet werden',
          'warn',
          row?.message||'Der Gegner ist nicht mehr verfügbar.'
        );
      }

      if(fightBtn){
        fightBtn.disabled=false;
        fightBtn.textContent='⚔️ Kampf starten';
      }
      return;
    }

    /*
      Now — and only now — the attempt exists server-side.
    */
    v204CooldownLeft=V204_COOLDOWN;
    v204BattleBusy=true;
    v204RenderPage();

  }catch(e){
    console.error('V4.02 fight start',e);

    const raw=String(e?.message||'Kampf konnte nicht gestartet werden.');
    const msg=/v206_start_pvp|function.*does not exist/i.test(raw)
      ? `PvP-Startfunktion konnte nicht aufgerufen werden: ${raw}`
      : raw;

    v063Toast('PvP nicht bereit','error',msg);

    if(fightBtn){
      fightBtn.disabled=false;
      fightBtn.textContent='⚔️ Kampf starten';
    }
    return;
  }

  const log=document.querySelector('#v204BattleLog');
  const myPower=Math.max(1,combatPower());
  const enPower=Math.max(1,enemy.combat_power);

  let myHp=Math.max(120,maxHp());
  let enHp=Math.max(120,Math.round(100+enemy.level*11+enPower*.35));

  const maxMy=myHp;
  const maxEn=enHp;

  let round=0;

  const win=await new Promise(resolve=>{
    const step=()=>{
      round++;

      const myDmg=Math.max(
        6,
        Math.round((myPower*.10+8)*(.84+Math.random()*.32))
      );

      const enDmg=Math.max(
        6,
        Math.round((enPower*.10+8)*(.84+Math.random()*.32))
      );

      enHp=Math.max(0,enHp-myDmg);

      if(log){
        log.textContent=
          `Runde ${round}: ${s.characterName} trifft für ${myDmg}. `+
          `Gegner: ${enHp}/${maxEn} HP`;
      }

      if(enHp<=0){
        resolve(true);
        return;
      }

      setTimeout(()=>{
        myHp=Math.max(0,myHp-enDmg);

        if(log){
          log.textContent+=
            `\n${enemy.character_name} trifft für ${enDmg}. `+
            `Du: ${myHp}/${maxMy} HP`;
        }

        if(myHp<=0){
          resolve(false);
          return;
        }

        if(round>=30){
          resolve((myHp/maxMy)>=(enHp/maxEn));
          return;
        }

        setTimeout(step,390);
      },390);
    };

    setTimeout(step,320);
  });

  await v204Finish(win);
};

/*
  Rebind dynamic opponent card to the final functions.
*/
const v206BaseRenderOpponent=v204RenderOpponent;
v204RenderOpponent=function(){
  v206BaseRenderOpponent();

  const fight=document.querySelector('#v204FightBtn');
  if(fight)fight.onclick=v204Fight;

  const find=document.querySelector('#v204FindBtn');
  if(find)find.onclick=v204FindOpponent;
};

/* V8.009: no-op global render wrapper retired. */

window.addEventListener('growlegends:navigation-open-v7119',async e=>{
  if(String(e?.detail?.id||'')!=='pvp')return;
  try{
    v204CooldownLeft=await v204LoadCooldown();
    v204RenderPage();
    const find=document.querySelector('#v204FindBtn');
    if(find)find.onclick=v204FindOpponent;
  }catch(err){console.warn('V4.206 PvP open sync',err)}
},{passive:true});

queueMicrotask(()=>{const find=document.querySelector('#v204FindBtn');if(find)find.onclick=v204FindOpponent});
