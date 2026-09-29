/* === v6307-guildboss-multiexchange-script === */
(()=>{
  'use strict';
  if(window.__V6307_GUILD_BOSS_MULTI_EXCHANGE__)return;
  window.__V6307_GUILD_BOSS_MULTI_EXCHANGE__=true;

  const sleep=ms=>typeof v259Sleep==='function'?v259Sleep(ms):new Promise(r=>setTimeout(r,ms));
  const fmt=v=>{try{return typeof v255Fmt==='function'?v255Fmt(v):Math.round(Number(v)||0).toLocaleString('de-DE')}catch(_){return String(v)}};
  const clsLabel={grower:'Bud-Barbar',scout:'Blatt-Schütze',bruiser:'Bong-Magier',frost:'Frost-Todesritter',summoner:'Harzruferin'};

  function ensureCombatUi(){
    const arena=document.getElementById('v260DailyBossArena');
    if(!arena)return null;
    const fighter=arena.querySelector('.v259-fighter-side');
    const stage=arena.querySelector('.v259-stage');
    if(fighter && !document.getElementById('v260HeroEndurance')){
      const wrap=document.createElement('div');
      wrap.id='v260HeroEndurance';
      wrap.className='v6307-endurance';
      wrap.innerHTML='<div class="v6307-endurance-head"><span>KAMPFAUSDAUER</span><b id="v260HeroEnduranceText">100%</b></div><div class="v6307-endurance-bar"><i id="v260HeroEnduranceFill"></i></div><div id="v260HeroCombatNote" class="v6307-combat-note"></div>';
      const impact=document.getElementById('v260HeroImpact');
      if(impact)impact.insertAdjacentElement('beforebegin',wrap); else fighter.appendChild(wrap);
    }
    if(stage && !document.getElementById('v260BossDamagePop')){
      const pop=document.createElement('div');pop.id='v260BossDamagePop';stage.appendChild(pop);
    }
    if(stage && !document.getElementById('v260ClassFx')){
      const fx=document.createElement('div');fx.id='v260ClassFx';stage.appendChild(fx);
    }
    return arena;
  }

  function setEndurance(pct,note=''){
    pct=Math.max(0,Math.min(100,Math.round(Number(pct)||0)));
    const fill=document.getElementById('v260HeroEnduranceFill');
    const txt=document.getElementById('v260HeroEnduranceText');
    const noteEl=document.getElementById('v260HeroCombatNote');
    if(fill){fill.style.width=pct+'%';fill.classList.toggle('low',pct<=55&&pct>25);fill.classList.toggle('danger',pct<=25)}
    if(txt)txt.textContent=pct+'%';
    if(noteEl)noteEl.textContent=note;
  }

  function clearFightClasses(arena){
    arena.classList.remove('attack','hit','v6203-finisher','v6307-player-strike','v6307-boss-attack','v6307-hero-hit','v6307-cls-grower','v6307-cls-scout','v6307-cls-bruiser','v6307-cls-frost','v6307-cls-summoner','v6307-cls-summoner');
  }

  function classHitCount(cls,cp){
    /* V6.209: replay-only pacing. Damage remains server-authoritative and unchanged. */
    if(cls==='scout')return 4;
    if(cls==='bruiser')return 3;
    if(cls==='frost')return 3;
    if(cls==='summoner')return 3;
    if(cls==='grower')return 3;
    return 3;
  }

  function splitDamage(total,hits,seed=1){
    total=Math.max(0,Math.round(Number(total)||0));hits=Math.max(1,Math.floor(hits)||1);
    if(hits===1)return [total];
    const weights=[];
    for(let i=0;i<hits;i++)weights.push(1+0.22*Math.sin((i+1)*(seed+1)*1.37)+0.08*Math.cos((i+2)*(seed+2)*.91));
    const sum=weights.reduce((a,b)=>a+b,0)||1;
    const out=[];let used=0;
    for(let i=0;i<hits;i++){
      const n=i===hits-1?total-used:Math.max(0,Math.round(total*weights[i]/sum));
      out.push(n);used+=n;
    }
    if(used!==total)out[out.length-1]+=total-used;
    return out;
  }

  function bossCounterPattern(hits,seed=0){
    /* V6.209: max two cinematic counters; this changes presentation only, never server damage. */
    const set=new Set();
    if(hits>1)set.add(Math.max(1,Math.floor(hits/2)));
    if(hits>=4)set.add(hits-1);
    return set;
  }

  function actionText(cls,name,hitNo,hits){
    if(cls==='scout')return hitNo%2===0?`${name} setzt mit einer schnellen Salve nach!`:`${name} feuert auf den Titan.`;
    if(cls==='bruiser')return hitNo===hits?`${name} entlädt die volle Nebelmagie!`:`${name} schleudert Nebelenergie auf den Titan.`;
    if(cls==='frost')return hitNo===hits?`${name} lässt die Frostklinge einschlagen!`:`${name} greift mit eisiger Schattenkraft an.`;
    if(cls==='summoner')return hitNo===hits?`${name} entfesselt den Geisterchor!`:`${name} ruft einen Diener aus dem Dunst.`;
    return hitNo===hits?`${name} holt zum schweren Hieb aus!`:`${name} schlägt mit voller Wucht zu.`;
  }


  function resetLog(partsLen){
    const log=document.getElementById('v260BattleLog');if(!log)return;
    log.innerHTML='';
    const head=document.createElement('div');head.className='v6305-log-head';
    const a=document.createElement('span');a.textContent='Kampfverlauf';
    const b=document.createElement('span');b.textContent=partsLen+' Teilnehmer';
    head.append(a,b);log.appendChild(head);
  }

  function addFighterLog(roundNo,x,total,hits,counters,hp,max,final){
    const log=document.getElementById('v260BattleLog');if(!log)return;
    const row=document.createElement('div');row.className='v6305-log-row';
    const tag=document.createElement('span');tag.className='tag';tag.textContent='Kämpfer '+roundNo;
    const mid=document.createElement('div');
    const strong=document.createElement('b');strong.textContent=x.character_name||'Spieler';
    const sub=document.createElement('div');sub.textContent=`${hits} eigene Treffer · ${counters} Boss-Gegenangriffe · ${fmt(total)} Gesamtschaden`;
    mid.append(strong,sub);
    const right=document.createElement('div');right.className='right';right.textContent=final?'Boss besiegt':`Rest-HP ${fmt(hp)} / ${fmt(max)}`;
    row.append(tag,mid,right);log.appendChild(row);
  }

  function setTop(stateText,phaseText,state='idle'){
    const a=document.getElementById('v260BattleState'),b=document.getElementById('v260BattlePhase');
    if(a){a.textContent=stateText;a.dataset.state=state}
    if(b)b.textContent=phaseText;
  }

  async function playerStrike(arena,cls,name,chunk,hitNo,hits,bossHp,maxHp,finalHit){
    clearFightClasses(arena);
    arena.classList.add('attack','v6307-player-strike','v6307-cls-'+(cls||'grower'));
    const text=document.getElementById('v260FightText');
    if(text)text.textContent=actionText(cls,name,hitNo,hits);
    setTop(`${name} greift an`,`Treffer ${hitNo} / ${hits}`,'attack');
    await sleep(cls==='scout'?180:240);
    arena.classList.add('hit');
    if(finalHit)arena.classList.add('v6203-finisher');
    const pop=document.getElementById('v260DamagePop');
    if(pop){
      const label=finalHit?'FINALER TREFFER':(hitNo>1&&hitNo<hits?'KOMBO':'TREFFER');
      pop.innerHTML=`-${fmt(chunk)}<span class="v6203-sub">${label}</span>`;
    }
    if(typeof v260SetRealBossHp==='function')v260SetRealBossHp(bossHp,maxHp);
    await sleep(cls==='scout'?420:500);
    clearFightClasses(arena);
    if(pop)pop.innerHTML='';
  }

  async function bossCounter(arena,endurance,loss,heavy=false){
    clearFightClasses(arena);
    arena.classList.add('v6307-boss-attack');
    const text=document.getElementById('v260FightText');
    if(text)text.textContent=heavy?'Der Verseuchte Titan holt zum schweren Gegenschlag aus!':'Der Titan schlägt zurück!';
    setTop('Boss-Gegenangriff',heavy?'Schwerer Treffer':'Der Titan kontert','attack');
    await sleep(300);
    arena.classList.add('v6307-hero-hit');
    const pop=document.getElementById('v260BossDamagePop');
    if(pop){pop.innerHTML=`-${Math.round(loss)}%<span>${heavy?'SCHWERER TREFFER':'GEGENANGRIFF'}</span>`}
    endurance=Math.max(0,endurance-loss);
    setEndurance(endurance,endurance<=0?'Kampfunfähig':endurance<=30?'Kritische Ausdauer':'Hält stand');
    await sleep(520);
    clearFightClasses(arena);
    if(pop)pop.innerHTML='';
    return endurance;
  }

  async function animate(){
    try{if(typeof v260DailyAnimating!=='undefined'&&v260DailyAnimating)return}catch(_){ }
    let round,parts;
    try{
      if(!(typeof v260RoundResolved==='function'&&v260RoundResolved()))return;
      round=(typeof v255BossRound!=='undefined'&&v255BossRound)||{};
      parts=(typeof v255BossParticipants!=='undefined'&&Array.isArray(v255BossParticipants))?v255BossParticipants:[];
    }catch(_){return}
    const arena=ensureCombatUi();if(!arena||!parts.length)return;
    try{v260DailyAnimating=true}catch(_){window.v260DailyAnimating=true}
    arena.classList.remove('win','v261-final');clearFightClasses(arena);
    arena.querySelectorAll('.v261-fight-finished').forEach(el=>el.classList.remove('v261-fight-finished'));
    const max=Math.max(1,Number(round.boss_max_hp)||1);let hp=max;
    if(typeof v260SetRealBossHp==='function')v260SetRealBossHp(hp,max);
    const summary=document.getElementById('v260DailySummary');if(summary){summary.classList.remove('on');summary.innerHTML=''}
    const text=document.getElementById('v260FightText');
    const fighterName=document.getElementById('v260FighterName');
    const fighterMeta=document.getElementById('v260FighterMeta');
    const avatar=document.getElementById('v260FighterAvatar');
    const damagePop=document.getElementById('v260DamagePop');if(damagePop)damagePop.innerHTML='';
    resetLog(parts.length);
    setEndurance(100,'Bereit');
    setTop('Gildenkampf startet',`${parts.length} Kämpfer treten nacheinander an`,'idle');
    if(text)text.textContent='Der erste Gildenkämpfer betritt die Arena …';
    arena.style.display='';
    /* V6.209: no automatic smooth scroll during replay (Samsung/Android jank). */
    await sleep(650);

    for(let i=0;i<parts.length;i++){
      const x=parts[i]||{};
      const name=x.character_name||'Spieler';
      const cls=String(x.class_id||'grower');
      /* V7.189: expose the participant's authoritative class directly to the
         visual owner. Do not infer the combat figure from labels/names. */
      arena.dataset.activeGuildClass=cls;
      /* Server damage_done is the authoritative damage value. boss_hp_after can be
         inconsistent with participant display order (seen when a 0-damage fighter
         appeared to land the killing blow). Rebuild replay HP strictly from the
         recorded damage so damage popups, log rows and the HP bar cannot disagree. */
      const total=Math.max(0,Number(x.damage_done)||0);
      const finalHp=Math.max(0,hp-total);
      const hitCount=classHitCount(cls,x.combat_power);
      const chunks=splitDamage(total,hitCount,i+1);
      const counters=bossCounterPattern(hitCount,i);
      let endurance=100,counterCount=0,cumulative=0;
      try{
        const rawAfter=Number(x.boss_hp_after);
        if(Number.isFinite(rawAfter)&&Math.max(0,rawAfter)!==finalHp){
          console.warn('[GuildBoss replay] boss_hp_after mismatch ignored',{name,damage_done:total,expected_hp_after:finalHp,server_hp_after:rawAfter});
        }
      }catch(_){}
      if(avatar)avatar.src=typeof v080AvatarFor==='function'?v080AvatarFor(cls):'';
      if(fighterName)fighterName.textContent=`${i+1}. ${name}`;
      if(fighterMeta)fighterMeta.textContent=`${x.class_name||clsLabel[cls]||''} · Lv. ${Number(x.level)||1} · Kampfkraft ${fmt(x.combat_power)}`;
      setEndurance(100,'Betritt die Arena');
      setTop(`${name} ist dran`,`Kämpfer ${i+1} / ${parts.length}`,'idle');
      if(text)text.textContent=`${name} stellt sich dem Verseuchten Titan.`;
      await sleep(430);

      for(let h=0;h<chunks.length;h++){
        cumulative+=chunks[h];
        const visualHp=Math.max(0,hp-cumulative);
        const finalHit=visualHp<=0;
        await playerStrike(arena,cls,name,chunks[h],h+1,chunks.length,visualHp,max,finalHit);
        if(finalHit){hp=0;break}

        if(counters.has(h+1)){
          counterCount++;
          const remainingCounters=[...counters].filter(n=>n>h+1).length;
          const targetLoss=Math.max(16,Math.min(28,18+((i+h)%4)*3));
          // Keep the fighter alive for several exchanges. Final knockout happens only after their own sequence.
          const maxLossNow=Math.max(8,endurance-(remainingCounters?18:12));
          endurance=await bossCounter(arena,endurance,Math.min(targetLoss,maxLossNow),false);
        }else if(h<chunks.length-1){
          setTop(`${name} bleibt am Boss`,`Kombofolge ${h+1} / ${chunks.length}`,'attack');
          if(text)text.textContent=`${name} hält den Druck aufrecht …`;
          await sleep(180);
        }
      }

      hp=finalHp;
      if(typeof v260SetRealBossHp==='function')v260SetRealBossHp(hp,max);
      const killedBoss=hp<=0;
      if(!killedBoss){
        // Cinematic knockout only; server damage/curve is already fixed by damage_done + boss_hp_after.
        if(endurance>0){
          counterCount++;
          endurance=await bossCounter(arena,endurance,endurance,true);
        }
        setTop(`${name} kampfunfähig`,`Gesamtschaden ${fmt(total)}`,'idle');
        if(text)text.textContent=`${name} hat ${fmt(total)} Schaden verursacht. Der nächste Gildenkämpfer übernimmt.`;
      }else{
        setTop('Finaler Treffer',`${name} besiegt den Titan`,'win');
        if(text)text.textContent=`${name} landet den finalen Treffer – der Titan fällt!`;
      }
      addFighterLog(i+1,x,total,hitCount,counterCount,hp,max,killedBoss);
      await sleep(killedBoss?800:600);
      if(killedBoss)break;
    }

    const won=round.status==='won'||hp<=0;
    const fighterSide=arena.querySelector('.v259-fighter-side');
    const vs=arena.querySelector('.v259-vs');
    if(fighterSide)fighterSide.classList.add('v261-fight-finished');
    if(vs)vs.classList.add('v261-fight-finished');
    arena.classList.add('v261-final');
    if(won){arena.classList.add('win');setTop('Gildensieg!','Der Verseuchte Titan wurde besiegt','win');if(text)text.textContent='🏆 GILDENSIEG – Der Verseuchte Titan wurde besiegt!'}
    else{setTop('Niederlage',`${fmt(hp)} Boss-HP blieben übrig`,'lose');if(text)text.textContent=`💀 GILDENNIEDERLAGE – ${fmt(hp)} HP blieben übrig.`}

    const totalDamage=parts.reduce((sum,x)=>sum+(Number(x?.damage_done)||0),0);
    if(summary){
      summary.classList.add('on');
      summary.innerHTML=`<div class="v6305-summary-grid"><div class="v6305-summary-card"><small>Ergebnis</small><b>${won?'🏆 Sieg':'💀 Niederlage'}</b><span>${won?'Der Bosskampf wurde als mehrstufige Sequenz abgespielt.':`${fmt(hp)} Boss-HP blieben übrig.`}</span></div><div class="v6305-summary-card"><small>Gesamtschaden</small><b>${fmt(totalDamage)}</b><span>${parts.length} Kämpfer · Server-Gesamtschaden unverändert</span></div><div class="v6305-summary-card"><small>Kampfkurve</small><b>Unverändert</b><span>Boss-Stufe, HP und Teilnehmer-Schaden bleiben serverseitig identisch.</span></div></div>`;
    }
    try{if(typeof v260MarkSeen==='function')v260MarkSeen()}catch(_){ }
    await sleep(220);
    try{v260DailyAnimating=false}catch(_){window.v260DailyAnimating=false}
  }

  window.v6322GuildBossDamageQA=()=>{
    try{
      const max=Math.max(1,Number(v255BossRound?.boss_max_hp)||1);
      const parts=Array.isArray(v255BossParticipants)?v255BossParticipants:[];
      let hp=max;
      const rows=parts.map((x,i)=>{
        const damage=Math.max(0,Number(x?.damage_done)||0);
        const expected=Math.max(0,hp-damage);
        const server=Number(x?.boss_hp_after);
        const row={index:i+1,name:x?.character_name||'Spieler',class_id:x?.class_id||'',damage_done:damage,hp_before:hp,expected_hp_after:expected,server_hp_after:Number.isFinite(server)?Math.max(0,server):null,match:!Number.isFinite(server)||Math.max(0,server)===expected};
        hp=expected;
        return row;
      });
      return{max_hp:max,total_damage:parts.reduce((a,x)=>a+(Math.max(0,Number(x?.damage_done)||0)),0),calculated_final_hp:hp,round_status:v255BossRound?.status||null,mismatches:rows.filter(r=>!r.match),rows};
    }catch(e){return{error:String(e?.message||e)}}
  };

  function bindButton(id,fn){
    const old=document.getElementById(id);if(!old)return;
    if(old.dataset.v6307Bound==='1')return;
    const clone=old.cloneNode(true);clone.dataset.v6307Bound='1';old.parentNode.replaceChild(clone,old);clone.addEventListener('click',fn);
  }
  function boot(){
    ensureCombatUi();
    window.v260AnimateDailyBoss=()=>animate();
    bindButton('v260WatchDailyBoss',()=>animate());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  setTimeout(boot,500);setTimeout(boot,1400);setTimeout(boot,2800);
})();

