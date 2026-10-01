/* === v255-daily-guild-boss-core === */
/* V4.02 DAILY GUILD BOSS — one server-authoritative round per guild/day. */
let v255BossRound=null,v255BossParticipants=[];
function v255Fmt(n){return Math.max(0,Math.round(Number(n)||0)).toLocaleString('de-DE')}
function v255LocalPhase(){
  const now=new Date(),h=now.getHours();
  if(h<19)return {label:'Offen bis 19:00',open:true};
  if(h<20)return {label:'Anmeldung geschlossen',open:false};
  return {label:'Kampf läuft / beendet',open:false};
}
function v255BossParticipantHtml(x,i){
  const avatar=typeof v080AvatarFor==='function'?v080AvatarFor(x.class_id||'grower'):'';
  return `<div class="v255-fighter"><img src="${v254GuildEsc(avatar)}" alt=""><div><b>${i+1}. ${v254GuildEsc(x.character_name||'Spieler')}</b><small>${v254GuildEsc(x.class_name||'')} · Lv. ${Number(x.level)||1} · Kampfkraft ${v255Fmt(x.combat_power)}</small></div><div class="v255-damage">${x.damage_done==null?'ANGEMELDET':`-${v255Fmt(x.damage_done)}<small class="v255-rank">${x.damage_done>0?'Schaden':''}</small>`}</div></div>`;
}
function v4118BossSignedFallback(){
  try{
    return (Array.isArray(v254Members)?v254Members:[]).filter(m=>!!m?.boss_signed).map(m=>{
      const p=m?.profile||(Array.isArray(m?.profiles)?m.profiles[0]:m?.profiles)||{};
      return {user_id:m?.user_id||p?.id||'',character_name:p?.character_name||'Spieler',class_id:p?.class_id||'grower',class_name:p?.class_name||'',level:Number(p?.level)||1,combat_power:Number(p?.combat_power)||0,damage_done:null,__signupFallback:true};
    });
  }catch(e){return[]}
}
function v4118VisibleBossParticipants(){
  const server=Array.isArray(v255BossParticipants)?v255BossParticipants.filter(Boolean):[],fallback=v4118BossSignedFallback(),out=[],seen=new Set();
  const add=x=>{const k=String(x?.user_id||x?.id||x?.character_name||'').trim().toLowerCase();if(k&&seen.has(k))return;if(k)seen.add(k);out.push(x)};
  server.forEach(add);fallback.forEach(add);return out;
}
window.v4118VisibleBossParticipants=v4118VisibleBossParticipants;
function v255RenderBoss(){
  const phase=v255LocalPhase(),visibleParticipants=v4118VisibleBossParticipants(), state=document.querySelector('#v254BossSignupState'), btn=document.querySelector('#v254BossSignup');
  if(state)state.textContent=phase.label;
  if(btn){btn.disabled=!phase.open; if(!phase.open)btn.textContent=v254Membership?.boss_signed?'✓ Anmeldung gespeichert':'Anmeldung geschlossen'}
  const count=document.querySelector('#v254BossCount');if(count)count.textContent=visibleParticipants.length;
  const hpText=document.querySelector('#v255BossHpText'),fill=document.querySelector('#v255BossHpFill'),result=document.querySelector('#v255BossResult'),list=document.querySelector('#v255BossTimeline'),claim=document.querySelector('#v255ClaimBossReward');
  if(!hpText||!fill||!list)return;
  if(!v255BossRound){
    hpText.textContent=phase.open?'Heute noch kein Kampf gestartet.':'Bossrunde wird beim ersten Abruf nach 20:00 serverseitig ausgewertet.';
    fill.style.width='100%';result.textContent='';
    list.innerHTML=visibleParticipants.length?visibleParticipants.map(v255BossParticipantHtml).join(''):'<div class="v255-empty">Noch keine Boss-Teilnehmer.</div>';
    if(claim)claim.style.display='none'; return;
  }
  const max=Math.max(1,Number(v255BossRound.boss_max_hp)||1),hp=Math.max(0,Number(v255BossRound.boss_hp)||0);
  hpText.textContent=`Der Verseuchte Titan · ${v255Fmt(hp)} / ${v255Fmt(max)} HP`;
  fill.style.width=`${Math.max(0,Math.min(100,hp/max*100))}%`;
  result.textContent=v255BossRound.status==='won'?'🏆 BESIEGT':v255BossRound.status==='lost'?'💀 ENTKOMMEN':'⚔️ KAMPF';
  list.innerHTML=visibleParticipants.length?visibleParticipants.map(v255BossParticipantHtml).join(''):'<div class="v255-empty">Keine Teilnehmer.</div>';
  if(claim)claim.style.display=v255BossRound.can_claim?'':'none';
}
async function v255LoadBoss(){
  if(!v254Membership||!(await v254EnsureOnline())){v255BossRound=null;v255BossParticipants=[];v255RenderBoss();return}
  try{
    const {data,error}=await v073Db.rpc('v255_get_guild_boss');
    if(error)throw error;
    const payload=Array.isArray(data)?data[0]:data;
    v255BossRound=payload?.round||null;
    v255BossParticipants=payload?.participants||[];
    v255RenderBoss();
  }catch(e){
    console.error('V4.02 boss load',e);v255BossRound=null;v255BossParticipants=[];v255RenderBoss();
    if(/v255_get_guild_boss|does not exist|schema cache/i.test(String(e?.message||'')))v063Toast('Gildenboss noch nicht bereit','warn','Bitte V255_GUILD_BOSS_SQL.sql einmal in Supabase ausführen.');
  }
}
async function v255ClaimBossReward(){
  if(!(await v254EnsureOnline()))return;
  const btn=document.querySelector('#v255ClaimBossReward');if(btn){btn.disabled=true;btn.textContent='Belohnung wird geprüft …'}
  try{
    const {data,error}=await v073Db.rpc('v255_claim_guild_boss_reward');if(error)throw error;
    const r=Array.isArray(data)?data[0]:data;if(!r)throw new Error('Keine Belohnung erhalten.');
    /* V4.36: Gildenboss-Gilden-EP only on an actual Titan victory.
       A normal participation reward must never count as a defeated guild boss. */
    try{if(r.won&&window.GL_EVENTS)window.GL_EVENTS.emit('guildBossWon',{result:r},String(r.round_id||r.boss_id||r.day_key||r.date||Date.now()));else if(r.won&&typeof window.v411AwardGuildActivity==='function')void window.v411AwardGuildActivity('guild_boss')}catch(e){console.warn('V4.161 guild boss event',e)}
    const gold=Math.max(0,Number(r.gold)||0),xp=Math.max(0,Number(r.xp)||0),harz=Math.max(0,Number(r.harz)||0);
    s.gold=(Number(s.gold)||0)+gold;
    if(typeof addXp==='function')addXp(xp);else s.xp=(Number(s.xp)||0)+xp;
    s.harzTaler=(Number(s.harzTaler)||0)+harz;
    /* V4.92: successful guild-boss claims can also feed the Growroom seed loop. */
    try{if(!r.won&&typeof window.v492GuildBossSeedReward==='function')window.v492GuildBossSeedReward(r);else if(r.won&&!window.GL_EVENTS&&typeof window.v492GuildBossSeedReward==='function')window.v492GuildBossSeedReward(r)}catch(e){console.warn('V4.161 guild boss seed',e)}
    try{persist(false)}catch(e){} try{render()}catch(e){}
    if(typeof window.v7136ShowServerReward==='function'){
      window.v7136ShowServerReward('guildBoss',r,{});
    }else{
      try{window.v115Alert?.(`+${v255Fmt(xp)} EXP · +${v255Fmt(gold)} Gold${harz?` · +${harz} Harz-Taler`:''}`,r.won?'Gildenboss besiegt!':'Gildenboss-Belohnung','success')}catch(_){}
    }
    await v254LoadGuild();await v255LoadBoss();
  }catch(e){v063Toast('Belohnung nicht verfügbar','warn',e?.message||'');}
  finally{if(btn){btn.disabled=false;btn.textContent='🎁 Gildenboss-Belohnung abholen'}}
}
/* V8.009: legacy signup/load wrappers retired.
   v7307 owns boss signup; C25 owns guild -> boss/war refresh.
   Keep only the legacy reward click fallback for non-authority mode. */
document.querySelector('#v255ClaimBossReward')?.addEventListener('click',v255ClaimBossReward);
/* V6.213: retired duplicate v255 30s boss repaint; v260 active-tab owner remains authoritative. */

