
/* ===== V4.02 Legendary Seed: Wundertüte OG ===== */
s.v077 ??= { seeds:0, lastPlantAt:0, planted:null, buff:null };
const V077_COOLDOWN=30*60*1000, V077_BUFF=5*60*1000, V077_COST=5;

function v077Now(){return Date.now()}
function v077Fmt(ms){ms=Math.max(0,ms);let s=Math.ceil(ms/1000),m=Math.floor(s/60);return `${m}:${String(s%60).padStart(2,'0')}`}
function v077Buff(){
  if(s.v077?.buff && s.v077.buff.until>v077Now()) return s.v077.buff;
  if(s.v077?.buff){s.v077.buff=null;localStorage.setItem(KEY,JSON.stringify(s))}
  return null;
}
function v077MainAttr(){
  return s.playerClass==='mage'?'intelligenz':s.playerClass==='ranger'?'geschick':'staerke';
}
function v077BuffLabel(type){
  return ({main:'Hauptattribut +20%',gold:'Gold +25%',xp:'EXP +25%',yield:'Grow-Ertrag +30%',harvestGold:'Ernte-Gold +40%'})[type]||type;
}
function v077BuySeed(){
  s.v077 ??={seeds:0,lastPlantAt:0,planted:null,buff:null};
  if((s.resin||0)<V077_COST){v063Toast('Nicht genug Harz-Taler','error',`Benötigt: ${V077_COST}`);return}
  s.resin-=V077_COST;s.v077.seeds++;localStorage.setItem(KEY,JSON.stringify(s));v063Toast('Wundertüte OG gekauft','success','Liegt bei deinen legendären Samen.');render();
}
function v077Plant(){
  s.v077 ??={seeds:0,lastPlantAt:0,planted:null,buff:null};
  if(s.v077.planted){v063Toast('Wundertüte OG wächst bereits','warn');return}
  if(s.v077.seeds<1){v063Toast('Keine Wundertüte OG vorhanden','warn');return}
  const left=V077_COOLDOWN-(v077Now()-(s.v077.lastPlantAt||0));
  if(left>0){v063Toast('Legendärer Samen noch gesperrt','warn',`Noch ${v077Fmt(left)}`);return}
  s.v077.seeds--;s.v077.lastPlantAt=v077Now();s.v077.planted={at:v077Now(),readyAt:v077Now()+60*1000};
  localStorage.setItem(KEY,JSON.stringify(s));v063Toast('Wundertüte OG gepflanzt','success','In 1 Minute erntereif.');render();
}
function v077Harvest(){
  if(!s.v077?.planted)return;
  if(v077Now()<s.v077.planted.readyAt){v063Toast('Noch nicht erntereif','warn',`Noch ${v077Fmt(s.v077.planted.readyAt-v077Now())}`);return}
  const types=['main','gold','xp','yield','harvestGold'],type=types[Math.floor(Math.random()*types.length)];
  s.v077.planted=null;s.v077.buff={type,until:v077Now()+V077_BUFF};
  localStorage.setItem(KEY,JSON.stringify(s));
  v063Toast('Legendärer Buff aktiviert!','success',`${v077BuffLabel(type)} · 5 Minuten`);
  render();
}
function v077ModifyGold(n,source='general'){const b=v077Buff();if(!b)return n;if(b.type==='gold')return Math.round(n*1.25);if(b.type==='harvestGold'&&source==='harvest')return Math.round(n*1.40);return n}
function v077ModifyXp(n){const b=v077Buff();return b?.type==='xp'?Math.round(n*1.25):n}
function v077ModifyYield(n){const b=v077Buff();return b?.type==='yield'?Math.round(n*1.30):n}
function v077MainBonus(){const b=v077Buff();if(b?.type!=='main')return 0;let base=0;try{base=Number(totalAttr(v077MainAttr()))||0}catch(e){}return Math.max(1,Math.round(base*.20))}

function v077QuestFind(){
  if(Math.random()>=0.025)return;
  s.v077 ??={seeds:0,lastPlantAt:0,planted:null,buff:null};s.v077.seeds++;
  localStorage.setItem(KEY,JSON.stringify(s));
  setTimeout(()=>v063Toast('Legendärer Fund!','success','Wundertüte OG bei der Quest gefunden.'),80);
}

function v077InjectGrow(){
  const screen=document.querySelector('#grow');if(!screen)return;
  let box=document.querySelector('#v077SeedPanel');
  if(!box){box=document.createElement('div');box.id='v077SeedPanel';box.className='v077-panel';const card=screen.querySelector('.card');if(card)card.prepend(box);else screen.prepend(box)}
  const planted=s.v077?.planted,left=V077_COOLDOWN-(v077Now()-(s.v077?.lastPlantAt||0)),b=v077Buff();
  box.innerHTML=`<div class="v077-seed"><div class="v077-orb"></div><div><div class="v077-title">Wundertüte OG · Legendär</div><div class="v077-small">Besitz: ${s.v077?.seeds||0} · Pflanzbar: ${left>0?v077Fmt(left):'JETZT'} · Questfund 2,5%</div></div><button class="btn" onclick="v077BuySeed()">${V077_COST} Harz-Taler</button></div>
  ${planted?`<button class="btn" style="width:100%;margin-top:8px" onclick="v077Harvest()">${v077Now()>=planted.readyAt?'Legendäre Pflanze ernten':'Wächst · '+v077Fmt(planted.readyAt-v077Now())}</button>`:`<button class="btn secondary" style="width:100%;margin-top:8px" onclick="v077Plant()">Wundertüte OG pflanzen</button>`}
  <div class="v077-buff ${b?'show':''}">${b?`Aktiver Buff: <b>${v077BuffLabel(b.type)}</b> · <span id="v077BuffTime">${v077Fmt(b.until-v077Now())}</span>`:''}</div>`;
}
function v077InjectCharacterFx(){
  document.querySelectorAll('.v077-fx,.v077-badge').forEach(x=>x.remove());
  const b=v077Buff();if(!b)return;
  const screen=document.querySelector('#character');if(!screen)return;
  const candidates=[...screen.querySelectorAll('img')].filter(x=>x.offsetWidth>80&&x.offsetHeight>80);
  const img=candidates.sort((a,b)=>b.offsetWidth*b.offsetHeight-a.offsetWidth*a.offsetHeight)[0];if(!img)return;
  const host=img.parentElement;host.style.position='relative';
  const fx=document.createElement('div');fx.className='v077-fx';host.appendChild(fx);
  const badge=document.createElement('div');badge.className='v077-badge';badge.textContent=`${v077BuffLabel(b.type)} · ${v077Fmt(b.until-v077Now())}`;host.appendChild(badge);
}
const v077OldAddXp=addXp;
addXp=function(n){return v077OldAddXp(v077ModifyXp(n))};

/* V6.317: Wundertüte OG was retired by V4.99. Do not attach its historic
   Grow/portrait painters to every global render and do not keep its two pollers alive. */
let v077QuestSnapshot={gold:s.gold||0,xp:s.xp||0};
render();
