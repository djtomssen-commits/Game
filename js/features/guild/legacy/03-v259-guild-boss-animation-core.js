/* === v259-guild-boss-animation-core === */
/* V4.02: sequential guild boss fight presentation. Server remains authoritative. */
const v259Sleep=ms=>new Promise(r=>setTimeout(r,ms));
function v259SetBossHp(hp,max){
  const h=Math.max(0,Number(hp)||0),m=Math.max(1,Number(max)||1);
  const txt=document.querySelector('#v259BossHpText'),fill=document.querySelector('#v259BossHpFill');
  if(txt)txt.textContent=`${v255Fmt(h)} / ${v255Fmt(m)} HP`;
  if(fill)fill.style.width=`${Math.max(0,Math.min(100,h/m*100))}%`;
}
async function v259AnimateBossResult(r){
  const arena=document.querySelector('#v259BossArena');
  if(!arena)return;
  const parts=Array.isArray(r?.participants)?r.participants:[];
  const max=Math.max(1,Number(r?.boss_max_hp)||1);
  let hp=max;
  arena.style.display='';
  arena.classList.remove('attack','hit','win','v261-final');
  arena.querySelectorAll('.v261-fight-finished').forEach(el=>el.classList.remove('v261-fight-finished'));
  v259SetBossHp(hp,max);
  const name=document.querySelector('#v259FighterName'),meta=document.querySelector('#v259FighterMeta'),
        avatar=document.querySelector('#v259FighterAvatar'),text=document.querySelector('#v259FightText'),
        pop=document.querySelector('#v259DamagePop');
  if(text)text.textContent=`${parts.length} Gildenmitglieder treten gegen den Titan an.`;
  await v259Sleep(700);

  for(let i=0;i<parts.length;i++){
    const x=parts[i];
    if(avatar)avatar.src=typeof v080AvatarFor==='function'?v080AvatarFor(x.class_id||'grower'):'';
    if(name)name.textContent=`${i+1}. ${x.character_name||'Spieler'}`;
    if(meta)meta.textContent=`${x.class_name||''} · Lv. ${Number(x.level)||1} · Kampfkraft ${v255Fmt(x.combat_power)}`;
    if(text)text.textContent=`${x.character_name||'Spieler'} macht sich zum Angriff bereit …`;
    await v259Sleep(650);

    arena.classList.remove('attack','hit');
    void arena.offsetWidth;
    arena.classList.add('attack');
    if(text)text.textContent=`${x.character_name||'Spieler'} greift an!`;
    await v259Sleep(330);
    arena.classList.add('hit');
    if(pop)pop.textContent=`-${v255Fmt(x.damage_done)}`;
    hp=Math.max(0,Number(x.boss_hp_after));
    v259SetBossHp(hp,max);
    await v259Sleep(900);
    arena.classList.remove('attack','hit');
    if(hp<=0)break;
    if(text)text.textContent=`Der Titan hat noch ${v255Fmt(hp)} HP.`;
    await v259Sleep(650);
  }

  const fighterSide=arena.querySelector('.v259-fighter-side');
  const vs=arena.querySelector('.v259-vs');
  if(fighterSide)fighterSide.classList.add('v261-fight-finished');
  if(vs)vs.classList.add('v261-fight-finished');
  arena.classList.add('v261-final');
  if(hp<=0){
    arena.classList.add('win');
    if(text)text.textContent='🏆 Der Verseuchte Titan wurde besiegt!';
  }else{
    if(text)text.textContent=`💀 Niederlage – der Titan überlebt mit ${v255Fmt(hp)} HP.`;
  }
  await v259Sleep(850);
}

