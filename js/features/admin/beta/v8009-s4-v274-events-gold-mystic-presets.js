/* ===== V4.02 Event pack =====
   - Gold-Event: 2x quest Gold at claim time.
   - Mystisch-Event: 10% chance per completed quest for one genuine cyan class item.
   - Admin presets: Dampf, Erfahrung, Gold, Mystisch.
*/

function v274EventActive(words){
  const now=Date.now();
  const wanted=(Array.isArray(words)?words:[words]).map(x=>String(x).toLowerCase());
  return (v093Events||[]).some(ev=>{
    if(!ev?.is_active)return false;
    const name=String(ev.name||'').toLowerCase();
    if(!wanted.some(w=>name.includes(w)))return false;
    const start=ev.starts_at?new Date(ev.starts_at).getTime():0;
    const end=ev.ends_at?new Date(ev.ends_at).getTime():Infinity;
    return now>=start && now<=end;
  });
}
function v274GoldEventActive(){return v274EventActive(['gold'])}
function v274MysticEventActive(){return v274EventActive(['mystisch','mystic'])}

/* Final quest reward wrapper:
   Set quest Gold BEFORE the existing reward chain so all established
   reward modals/snapshots display the exact doubled amount. */
const v274BaseClaimQuest=claimQuest;
claimQuest=function(...args){
  const q=s.quests?.active;
  const ready=!!q && Date.now()>=Number(q.ends||0);

  if(ready){
    const baseGold=Math.max(0,Number(q.v274BaseGold ?? q.gold)||0);
    q.v274BaseGold=baseGold;
    q.gold=v274GoldEventActive()?baseGold*2:baseGold;
  }

  const beforeInv=Array.isArray(s.inventory)?s.inventory.length:0;
  const result=v274BaseClaimQuest.apply(this,args);

  /* A vanished active quest proves the established reward chain succeeded. */
  if(ready && !s.quests?.active){
    if(v274GoldEventActive()){
      try{
        v063Toast?.('💰 2× Gold Event!','success',`Diese Quest brachte ${Math.max(0,Number(q.gold)||0)} Gold.`);
      }catch(e){}
    }

    /* V4.56 loot contract:
       Mythic/cyan equipment is exclusive to an actual Smaragd-Koloss victory.
       A mystic event may activate the boss, but completed quests never mint cyan gear. */
  }

  return result;
};

/* Quest Cleanup Phase 2: the old V274 render-only Gold preview is retired.
   V276 is the later canonical Gold-event painter and writes the same doubled
   preview plus the visible ×2 badge. V274 claim/reward/event logic remains active. */

function v274LocalInput(d){
  return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
}
function v274FillEventPreset(kind){
  const presets={
    dampf:{
      name:'Dampf-Event',
      desc:'Alle Spieler erhalten während des Events 300/300 Dampf.'
    },
    xp:{
      name:'Erfahrungs-Event',
      desc:'Quests geben während des Events 2× Erfahrung.'
    },
    gold:{
      name:'Gold-Event',
      desc:'Quests, Dungeons und Pflanzen-Ernten geben während des Events 2× Gold.'
    },
    mystic:{
      name:'Mystisch-Event',
      desc:'Abgeschlossene Quests können während des Events mystische Ausrüstung finden.'
    }
  };
  const x=presets[kind];if(!x)return;

  const now=new Date(),later=new Date(Date.now()+24*3600000);
  const name=document.querySelector('#v093EventName');
  const desc=document.querySelector('#v093EventDesc');
  const start=document.querySelector('#v093EventStart');
  const end=document.querySelector('#v093EventEnd');
  const active=document.querySelector('#v093EventActive');

  if(name)name.value=x.name;
  if(desc)desc.value=x.desc;
  if(start)start.value=v274LocalInput(now);
  if(end)end.value=v274LocalInput(later);
  if(active)active.checked=true;

  document.querySelector('#v093EventName')?.scrollIntoView({behavior:'smooth',block:'center'});
  v063Toast?.(`${x.name} vorbereitet`,'success','Zeitraum prüfen und anschließend „Event speichern“ drücken.');
}

function v274InstallEventPresets(){
  if(!v093IsAdmin)return;
  const root=document.querySelector('#v093AdminContent');
  if(!root)return;

  /* Reuse the existing Dampf helper card instead of stacking another admin card. */
  const card=document.querySelector('#v271AdminDampfCard');
  if(!card)return;

  const title=card.querySelector('h3');
  if(title)title.textContent='🎪 Event-Vorlagen';

  const sub=card.querySelector('.muted');
  if(sub)sub.textContent='Vorlage auswählen, Zeitraum prüfen und anschließend das Event speichern.';

  const state=card.querySelector('#v271AdminDampfState');
  if(state)state.style.display='none';

  const oldInfo=card.querySelector('.v271-admin-dampf-state');
  if(oldInfo)oldInfo.innerHTML='Dampf: <b>300/300</b> · Erfahrung: <b>2× XP</b> · Gold: <b>2× Gold</b> · Mystisch: <b>10 % Chance pro abgeschlossener Quest</b>.';

  const oldBtn=document.querySelector('#v271DampfPreset');
  if(oldBtn)oldBtn.remove();

  let grid=document.querySelector('#v274EventPresets');
  if(!grid){
    grid=document.createElement('div');
    grid.id='v274EventPresets';
    grid.innerHTML=`
      <button class="btn" type="button" data-v274-preset="dampf">💨 Dampf-Event</button>
      <button class="btn" type="button" data-v274-preset="xp">⚡ Erfahrungs-Event</button>
      <button class="btn" type="button" data-v274-preset="gold">💰 Gold-Event</button>
      <button class="btn" type="button" data-v274-preset="mystic">🔷 Mystisch-Event</button>`;
    card.appendChild(grid);
    grid.querySelectorAll('[data-v274-preset]').forEach(btn=>{
      btn.addEventListener('click',()=>v274FillEventPreset(btn.dataset.v274Preset));
    });
  }
}

/* Admin content loading is the single installation owner for presets. */
const v274BaseAdminLists=v093AdminLoadLists;
v093AdminLoadLists=async function(){
  const r=await v274BaseAdminLists();
  if(v093IsAdmin)v274InstallEventPresets();
  return r;
};

/* Add concise live bonuses to the world event area without changing DB rows. */
const v274BaseActiveEvents=v085ActiveEvents;
v085ActiveEvents=function(){
  let html=v274BaseActiveEvents();
  const badges=[];
  if(v274GoldEventActive())badges.push('<span class="v274-event-live">💰 2× GOLD</span>');
  if(v274MysticEventActive())badges.push('<span class="v274-event-live">🔷 MYSTISCH AKTIV</span>');
  if(!badges.length)return html;
  return `${html}<div>${badges.join(' ')}</div>`;
};

/* v093AdminLoadLists directly owns preset installation. */
