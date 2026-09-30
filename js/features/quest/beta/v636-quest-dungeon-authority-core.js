
(function(){
 'use strict';
 if(window.__V636_QUEST_DUNGEON_AUTHORITY__)return;
 window.__V636_QUEST_DUNGEON_AUTHORITY__=true;
 const $=q=>document.querySelector(q);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const v7193QuestEnemyKey=name=>String(name||'quest-gegner').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'quest-gegner';
 const wait=ms=>new Promise(resolve=>{const t0=performance.now();function f(t){if(t-t0>=ms)return resolve();requestAnimationFrame(f)}requestAnimationFrame(f)});
 const after=(ms,fn)=>{const t0=performance.now();function f(t){if(t-t0>=ms){try{fn()}catch(_){}return}requestAnimationFrame(f)}requestAnimationFrame(f)};
 let fightToken=0;
 const V637_DUNGEON_BAR='assets/v7198-base64/67a0f48f9ff06acfffd0.webp';

 const EFFECTS=[
  [/ABSOLUTER NULLPUNKT/i,'❄️ ABSOLUTER NULLPUNKT','frost','power'],[/PERFEKTER SCHUSS/i,'🎯 PERFEKTER SCHUSS','scout','power'],[/GRÜNER HAGEL/i,'🌿 GRÜNER HAGEL','scout','power'],[/BRUTALE ERNTE/i,'⚔️ BRUTALE ERNTE','wucht','power'],[/KETTENREAKTION/i,'⚡ KETTENREAKTION','magic','power'],[/SUPERNOVA/i,'✨ SUPERNOVA','magic','power'],[/TODESNEBEL/i,'☁️ TODESNEBEL','magic','power'],[/SEELENERNTE/i,'💀 SEELENERNTE','frost','power'],[/ZWILLINGSSCHNITT/i,'⚔️ ZWILLINGSSCHNITT','frost','power'],[/SEELENSCHNITT/i,'❄️ SEELENSCHNITT','frost','power'],[/FROSTSCHNITT/i,'❄️ FROSTSCHNITT','frost','power'],[/DOPPELREIF/i,'❄️ DOPPELREIF','frost','power'],[/KÄLTEMARKE/i,'❄️ KÄLTEMARKE','frost','power'],[/EISBRUCH/i,'🧊 EISBRUCH','frost','power'],[/NEBENHAND/i,'⚔️ NEBENHAND','frost','power'],[/HINRICHTUNG/i,'🎯 HINRICHTUNG','scout','power'],[/SALVE/i,'🏹 SALVE','scout','power'],[/DETONATION/i,'💣 DETONATION','magic','power'],[/RASEREI/i,'🔥 RASEREI','rage','power'],[/WUCHT/i,'⚔️ WUCHT','wucht','power'],[/\bKRIT\b|KRITISCH/i,'💥 KRITISCHER TREFFER','crit','power'],[/AUSGEWICHEN/i,'💨 AUSGEWICHEN','dodge','dodge'],[/RAUCHBARRIERE/i,'🛡️ RAUCHBARRIERE','guard','guard'],[/REIFBARRIERE/i,'🧊 REIFBARRIERE','guard','guard'],[/EWIGES EIS/i,'🧊 EWIGES EIS','frost','guard'],[/TOTENSTARRE/i,'❄️ TOTENSTARRE','frost','guard'],[/ZWEITE LUFT/i,'❤️ ZWEITE LUFT','heal','heal'],[/UNKRAUT VERGEHT NICHT/i,'🌿 UNKRAUT VERGEHT NICHT','guard','guard'],[/GEBLOCKT|\bBLOCK\b|\bSCHILD\b|REDUZIERT/i,'🛡️ GEBLOCKT','guard','guard'],[/\bDOT\b/i,'☠️ RAUCHSCHADEN','magic','power']
 ];

 function pulse(el,cls,ms=500){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);after(ms,()=>el.classList.remove(cls))}
 function classKind(){return s?.playerClass==='scout'?'arrow':(s?.playerClass==='bruiser'||s?.playerClass==='summoner')?'magic':'melee'}
 function className(){try{return classes?.[s?.playerClass]?.name||'Legende'}catch(_){return 'Legende'}}
 function playerName(){return `${String(s?.characterName||'Du')} · ${className()} · Lv. ${Number(s?.level)||1}`}
 function bossInfo(q){try{const b=v311BossForQuest(q);return q?.v310Elite?`ELITE · ${b?.[1]||'Quest-Gegner'}`:(b?.[1]||'Quest-Gegner')}catch(_){return q?.v310Elite?'ELITE · Quest-Gegner':'Quest-Gegner'}}
 function cleanMonster(svg){return String(svg||'').replace(/class="v253-monster[^\"]*"/,'class="v253-monster v636-monster"')}
 function v6326QuestEnemyArt(q,name){
   const txt=`${q?.name||''} ${q?.text||''} ${name||''}`.toLowerCase();
   let path='';
   if(/fliege|falter|mücke|muecke/.test(txt))path='v474_dungeon_assets/d10_7.png';
   else if(/labor|mutant/.test(txt))path='v474_dungeon_assets/d10_boss.png';
   else if(/ungeziefer|blattlaus|laus|käfer|kaefer/.test(txt))path='v474_dungeon_assets/d12_1.png';
   else if(/zwerg|gartenwächter|gartenwaechter|wächter|waechter/.test(txt))path='v474_dungeon_assets/d17_7.png';
   else if(/nebel|geist|unhold/.test(txt))path='v474_dungeon_assets/d19_3.png';
   else if(/spore|pilz/.test(txt))path='v474_dungeon_assets/d14_9.png';
   else if(/dorn|ranke|wurzel/.test(txt))path='v474_dungeon_assets/d13_7.png';
   else {
     const pool=['v474_dungeon_assets/d2_5.png','v474_dungeon_assets/d3_9.png','v474_dungeon_assets/d4_4.png','v474_dungeon_assets/d12_8.png','v474_dungeon_assets/d18_6.png'];
     path=pool[Math.abs(Math.floor(Number(q?.id)||0))%pool.length];
   }
   try{
     const proto=String(location?.protocol||'');
     if(!/^(file:|capacitor:|ionic:)$/i.test(proto))path+=`${path.includes('?')?'&':'?'}gl=v6326q`;
   }catch(_){ }
   return path;
 }
 function monster(q,name){
   const src=v6326QuestEnemyArt(q,name);
   return `<img class="v645-quest-enemy-art" src="${src}" alt="${esc(name||'Quest Gegner')}" draggable="false">`;
 }
 function copyExactDungeonBackground(){
   const dst=$('#v636QuestDungeonCard .v600-bg');
   if(dst)dst.removeAttribute('style');
 }
 function ensureRoot(q={}){
   let root=$('#v311QuestFight');if(!root){root=document.createElement('div');root.id='v311QuestFight';document.body.appendChild(root)}
   root.className='v636-dungeon-quest';root.classList.toggle('elite',!!q?.v310Elite);
   const boss=bossInfo(q),pName=playerName();let pArt='';try{pArt=s?.playerClass==='grower'?V637_DUNGEON_BAR:v080AvatarFor(s?.playerClass)}catch(_){}
   root.innerHTML=`<div id="v636QuestDungeonCard" class="v575-combat v599-clean v602-template">
    <div class="v575-head"><div class="v575-head-main"><div class="v575-kicker">QUEST-FINALE · DUNGEON-KAMPF</div><b class="v575-title">Der Weg zur Belohnung ist noch nicht frei!</b></div><div class="v575-recommend">${q?.v310Elite?'ELITE QUEST':'QUEST DUELL'}</div></div>
    <div class="battle-stage" id="v636QuestBattleStage"><div class="v600-bg"></div><div class="v575-stage-title">QUEST DUELL</div><div class="v575-round">BEREIT</div><div class="v575-proc-strip"></div><div class="v252-screen-flash"></div><div class="v252-impact"></div><div class="v252-slash"></div><div class="v252-projectile"></div><div class="damage left" id="v636QuestDamagePlayer"></div><div class="damage right" id="v636QuestDamageEnemy"></div>
      <div class="fighter player" id="v636QuestPlayerFighter"><div class="v252-fighter-shell"><div class="v252-aura"></div><div class="v252-shadow"></div><div class="fighter-avatar">${pArt?`<img class="${s?.playerClass==='grower'?'v600-barbar-art':'v253-player-avatar-img'}" src="${pArt}" alt="Spielcharakter">`:'🧙'}</div><div class="fighter-name">${esc(pName)}</div><div class="hpbar"><div class="hpfill" id="v636QuestPlayerHpBar"></div></div><div class="tiny"><span id="v636QuestPlayerHpText">100</span> HP</div></div></div>
      <div class="fighter enemy-side" id="v636QuestEnemyFighter" data-v7193-quest-enemy="${v7193QuestEnemyKey(boss)}"><div class="v252-fighter-shell"><div class="v252-aura"></div><div class="v252-shadow"></div><div class="fighter-avatar" id="v636QuestEnemyIcon">${monster(q,boss)}</div><div class="fighter-name">${esc(boss)}</div><div class="hpbar"><div class="hpfill" id="v636QuestEnemyHpBar"></div></div><div class="tiny"><span id="v636QuestEnemyHpText">100</span> HP</div></div></div>
    </div><div class="v575-log"><div class="v575-log-title"><span>📜 Kampfverlauf</span><small>letzte Runden</small></div><div class="v575-log-lines"></div></div></div>`;
   requestAnimationFrame(copyExactDungeonBackground);return root;
 }
 function round(t){const el=$('#v636QuestDungeonCard .v575-round');if(el)el.textContent=t}
 function setHp(side,cur,max){const bar=$(side==='player'?'#v636QuestPlayerHpBar':'#v636QuestEnemyHpBar'),txt=$(side==='player'?'#v636QuestPlayerHpText':'#v636QuestEnemyHpText');const pct=Math.max(0,Math.min(100,(Number(cur)||0)/Math.max(1,Number(max)||1)*100));if(bar)bar.style.width=pct+'%';if(txt)txt.textContent=String(Math.max(0,Math.round(cur)))}
 function pop(side,text,crit=false){const el=$(side==='player'?'#v636QuestDamagePlayer':'#v636QuestDamageEnemy');if(!el)return;el.textContent=text;el.classList.remove('pop','v252-crit');if(crit)el.classList.add('v252-crit');void el.offsetWidth;el.classList.add('pop');after(780,()=>el.classList.remove('pop','v252-crit'))}
 function fxNode(cls){return $(`#v636QuestBattleStage .${cls}`)}
 function v644DirectMeleeStrike(){
   const stage=$('#v636QuestBattleStage');if(!stage)return;
   const trail=document.createElement('div');trail.className='v644-player-strike';trail.innerHTML='<i></i><b></b>';
   stage.appendChild(trail);
   try{trail.animate([
     {opacity:0,transform:'translate3d(-28px,18px,0) rotate(-16deg) scaleX(.35)',offset:0},
     {opacity:1,transform:'translate3d(0,0,0) rotate(-16deg) scaleX(1.05)',offset:.28},
     {opacity:1,transform:'translate3d(18px,-8px,0) rotate(-12deg) scaleX(1.18)',offset:.58},
     {opacity:0,transform:'translate3d(42px,-20px,0) rotate(-9deg) scaleX(1.34)',offset:1}
   ],{duration:430,easing:'cubic-bezier(.16,.78,.2,1)',fill:'forwards'});}catch(_){}
   after(125,()=>{
     if(!stage.isConnected)return;
     const hit=document.createElement('div');hit.className='v644-player-impact';hit.innerHTML='<i></i>';
     stage.appendChild(hit);
     try{hit.animate([
       {opacity:0,transform:'translate(-50%,-50%) scale(.15) rotate(0deg)',offset:0},
       {opacity:1,transform:'translate(-50%,-50%) scale(1.08) rotate(12deg)',offset:.24},
       {opacity:.95,transform:'translate(-50%,-50%) scale(1.35) rotate(24deg)',offset:.52},
       {opacity:0,transform:'translate(-50%,-50%) scale(1.85) rotate(42deg)',offset:1}
     ],{duration:410,easing:'ease-out',fill:'forwards'});}catch(_){}
     after(450,()=>hit.remove());
   });
   after(500,()=>trail.remove());
 }
 function attackFx(side){const kind=side==='player'?classKind():'enemy';if(side==='player'&&kind==='melee'){v644DirectMeleeStrike()}else{const p=fxNode('v252-projectile');if(p){p.className=`v252-projectile ${side==='player'?(kind+' player-shot'):'enemy-shot'}`;after(430,()=>{if(p)p.className='v252-projectile'})}}}
 function hitFx(side){const impact=fxNode('v252-impact');if(impact){impact.className='v252-impact';if(side==='enemy'){const k=classKind();if(k==='magic')impact.classList.add('magic');if(k==='arrow')impact.classList.add('arrow');impact.style.left='72%'}else impact.style.left='28%';impact.style.top='47%';pulse(impact,'show',470)}pulse(fxNode('v252-screen-flash'),'show',280)}
 function animate(el,cls,ms){
   if(!el)return;
   /* V6.43 smooth mobile motion: animate only the artwork layer. Name/HP stay
      stable, no legacy fighter animation is triggered, and hit recoil finishes
      before the next 430 ms combat beat. Visual only. */
   try{
     const target=el.querySelector('.fighter-avatar')||el;
     if(target.__v643QuestMotion){try{target.__v643QuestMotion.cancel()}catch(_){} }
     let frames=null,easing='cubic-bezier(.2,.75,.25,1)';
     let duration=cls==='hit'?240:Math.max(320,Number(ms)||430);
     if(cls==='attack-right')frames=[
       {transform:'translate3d(0,0,0) scale(1) rotate(0deg)',offset:0},
       {transform:'translate3d(74px,0,0) scale(1.08) rotate(3deg)',offset:.42},
       {transform:'translate3d(54px,0,0) scale(1.05) rotate(0deg)',offset:.68},
       {transform:'translate3d(0,0,0) scale(1) rotate(0deg)',offset:1}
     ];
     else if(cls==='attack-left')frames=[
       {transform:'translate3d(0,0,0) scale(1) rotate(0deg)',offset:0},
       {transform:'translate3d(-74px,0,0) scale(1.08) rotate(-3deg)',offset:.42},
       {transform:'translate3d(-54px,0,0) scale(1.05) rotate(0deg)',offset:.68},
       {transform:'translate3d(0,0,0) scale(1) rotate(0deg)',offset:1}
     ];
     else if(cls==='hit'){
       easing='cubic-bezier(.18,.76,.28,1)';
       const dir=el.classList.contains('enemy-side')?-1:1;
       frames=[
        {transform:'translate3d(0,0,0)',offset:0},
        {transform:`translate3d(${dir*12}px,-1px,0)`,offset:.24},
        {transform:`translate3d(${dir*-7}px,1px,0)`,offset:.52},
        {transform:`translate3d(${dir*3}px,0,0)`,offset:.76},
        {transform:'translate3d(0,0,0)',offset:1}
       ];
     }
     if(frames&&typeof target.animate==='function'){
       const a=target.animate(frames,{duration,easing,iterations:1,fill:'none'});
       target.__v643QuestMotion=a;
       a.onfinish=a.oncancel=()=>{if(target.__v643QuestMotion===a)target.__v643QuestMotion=null};
     }
   }catch(_){}
 }
 function addRow(n,text,cls=''){const host=$('#v636QuestDungeonCard .v575-log-lines');if(!host)return;let row=host.querySelector(`[data-round="${n}"]`);if(!row){row=document.createElement('div');row.dataset.round=String(n);host.prepend(row)}row.className='v575-log-line '+cls;row.innerHTML=`<b>R${n}</b><span>${esc(text)}</span>`;while(host.children.length>4)host.lastElementChild?.remove()}
 function flash(kind){const p=$('#v636QuestPlayerFighter'),e=$('#v636QuestEnemyFighter');const cls=kind==='heal'?'v604-heal-flash':kind==='dodge'?'v604-dodge-flash':kind==='guard'?'v604-guard-flash':kind==='power'?'v604-power-flash':'';pulse(p,cls,680);if(kind==='power')pulse(e,'v604-hit-flash',520)}
 function chip(label,cls='',kind=''){const strip=$('#v636QuestDungeonCard .v575-proc-strip');if(!strip)return;const key=label.toUpperCase();if([...strip.children].some(x=>(x.textContent||'').toUpperCase()===key))return;const el=document.createElement('span');el.className='v575-chip v604-skill-chip '+cls;el.textContent=label;strip.appendChild(el);flash(kind);after(1650,()=>el.remove());while(strip.children.length>3)strip.firstElementChild?.remove()}
 function showEffects(text,heal=0,defensive=false,counter=0){const raw=String(text||'');for(const [re,label,cls,kind] of EFFECTS){if(re.test(raw))chip(label,cls,kind)}if(heal>0)chip(defensive?`💚 HEILUNG +${heal} LP`:`💚 LEBENSRAUB +${heal} LP`,'heal','heal');if(counter>0)chip(`↩️ KONTER ${counter}`,'scout','power')}
 function attr(name){try{return Number(totalAttr(name))||0}catch(_){return 0}}
 function setVal(name){try{return Number(setBonusValue(name))||0}catch(_){return 0}}
 function primary(){
   try{
     const v=typeof v029PrimaryStat==='function'
       ?Number(v029PrimaryStat())
       :attr(s?.playerClass==='scout'?'geschick':(s?.playerClass==='bruiser'||s?.playerClass==='summoner')?'intelligenz':'staerke');
     if(Number.isFinite(v)&&v>0)return v;
   }catch(_){}
   /* Last-resort raw fallback, not the old hardcoded 1. */
   const key=s?.playerClass==='scout'?'geschick':(s?.playerClass==='bruiser'||s?.playerClass==='summoner')?'intelligenz':'staerke';
   let v=Number(s?.attrs?.[key])||5;
   try{v+=Number(classes?.[s?.playerClass]?.bonus?.[key])||0}catch(_){}
   try{Object.values(s?.equipment||{}).forEach(it=>{v+=Number(it?.bonus?.[key])||0})}catch(_){}
   return Math.max(1,v);
 }

 async function play(q={}){
   if(typeof v141Settings==='object'&&v141Settings.questBattleAnimation===false)return;
   const mine=++fightToken,root=ensureRoot(q),card=$('#v636QuestDungeonCard'),pf=$('#v636QuestPlayerFighter'),ef=$('#v636QuestEnemyFighter');
   const boss=bossInfo(q),pName=String(s?.characterName||className());
   let maxPlayer=120;
   try{
     const live=Math.round(Number(maxHp())||0);
     if(live>0)maxPlayer=Math.max(120,live);
   }catch(_){
     let sta=Number(s?.attrs?.ausdauer)||5;
     try{sta+=Number(classes?.[s?.playerClass]?.bonus?.ausdauer)||0}catch(_){}
     try{Object.values(s?.equipment||{}).forEach(it=>{sta+=Number(it?.bonus?.ausdauer)||0})}catch(_){}
     maxPlayer=Math.max(120,Math.round(80+sta*8+(Number(s?.level)||1)*5));
   }
   const lvl=Math.max(1,Number(s?.level)||1),sampleBase=Math.max(4,Math.floor(primary()*1.9+lvl*1.55+4));
   /* V6.322 Elite-Quest class fairness: Harzruferin damage is deliberately
      delayed through Ruf-aus-dem-Dunst/pity summons. With the generic Elite
      values (13 base hits + 11.5% max-HP enemy hits) she could die before her
      class engine had enough turns to pay off. Keep Elite hard, but give the
      summoner enough combat length for companions/lifesteal to matter. */
   const summonerElite=!!q?.v310Elite&&String(s?.playerClass||'')==='summoner';
   const eliteHpFactor=summonerElite?11.5:13;
   const eliteAtkPct=summonerElite?.098:.115;
   const maxEnemy=Math.max(180,Math.round(sampleBase*(q?.v310Elite?eliteHpFactor:10)));
   const enemyBaseAtk=Math.max(4,Math.round(maxPlayer*(q?.v310Elite?eliteAtkPct:.085)));
   let playerHp=maxPlayer,enemyHp=maxEnemy,roundNo=0,finished=false;
   let combatState=null;try{combatState=typeof v318NewCombatState==='function'?v318NewCombatState('dungeon',maxPlayer):null}catch(_){}
   card?.classList.remove('v577-victory','v577-defeat','v252-victory','v252-defeat');
   setHp('player',playerHp,maxPlayer);setHp('enemy',enemyHp,maxEnemy);round('BEREIT');
   const log=$('#v636QuestDungeonCard .v575-log-lines');if(log)log.innerHTML='';const procs=$('#v636QuestDungeonCard .v575-proc-strip');if(procs)procs.innerHTML='';root.classList.add('show');copyExactDungeonBackground();
   await wait(420);if(mine!==fightToken)return;
   let playerTurn=true,nextTurnAt=performance.now();
   return await new Promise(resolve=>{
    function finish(){if(finished)return;finished=true;setHp('enemy',0,maxEnemy);round('SIEG');card?.classList.add('v577-victory','v252-victory');chip(q?.v310Elite?'🏆 ELITE BESIEGT':'🏆 SIEG','heal','heal');const row=$(`#v636QuestDungeonCard .v575-log-lines [data-round="${roundNo}"] span`);if(row)row.textContent+=` ${boss} wurde besiegt. Belohnung wird geöffnet …`;after(780,()=>{if(mine===fightToken)root.classList.remove('show');resolve(true)})}
    function playerAttack(){
      roundNo++;round('RUNDE '+roundNo);const base=Math.max(4,Math.floor(primary()*1.9+lvl*1.55+Math.random()*7));let dmg=base,heal=0,crit=false,label='TREFFER';
      try{if(combatState&&typeof v318ResolvePlayerAttack==='function'){const a=v318ResolvePlayerAttack(combatState,{baseDamage:base,enemyHp,enemyMax:maxEnemy,playerHp,playerMax:maxPlayer,baseCrit:Math.min(.30,.04+attr('glueck')*.012),setCrit:s.playerClass==='bruiser'?(.07+setVal('critChance')):0,baseWucht:(s.playerClass==='grower'||s.playerClass==='frost')?(.13+setVal('wuchtChance')):0,baseDouble:s.playerClass==='scout'?(.15+setVal('doubleChance')):0,setDoubleDamage:setVal('doubleDamage')})||{};dmg=Math.max(1,Math.round(Number(a.damage)||base));heal=Math.max(0,Math.round(Number(a.heal)||0));crit=!!a.crit;label=a.text||label}}catch(_){}
      playerHp=Math.min(maxPlayer,playerHp+heal);enemyHp=Math.max(0,enemyHp-dmg);try{window.v7175CombatReplayStep?.('quest',{side:'player',label,round:roundNo,damage:dmg,heal,crit,player_hp:playerHp,enemy_hp:enemyHp})}catch(_){}animate(pf,'attack-right',430);attackFx('player');after(145,()=>{if(mine!==fightToken)return;animate(ef,'hit',240);hitFx('enemy');pop('enemy',String(dmg),crit)});setHp('player',playerHp,maxPlayer);setHp('enemy',enemyHp,maxEnemy);showEffects(label,heal,false,0);try{window.v6225ExtraHitVisual?.('quest',label,{round:roundNo})}catch(_){}addRow(roundNo,`${pName}: ${label} · ${dmg} Schaden${heal?` · +${heal} LP`:''}`,crit?'crit':'');if(enemyHp<=0){finish();return false}return true
    }
    function enemyAttack(){
      const raw=Math.max(3,Math.round(enemyBaseAtk*(.88+Math.random()*.24)));let dmg=raw,heal=0,counter=0,prevent=false,label='Gegner trifft';
      try{if(combatState&&typeof v318ResolveEnemyAttack==='function'){const d=v318ResolveEnemyAttack(combatState,{damage:raw,playerHp,playerMax:maxPlayer})||{};dmg=Math.max(0,Math.round(Number(d.damage)||0));heal=Math.max(0,Math.round(Number(d.heal)||0));counter=Math.max(0,Math.round(Number(d.counterDamage)||0));prevent=!!d.preventLethal;label=d.text||label}}catch(_){}
      playerHp=Math.min(maxPlayer,playerHp+heal);playerHp=Math.max(0,playerHp-dmg);if(prevent&&playerHp<=0)playerHp=1;if(counter)enemyHp=Math.max(0,enemyHp-counter);try{window.v7175CombatReplayStep?.('quest',{side:'enemy',label,round:roundNo,damage:dmg,heal,counter,prevent,dodge:/AUSGEWICHEN/i.test(label),player_hp:playerHp,enemy_hp:enemyHp})}catch(_){}animate(ef,'attack-left',430);attackFx('enemy');after(145,()=>{if(mine!==fightToken)return;if(!/AUSGEWICHEN/i.test(label)){animate(pf,'hit',240);hitFx('player');if(dmg)pop('player','-'+dmg,false)}});setHp('player',playerHp,maxPlayer);setHp('enemy',enemyHp,maxEnemy);showEffects(label,heal,true,counter);try{window.v6225ExtraHitVisual?.('quest',label,{round:roundNo,actor:'defender'})}catch(_){}const row=$(`#v636QuestDungeonCard .v575-log-lines [data-round="${roundNo}"] span`);if(row){const special=String(label).replace(/^Gegner trifft\s*·?\s*/i,'').trim();row.textContent+=/AUSGEWICHEN/i.test(label)?' · Gegner: AUSGEWICHEN':` · Gegner: ${dmg} Schaden${special&&special!=='Gegner trifft'?` · ${special}`:''}${counter?` · Konter ${counter}`:''}${heal?` · +${heal} LP`:''}`}
      if(enemyHp<=0){finish();return false}if(playerHp<=0){
        finished=true;
        playerHp=0;
        setHp('player',0,maxPlayer);
        round('NIEDERLAGE');
        card?.classList.add('v577-defeat','v252-defeat');
        chip('💀 NIEDERLAGE','guard','guard');
        const lossRow=$(`#v636QuestDungeonCard .v575-log-lines [data-round="${roundNo}"] span`);
        if(lossRow)lossRow.textContent+=' · Du wurdest besiegt.';
        after(780,()=>{if(mine===fightToken){root.classList.remove('show');resolve(false)}});
        return false;
      }return true
    }
    function frame(now){if(finished||mine!==fightToken)return;if(now>=nextTurnAt){if(playerTurn){if(!playerAttack())return}else{if(!enemyAttack())return}playerTurn=!playerTurn;nextTurnAt=now+430}requestAnimationFrame(frame)}
    requestAnimationFrame(frame);
   });
 }

 window.v311PlayFight=play;try{v311PlayFight=play}catch(_){}
 window.v636QuestDungeonPreview=()=>play({id:636,name:'Nebel über dem Gewächshaus',text:'Ein Quest-Gegner versperrt den Weg.',v310Elite:false});
 window.v634QuestDungeonPreview=window.v636QuestDungeonPreview;window.v625QuestVisualPreview=window.v636QuestDungeonPreview;window.v615QuestVisualPreview=window.v636QuestDungeonPreview;
 function ownPreviewButtons(){document.querySelectorAll('[data-v615-quest-preview]').forEach(b=>{b.removeAttribute('data-v615-quest-preview');b.setAttribute('data-v636-quest-preview','1')})}
 ownPreviewButtons();/* V6.97: global preview-button observer retired. */
 window.addEventListener('click',e=>{const b=e.target?.closest?.('[data-v636-quest-preview]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();window.v636QuestDungeonPreview()},true);
})();
