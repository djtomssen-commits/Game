/* V8.008-C11 BETA — Gildenboss runtime core.
   Server result/round state, replay visibility, seen-state and the 20:00 refresh
   remain here. The obsolete V4.02 replay renderer is removed; C7 is the only
   visual replay owner. */
window.__V8008_C11_GUILD_BOSS_RUNTIME__=true;
let v260DailyAnimating=false;

function v260RoundResolved(){
  return !!v255BossRound && ['won','lost'].includes(v255BossRound.status) &&
         Array.isArray(v255BossParticipants) && v255BossParticipants.length>0;
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

/* C7 installs the only real replay implementation later in the script chain. */
async function v260AnimateDailyBoss(){ return false; }

function v260MaybeAutoPlay(){
  v260RenderDailyControls();
  const panel=document.querySelector('#v254GuildBoss');
  const guild=document.querySelector('#guild');
  const bossVisible=!!panel && panel.style.display!=='none' && !!guild?.classList.contains('active');
  if(bossVisible && document.visibilityState!=='hidden' && v260RoundResolved() &&
     !v260HasSeen() && !v260DailyAnimating){
    setTimeout(()=>{
      const p=document.querySelector('#v254GuildBoss');
      if(p && p.style.display!=='none' && document.querySelector('#guild')?.classList.contains('active')){
        const replay=window.v260AnimateDailyBoss;
        if(typeof replay==='function')replay();
      }
    },350);
  }
}

document.querySelector('#v260WatchDailyBoss')?.addEventListener('click',()=>{
  const replay=window.v260AnimateDailyBoss;
  if(typeof replay==='function')replay();
});

const v260BaseLoadBoss=v255LoadBoss;
v255LoadBoss=async function(){
  const r=await v260BaseLoadBoss();
  v260MaybeAutoPlay();
  return r;
};

const v260BossClock=setInterval(async()=>{
  if(document.hidden)return;
  const guild=document.querySelector('#guild'),panel=document.querySelector('#v254GuildBoss');
  if(!guild?.classList.contains('active') || !v254Membership || !panel || panel.style.display==='none')return;
  const h=new Date().getHours();
  if(h>=20 && !v260RoundResolved())await v255LoadBoss();
  else v260RenderDailyControls();
},30000);

setTimeout(()=>v260RenderDailyControls(),900);
