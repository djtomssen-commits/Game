(()=>{
'use strict';
if(window.__V6287_HARZRUFERIN__)return;window.__V6287_HARZRUFERIN__=true;
const A={"avatar":"assets/v7198-base64/f6cfb669e5225b6e0a9c.webp","weapon_harz":"assets/v7198-base64/664373607a1fa16e4369.webp","weapon_skull":"assets/v7198-base64/949693988eaf05b071e9.webp","head":"assets/v7198-base64/be6d922f7ba996ae93a7.webp","body":"assets/v7198-base64/2c2127fe91cafb51010f.webp","boots":"assets/v7198-base64/2c5ca7005debcd1ac2af.webp","ring":"assets/v7198-base64/44fab6c712a9120efe6c.webp","amulet":"assets/v7198-base64/ce9c4976dff2d0e6fc81.webp","bud":"assets/v7198-base64/646d6b18ed4da5a10d9f.webp","bone":"assets/v7198-base64/61d424942960882270ae.webp","spore":"assets/v7198-base64/a6daa97cef0eba64add2.webp","crow":"assets/v7198-base64/479d2138c99640576f9e.webp"};
const getState=()=>{try{return typeof s!=='undefined'?s:null}catch(_){return null}};
const isHR=()=>String(getState()?.playerClass||'')==='summoner';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const sb=k=>{try{return typeof setBonusValue==='function'?Number(setBonusValue(k))||0:0}catch(_){return 0}};

/* Approved existing artwork only. */
try{if(typeof V080_AVATARS==='object')V080_AVATARS.summoner=A.avatar}catch(_){}
const oldAvatar=(typeof v080AvatarFor==='function'?v080AvatarFor:null);
const hrAvatar=id=>String(id||'')==='summoner'?A.avatar:(oldAvatar?oldAvatar(id):(typeof V080_AVATARS==='object'?(V080_AVATARS[id]||V080_AVATARS.grower):''));
try{v080AvatarFor=hrAvatar}catch(_){}
window.v080AvatarFor=hrAvatar;

/* Item art from the already approved Harzruferin concept board. */
const oldArt=typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri:null;
function hrItemArt(it){
 if(it&&String(it.classId||it.class||it.setFamily||'')==='summoner'&&it.type!=='gem'&&it.type!=='scroll'&&it.type!=='material'){
   const slot=String(it.slot||''),n=(String(it.name||'')+' '+String(it.setName||'')).toLowerCase();
   /* The explicitly approved starter / signature pieces use the exact artwork
      from the approved class board. The many additional class items keep the
      game's comic-art variation pipeline so different names do not all look identical. */
   if(slot==='weapon'&&/harzstab/.test(n))return A.weapon_harz;
   if(slot==='weapon'&&/(knochen.*(schädel|zepter)|schädel.*zepter)/.test(n))return A.weapon_skull;
   if(slot==='head'&&/(nebelkapuze|sarggärtnerin)/.test(n))return A.head;
   if(slot==='body'&&/(sarggärtner|sargrobe)/.test(n))return A.body;
   if(slot==='boots'&&/wurzelstiefel/.test(n))return A.boots;
   if(slot==='ring'&&/bud-geister-ring/.test(n))return A.ring;
   if(slot==='amulet'&&/seelen-amulett/.test(n))return A.amulet;
 }
 return oldArt?oldArt(it):'';
}
['v466ItemArtUri','v4106ComicItemArtUri','v4111ComicItemArtUri','v4115ComicItemArtUri','v6105ItemArtUri'].forEach(k=>{try{window[k]=hrItemArt}catch(_){}});
try{v466ItemArtUri=hrItemArt}catch(_){}

try{if(typeof V110_MYSTIC_NAMES==='object')V110_MYSTIC_NAMES.summoner=['Harzruferin der letzten Ernte','🕯️']}catch(_){}
try{if(typeof SET_PATTERN==='object'&&!SET_PATTERN.summoner&&SET_PATTERN.bruiser)SET_PATTERN.summoner=JSON.parse(JSON.stringify(SET_PATTERN.bruiser))}catch(_){}
try{if(typeof MYSTIC_SET_PATTERN==='object'&&!MYSTIC_SET_PATTERN.summoner&&MYSTIC_SET_PATTERN.bruiser)MYSTIC_SET_PATTERN.summoner=JSON.parse(JSON.stringify(MYSTIC_SET_PATTERN.bruiser))}catch(_){}

/* Final primary stat helpers. */
try{
 const base=v267PrimaryKey;
 v267PrimaryKey=function(cls=getState()?.playerClass){return cls==='scout'?'geschick':(cls==='bruiser'||cls==='summoner')?'intelligenz':'staerke'};
 window.v267PrimaryKey=v267PrimaryKey;
}catch(_){}
try{
 const base=v070PrimaryStatKey;
 v070PrimaryStatKey=function(){const c=getState()?.playerClass;if(c==='summoner')return'intelligenz';return base()};
 window.v070PrimaryStatKey=v070PrimaryStatKey;
}catch(_){}

/* Dedicated Harzruferin talent summary layered over the existing V314 system. */
const oldSummary=typeof v314Summary==='function'?v314Summary:null;
function hrSummary(){
 if(!isHR())return oldSummary?oldSummary():{};
 /* V6.295 ROOT FIX:
    NEVER call oldSummary for Summoner here.
    oldSummary internally resolves the current v319ExactTalentStats, while the
    Summoner v319 wrapper calls hrSummary again. That was the recursion which
    broke totalAttr(), maxHp(), combat power and combat. */
 const o={
  primaryPct:0,hpPct:0,damagePct:0,critChance:0,critDamage:0,damageReduce:0,
  wuchtChance:0,doubleChance:0,dodgeChance:0,lifeSteal:0,armorPen:0,
  dotChance:0,dotDamagePct:0,
  summonChance:0,summonDamage:0,companionCrit:0,secondSummonChance:0,
  curseAmp:0,preventLethal:0
 };
 const R=(b,i)=>{try{return Math.max(0,Number(v314Rank(b,'s',i))||0)}catch(_){return 0}};
 const M=(b,i)=>{try{return Math.max(0,Number(v314Rank(b,'m',i))||0)}catch(_){return 0}};
 o.summonChance+=R('summon',0)*.003+R('summon',5)*.0025;
 o.summonDamage+=R('summon',1)*.008+R('summon',3)*.005+R('summon',6)*.005;
 o.companionCrit+=R('summon',2)*.004;
 o.secondSummonChance+=R('summon',4)*.0025;
 o.primaryPct+=R('summon',5)*.002;
 for(let i=0;i<7;i++)if(M('summon',i)){o.summonChance+=i===6?.025:.004;o.summonDamage+=i===6?.10:.015;if(i===2)o.secondSummonChance+=.04;if(i===6)o.secondSummonChance+=.12}
 o.lifeSteal+=R('soul',0)*.002+R('soul',3)*.0015;
 o.hpPct+=R('soul',1)*.006+R('soul',6)*.005;
 o.damageReduce+=R('soul',2)*.003+R('soul',5)*.0025;
 o.summonDamage+=R('soul',4)*.0025;
 for(let i=0;i<7;i++)if(M('soul',i)){o.lifeSteal+=i===6?.015:.002;o.hpPct+=i===6?.06:.008;o.damageReduce+=i===6?.025:.004;if(i===6)o.preventLethal=1}
 o.dotChance+=R('curse',0)*.003+R('curse',4)*.002;
 o.dotDamagePct+=R('curse',1)*.004+R('curse',5)*.003;
 o.armorPen+=R('curse',2)*.0025;
 o.damagePct+=R('curse',3)*.0025+R('curse',6)*.0025;
 o.curseAmp+=R('curse',4)*.002;
 for(let i=0;i<7;i++)if(M('curse',i)){o.dotChance+=i===6?.04:.006;o.dotDamagePct+=i===6?.08:.012;o.armorPen+=i===6?.04:.006;if(i===6)o.curseAmp+=.08}
 o.summonChance=clamp(o.summonChance,0,.18);o.summonDamage=clamp(o.summonDamage,0,.42);o.secondSummonChance=clamp(o.secondSummonChance,0,.22);
 o.lifeSteal=clamp(o.lifeSteal,0,.09);o.hpPct=clamp(o.hpPct,0,.40);o.damageReduce=clamp(o.damageReduce,0,.25);
 o.dotChance=clamp(o.dotChance,0,.28);o.dotDamagePct=clamp(o.dotDamagePct,0,.32);o.armorPen=clamp(o.armorPen,0,.20);o.damagePct=clamp(o.damagePct,0,.30);o.curseAmp=clamp(o.curseAmp,0,.12);
 return o;
}
if(oldSummary){try{v314Summary=hrSummary}catch(_){}window.v314TalentSummary=hrSummary}

const oldExact=typeof v319ExactTalentStats==='function'?v319ExactTalentStats:null;
if(oldExact){
 const wrapped=function(){
  const o=oldExact.apply(this,arguments)||{};if(!isHR())return o;
  const t=hrSummary();
  ['damagePct','critChance','critDamage','damageReduce','lifeSteal','armorPen','dotChance','dotDamagePct'].forEach(k=>o[k]=(Number(o[k])||0)+(Number(t[k])||0));
  o.primaryPct=(Number(o.primaryPct)||0)+(Number(t.primaryPct)||0);o.hpPct=(Number(o.hpPct)||0)+(Number(t.hpPct)||0);
  o.v6287SummonChance=t.summonChance;o.v6287SummonDamage=t.summonDamage;o.v6287SecondSummon=t.secondSummonChance;o.v6287PreventLethal=t.preventLethal;
  return o;
 };
 try{v319ExactTalentStats=wrapped}catch(_){}window.v319ExactTalentStats=wrapped;
}

/* Visible companions. */
const COMP={
 bud:{name:'Bud-Geist',img:A.bud,mult:.30},
 bone:{name:'Knochenknecht',img:A.bone,mult:.48},
 spore:{name:'Pilzspore',img:A.spore,mult:.24},
 crow:{name:'Nebelkrähe',img:A.crow,mult:.30}
};
const compKeys=Object.keys(COMP);
function battleStage(){
 const qs=['#tower .vT-battle-stage','#tower .v6259-battle','#battleStage','#v311QuestFight .v311-arena','#v636QuestDungeonCard .battle-stage','#v636QuestDungeonCard','#v111BossScene','#v209PvpBattleOverlay .v209-stage','#pvp .v209-battle-stage','#pvp .battle-stage','.v209-battle-stage','.battle-stage'];
 for(const q of qs){const el=document.querySelector(q);if(el&&el.getClientRects().length)return el}
 const f=document.querySelector('#vTPlayerFighter,#v636QuestPlayerFighter,#v209PlayerFighter,#playerFighter');return f?.parentElement||null;
}
function clearSummonerVisuals(){
 document.querySelectorAll('.v6287-summon-roster,.v6287-summon-fx,.v6303-companion-impact,.v6303-companion-float,.v6329-companion-status-lane,.v6335-enemy-dot,.v6335-dot-pop').forEach(n=>n.remove());
}
function rosterForStage(st){
 if(!st)return null;
 const parent=st.parentElement;
 return parent?.querySelector(':scope > .v6287-summon-roster')||
        st.querySelector('.v6287-summon-roster')||
        document.querySelector('.v6287-summon-roster');
}
function dockRoster(st,r){
 if(!st||!r)return;
 /* The bar is HUD information, not a fighter. It must never sit over HP bars. */
 if(st.nextElementSibling!==r)st.insertAdjacentElement('afterend',r);
 r.classList.add('v6304-roster-docked');
}
function ensureRoster(){
 if(!isHR()){clearSummonerVisuals();return}
 const st=battleStage();if(!st)return;
 if(getComputedStyle(st).position==='static')st.style.position='relative';
 let r=rosterForStage(st);
 if(!r){
   r=document.createElement('div');
   r.className='v6287-summon-roster v6304-roster-docked';
   r.innerHTML=`
     <div class="v6303-roster-head">
       <b>👻 BEGLEITER</b>
       <span data-v6303-ruf>Ruf 12 % · Garantie in 5</span>
     </div>
     <div class="v6303-roster-grid">
       ${compKeys.map(k=>`<span class="v6303-comp-card v6303-${k}" data-v6287-comp="${k}">
         <i class="v6303-portrait"><img src="${COMP[k].img}" alt="${COMP[k].name}"></i>
         <em>${k==='bud'?'Bud-Geist':k==='bone'?'Knochen':k==='spore'?'Spore':'Krähe'}</em>
         <small></small>
       </span>`).join('')}
     </div>
     <div class="v6303-roster-foot">
       <div class="v6303-pity" aria-label="Garantie-Zähler">
         <i></i><i></i><i></i><i></i><i class="guarantee">★</i>
       </div>
       <span data-v6303-last>Ruf aus dem Dunst bereit</span>
     </div>`;
 }
 dockRoster(st,r);
 return r;
}
function updateRosterState(st,chance,key=null,action=''){
 const root=battleStage(),r=rosterForStage(root);if(!r)return;
 const pity=Math.max(0,Math.min(4,Number(st?.v6287NoSummon)||0));
 const next=Math.max(1,5-pity);
 const pct=Math.max(0,Math.round((Number(chance)||.10)*100));
 const info=r.querySelector('[data-v6303-ruf]');
 if(info)info.textContent=`Ruf ${pct} % · Garantie in ${next}`;
 [...r.querySelectorAll('.v6303-pity i')].forEach((dot,i)=>{
   dot.classList.toggle('filled',i<pity);
   dot.classList.toggle('next',i===pity);
 });
 if(key){
   r.querySelectorAll('[data-v6287-comp]').forEach(x=>x.classList.toggle('last',x.dataset.v6287Comp===key));
 }
 if(action){
   const last=r.querySelector('[data-v6303-last]');
   if(last)last.textContent=action;
 }
}
function combatTarget(stage,side){
 /* Prefer the actual portrait/monster artwork. Fighter containers also include
    name + HP and therefore put the old companion path far too low. */
 const selectors=side==='enemy'
  ?[
    '#vTEnemyFighter .fighter-avatar','#v636QuestEnemyFighter .fighter-avatar','#enemyFighter .fighter-avatar',
    '#v209EnemyFighter .fighter-avatar','.v209-fighter.enemy .fighter-avatar','.fighter.enemy-side .fighter-avatar',
    '#vTEnemyFighter','#v636QuestEnemyFighter','#enemyFighter','#v209EnemyFighter',
    '.v209-fighter.enemy','.fighter.enemy-side','.v6201-boss-art','.v111-colossus'
   ]
  :[
    '#vTPlayerFighter .fighter-avatar','#v636QuestPlayerFighter .fighter-avatar','#playerFighter .fighter-avatar',
    '#v209PlayerFighter .fighter-avatar','.v209-fighter.player .fighter-avatar','.fighter.player .fighter-avatar',
    '#vTPlayerFighter','#v636QuestPlayerFighter','#playerFighter','#v209PlayerFighter',
    '.v209-fighter.player','.fighter.player'
   ];
 for(const q of selectors){
   const el=stage.querySelector(q)||document.querySelector(q);
   if(el&&el.getClientRects().length)return el;
 }
 return null;
}
function centerIn(stage,el,fallbackX,fallbackY,side=''){
 const sr=stage.getBoundingClientRect();
 if(el){
   const r=el.getBoundingClientRect();
   const xPart=side==='player'?.62:side==='enemy'?.42:.5;
   /* Attack through chest/head area — never through the HP/name area. */
   return {
     x:r.left-sr.left+r.width*xPart,
     y:r.top-sr.top+r.height*.39
   };
 }
 return {x:sr.width*fallbackX,y:sr.height*fallbackY};
}
function companionStatus(stage,key,meta={}){
 if(!stage)return;
 let lane=stage.querySelector(':scope > .v6329-companion-status-lane');
 if(!lane){
   lane=document.createElement('div');
   lane.className='v6329-companion-status-lane';
   stage.appendChild(lane);
 }
 const name=key==='bud'?'BUD-GEIST':key==='bone'?'KNOCHEN':key==='spore'?'PILZSPORE':key==='crow'?'KRÄHE':'BEGLEITER';
 const parts=[name];
 if(meta.crit)parts.push('KRIT');
 if(meta.revive){parts.push('NICHT GANZ TOT','1 LP');}
 else{
   if(key==='bud'&&meta.heal)parts.push(`+${Math.max(1,Math.round(meta.heal))} LP`);
   /* The spore curse buffs the next two OWN attacks; it is not -2 enemy attack. */
   if(key==='spore')parts.push('FLUCH','DOT 3R');
   if(key==='crow')parts.push(meta.critBuff?`+${Math.round(meta.critBuff*1000)/10}% KRIT`:'+KRIT');
   if(meta.secondary)parts.push(meta.note||'2. RUF');
 }
 const chip=document.createElement('span');
 chip.className=`v6329-companion-status v6329-status-${key}${meta.crit?' crit':''}`;
 chip.textContent=parts.join(' · ');
 lane.appendChild(chip);
 while(lane.children.length>2)lane.firstElementChild?.remove();
 setTimeout(()=>chip.remove(),1450);
 setTimeout(()=>{if(lane&&!lane.children.length)lane.remove()},1500);
}
function v6335EnemyHost(stage){
 const qs=['#vTEnemyFighter','#v636QuestEnemyFighter','#enemyFighter','#v209EnemyFighter','.v209-fighter.enemy','.fighter.enemy-side'];
 for(const q of qs){
   const el=stage?.querySelector?.(q)||document.querySelector(q);
   if(el&&el.getClientRects().length)return el;
 }
 return combatTarget(stage,'enemy');
}
function v6335SyncSporeDot(stage,st,tick=0){
 stage=stage||battleStage();if(!stage)return;
 const host=v6335EnemyHost(stage);if(!host)return;
 const dot=st?.v6335SporeDot;
 let badge=host.querySelector(':scope > .v6335-enemy-dot');
 if(!dot||Number(dot.rounds)<=0){badge?.remove();return}
 if(getComputedStyle(host).position==='static')host.style.position='relative';
 if(!badge){
   badge=document.createElement('div');
   badge.className='v6335-enemy-dot';
   host.appendChild(badge);
 }
 badge.innerHTML=`<b>🍄 SPORENFÄULE</b><small>${Math.max(0,Number(dot.rounds)||0)} R. · ${Math.max(1,Math.round(Number(dot.damage)||1))} DOT</small>`;
 if(tick>0){
   const pop=document.createElement('span');
   pop.className='v6335-dot-pop';
   pop.textContent=`🍄 -${Math.max(1,Math.round(tick))}`;
   host.appendChild(pop);
   setTimeout(()=>pop.remove(),900);
 }
}
function v6335ApplySporeDot(st,base,t,wb){
 const pct=clamp(.04+(Number(t?.dotDamagePct)||0)*.12,.04,.08);
 const tick=Math.max(1,Math.round(Math.max(1,Number(base)||1)*pct*(wb?.55:1)));
 const prev=st?.v6335SporeDot;
 st.v6335SporeDot={rounds:3,damage:Math.max(tick,Math.round(Number(prev?.damage)||0))};
 return {...st.v6335SporeDot};
}
function impactFx(stage,key,x,y,damage,meta={}){
 const fx=document.createElement('div');
 fx.className=`v6303-companion-impact v6303-impact-${key}${meta.secondary?' secondary':''}${meta.crit?' crit':''}`;
 fx.style.left=x+'px';fx.style.top=y+'px';
 /* Damage remains at the enemy. Companion status text is moved to the dedicated
    combat-effect lane so it never covers the opponent artwork. */
 fx.innerHTML=`<i></i><b>${damage?`-${Math.max(1,Math.round(damage))}`:meta.revive?'1 LP':''}</b>`;
 stage.appendChild(fx);
 companionStatus(stage,key,meta);
 setTimeout(()=>fx.remove(),1050);
}
function showSummon(key,damage=0,secondary=false,meta={}){
 if(!isHR())return;
 const st=battleStage();if(!st)return;
 const r=ensureRoster(),c=COMP[key]||COMP.bud;
 try{window.dispatchEvent(new CustomEvent('growlegends:companion-attack',{detail:{key,damage,secondary,name:c.name,meta:{...meta}}}))}catch(_){}
 if(!r)return;
 if(getComputedStyle(st).position==='static')st.style.position='relative';

 const player=combatTarget(st,'player'),enemy=combatTarget(st,'enemy');
 const from=centerIn(st,player,.22,.40,'player'),to=centerIn(st,enemy,.76,.40,'enemy');
 if(secondary){from.y+=24;to.y+=18}

 const el=document.createElement('div');
 el.className=`v6287-summon-fx v6303-strike-${key}${secondary?' secondary':''}`;
 el.innerHTML=`
   <span class="v6303-spirit"><img src="${c.img}" alt="${c.name}"></span>
   <i class="v6303-trail"></i>
   <b>${c.name}</b>`;
 st.appendChild(el);

 const size=secondary?66:82;
 /* V6.287 used !important on left/top/size. Override it explicitly here,
    otherwise the calculated path is offset down toward the HP bars. */
 el.style.setProperty('width',size+'px','important');
 el.style.setProperty('height',size+'px','important');
 el.style.setProperty('left','0px','important');
 el.style.setProperty('top','0px','important');

 const sx=from.x-size/2,sy=from.y-size/2,tx=to.x-size/2,ty=to.y-size/2;
 const midX=sx+(tx-sx)*.54,midY=Math.min(sy,ty)-(key==='spore'?58:key==='crow'?42:18);
 const dur=key==='bone'?650:key==='crow'?760:key==='spore'?900:820;
 const frames=
   key==='spore'
    ?[
      {transform:`translate(${sx}px,${sy}px) scale(.55) rotate(-8deg)`,opacity:0},
      {transform:`translate(${midX}px,${midY}px) scale(1.02) rotate(12deg)`,opacity:1,offset:.52},
      {transform:`translate(${tx}px,${ty}px) scale(.82) rotate(22deg)`,opacity:1}
     ]
   :key==='crow'
    ?[
      {transform:`translate(${sx}px,${sy}px) scale(.58) rotate(-15deg)`,opacity:0},
      {transform:`translate(${midX}px,${midY}px) scale(1.08) rotate(10deg)`,opacity:1,offset:.42},
      {transform:`translate(${tx+10}px,${ty-8}px) scale(.88) rotate(-12deg)`,opacity:1}
     ]
   :key==='bone'
    ?[
      {transform:`translate(${sx}px,${sy}px) scale(.62) rotate(-5deg)`,opacity:0},
      {transform:`translate(${sx+(tx-sx)*.30}px,${sy-7}px) scale(1.03)`,opacity:1,offset:.28},
      {transform:`translate(${tx}px,${ty}px) scale(1.13) rotate(4deg)`,opacity:1}
     ]
   :[
      {transform:`translate(${sx}px,${sy}px) scale(.50)`,opacity:0},
      {transform:`translate(${midX}px,${midY}px) scale(1.08)`,opacity:1,offset:.48},
      {transform:`translate(${tx}px,${ty}px) scale(.90)`,opacity:1}
     ];

 el.animate(frames,{duration:dur,easing:key==='bone'?'cubic-bezier(.12,.78,.18,1)':'cubic-bezier(.18,.72,.20,1)',fill:'forwards'});
 setTimeout(()=>{
   impactFx(st,key,to.x,to.y,damage,{...meta,secondary});
   const target=enemy;
   if(target){
     target.classList.remove('v6303-companion-hit');void target.offsetWidth;target.classList.add('v6303-companion-hit');
     setTimeout(()=>target.classList.remove('v6303-companion-hit'),360);
   }
 },Math.max(280,dur-190));

 const chip=r?.querySelector(`[data-v6287-comp="${key}"]`);
 chip?.classList.add('active');
 const status=chip?.querySelector('small');
 if(status)status.textContent=meta.revive?'RETTUNG':secondary?'2. RUF':meta.crit?'KRIT':'ANGRIFF';
 const action=`${c.name}${damage?` · +${Math.max(1,Math.round(damage))}`:''}${meta.heal?` · +${meta.heal} LP`:''}`;
 const last=r.querySelector('[data-v6303-last]');if(last)last.textContent=action;

 setTimeout(()=>{chip?.classList.remove('active');if(status)status.textContent=''},1050);
 setTimeout(()=>el.remove(),dur+180);
}
window.v6287ShowSummon=showSummon;
window.v6287EnsureRoster=ensureRoster;
window.v6287UpdateRosterState=updateRosterState;
window.v6287ClearSummonerVisuals=clearSummonerVisuals;

/* Central attack resolver: all modern combat modes using V318 get the class. */
const oldAttack=typeof v318ResolvePlayerAttack==='function'?v318ResolvePlayerAttack:null;
if(oldAttack){
 const wrapped=function(st,ctx){
  if(!isHR())return oldAttack.apply(this,arguments);
  st=st||{};
  const wb=String(st.mode||'')==='worldboss';
  let t={
    summonChance:0,summonDamage:0,companionCrit:0,secondSummonChance:0,
    curseAmp:0,dotChance:0,dotDamagePct:0,lifeSteal:0
  };
  try{t=hrSummary()||t}catch(e){console.warn('V6.302 Harzruferin talent summary fallback',e)}
  const c={...(ctx||{})};
  const base=Math.max(1,Number(c.baseDamage)||1);
  const rank=(branch,kind,i)=>{try{return Math.max(0,Number(v314Rank(branch,kind,i))||0)}catch(_){return 0}};
  const addTag=(r,label)=>{
    if(!r||!label)return;
    const raw=String(r.text||'TREFFER');
    if(raw.toUpperCase().includes(String(label).toUpperCase()))return;
    r.text=(raw&&raw!=='TREFFER')?`${raw} + ${label}`:label;
  };

  if(Number(st.v6287CritBuff)>0){
    c.baseCrit=(Number(c.baseCrit)||0)+Number(st.v6287CritBuff);
    st.v6287CritBuff=0;
  }

  /* A running curse amplifies the next two own attacks. */
  const curseBoosted=Number(st.v6287CurseHits)>0;
  if(curseBoosted){
    c.baseDamage=Math.max(1,base*(1+.05+(Number(t.curseAmp)||0)*(wb?.55:1)));
    st.v6287CurseHits=Math.max(0,Number(st.v6287CurseHits)-1);
  }

  let r=null;
  try{r=oldAttack.call(this,st,c)||null}
  catch(e){
    console.warn('V6.296 base resolver fallback',e);
    r=null;
  }
  if(!r||typeof r!=='object'){
    r={damage:Math.max(1,Math.round(Number(c.baseDamage)||base)),heal:0,text:'TREFFER',crit:false};
  }
  r.damage=Math.max(1,Math.round(Number(r.damage)||Number(c.baseDamage)||base));
  r.heal=Math.max(0,Math.round(Number(r.heal)||0));
  r.text=String(r.text||'TREFFER');

  /* SEELENRAUB
     lifeSteal itself is calculated by the exact V319 resolver. Here we only
     expose the actually triggered heal as a named combat ability. */
  if(Number(t.lifeSteal)>0 && r.heal>0){
    addTag(r,'SEELENRAUB');
    r.v6302SoulSteal=Math.round(r.heal);
  }

  /* FLUCHNEBEL
     V319 only creates smoke DOTs for the Bong-Magier. The Harzruferin's
     dotChance/dotDamagePct existed in stats but had no execution path.
     This is the missing mechanical bridge. */
  const curseChance=clamp(Number(t.dotChance)||0,0,wb?.18:.28);
  if(curseChance>0 && Math.random()<curseChance){
    const dotPct=clamp(.035+(Number(t.dotDamagePct)||0)*.65,.035,.24);
    const tick=Math.max(1,Math.round(base*dotPct*(wb?.55:1)));
    st.v6302CurseDot={rounds:2,damage:tick};
    st.v6287CurseHits=Math.max(Number(st.v6287CurseHits)||0,2);
    addTag(r,'FLUCHNEBEL');
    r.v6302CurseApplied={rounds:2,damage:tick};
  }

  if(st.v6302CurseDot?.rounds>0){
    const tick=Math.max(1,Math.round(Number(st.v6302CurseDot.damage)||1));
    r.damage=Math.max(1,Math.round(Number(r.damage)||0)+tick);
    st.v6302CurseDot.rounds--;
    addTag(r,'FLUCHSCHADEN');
    r.v6302CurseTick=tick;
    if(st.v6302CurseDot.rounds<=0)st.v6302CurseDot=null;
  }

  if(st.v6335SporeDot?.rounds>0){
    const sporeTick=Math.max(1,Math.round(Number(st.v6335SporeDot.damage)||1));
    r.damage=Math.max(1,Math.round(Number(r.damage)||0)+sporeTick);
    st.v6335SporeDot.rounds=Math.max(0,Number(st.v6335SporeDot.rounds)-1);
    addTag(r,'SPORENFÄULE');
    r.v6335SporeDotTick=sporeTick;
    const visualDot={...st.v6335SporeDot};
    setTimeout(()=>{
      v6335SyncSporeDot(battleStage(),{v6335SporeDot:visualDot},sporeTick);
      if(visualDot.rounds<=0)setTimeout(()=>document.querySelectorAll('.v6335-enemy-dot').forEach(n=>n.remove()),720);
    },45);
    if(st.v6335SporeDot.rounds<=0)st.v6335SporeDot=null;
  }

  if(curseBoosted && rank('curse','m',6)>0){
    addTag(r,'ALLES WIRD KOMPOST');
    r.v6302CurseMaster=true;
  }

  /* Ruf aus dem Dunst:
     12% base chance, talent/set bonuses, and hard pity on the 5th own attack.
     This counter is independent of every old class mechanic. */
  const pity=Math.max(0,Number(st.v6287NoSummon)||0);
  let chance=.12+(Number(t.summonChance)||0)+sb('summonChance');
  if(wb)chance*=.72;
  const forced=pity>=4;
  const summoned=forced||Math.random()<clamp(chance,0,wb?.24:.34);
  ensureRoster();

  if(!summoned){
    st.v6287NoSummon=pity+1;
    r.v6287SummonPity=st.v6287NoSummon;
    setTimeout(()=>updateRosterState(st,chance,null,'Der Dunst sammelt Kraft …'),0);
    return r;
  }

  st.v6287NoSummon=0;
  const key=compKeys[Math.floor(Math.random()*compKeys.length)]||'bud';
  const cp=COMP[key];
  let mult=cp.mult*1.05*(1+(Number(t.summonDamage)||0)+sb('summonDamage'));
  if(wb)mult*=.62;

  let extra=Math.max(1,Math.round(base*mult));
  const companionCrit=Math.random()<clamp(Number(t.companionCrit)||0,0,.20);
  if(companionCrit){
    extra=Math.round(extra*1.5);
    addTag(r,'KNOCHENPAKT');
  }

  r.damage=Math.max(1,Math.round((Number(r.damage)||base)+extra));

  const summonMeta={forced,crit:companionCrit};
  if(key==='bud'){
    const budHeal=Math.max(1,Math.round(extra*(wb?.10:.20)));
    r.heal=Math.max(0,Number(r.heal)||0)+budHeal;
    summonMeta.heal=budHeal;
  }else if(key==='spore'){
    st.v6287CurseHits=2;
    summonMeta.curseHits=2;
    const sporeDot=v6335ApplySporeDot(st,base,t,wb);
    summonMeta.dotRounds=sporeDot.rounds;
    summonMeta.dotDamage=sporeDot.damage;
    addTag(r,'SPORENFÄULE');
    setTimeout(()=>v6335SyncSporeDot(battleStage(),st,0),90);
  }else if(key==='crow'){
    const critBuff=wb?.035:.06;
    st.v6287CritBuff=critBuff;
    summonMeta.critBuff=critBuff;
  }

  addTag(r,cp.name.toUpperCase());
  r.v6287Summon={key,name:cp.name,damage:extra,forced,...summonMeta};
  setTimeout(()=>{
    updateRosterState(st,chance,key,`${cp.name} greift an!`);
    showSummon(key,extra,false,summonMeta);
  },35);

  const second=clamp(Number(t.secondSummonChance)||0,0,wb?.10:.22);
  if(second&&Math.random()<second){
    let k2=compKeys[Math.floor(Math.random()*compKeys.length)]||'bone';
    if(k2===key)k2=compKeys[(compKeys.indexOf(key)+1)%compKeys.length];
    const e2=Math.max(1,Math.round(base*COMP[k2].mult*.50*(1+(Number(t.summonDamage)||0))*(wb?.60:1)));
    r.damage=Math.max(1,Math.round((Number(r.damage)||0)+e2));
    const secondTag=
      rank('summon','m',6)>0?'DIE TOTEN GÄRTNERN MIT':
      rank('summon','m',2)>0?'ZWEITER RUF':
      rank('summon','s',4)>0?'DOPPELRUF':'GEISTERCHOR';
    addTag(r,secondTag);
    const secondMeta={secondary:true,note:secondTag};
    if(k2==='spore'){
      st.v6287CurseHits=Math.max(Number(st.v6287CurseHits)||0,2);
      const sporeDot=v6335ApplySporeDot(st,base,t,wb);
      secondMeta.curseHits=2;secondMeta.dotRounds=sporeDot.rounds;secondMeta.dotDamage=sporeDot.damage;
      addTag(r,'SPORENFÄULE');
      setTimeout(()=>v6335SyncSporeDot(battleStage(),st,0),330);
    }
    r.v6287SecondSummon={key:k2,name:COMP[k2].name,damage:e2,talent:secondTag,...secondMeta};
    setTimeout(()=>{
      updateRosterState(st,chance,k2,`${secondTag} · ${COMP[k2].name}`);
      showSummon(k2,e2,true,secondMeta);
    },300);
  }
  return r;
 };
 try{v318ResolvePlayerAttack=wrapped}catch(_){}window.v318ResolvePlayerAttack=wrapped;
}

const oldEnemy=typeof v318ResolveEnemyAttack==='function'?v318ResolveEnemyAttack:null;
if(oldEnemy){
 const wrapped=function(st,ctx){
  const r=oldEnemy.apply(this,arguments)||{};if(!isHR())return r;const t=hrSummary(),incoming=Math.max(0,Number(r.damage)||0),hp=Math.max(0,Number(ctx?.playerHp)||0);
  if(t.preventLethal&&incoming>=hp&&!st.v6287SoulSave){
   st.v6287SoulSave=true;
   r.preventLethal=true;
   r.text=(String(r.text||'TREFFER')+' · NICHT GANZ TOT').trim();
   setTimeout(()=>{
     ensureRoster();
     updateRosterState(st,.10,'bud','Bud-Geist rettet dich!');
     showSummon('bud',0,false,{revive:true});
   },30)
  }
  return r;
 };
 try{v318ResolveEnemyAttack=wrapped}catch(_){}window.v318ResolveEnemyAttack=wrapped;
}

const oldPassive=typeof window.v4156ClassPassive==='function'?window.v4156ClassPassive:null;
window.v4156ClassPassive=id=>String(id||getState()?.playerClass)==='summoner'?{name:'Ruf aus dem Dunst',text:'12 % Grundchance auf einen Begleiter. Nach 4 Angriffen ohne Ruf ist der nächste garantiert.'}:(oldPassive?oldPassive(id):null);

function refresh(){
 try{
  if(!isHR()){clearSummonerVisuals();return}
  document.querySelectorAll('[data-v029-class="summoner"],[data-v200-class="summoner"],[data-v4135-class="summoner"],[data-v4136-class="summoner"]').forEach(card=>{const im=card.querySelector('img');if(im){im.src=A.avatar;im.alt='Harzruferin'}});
  document.querySelectorAll('#character .v080-class-avatar-img').forEach(im=>{im.src=A.avatar;im.alt='Harzruferin'});
  const t=document.getElementById('avatarTitle'),sub=document.getElementById('avatarSubtitle'),st=getState();if(t)t.textContent=String(st?.characterName||'').trim()||'Harzruferin';if(sub)sub.textContent='Harzruferin · Herrin von Nebel, Knochen und Bud-Geistern';
  let box=document.getElementById('v4156ClassPassive'),target=sub?.parentElement||document.querySelector('#character .center-hero');
  if(!box&&target){box=document.createElement('div');box.id='v4156ClassPassive';target.appendChild(box)}
  if(box)box.innerHTML='<b>🕯️ Klassenpassive · Ruf aus dem Dunst</b><br>Bud-Geist · Knochenknecht · Pilzspore · Nebelkrähe · nach 4 Angriffen ohne Ruf wird die nächste Beschwörung garantiert.';
  ensureRoster();
 }catch(_){}
}
/* V6.290 PERFORMANCE: kein globaler DOM-Observer mehr.
   Die alte Variante reagierte auf jeden Timer-/HUD-/Kampf-DOM-Update und konnte
   dadurch Navigation auf Mobilgeräten massiv ausbremsen. */
document.addEventListener('click',e=>{
 const nav=e.target instanceof Element
   ? e.target.closest('[data-screen],[data-go],[data-v085-go],[data-v032-go]')
   : null;
 if(nav)setTimeout(refresh,0);
},true);
window.addEventListener('growlegends:account-ready',()=>setTimeout(refresh,60));
window.addEventListener('pageshow',()=>setTimeout(refresh,60),{passive:true});
window.addEventListener('growlegends:foreground-ready',refresh,{passive:true});

window.v6287HarzruferinDiagnostics=()=>({
 version:'V6.287',classDefined:typeof classes!=='undefined'&&!!classes.summoner,active:isHR(),
 gearTemplates:typeof classGear!=='undefined'?(classGear.summoner||[]).length:0,
 setVariants:Array.isArray(window.v6105SetVariants?.summoner)?window.v6105SetVariants.summoner.map(x=>x.name):[],
 talentBranches:typeof V314_BRANCHES!=='undefined'?(V314_BRANCHES.summoner||[]).map(x=>x.id):[],
 companions:compKeys.map(k=>COMP[k].name),embeddedApprovedArt:!!A.avatar
});
})();
