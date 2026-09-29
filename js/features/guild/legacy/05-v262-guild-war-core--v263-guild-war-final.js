/* === v262-guild-war-core === */
let v262War=null,v262WarDuels=[];
function v262WarLocalPhase(){const h=new Date().getHours();return h<18?'signup':h<19?'matching':'battle'}
function v262RenderWar(){const phase=document.querySelector('#v262WarPhase'),status=document.querySelector('#v262WarStatus'),own=document.querySelector('#v262WarOwnName'),enemy=document.querySelector('#v262WarEnemyName'),os=document.querySelector('#v262WarOwnScore'),es=document.querySelector('#v262WarEnemyScore'),stats=document.querySelector('#v262WarStats'),watch=document.querySelector('#v262WarWatch'),claim=document.querySelector('#v262WarClaim');if(!status)return;const local=v262WarLocalPhase();if(phase)phase.textContent=local==='signup'?'ANMELDUNG':local==='matching'?'MATCHMAKING':'KAMPF';if(own)own.textContent=v254Guild?.name||'Deine Gilde';if(!v262War){if(enemy)enemy.textContent='Noch kein Gegner';if(os)os.textContent='0';if(es)es.textContent='0';status.textContent=local==='signup'?'Melde Mitglieder bis 18:00 Uhr für Angriff und/oder Verteidigung an.':local==='matching'?'Matchmaking läuft. Ab 19:00 Uhr steht das Ergebnis bereit.':'Für heute wurde noch kein passender Gildenkrieg gefunden.';if(stats)stats.innerHTML='';if(watch)watch.style.display='none';if(claim)claim.style.display='none';return}const mine=v262War.my_guild_id===v262War.guild_a_id?'a':'b',myScore=mine==='a'?v262War.score_a:v262War.score_b,enemyScore=mine==='a'?v262War.score_b:v262War.score_a,enemyName=mine==='a'?v262War.guild_b_name:v262War.guild_a_name;if(enemy)enemy.textContent=enemyName||'Gegnergilde';if(os)os.textContent=String(myScore||0);if(es)es.textContent=String(enemyScore||0);const resolved=['a_won','b_won','draw'].includes(v262War.status),won=(v262War.status==='a_won'&&mine==='a')||(v262War.status==='b_won'&&mine==='b');status.textContent=!resolved?'Gildenkrieg vorbereitet. Ergebnis ab 19:00 Uhr.':won?'🏆 Gildensieg! +30 Gilden-Buds.':v262War.status==='draw'?'🤝 Unentschieden.':'💀 Niederlage. +10 Gilden-Buds.';if(stats)stats.innerHTML=`<div class="v262-war-stat"><small>ANGRIFF GEMELDET</small><b>${Number(v262War.my_attackers)||0}</b></div><div class="v262-war-stat"><small>VERTEIDIGUNG GEMELDET</small><b>${Number(v262War.my_defenders)||0}</b></div>`;if(watch)watch.style.display=resolved&&v262WarDuels.length?'':'none';if(claim)claim.style.display=resolved&&v262War.i_participated&&!v262War.reward_claimed?'':'none'}
async function v262LoadWar(){if(!v254Membership||!v073Db){v262War=null;v262WarDuels=[];v262RenderWar();return}const {data,error}=await v073Db.rpc('v262_get_guild_war');if(error){console.info('V4.02 war foundation: matchmaking RPC follows in V4.02');v262War=null;v262WarDuels=[];v262RenderWar();return}v262War=data?.war||null;v262WarDuels=Array.isArray(data?.duels)?data.duels:[];v262RenderWar()}
function v262DuelHtml(d,i){const leftWin=d.winner_side==='attacker';return `<div class="v262-duel ${leftWin?'winner-left':'winner-right'}"><div class="v262-duel-head"><span>Duell ${i+1}</span><span>${leftWin?'⚔️ Angriff gewinnt':'🛡️ Verteidigung gewinnt'}</span></div><div class="v262-duel-line"><div class="v262-left"><b>${v254GuildEsc(d.attacker_name||'Angreifer')}</b><small>Lv. ${Number(d.attacker_level)||1} · ${v255Fmt(d.attacker_power)} KP · ${v255Fmt(d.attacker_hp_after)} HP</small></div><span>⚔️</span><div class="v262-right"><b>${v254GuildEsc(d.defender_name||'Verteidiger')}</b><small>Lv. ${Number(d.defender_level)||1} · ${v255Fmt(d.defender_power)} KP · ${v255Fmt(d.defender_hp_after)} HP</small></div></div></div>`}
async function v262WatchWar(){const box=document.querySelector('#v262WarReplay');if(!box||!v262WarDuels.length)return;box.classList.add('on');box.innerHTML='';for(let i=0;i<v262WarDuels.length;i++){box.insertAdjacentHTML('beforeend',v262DuelHtml(v262WarDuels[i],i));await v259Sleep(450)}}
async function v262ClaimWar(){const {data,error}=await v073Db.rpc('v262_claim_guild_war_reward');if(error)return v063Toast('Belohnung fehlgeschlagen','warn',error.message||'');const r=data||{};s.gold=(Number(s.gold)||0)+v408GuildGold(Number(r.gold)||0);addXp(Number(r.xp)||0);s.harzTaler=(Number(s.harzTaler)||0)+(Number(r.harz)||0);persist();render();v063Toast('Gildenkrieg-Belohnung','success',`+${v255Fmt(r.gold)} Gold · +${v255Fmt(r.xp)} EXP · +${r.harz||0} Harz-Taler`);await v262LoadWar()}
document.querySelector('#v262WarRefresh')?.addEventListener('click',v262LoadWar);document.querySelector('#v262WarWatch')?.addEventListener('click',v262WatchWar);document.querySelector('#v262WarClaim')?.addEventListener('click',v262ClaimWar);
const v262BaseLoadGuild=v254LoadGuild;v254LoadGuild=async function(){const r=await v262BaseLoadGuild();await v262LoadWar();return r};
const v262BaseSignup=v254ToggleSignup;v254ToggleSignup=async function(kind){const r=await v262BaseSignup(kind);if(kind==='attack'||kind==='defense')await v262LoadWar();return r};
/* V6.319: V4159 is the authoritative guild-war watcher and already refreshes
   once per minute plus on guild entry/foreground. Retire the duplicate V262 poll
   and obsolete startup paint while keeping its data/compatibility functions. */

/* === v263-guild-war-final === */
function v263WarLeader(){return v254Membership?.role==='leader'}
async function v263TestWar(){
  const b=document.querySelector('#v263WarTest'); if(b)b.disabled=true;
  try{
    const {data,error}=await v073Db.rpc('v264_test_guild_war');
    if(error) throw error;
    v262War=data?.war||null; v262WarDuels=Array.isArray(data?.duels)?data.duels:[];
    v262RenderWar();
    v063Toast('Gildenkrieg-Test','success',`${v262War?.guild_a_name||'Gilde A'} ${v262War?.score_a||0}:${v262War?.score_b||0} ${v262War?.guild_b_name||'Gilde B'}`);
    if(v262WarDuels.length) await v262WatchWar();
  }catch(e){v063Toast('Gildenkrieg-Test fehlgeschlagen','warn',e?.message||String(e))}
  finally{if(b)b.disabled=false}
}
document.querySelector('#v263WarTest')?.addEventListener('click',v263TestWar);

const v263RenderWarBase=v262RenderWar;
v262RenderWar=function(){
  v263RenderWarBase();
  const b=document.querySelector('#v263WarTest');
  if(b)b.style.display=v263WarLeader()?'':'none';
};

