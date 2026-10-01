/* ===== V4.02 Mystisches Weltboss-Event ===== */
s.v110WorldBoss ??={day:'',freeUsed:false,wins:0,attempts:0};

function v110MysticEventActive(){
  const now=Date.now();
  return (v093Events||[]).some(ev=>{
    if(!ev?.is_active)return false;
    const start=ev.starts_at?new Date(ev.starts_at).getTime():0;
    const end=ev.ends_at?new Date(ev.ends_at).getTime():Infinity;
    const n=String(ev.name||'').toLowerCase();
    return (n.includes('myst')||n.includes('smaragd')||n.includes('weltboss')) && now>=start&&now<=end;
  });
}
function v110ResetDay(){
  const d=new Date(),key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  if(s.v110WorldBoss.day!==key)s.v110WorldBoss={...s.v110WorldBoss,day:key,freeUsed:false};
}
function v110MainStat(){
  const k=s.playerClass==='scout'?'geschick':(s.playerClass==='bruiser'||s.playerClass==='summoner')?'intelligenz':'staerke';
  return totalAttr(k);
}
function v110BossScale(){
  const cp=Math.max(1,combatPower()), hp=maxHp(), main=v110MainStat(), gear=Object.values(s.equipment||{}).filter(Boolean);
  const gearScore=gear.reduce((sum,it)=>sum+Object.values(it.bonus||{}).reduce((a,b)=>a+(Number(b)||0),0),0);
  /* Boss reacts to actual character strength, not level alone. */
  const bossHp=Math.round(hp*(4.6+Math.min(2.4,cp/900)));
  const bossAtk=Math.max(12,Math.round((main*1.45+s.level*2.7+gearScore*.32)*(1.04+Math.min(.24,cp/6000))));
  return {cp,hp,main,gearScore,bossHp,bossAtk};
}
const V110_MYSTIC_NAMES={
 grower:['Smaragd-Tyrann','🪓'],
 scout:['Giftpfeil','🏹'],
 bruiser:['Grüne Verdammnis','🔮']
};
function v110MakeMysticItem(){
  const cls=s.playerClass||'grower';
  const pool=classGear[cls]||classGear.grower;
  const base=pool[Math.floor(Math.random()*pool.length)];
  const boost=Math.max(8,Math.floor(s.level/3)+8);
  const bonus=Object.fromEntries(Object.entries(base.bonus||{}).map(([k,v])=>[k,(Number(v)||0)+boost]));
  const specialPool=(cls==='grower'||cls==='frost')
    ?[{key:'hpPct',label:'+5 % Leben',value:.05},{key:'mainPct',label:'+5 % Hauptattribut',value:.05},{key:'wuchtChance',label:'+3 % Wuchtschlag',value:.03}]
    :cls==='scout'
    ?[{key:'dodgeChance',label:'+3 % Ausweichen',value:.03},{key:'mainPct',label:'+5 % Hauptattribut',value:.05},{key:'doubleChance',label:'+3 % Doppeltreffer',value:.03}]
    :[{key:'critChance',label:'+3 % Krit',value:.03},{key:'mainPct',label:'+5 % Hauptattribut',value:.05},{key:'critDamage',label:'+8 % Krit-Schaden',value:.08}];
  const special=specialPool[Math.floor(Math.random()*specialPool.length)];
  return {...base,id:`mythic_${cls}_${Date.now()}_${Math.random()}`,price:0,quality:'cyan',rarity:'mythic',
    name:`Mystisch: ${base.name} [Lv.${s.level}]`,dropLevel:s.level,bonus,
    mysticSpecial:special,setName:null};
}
function v110MakeRareMysticSet(){
  const cls=s.playerClass||'grower', [setName]=V110_MYSTIC_NAMES[cls];
  const base=setBases[Math.floor(Math.random()*setBases.length)];
  const main=(cls==='grower'||cls==='frost')?'staerke':cls==='scout'?'geschick':'intelligenz';
  return {id:`myset_${cls}_${base.slot}_${Date.now()}`,classId:cls,slot:base.slot,icon:base.icon,price:0,
    quality:'cyan',rarity:'mythic',mysticSetId:`v110_${cls}`,setName:`Set des ${setName}`,
    name:`Mystisch: ${setName} – ${base.label} [Lv.${s.level}]`,
    dropLevel:s.level,bonus:{[main]:Math.floor(s.level/3)+15,ausdauer:Math.floor(s.level/5)+7},
    mysticSpecial:{key:'mainPct',label:'+5 % Hauptattribut',value:.05}};
}

function v110EnsureOverlay(){
  if(document.querySelector('#v110Overlay'))return;
  const ov=document.createElement('div');ov.id='v110Overlay';ov.className='v110-overlay';
  ov.innerHTML=`<div class="v110-panel">
    <div class="v110-head"><span class="v110-phase" id="v110Phase">MYSTISCHES EVENT</span><h2>☠️ Der Smaragd-Koloss</h2>
    <p>Der Koloss passt sich deinem Level, deinen Attributen, deiner Kampfkraft und deiner Ausrüstung an. Ein Sieg ist absichtlich sehr schwer.</p></div>
    <div class="v110-boss">🗿</div>
    <div class="v110-bars">
      <div><div class="tiny">Smaragd-Koloss <span id="v110BossHpTxt"></span></div><div class="v110-bar v110-bossbar"><i id="v110BossHp"></i></div></div>
      <div><div class="tiny">Dein Held <span id="v110PlayerHpTxt"></span></div><div class="v110-bar v110-playerbar"><i id="v110PlayerHp"></i></div></div>
    </div>
    <div class="v110-stats"><div class="v110-stat">DEINE KAMPFKRAFT<b id="v110Cp">0</b></div><div class="v110-stat">BOSS-STÄRKE<b id="v110Strength">EXTREM</b></div><div class="v110-stat">VERSUCHE<b id="v110Attempts">0</b></div></div>
    <div class="v110-log" id="v110Log">Der Koloss wartet...</div>
    <div class="v110-actions"><button class="btn gold" id="v110Fight">⚔️ Weltboss angreifen</button><button class="btn secondary" onclick="v110Close()">Zurück</button></div>
    <div class="tiny" id="v110Cost" style="text-align:center;margin-top:8px"></div>
  </div>`;
  document.body.appendChild(ov);
  document.querySelector('#v110Fight').onclick=v110Fight;
}
function v110Open(){
  if(!v110MysticEventActive())return v063Toast('Kein mystisches Event aktiv','warn','Der Weltboss ist derzeit versiegelt.');
  v110ResetDay();v110EnsureOverlay();v110Refresh();document.querySelector('#v110Overlay').classList.add('show');
}
function v110Close(){document.querySelector('#v110Overlay')?.classList.remove('show')}
function v110Refresh(){
  v110ResetDay();const b=v110BossScale();
  document.querySelector('#v110Cp').textContent=b.cp;
  document.querySelector('#v110Attempts').textContent=s.v110WorldBoss.attempts||0;
  document.querySelector('#v110Cost').innerHTML=s.v110WorldBoss.freeUsed?'Weiterer Versuch heute: <b>10 Harz-Taler</b>':'Erster Versuch heute: <b>KOSTENLOS</b>';
  document.querySelector('#v110BossHp').style.width='100%';document.querySelector('#v110PlayerHp').style.width='100%';
  document.querySelector('#v110BossHpTxt').textContent=`${b.bossHp}/${b.bossHp}`;document.querySelector('#v110PlayerHpTxt').textContent=`${b.hp}/${b.hp}`;
}
function v110Fight(){
  if(!v110MysticEventActive())return v110Close();
  v110ResetDay();
  if(s.v110WorldBoss.freeUsed){
    if((s.harzTaler||0)<10)return v063Toast('Zu wenig Harz-Taler','warn','Ein weiterer Weltboss-Versuch kostet 10 Harz-Taler.');
    s.harzTaler-=10;
  }else s.v110WorldBoss.freeUsed=true;
  s.v110WorldBoss.attempts=(s.v110WorldBoss.attempts||0)+1;

  const b=v110BossScale();let p=b.hp,e=b.bossHp,round=0,log=[];
  const btn=document.querySelector('#v110Fight');btn.disabled=true;
  const timer=setInterval(()=>{
    round++;
    const phase=e/b.bossHp<=.25?3:e/b.bossHp<=.60?2:1;
    const phaseMult=phase===3?1.48:phase===2?1.25:1;
    document.querySelector('#v110Phase').textContent=phase===3?'☠️ LETZTE BLÜTE':phase===2?'💚 SMARAGD-RASEREI':'MYSTISCHES EVENT';

    let pDmg=Math.max(5,Math.round((v110MainStat()*2.15+s.level*4+combatPower()*.055)*(0.82+Math.random()*.36)));
    if(Math.random()<Math.min(.25,.05+totalAttr('glueck')*.002)){pDmg=Math.round(pDmg*1.65);log.push(`💥 Kritischer Treffer: ${pDmg}`);try{window.v6111Sfx?.('crit')}catch(e){}}
    else {log.push(`⚔️ Du triffst für ${pDmg}.`);try{window.v6111Sfx?.('hit')}catch(e){}}
    e=Math.max(0,e-pDmg);

    if(e>0){
      let eDmg=Math.max(5,Math.round(b.bossAtk*phaseMult*(.82+Math.random()*.38)));
      p=Math.max(0,p-eDmg);log.push(`${phase===3?'☠️':phase===2?'💚':'🗿'} Koloss trifft für ${eDmg}.`);try{window.v6111Sfx?.('enemyHit')}catch(e){}
    }
    document.querySelector('#v110BossHp').style.width=`${e/b.bossHp*100}%`;
    document.querySelector('#v110PlayerHp').style.width=`${p/b.hp*100}%`;
    document.querySelector('#v110BossHpTxt').textContent=`${e}/${b.bossHp}`;
    document.querySelector('#v110PlayerHpTxt').textContent=`${p}/${b.hp}`;
    document.querySelector('#v110Log').textContent=log.slice(-8).join('\n');

    if(e<=0||p<=0||round>=60){
      clearInterval(timer);btn.disabled=false;
      if(e<=0){
        try{window.v6111Sfx?.('win')}catch(e){}
        s.v110WorldBoss.wins=(s.v110WorldBoss.wins||0)+1;
        try{window.v6239WeeklyChestActivity?.('worldboss',{wins:Number(s.v110WorldBoss.wins)||0},`worldboss:${Number(s.v110WorldBoss.wins)||0}`)}catch(_){}
        let item;
        if(Math.random()<.06)item=v110MakeRareMysticSet(); else item=v110MakeMysticItem();
        s.inventory.push(item);
        document.querySelector('#v110Log').textContent=`🏆 DER SMARAGD-KOLOSS IST GEFALLEN!\n\n🔷 Garantierte mystische Beute:\n${item.name}\n${itemBonus(item)}\n✨ ${item.mysticSpecial?.label||''}`;
        v063Toast('🔷 MYSTISCHER SIEG!','success',`${item.name} erhalten!`);
      }else{
        try{window.v6111Sfx?.('lose')}catch(e){}
        document.querySelector('#v110Log').textContent=`☠️ Der Smaragd-Koloss hat dich besiegt.\nDu hast ihn auf ${Math.round(e/b.bossHp*100)} % Leben gebracht.\nVerbessere Ausrüstung, Sockel, Verzauberungen und Set-Boni.`;
        v063Toast('Weltboss nicht bezwungen','warn','Der Smaragd-Koloss war diesmal stärker.');
      }
      persist();v110Refresh();
    }
  },430);
}
function v110InstallEventButton(){
  if(!v110MysticEventActive())return;
  const world=document.querySelector('#world');
  if(!world||document.querySelector('#v110WorldBossBtn'))return;
  const target=world.querySelector('.v085-event-card');
  if(!target)return;
  const b=document.createElement('button');b.id='v110WorldBossBtn';b.className='btn v110-event-btn';b.textContent='☠️ Smaragd-Koloss herausfordern';b.onclick=v110Open;target.appendChild(b);
}

/* Illegal Book: add world-boss/mystic achievements. */
if(typeof V106_ACH!=='undefined'){
  const extra=[
   ['wb1','Der Koloss fällt','Besiege deinen ersten mystischen Weltboss.',()=>s.v110WorldBoss?.wins||0,1],
   ['wb10','Smaragd-Schlächter','Besiege 10 mystische Weltbosse.',()=>s.v110WorldBoss?.wins||0,10],
   ['myth1','Türkise Beute','Besitze dein erstes mystisches Item.',()=>s.inventory?.some(x=>x?.quality==='cyan')?1:0,1],
   ['myth6','In Mystik gehüllt','Besitze 6 mystische Gegenstände.',()=>s.inventory?.filter(x=>x?.quality==='cyan').length||0,6]
  ];
  extra.forEach(a=>{if(!V106_ACH.some(x=>x[0]===a[0]))V106_ACH.push(a)});
}

const v110OldActiveEvents=v085ActiveEvents;
v085ActiveEvents=function(){
  let out=v110OldActiveEvents();
  if(v110MysticEventActive())out=out.replace(/(<div class="v085-event-status">AKTIV<\/div>)/,'$1<div class="v094-event-bonus v094-xp-active">🔷 MYSTISCHER WELTBOSS AKTIV</div>');
  return out;
};

const v110BaseRender=render;
render=function(){
  const result=v110BaseRender();
  
  if(!window.__V483_MODERN_WORLD_ONLY__)requestAnimationFrame(v110InstallEventButton);
  return result;
};
/* V4.86: current V366 home owns the worldboss entry; old-home installer retired. */
