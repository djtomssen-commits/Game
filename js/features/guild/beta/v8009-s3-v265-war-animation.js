let v265WarSkip=false;
const v265Sleep=ms=>new Promise(r=>setTimeout(r,ms));
function v265Mine(){return v262War?.my_guild_id===v262War?.guild_a_id?'a':'b'}
function v265Avatar(name,side){const n=String(name||'').toLowerCase();if(n.includes('bong')||n.includes('mag'))return '🧙';if(n.includes('kush')||n.includes('barbar'))return '🪓';return side==='left'?'🗡️':'🛡️'}
function v265SetFighter(el,name,level,power,hp,maxhp,side){
 el.querySelector('.v265-avatar').textContent=v265Avatar(name,side);el.querySelector('.v265-name').textContent=name||'Kämpfer';el.querySelector('.v265-meta').textContent=`Lv. ${Number(level)||1} · ${v255Fmt(power)} KP`;
 const pct=Math.max(0,Math.min(100,(Number(hp)||0)/Math.max(1,Number(maxhp)||1)*100));el.querySelector('.v265-hp i').style.width=pct+'%';el.querySelector('.v265-hptxt').textContent=`${v255Fmt(Math.max(0,hp))} HP`;
}
async function v265Hit(att,def,damage){
 att.classList.add('attack');await v265Sleep(v265WarSkip?10:260);att.classList.remove('attack');def.classList.add('hit');
 const pop=def.querySelector('.v265-dmg');pop.textContent='-'+v255Fmt(damage);pop.classList.remove('pop');void pop.offsetWidth;pop.classList.add('pop');
 await v265Sleep(v265WarSkip?10:330);def.classList.remove('hit');
}
function v265FinalText(){
 const mine=v265Mine(),myScore=mine==='a'?Number(v262War.score_a):Number(v262War.score_b),enScore=mine==='a'?Number(v262War.score_b):Number(v262War.score_a),myHp=mine==='a'?Number(v262War.hp_a):Number(v262War.hp_b),enHp=mine==='a'?Number(v262War.hp_b):Number(v262War.hp_a);
 const won=(v262War.status==='a_won'&&mine==='a')||(v262War.status==='b_won'&&mine==='b');
 const tied=myScore===enScore;
 return {won,tied,myScore,enScore,myHp,enHp,text:won?'🏆 GILDENSIEG':'💀 NIEDERLAGE'};
}
async function v262WatchWar(){
 if(!v262WarDuels.length)return;
 v265WarSkip=false;const modal=document.querySelector('#v265WarArena'),L=document.querySelector('#v265Left'),R=document.querySelector('#v265Right'),score=document.querySelector('#v265WarScore'),round=document.querySelector('#v265WarRound'),res=document.querySelector('#v265WarResult'),sub=document.querySelector('#v265WarSub');
 modal.classList.add('on');res.textContent='';sub.textContent='';let aPts=0,bPts=0;
 const an=v262War.guild_a_name||'Gilde A',bn=v262War.guild_b_name||'Gilde B';
 for(let i=0;i<v262WarDuels.length;i++){
  const d=v262WarDuels[i],dir=d.direction||'a';round.textContent=`Duell ${i+1} von ${v262WarDuels.length}`;
  score.innerHTML=`${v254GuildEsc(an)} <b>${aPts} : ${bPts}</b> ${v254GuildEsc(bn)}`;
  const ah=Math.max(Number(d.attacker_hp_after)||0,Math.round((Number(d.attacker_power)||1)*2.4+(Number(d.attacker_level)||1)*35)),dh=Math.max(Number(d.defender_hp_after)||0,Math.round((Number(d.defender_power)||1)*2.4+(Number(d.defender_level)||1)*35));
  v265SetFighter(L,d.attacker_name,d.attacker_level,d.attacker_power,ah,ah,'left');v265SetFighter(R,d.defender_name,d.defender_level,d.defender_power,dh,dh,'right');
  await v265Sleep(v265WarSkip?10:650);
  const aFinal=Math.max(0,Number(d.attacker_hp_after)||0),dFinal=Math.max(0,Number(d.defender_hp_after)||0),dmgD=Math.max(1,dh-dFinal),dmgA=Math.max(1,ah-aFinal);
  await v265Hit(L,R,dmgD);v265SetFighter(R,d.defender_name,d.defender_level,d.defender_power,dFinal,dh,'right');
  await v265Hit(R,L,dmgA);v265SetFighter(L,d.attacker_name,d.attacker_level,d.attacker_power,aFinal,ah,'left');
  const attackWon=d.winner_side==='attacker';if(dir==='a'){attackWon?aPts++:bPts++}else{attackWon?bPts++:aPts++}
  score.innerHTML=`${v254GuildEsc(an)} <b>${aPts} : ${bPts}</b> ${v254GuildEsc(bn)}`;
  (attackWon?L:R).style.filter='drop-shadow(0 0 16px #b7ff77)';await v265Sleep(v265WarSkip?10:800);L.style.filter='';R.style.filter='';
 }
 const f=v265FinalText();round.textContent='Endergebnis';score.innerHTML=`${v254GuildEsc(an)} <b>${Number(v262War.score_a)||0} : ${Number(v262War.score_b)||0}</b> ${v254GuildEsc(bn)}`;res.textContent=f.text;
 sub.textContent=f.tied?`Punktgleich – Entscheidung durch Rest-HP (${v255Fmt(f.myHp)} : ${v255Fmt(f.enHp)}).`:`Entscheidung nach ${v262WarDuels.length} Duellen.`;
}
document.querySelector('#v265WarClose')?.addEventListener('click',()=>document.querySelector('#v265WarArena')?.classList.remove('on'));
document.querySelector('#v265WarSkip')?.addEventListener('click',()=>{v265WarSkip=true});
const v265RenderBase=v262RenderWar;
v262RenderWar=function(){
 v265RenderBase();
 if(!v262War)return;
 const mine=v265Mine(),myScore=mine==='a'?Number(v262War.score_a):Number(v262War.score_b),enScore=mine==='a'?Number(v262War.score_b):Number(v262War.score_a),myHp=mine==='a'?Number(v262War.hp_a):Number(v262War.hp_b),enHp=mine==='a'?Number(v262War.hp_b):Number(v262War.hp_a),resolved=['a_won','b_won','draw'].includes(v262War.status),won=(v262War.status==='a_won'&&mine==='a')||(v262War.status==='b_won'&&mine==='b'),status=document.querySelector('#v262WarStatus');
 if(resolved&&status){const tie=myScore===enScore;status.textContent=won?(tie?`🏆 Gildensieg nach Rest-HP! ${v255Fmt(myHp)} : ${v255Fmt(enHp)} HP.`:'🏆 Gildensieg! +30 Gilden-Buds.'):(v262War.status==='draw'?'🤝 Unentschieden.':tie?`💀 Niederlage nach Rest-HP. ${v255Fmt(myHp)} : ${v255Fmt(enHp)} HP.`:'💀 Niederlage. +10 Gilden-Buds.')}
};
