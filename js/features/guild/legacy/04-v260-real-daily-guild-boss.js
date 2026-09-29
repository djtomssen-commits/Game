/* === v260-real-daily-guild-boss === */
/* V4.02: the real daily boss uses the same sequential presentation as the test.
   The server result is authoritative; animation is only presentation/replay. */
let v260DailyAnimating=false;

function v260RoundResolved(){
  return !!v255BossRound && ['won','lost'].includes(v255BossRound.status) && Array.isArray(v255BossParticipants) && v255BossParticipants.length>0;
}
function v260RoundKey(){
  const round=v255BossRound||{};
  return String(round.id||round.battle_date||round.created_at||'today');
}
function v260SeenKey(){
  return `gl_v260_boss_seen_${v073User?.id||'user'}_${v260RoundKey()}`;
}
function v260HasSeen(){
  try{return localStorage.getItem(v260SeenKey())==='1'}catch(e){return false}
}
function v260MarkSeen(){
  try{localStorage.setItem(v260SeenKey(),'1')}catch(e){}
}
function v260RenderDailyControls(){
  const watch=document.querySelector('#v260WatchDailyBoss');
  if(watch)watch.style.display=v260RoundResolved()?'':'none';
}
function v260SetRealBossHp(hp,max){
  const h=Math.max(0,Number(hp)||0),m=Math.max(1,Number(max)||1);
  const txt=document.querySelector('#v260BossHpText'),fill=document.querySelector('#v260BossHpFill');
  if(txt)txt.textContent=`${v255Fmt(h)} / ${v255Fmt(m)} HP`;
  if(fill)fill.style.width=`${Math.max(0,Math.min(100,h/m*100))}%`;
}
async function v260AnimateDailyBoss(){
  if(v260DailyAnimating||!v260RoundResolved())return;
  const arena=document.querySelector('#v260DailyBossArena');
  if(!arena)return;
  v260DailyAnimating=true;
  const parts=v255BossParticipants;
  const max=Math.max(1,Number(v255BossRound.boss_max_hp)||1);
  let hp=max;
  arena.style.display='';
  arena.classList.remove('attack','hit','win','v261-final');
  arena.querySelectorAll('.v261-fight-finished').forEach(el=>el.classList.remove('v261-fight-finished'));
  v260SetRealBossHp(hp,max);

  const name=document.querySelector('#v260FighterName'),
        meta=document.querySelector('#v260FighterMeta'),
        avatar=document.querySelector('#v260FighterAvatar'),
        text=document.querySelector('#v260FightText'),
        pop=document.querySelector('#v260DamagePop'),
        summary=document.querySelector('#v260DailySummary');

  if(summary){summary.classList.remove('on');summary.innerHTML=''}
  if(text)text.textContent=`${parts.length} gemeldete Gildenmitglieder treten gegen den Titan an.`;
  /* V6.208: do not start a browser smooth-scroll while the user is entering or
     scrolling the boss tab. It caused visible jank on Android/Samsung Browser. */
  await v259Sleep(750);

  for(let i=0;i<parts.length;i++){
    const x=parts[i];
    if(avatar)avatar.src=typeof v080AvatarFor==='function'?v080AvatarFor(x.class_id||'grower'):'';
    if(name)name.textContent=`${i+1}. ${x.character_name||'Spieler'}`;
    if(meta)meta.textContent=`${x.class_name||''} · Lv. ${Number(x.level)||1} · Kampfkraft ${v255Fmt(x.combat_power)}`;
    if(text)text.textContent=`${x.character_name||'Spieler'} betritt den Kampf …`;
    await v259Sleep(650);

    arena.classList.remove('attack','hit');
    void arena.offsetWidth;
    arena.classList.add('attack');
    if(text)text.textContent=`${x.character_name||'Spieler'} greift den Titan an!`;
    await v259Sleep(330);

    arena.classList.add('hit');
    if(pop)pop.textContent=`-${v255Fmt(x.damage_done)}`;
    hp=Math.max(0,Number(x.boss_hp_after));
    v260SetRealBossHp(hp,max);
    await v259Sleep(900);
    arena.classList.remove('attack','hit');

    if(hp<=0)break;
    if(text)text.textContent=`Noch ${v255Fmt(hp)} HP – der nächste Kämpfer ist dran.`;
    await v259Sleep(650);
  }

  const won=v255BossRound.status==='won' || hp<=0;
  const fighterSide=arena.querySelector('.v259-fighter-side');
  const vs=arena.querySelector('.v259-vs');
  if(fighterSide)fighterSide.classList.add('v261-fight-finished');
  if(vs)vs.classList.add('v261-fight-finished');
  arena.classList.add('v261-final');
  if(won){
    arena.classList.add('win');
    if(text)text.textContent='🏆 GILDENSIEG – Der Verseuchte Titan wurde besiegt!';
  }else{
    if(text)text.textContent=`💀 GILDENNIEDERLAGE – ${v255Fmt(hp)} HP blieben übrig.`;
  }

  const totalDamage=parts.reduce((sum,x)=>sum+(Number(x.damage_done)||0),0);
  if(summary){
    summary.classList.add('on');
    summary.innerHTML=`<b>${won?'🏆 Sieg':'💀 Niederlage'}</b><br>${parts.length} Teilnehmer · ${v255Fmt(totalDamage)} Gesamtschaden${won?' · +20 Gilden-Buds für die Gilde':''}.`;
  }
  v260MarkSeen();
  v260DailyAnimating=false;
}

function v260MaybeAutoPlay(){
  v260RenderDailyControls();
  const panel=document.querySelector('#v254GuildBoss');
  const guild=document.querySelector('#guild');
  const bossVisible=!!panel && panel.style.display!=='none' && !!guild?.classList.contains('active');
  /* V6.208: never animate the hidden boss while Overview/War is open. */
  if(bossVisible && document.visibilityState!=='hidden' && v260RoundResolved() && !v260HasSeen() && !v260DailyAnimating){
    setTimeout(()=>{
      const p=document.querySelector('#v254GuildBoss');
      if(p && p.style.display!=='none' && document.querySelector('#guild')?.classList.contains('active'))v260AnimateDailyBoss();
    },350);
  }
}

document.querySelector('#v260WatchDailyBoss')?.addEventListener('click',v260AnimateDailyBoss);

/* Hook the final active boss loader, after V4.02/V4.02 wrappers are established. */
const v260BaseLoadBoss=v255LoadBoss;
v255LoadBoss=async function(){
  const r=await v260BaseLoadBoss();
  v260MaybeAutoPlay();
  return r;
};

/* If the guild boss screen is left open across 20:00, resolve/load it automatically
   on the existing 30-second cadence instead of requiring a reload. */
const v260BossClock=setInterval(async()=>{
  if(document.hidden)return;
  const guild=document.querySelector('#guild'),panel=document.querySelector('#v254GuildBoss');
  if(!guild?.classList.contains('active') || !v254Membership || !panel || panel.style.display==='none')return;
  const h=new Date().getHours();
  if(h>=20 && !v260RoundResolved())await v255LoadBoss();
  else v260RenderDailyControls();
},30000);

setTimeout(()=>{
  v260RenderDailyControls();
  
  const line=document.querySelector('#v141VersionLine');
},900);

