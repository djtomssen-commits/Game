
/* ===== V4.02 PvP System ===== */
const V204_COOLDOWN=30*60*1000;
let v204Opponent=null;
let v204BattleBusy=false;
let v204CooldownLeft=0;

s.v204Pvp ??={buds:0,wins:0,losses:0,fights:0,lastOpponent:null};

function v204ClassIdFromProfile(p){
  if(p?.class_id && classes[p.class_id])return p.class_id;
  const n=String(p?.class_name||'').toLowerCase();
  if(n.includes('harzrufer'))return 'summoner';
  if(n.includes('frost')||n.includes('todesritter'))return 'frost';
  if(n.includes('mag'))return 'bruiser';
  if(n.includes('schütz')||n.includes('blatt'))return 'scout';
  return 'grower';
}
function v204Fmt(ms){
  ms=Math.max(0,ms);
  const sec=Math.ceil(ms/1000), min=Math.floor(sec/60);
  return `${min}:${String(sec%60).padStart(2,'0')}`;
}
async function v204LoadCooldown(){
  if(!v200DurableUser())return 0;
  const {data,error}=await v073Db.from('pvp_attacks')
    .select('attacked_at').eq('attacker_id',v073User.id)
    .order('attacked_at',{ascending:false}).limit(1);
  if(error||!data?.length)return 0;
  return Math.max(0,V204_COOLDOWN-(Date.now()-new Date(data[0].attacked_at).getTime()));
}
function v204SyncLocalStatsFromProfile(row){
  if(!row)return;
  s.v204Pvp.buds=Number(row.pvp_buds)||0;
  s.v204Pvp.wins=Number(row.pvp_wins)||0;
  s.v204Pvp.losses=Number(row.pvp_losses)||0;
  s.v204Pvp.fights=Number(row.pvp_fights)||0;
}
async function v204RefreshStats(){
  if(!v200DurableUser())return;
  try{
    const {data,error}=await v073Db.from('profiles')
      .select('pvp_buds,pvp_wins,pvp_losses,pvp_fights')
      .eq('id',v073User.id).maybeSingle();
    if(!error&&data)v204SyncLocalStatsFromProfile(data);
  }catch(e){}
  v204CooldownLeft=await v204LoadCooldown();
  v204RenderPage();
}
function v204RenderPage(){
  const buds=document.querySelector('#v204Buds'), wins=document.querySelector('#v204Wins'), fights=document.querySelector('#v204Fights'), cd=document.querySelector('#v204Cooldown');
  if(buds)buds.textContent=s.v204Pvp?.buds||0;
  if(wins)wins.textContent=s.v204Pvp?.wins||0;
  if(fights)fights.textContent=s.v204Pvp?.fights||0;
  if(cd)cd.textContent=v204CooldownLeft>0?v204Fmt(v204CooldownLeft):'Bereit';

  const btn=document.querySelector('#v204FindBtn');
  if(btn){
    btn.disabled=v204CooldownLeft>0||v204BattleBusy;
    btn.textContent=v204CooldownLeft>0?`⏳ Neuer Kampf in ${v204Fmt(v204CooldownLeft)}`:'🎯 Gegner suchen';
  }
}
async function v204FindOpponent(){
  if(v204BattleBusy||v204CooldownLeft>0)return;
  if(!v200DurableUser())return v063Toast('PvP benötigt einen Account','warn');

  const btn=document.querySelector('#v204FindBtn');
  if(btn){btn.disabled=true;btn.textContent='🔎 Passenden Gegner suchen…';}

  try{
    await v073SyncProfile(true);
    const {data,error}=await v073Db.rpc('v204_find_pvp_match');
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;

    if(!row?.allowed){
      if(row?.remaining_seconds){
        v204CooldownLeft=Number(row.remaining_seconds)*1000;
        v204RenderPage();
        return;
      }
      v063Toast('Kein passender Gegner gefunden','warn','Momentan ist kein Spieler in deinem Level-/Kampfkraftbereich verfügbar.');
      return;
    }

    v204Opponent={
      id:row.target_id,character_name:row.character_name,class_id:row.class_id,class_name:row.class_name,
      level:Number(row.level)||1,combat_power:Number(row.combat_power)||1,pvp_buds:Number(row.pvp_buds)||0
    };
    s.v204Pvp.lastOpponent=v204Opponent.id;
    /* Cooldown starts only when a fight is actually started/recorded server-side.
       Finding or previewing an opponent must not consume the 30-minute window. */
    v204RenderOpponent();
    v204RenderPage();
  }catch(e){
    console.error('V4.02 matchmaking',e);
    const msg=/function.*does not exist|v204_find_pvp_match/i.test(String(e?.message||''))
      ?'Bitte zuerst V204_PVP_SQL.sql in Supabase ausführen.'
      :(e?.message||'Matchmaking fehlgeschlagen.');
    v063Toast('PvP nicht bereit','error',msg);
  }finally{
    if(btn&&!v204Opponent)v204RenderPage();
  }
}
function v204RenderOpponent(){
  const box=document.querySelector('#v204MatchCard');
  if(!box||!v204Opponent)return;
  const cls=v204ClassIdFromProfile(v204Opponent);
  box.innerHTML=`
    <div class="v204-opponent">
      <div class="v204-opponent-avatar">
        <img src="${v080AvatarFor(cls)}" alt="${v073Escape(v204Opponent.character_name)}">
      </div>
      <div>
        <h3>${v073Escape(v204Opponent.character_name)}</h3>
        <div class="v204-opponent-class">${v073Escape(v204Opponent.class_name||classes[cls]?.name||'')}</div>
        <div class="v204-opponent-stats">
          <div><span>LEVEL</span><b>${v204Opponent.level}</b></div>
          <div><span>KAMPFKRAFT</span><b>${v204Opponent.combat_power}</b></div>
          <div><span>PVP-BUDS</span><b>🌿 ${v204Opponent.pvp_buds}</b></div>
        </div>
        <div class="v204-match-actions">
          <button type="button" class="btn" id="v204FightBtn">⚔️ Kampf starten</button>
          <button type="button" class="btn secondary" id="v204ProfileBtn">👤 Profil ansehen</button>
        </div>
      </div>
    </div>
    <div class="v204-battle-log" id="v204BattleLog">Gegner gefunden. Der Kampf kann beginnen.</div>`;
  document.querySelector('#v204FightBtn').onclick=v204Fight;
  document.querySelector('#v204ProfileBtn').onclick=()=>v074OpenProfile(v204Opponent.id);
}
async function v204Fight(){
  if(v204BattleBusy||!v204Opponent)return;
  v204BattleBusy=true;
  const fightBtn=document.querySelector('#v204FightBtn');
  if(fightBtn)fightBtn.disabled=true;

  const log=document.querySelector('#v204BattleLog');
  const myPower=Math.max(1,combatPower());
  const enPower=Math.max(1,v204Opponent.combat_power);
  let myHp=Math.max(120,maxHp());
  let enHp=Math.max(120,Math.round(100+v204Opponent.level*11+enPower*.35));
  const maxMy=myHp,maxEn=enHp;
  let round=0;

  await new Promise(resolve=>{
    const step=()=>{
      round++;
      const myDmg=Math.max(6,Math.round((myPower*.10+8)*(.84+Math.random()*.32)));
      const enDmg=Math.max(6,Math.round((enPower*.10+8)*(.84+Math.random()*.32)));
      enHp=Math.max(0,enHp-myDmg);
      if(log)log.textContent=`Runde ${round}: ${s.characterName} trifft für ${myDmg}. Gegner: ${enHp}/${maxEn} HP`;
      if(enHp<=0)return resolve(true);
      myHp=Math.max(0,myHp-enDmg);
      if(log)log.textContent+=`\n${v204Opponent.character_name} trifft für ${enDmg}. Du: ${myHp}/${maxMy} HP`;
      if(myHp<=0)return resolve(false);
      if(round>=30)return resolve((myHp/maxMy)>=(enHp/maxEn));
      setTimeout(step,420);
    };
    setTimeout(step,350);
  }).then(win=>v204Finish(win));
}
async function v204Finish(win){
  const enemy=v204Opponent;
  const gold=Math.max(25,Math.round(typeof window.v6168PvpGold==='function'?window.v6168PvpGold(Number(s?.level)||1,!!win):(35+s.level*7+(win?combatPower()*.035:combatPower()*.01))));
  const xp=Math.max(10,Math.round(18+s.level*4+(win?s.level*2:s.level)));
  if(win){s.gold+=gold;s.xp+=xp;}else{s.gold+=Math.round(gold*.35);s.xp+=Math.round(xp*.45);}

  s.v106Achievements??={done:{},stats:{}};
  s.v106Achievements.stats??={};
  s.v106Achievements.stats.pvpFights=(s.v106Achievements.stats.pvpFights||0)+1;
  if(win)s.v106Achievements.stats.pvpWins=(s.v106Achievements.stats.pvpWins||0)+1;

  try{
    const {data,error}=await v073Db.rpc('v205_finish_pvp',{p_target_user:enemy.id,p_won:!!win});
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;
    if(row){
      v204SyncLocalStatsFromProfile(row);
      s.v204Pvp.lastBudReward=Number(row.buds_awarded)||0;
    }
  }catch(e){
    console.error('V4.02 finish rpc',e);
  }

  try{v106CheckAchievements(false)}catch(e){}
  persist();
  try{await v075WriteCloudSave(true)}catch(e){}

  const log=document.querySelector('#v204BattleLog');
  if(log){
    log.innerHTML=win
      ? `<span class="v204-result-win">🏆 SIEG gegen ${v073Escape(enemy.character_name)}<br>+${gold} Gold · +${xp} EXP · +${Number(s.v204Pvp?.lastBudReward)||1} PvP-Bud${(Number(s.v204Pvp?.lastBudReward)||1)===1?'':'s'} 🌿</span>`
      : `<span class="v204-result-loss">💀 NIEDERLAGE gegen ${v073Escape(enemy.character_name)}<br>+${Math.round(gold*.35)} Gold · +${Math.round(xp*.45)} EXP · <b>0 PvP-Buds verloren</b></span>`;
  }
  v204BattleBusy=false;
  v204Opponent=null;
  v204CooldownLeft=await v204LoadCooldown();
  v204RenderPage();
  await v073SyncProfile(true);
}

/* Profile payload: PvP ranking fields */
const v204BaseProfilePayload=v073ProfilePayload;
v073ProfilePayload=function(){
  const p=v204BaseProfilePayload();
  p.combat_power=Math.max(0,Math.round(combatPower()));
  p.pvp_buds=Number(s.v204Pvp?.buds)||0;
  p.pvp_wins=Number(s.v204Pvp?.wins)||0;
  p.pvp_losses=Number(s.v204Pvp?.losses)||0;
  p.pvp_fights=Number(s.v204Pvp?.fights)||0;
  return p;
};

/* Hall ranking: Level first, then PvP-Buds, then gear score */
v073PlayerRow=function(p,i=null,actions=''){
  const rank=i===null?'':`<div class="v072-rank ${v073RankClass(i)}">${i+1}</div>`;
  const left=i===null?'<div class="v072-rank">P</div>':rank;
  return `<div class="v072-player-row" data-profile-id="${v073Escape(p.id)}" data-class-id="${v073Escape(p.class_id||'')}">
    ${left}
    <div>
      <div class="v072-player-name">${v073Escape(p.character_name)}</div>
      <div class="v072-player-sub">
        ${v073Escape(p.class_name||'')} · Lv. ${Number(p.level)||1} ·
        <span class="v204-hall-buds">🌿 ${Number(p.pvp_buds)||0} PvP-Buds</span> ·
        Kampfkraft ${Number(p.combat_power)||0} · Ausrüstung ${Number(p.gear_score)||0}
      </div>
    </div>
    <div class="v073-row-actions">${actions}</div>
  </div>`;
};
v073LoadRanking=async function(){
  const el=document.querySelector('#v072HallRanking');
  if(!el)return;
  if(!(await v073Init()))return;
  el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';
  const {data,error}=await v073Db.from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,pvp_buds,pvp_wins')
    .order('level',{ascending:false})
    .order('pvp_buds',{ascending:false})
    .order('gear_score',{ascending:false})
    .limit(50);
  if(error){
    console.error(error);
    el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden. V204_PVP_SQL.sql ausgeführt?</div>';
    return;
  }
  el.innerHTML=(data||[]).length
    ?data.map((p,i)=>v073PlayerRow(p,i,p.id===v073User.id?'<span class="pill">DU</span>':`<button class="btn secondary" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Freund</button>`)).join('')
    :'<div class="v072-empty">Noch keine Spieler in der Hall of Haze.</div>';
  v073BindAddButtons(el);
};

/* PvP in top dropdown */
const v204BaseMenu=v086BuildCompleteMenu;
v086BuildCompleteMenu=function(){
  v204BaseMenu();
  const panel=document.querySelector('#v032MenuPanel');
  if(!panel||panel.querySelector('[data-screen="pvp"]'))return;
  const hall=panel.querySelector('[data-screen="hall"]');
  const btn=document.createElement('button');
  btn.className='top-menu-item';
  btn.dataset.screen='pvp';
  btn.innerHTML='<span>⚔️</span>PvP-Arena';
  btn.onclick=()=>v032Go('pvp');
  if(hall)panel.insertBefore(btn,hall);else panel.appendChild(btn);
};

/* Avatar badge */
function v204InstallAvatarBadge(){
  const center=document.querySelector('#character .center-hero');
  if(!center)return;
  let badge=center.querySelector('.v204-avatar-badge');
  if(!badge){
    badge=document.createElement('div');
    badge.className='v204-avatar-badge';
    center.appendChild(badge);
  }
  badge.innerHTML=`🌿 <b>${Number(s.v204Pvp?.buds)||0}</b> PvP-Buds`;
}

/* 5 new Illegal Book achievements */
if(typeof V106_ACH!=='undefined'){
  const pvpAchievements=[
    ['pvp_fight1','Erste Nebelschlacht','Bestreite deinen ersten PvP-Kampf.',()=>s.v106Achievements?.stats?.pvpFights||0,1],
    ['pvp_win1','Erstes Blut','Gewinne deinen ersten PvP-Kampf.',()=>s.v106Achievements?.stats?.pvpWins||0,1],
    ['pvp_win10','Bud-Raufbold','Gewinne 10 PvP-Kämpfe.',()=>s.v106Achievements?.stats?.pvpWins||0,10],
    ['pvp_win50','Nebel-Champion','Gewinne 50 PvP-Kämpfe.',()=>s.v106Achievements?.stats?.pvpWins||0,50],
    ['pvp_buds100','König der PvP-Buds','Sammle 100 PvP-Buds.',()=>s.v204Pvp?.buds||0,100]
  ];
  pvpAchievements.forEach(a=>{if(!V106_ACH.some(x=>x[0]===a[0]))V106_ACH.push(a)});
}

/* V8.009: shared post-navigation owner refreshes PvP stats. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')!=='pvp')return;
  try{v086BuildCompleteMenu();v204InstallAvatarBadge()}catch(_){}
  void v204RefreshStats();
},{passive:true});
document.querySelector('#v204FindBtn')?.addEventListener('click',v204FindOpponent);

setInterval(()=>{
  if(document.hidden)return;
  if(v204CooldownLeft>0)v204CooldownLeft=Math.max(0,v204CooldownLeft-1000);
  if(!document.querySelector('#pvp')?.classList.contains('active'))return;
  const cd=document.querySelector('#v204Cooldown');
  if(cd)cd.textContent=v204CooldownLeft>0?v204Fmt(v204CooldownLeft):'Bereit';
  const btn=document.querySelector('#v204FindBtn');
  if(btn&&!v204BattleBusy&&!v204Opponent){
    btn.disabled=v204CooldownLeft>0;
    btn.textContent=v204CooldownLeft>0?`⏳ Neuer Kampf in ${v204Fmt(v204CooldownLeft)}`:'🎯 Gegner suchen';
  }
},1000);

queueMicrotask(()=>{try{v086BuildCompleteMenu();v204InstallAvatarBadge()}catch(_){}});
