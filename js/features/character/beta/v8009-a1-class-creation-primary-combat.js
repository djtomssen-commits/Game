/* ===== V4.02 Class creation + Intelligence + primary-stat combat ===== */

/* --- State migration --- */
s.attrs ??= {};
s.attrs.intelligenz ??= 5;
if (!s.playerClass) s.classLocked = false;
localStorage.setItem(KEY, JSON.stringify(s));

/* --- Class bonuses --- */
classes.grower.bonus = {staerke:4,ausdauer:3};
classes.scout.bonus = {geschick:4,glueck:3};
classes.bruiser.bonus = {intelligenz:4,glueck:3};

/* --- Mage gear uses Intelligence --- */
classGear.bruiser = [
  {id:'bm_staff',name:'Nebelstab',slot:'weapon',icon:'🪄',price:250,classId:'bruiser',bonus:{intelligenz:7}},
  {id:'bm_hat',name:'Kapuze des Dunstes',slot:'head',icon:'🧙',price:220,classId:'bruiser',bonus:{intelligenz:4,glueck:2}},
  {id:'bm_robe',name:'Robe des Nebelzirkels',slot:'body',icon:'🥋',price:320,classId:'bruiser',bonus:{intelligenz:4,ausdauer:3}},
  {id:'bm_boots',name:'Schwebeschuhe',slot:'boots',icon:'👢',price:200,classId:'bruiser',bonus:{intelligenz:3,geschick:2}}
];

/* --- Rebuild flattened class gear cache if mutable --- */
try{
  if (typeof allClassGear !== 'undefined' && Array.isArray(allClassGear)){
    allClassGear.length = 0;
    Object.values(classGear).flat().forEach(x => allClassGear.push(x));
  }
}catch(e){}

/* --- Mage set items use Intelligence --- */
const v029OldMakeSetItem = makeSetItem;
makeSetItem = function(classId,slot){
  const item = v029OldMakeSetItem(classId,slot);
  if(classId === 'bruiser'){
    const map = {
      head:{intelligenz:4,glueck:2},
      weapon:{intelligenz:6},
      body:{intelligenz:4,ausdauer:3},
      boots:{intelligenz:3,geschick:2},
      ring:{intelligenz:4,glueck:1},
      amulet:{intelligenz:3,glueck:2}
    };
    item.bonus = v024Bonus(map[slot] || {intelligenz:3}, 'purple', Math.max(1,s.level||1));
  }
  return item;
};

/* --- Set bonus: mage 2-piece = Intelligence --- */
const v029OldSetBonusValue = setBonusValue;
setBonusValue = function(kind){
  if(s.playerClass === 'bruiser' && kind === 'intelligenz' && equippedSetCount('bruiser') >= 2) return 5;
  return v029OldSetBonusValue(kind);
};

/* --- Item text knows Intelligence --- */
itemBonus = function(it){
  return Object.entries(it?.bonus||{}).map(([k,v]) => `+${v} ${k
    .replace('staerke','Stärke')
    .replace('geschick','Geschick')
    .replace('intelligenz','Intelligenz')
    .replace('ausdauer','Ausdauer')
    .replace('glueck','Glück')
    .replace('growSkill','Grow')}`).join(' · ');
};

/* --- Primary damage stat per class --- */
function v029PrimaryStat(){
  if((s.playerClass === 'grower'||s.playerClass === 'frost')) return totalAttr('staerke');
  if(s.playerClass === 'scout') return totalAttr('geschick');
  if(s.playerClass === 'bruiser'||s.playerClass === 'summoner') return totalAttr('intelligenz');
  return totalAttr('staerke');
}
function v029PrimaryName(){
  if((s.playerClass === 'grower'||s.playerClass === 'frost')) return 'Stärke';
  if(s.playerClass === 'scout') return 'Geschick';
  if(s.playerClass === 'bruiser'||s.playerClass === 'summoner') return 'Intelligenz';
  return 'Hauptattribut';
}
combatPower = function(){
  return Math.round(v029PrimaryStat()*6 + totalAttr('ausdauer')*2 + totalAttr('glueck') + s.level*6);
};

/* --- Remove character-page class picker permanently --- */
function v029RemoveClassPicker(){
  const grid = document.querySelector('#classGrid');
  if(grid){
    const card = grid.closest('.card');
    if(card) card.remove();
  }
}

/* --- Reset/New Game at bottom of World page --- */
function v029MoveReset(){/* V4.02 obsolete new-game card disabled */}

/* --- Mandatory class selection after fresh/new game --- */
function v029ShowClassChoice(){
  if(s.playerClass || document.querySelector('#v029ClassModal')) return;

  const modal = document.createElement('div');
  modal.id = 'v029ClassModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto';
  modal.innerHTML = `
    <div style="max-width:640px;width:100%;background:#111a12;border:1px solid #41583e;border-radius:18px;padding:18px">
      <h2 style="margin-top:0">🧙 Wähle deine Klasse</h2>
      <div class="muted" style="margin-bottom:12px">
        Die Wahl ist für diesen Spielstand dauerhaft.
      </div>
      <div class="class-grid">
        ${Object.entries(classes).map(([id,c])=>`
          <button class="class-card" data-v029-class="${id}">
            <div class="class-icon">${c.icon}</div>
            <h4>${c.name}</h4>
            <p>${c.text}</p>
          </button>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelectorAll('[data-v029-class]').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.v029Class;
      if(!confirm(`${classes[id].name} wirklich wählen? Die Klasse kann später nicht gewechselt werden.`)) return;
      s.playerClass = id;
      s.classLocked = true;
      localStorage.setItem(KEY,JSON.stringify(s));
      modal.remove();
      render();
    };
  });
}

/* --- Combat handler with class-specific damage attribute --- */
function v029InstallFightHandler(){
  const btn = document.querySelector('#fightBtn');
  if(!btn) return;

  btn.onclick = ()=>{
    if(battleBusy) return;

    const di = Math.max(0,Math.min(dungeons.length-1,s.dungeon.selected||0));
    if(dungeonCompleted(di)) return v115Alert('Dieser Dungeon ist bereits abgeschlossen.');
    if(!dungeonAvailable(di)) return v115Alert('Dieser Dungeon ist noch nicht betretbar.');
    if(!s.playerClass) return v115Alert('Wähle zuerst deine Klasse.');
    if(!consumeDungeonAttempt()) return;

    persist(false);
    battleBusy = true;
    btn.disabled = true;
    document.querySelector('#loot').innerHTML = '';

    const d = dungeons[di];
    const idx = Math.max(0,Math.min(9,(s.dungeon.progress?.[di] ?? s.dungeon.room ?? 0)));
    const e = d.enemies[idx];
    const bal = v025EnemyStats(di,idx,e);

    const maxP = maxHp();
    let pHp = maxP, eHp = bal.hp, round = 0;

    const pBar=document.querySelector('#playerHpBar'),
          eBar=document.querySelector('#enemyHpBar'),
          pTxt=document.querySelector('#playerHpText'),
          eTxt=document.querySelector('#enemyHpText'),
          log=document.querySelector('#battleLog');

    eTxt.textContent=eHp; eBar.style.width='100%';
    pTxt.textContent=pHp; pBar.style.width='100%';

    const finish = win=>{
      setTimeout(()=>{
        battleBusy=false;
        btn.disabled=false;

        if(win){
          s.gold += e.gold;
          addXp(e.xp);
          let html = `<div class="loot good">🏆 Sieg gegen empfohlen Lv. ${bal.rec}! +${e.xp} XP · +${e.gold} Gold</div>`;

          if(e.boss || Math.random()<.22){
            let found;
            if(e.boss){
              if(Math.random()<.12){
                const slot=setBases[Math.floor(Math.random()*setBases.length)].slot;
                found=makeSetItem(s.playerClass||'grower',slot);
              }else{
                found=makeClassLoot(s.playerClass||'grower','boss');
              }
            }else{
              if(Math.random()<.8){
                found=makeClassLoot(s.playerClass||'grower','dungeon');
              }else{
                const other=['grower','bruiser','scout','frost','summoner'].filter(x=>x!==s.playerClass);
                found=makeClassLoot(other[Math.floor(Math.random()*other.length)],'dungeon');
              }
            }
            s.inventory.push(found);
            html += `<div class="loot">🎁 ${found.icon||'🎁'} ${found.name}<br><span class="tiny">${itemBonus(found)}</span></div>`;
          }

          if(e.boss){
            s.story.bossesDefeated++;
            s.story.chapter=Math.min(4,1+Math.floor(s.story.bossesDefeated/2));
            if(Math.random()<.22){
              s.harzTaler++;
              html += `<div class="loot">🟢 Harz-Taler gefunden!</div>`;
            }
            if(!s.dungeon.completed.includes(di)) s.dungeon.completed.push(di);
            s.dungeon.room=9;
            s.dungeon.progress[di]=9;
            html += `<div class="loot good">⛓️ Dungeon abgeschlossen!</div>`;
          }else{
            s.dungeon.room=idx+1;
            s.dungeon.progress[di]=idx+1;
          }

          document.querySelector('#loot').innerHTML=html;
          log.textContent=e.boss?'Boss besiegt.':'Gegner besiegt. Der nächste Gegner ist jetzt erreichbar.';
          persist();
        }else{
          document.querySelector('#loot').innerHTML =
            `<div class="loot" style="color:#ff9895">💀 Niederlage. Verbessere ${v029PrimaryName()}, Skills oder Ausrüstung.</div>`;
          log.textContent=`Niederlage gegen empfohlen Level ${bal.rec}.`;
        }
      },400);
    };

    const step = ()=>{
      round++;

      let critChance=Math.min(.30,.04+totalAttr('glueck')*.012);
      if(s.playerClass==='bruiser') critChance+=.07+setBonusValue('critChance')+skillValue('nebel')*.025;
      if(s.playerClass==='scout') critChance+=skillValue('praez')*.018;
      const crit=Math.random()<critChance;

      let pDmg=Math.max(4,Math.floor(v029PrimaryStat()*1.9 + s.level*1.55 + Math.random()*7));
      if(crit) pDmg=Math.floor(pDmg*1.75);

      let special='';
      if((s.playerClass==='grower'||s.playerClass==='frost') && Math.random()<(.13+setBonusValue('wuchtChance')+skillValue('wucht')*.025)){
        pDmg=Math.floor(pDmg*1.55);
        special=' WUCHTSCHLAG!';
      }
      if(s.playerClass==='scout' && Math.random()<(.15+setBonusValue('doubleChance')+skillValue('schnell')*.025)){
        pDmg=Math.floor(pDmg*(1.42+setBonusValue('doubleDamage')));
        special=' DOPPELTREFFER!';
      }
      if(s.playerClass==='bruiser' && crit){
        pDmg=Math.floor(pDmg*(1+setBonusValue('critDamage')+skillValue('overload')*.055));
        special=' MAGIE-KRIT!';
      }
      if((s.playerClass==='grower'||s.playerClass==='frost') && skillValue('raserei')){
        pDmg=Math.floor(pDmg*(1+skillValue('raserei')*.03));
      }

      animClass(document.querySelector('#playerFighter'),'attack-right');
      setTimeout(()=>{
        eHp=Math.max(0,eHp-pDmg);
        eBar.style.width=(eHp/bal.hp*100)+'%';
        eTxt.textContent=eHp;
        popDamage(document.querySelector('#damageEnemy'),`${crit||special?'KRIT! ':''}-${pDmg}`);
        animClass(document.querySelector('#enemyFighter'),'hit');
        log.textContent=`Runde ${round}: Du verursachst ${pDmg} Schaden.${special}`;

        if(eHp<=0) return finish(true);

        setTimeout(()=>{
          const defense=totalAttr('ausdauer')*.38;
          let eDmg=Math.max(2,Math.floor(bal.attack+Math.random()*7-defense));

          const skillReduce=(s.playerClass==='grower'||s.playerClass==='frost')?skillValue('fell')*.035:
                            s.playerClass==='bruiser'?skillValue('mantel')*.028:
                            s.playerClass==='scout'?skillValue('tarn')*.028:0;

          eDmg=Math.max(1,Math.floor(eDmg*(1-skillReduce)));

          animClass(document.querySelector('#enemyFighter'),'attack-left');
          setTimeout(()=>{
            pHp=Math.max(0,pHp-eDmg);
            pBar.style.width=(pHp/maxP*100)+'%';
            pTxt.textContent=pHp;
            popDamage(document.querySelector('#damagePlayer'),`-${eDmg}`);
            animClass(document.querySelector('#playerFighter'),'hit');
            log.textContent+=` Gegner trifft dich für ${eDmg}.`;

            if(pHp<=0) return finish(false);
            setTimeout(step,360);
          },240);
        },380);
      },240);
    };

    step();
  };
}

/* --- Wrap render: Intelligence row + UI cleanup + fight handler --- */
const v029BaseRender = render;
render = function(){
  v029BaseRender();

  const attrs = document.querySelector('#attrs');
  if(attrs){
    const list = [
      ['staerke','💪 Stärke'],
      ['geschick','🎯 Geschick'],
      ['intelligenz','🧠 Intelligenz'],
      ['ausdauer','❤️ Ausdauer'],
      ['glueck','🍀 Glück'],

    ];
    attrs.innerHTML = list.map(([k,n]) =>
      `<div class="attr"><span>${n}: <b>${totalAttr(k)}</b></span><button onclick="incAttr('${k}')" ${s.points<1?'disabled':''}>+</button></div>`
    ).join('');
  }

  v029RemoveClassPicker();
  v029MoveReset();
  v029InstallFightHandler();
  if(!s.playerClass && window.__V200_AUTH_READY__) v029ShowClassChoice();
};

/* --- Initial --- */
try{
  v029RemoveClassPicker();
  v029MoveReset();
  if(!s.playerClass && window.__V200_AUTH_READY__) v029ShowClassChoice();
  render();
}catch(e){
  console.error('V4.02 init',e);
}
