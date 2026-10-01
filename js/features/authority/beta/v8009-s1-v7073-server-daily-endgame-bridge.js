(()=>{
'use strict';
if(window.__V7073_DAILY_ENDGAME__)return;
window.__V7073_DAILY_ENDGAME__=true;

const VERSION='V7.091';
const D={dailyReady:false,endgameReady:false,busyDaily:false,busyEndgame:false,lastError:'',dailyClaims:0,endgameFights:0,lastDailyRpcMs:0,lastDailyApplyMs:0,duplicateDailyTaps:0};
let dailyP=null,endgameP=null,queue=Promise.resolve(),dailyShownKey='';

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const stop=e=>{try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(_){}};
const toast=(title,type='info',detail='')=>{
  try{return window.v063Toast?.(title,type,detail)}
  catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}
};
function serial(fn){const r=()=>Promise.resolve().then(fn);queue=queue.then(r,r);return queue}
async function rpc(name,args={}){
  const x=db();if(!x||!uid())throw new Error('SERVER_NOT_READY');
  const {data,error}=await x.rpc(name,args);if(error)throw error;return one(data);
}
function ensure(){
  if(typeof s==='undefined'||!s)return false;
  s.v484DailyLogin=(s.v484DailyLogin&&typeof s.v484DailyLogin==='object')?s.v484DailyLogin:{};
  s.v457Endgame=(s.v457Endgame&&typeof s.v457Endgame==='object')?s.v457Endgame:{progress:{},completed:[],selected:0,wins:0,bossWins:0};
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
  s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
  s.inventory=Array.isArray(s.inventory)?s.inventory:[];
  s.materials=Array.isArray(s.materials)?s.materials:[];
  return true;
}
function saveLocal(){
  try{
    if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
    else localStorage.setItem('grow_idle_save_v1',JSON.stringify(s));
  }catch(_){}
}
function berlinKey(){
  try{
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const o={};p.forEach(x=>{if(x.type!=='literal')o[x.type]=x.value});
    return `${o.year}-${o.month}-${o.day}`;
  }catch(_){return new Date().toISOString().slice(0,10)}
}
function dayOrd(key){
  const m=String(key||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?Math.floor(Date.UTC(+m[1],+m[2]-1,+m[3])/86400000):0;
}
function dailyLockKey(key){
  const id=uid();return id&&key?`growlegends_daily_claim_${id}_${key}`:'';
}
function setLock(key,on){
  const k=dailyLockKey(key);if(!k)return;
  try{on?localStorage.setItem(k,'1'):localStorage.removeItem(k)}catch(_){}
}
function applyCommon(r){
  if(!r||!ensure())return;
  if(Number.isFinite(Number(r.level)))s.level=Math.max(1,Number(r.level));
  if(Number.isFinite(Number(r.xp)))s.xp=Math.max(0,Number(r.xp));
  if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
  if(Number.isFinite(Number(r.harz)))s.harzTaler=Math.max(0,Number(r.harz));
  if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));
  if(Array.isArray(r.inventory))s.inventory=clone(r.inventory);
  if(Array.isArray(r.materials))s.materials=clone(r.materials);
  if(r.grow_seeds&&typeof r.grow_seeds==='object')s.grow.seeds=clone(r.grow_seeds);
  if(Number.isFinite(Number(r.time_seeds)))s.timeSeeds=Math.max(0,Number(r.time_seeds));
}
function paintDailyLight(){
  try{window.v069SyncCurrencies?.()}catch(_){}
  try{window.v441PaintResources?.()}catch(_){}
  try{window.v446PaintCombatPower?.()}catch(_){}
}
function scheduleDailyHeavy(needsInventory=false){
  if(!needsInventory)return;
  const run=()=>{try{renderInventory?.()}catch(_){}};
  try{if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:900});else setTimeout(run,180)}catch(_){setTimeout(run,180)}
}
function applyDaily(r,{openIfDue=false,keepOverlay=false,paint=true,heavy=true}={}){
  if(!r||r.ok!==true||!ensure())return false;
  const z=s.v484DailyLogin;
  z.streak=Math.max(0,Math.min(7,Number(r.streak)||0));
  z.totalClaims=Math.max(z.streak,Number(r.totalClaims)||0);
  z.lastClaimKey=String(r.lastClaimKey||'');
  z.lastClaimOrd=dayOrd(z.lastClaimKey);
  z.cycleRewards=r.cycleRewards&&typeof r.cycleRewards==='object'?clone(r.cycleRewards):{};
  applyCommon(r);
  const today=berlinKey();
  if(r.due===true)setLock(today,false);
  else if(z.lastClaimKey===today)setLock(today,true);
  /* V7.199: Daily Login is server-authoritative. Do not block the claim animation
     by serializing the complete legacy save back into localStorage. */
  D.dailyReady=true;

  if(r.due!==true&&!keepOverlay){
    document.getElementById('v484DailyLogin')?.classList.remove('show');
  }else if(r.due===true&&openIfDue&&dailyShownKey!==today){
    dailyShownKey=today;
    setTimeout(()=>{try{window.v484OpenDailyLogin?.()}catch(_){}},80);
  }
  if(paint)paintDailyLight();
  if(heavy)scheduleDailyHeavy(Array.isArray(r.inventory));
  return true;
}
async function refreshDaily(openIfDue=false){
  if(!window.v7081UseAuthority?.('daily')){D.dailyReady=false;return null;}
  if(dailyP)return dailyP;
  dailyP=(async()=>{
    try{
      const r=await rpc('v7073_daily_login_state');
      if(!r?.ok)throw new Error(String(r?.reason||'DAILY_STATE_FAILED'));
      applyDaily(r,{openIfDue});D.lastError='';return r;
    }catch(e){
      D.dailyReady=false;D.lastError=String(e?.message||e);console.warn('[V7073] daily refresh',e);return null;
    }finally{dailyP=null}
  })();
  return dailyP;
}
function dailyDetail(reward){
  if(!reward)return 'Belohnung serverseitig gebucht.';
  const a=Math.max(0,Number(reward.amount)||0);
  if(reward.type==='gold')return `+${a.toLocaleString('de-DE')} Gold`;
  if(reward.type==='xp')return `+${a.toLocaleString('de-DE')} EXP`;
  if(reward.type==='harz')return `+${a} Harz-Taler`;
  if(reward.type==='time')return `+${a} Zeit-Samen`;
  if(reward.type==='seed')return `+${a} ${reward.seed||'Grow-Samen'}`;
  if(reward.type==='item')return reward.item?.name||'Episches Item';
  return String(reward.title||'Belohnung erhalten');
}
function setDailyClaimUiBusy(on,text='Belohnung wird abgeholt …'){
  const day=document.querySelector('#v484DailyLogin .v484-day.current');if(!day)return;
  const sub=day.querySelector('.v484-day-sub');
  if(on){
    if(sub&&!day.dataset.v7073Sub)day.dataset.v7073Sub=sub.textContent||'';
    day.classList.add('server-busy');day.setAttribute('aria-busy','true');
    if(sub)sub.textContent=text;
  }else{
    day.classList.remove('server-busy');day.removeAttribute('aria-busy');
    if(sub&&day.dataset.v7073Sub)sub.textContent=day.dataset.v7073Sub;
    delete day.dataset.v7073Sub;
  }
}
function settleDailyCard(reward){
  const day=document.querySelector('#v484DailyLogin .v484-day.current');if(!day)return;
  const icon=String(reward?.icon||reward?.item?.icon||'✅');
  const title=String(reward?.item?.name||reward?.title||'Abgeholt');
  day.classList.remove('current','server-busy');day.classList.add('claimed');
  day.removeAttribute('role');day.removeAttribute('tabindex');day.removeAttribute('aria-busy');
  day.style.pointerEvents='none';
  const wrap=day.querySelector('.v484-gift-wrap');if(wrap)wrap.innerHTML=`<div class="v484-claimed-icon">${icon}</div>`;
  const ttl=day.querySelector('.v484-day-title');if(ttl)ttl.textContent=title;
  const sub=day.querySelector('.v484-day-sub');if(sub)sub.textContent='Abgeholt ✓';
}
function revealDaily(reward){
  const ov=document.getElementById('v484DailyLogin');
  if(!ov)return;
  settleDailyCard(reward);
  const reveal=document.getElementById('v484Reveal'),close=document.getElementById('v484Close');
  if(reveal){
    const icon=String(reward?.icon||reward?.item?.icon||'🎁');
    const title=String(reward?.item?.name||reward?.title||'Login-Bonus erhalten');
    const detail=dailyDetail(reward);
    reveal.innerHTML=`<div class="ico">${icon}</div><h3>${title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</h3><p>${detail.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</p>`;
    reveal.classList.add('show');
  }
  close?.classList.add('show');
  ov.classList.add('show');
  try{reveal?.scrollIntoView?.({block:'nearest',behavior:'smooth'})}catch(_){}
}
async function claimDaily(){
  return serial(async()=>{
    if(D.busyDaily){D.duplicateDailyTaps=(Number(D.duplicateDailyTaps)||0)+1;return null}
    D.busyDaily=true;setDailyClaimUiBusy(true);
    const t0=performance.now();
    try{
      const r=await Promise.race([
        rpc('v7073_claim_daily_login'),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('DAILY_CLAIM_TIMEOUT')),9000))
      ]);
      D.lastDailyRpcMs=Math.round((performance.now()-t0)*10)/10;
      if(!r?.ok){
        if(r?.reason==='ALREADY_CLAIMED'){
          /* The server already gives us the canonical streak fields. Do not launch a
             second RPC just to close a stale client card. */
          const canonical={...r,ok:true,due:false};
          applyDaily(canonical,{openIfDue:false,keepOverlay:true,paint:false,heavy:false});
          revealDaily({icon:'✅',title:'Heute bereits abgeholt',amount:0});
          paintDailyLight();
          return r;
        }
        throw new Error(String(r?.reason||'DAILY_CLAIM_FAILED'));
      }
      const snap=r.snapshot?.ok?r.snapshot:r;
      const ta=performance.now();
      applyDaily(snap,{openIfDue:false,keepOverlay:true,paint:false,heavy:false});
      setLock(berlinKey(),true);
      /* Paint the reward first. Expensive inventory work happens afterwards while idle. */
      revealDaily(r.reward);
      paintDailyLight();
      scheduleDailyHeavy(Array.isArray(snap?.inventory)||r.reward?.type==='item');
      D.lastDailyApplyMs=Math.round((performance.now()-ta)*10)/10;
      D.dailyClaims++;
      try{window.v106CheckAchievements?.(true)}catch(_){}
      toast('🎁 Login-Bonus erhalten','success',dailyDetail(r.reward));
      return r;
    }catch(e){
      D.lastError=String(e?.message||e);
      setDailyClaimUiBusy(false);
      document.getElementById('v484DailyLogin')?.classList.remove('show');
      toast('Login-Bonus später erneut verfügbar','warn','Die Spielwelt bleibt geöffnet.');
      setTimeout(()=>void refreshDaily(false),1200);
      return null;
    }finally{D.busyDaily=false}
  });
}

function applyEndgame(r,{paint=true}={}){
  if(!r||r.ok!==true||!ensure())return false;
  const st=r.state;
  if(st&&typeof st==='object'){
    s.v457Endgame={
      progress:clone(st.progress||{}),
      completed:Array.isArray(st.completed)?clone(st.completed):[],
      selected:Math.max(0,Math.min(8,Number(st.selected)||0)),
      wins:Math.max(0,Number(st.wins)||0),
      bossWins:Math.max(0,Number(st.boss_wins)||0)
    };
  }
  applyCommon(r);
  saveLocal();
  D.endgameReady=true;
  if(paint){
    try{window.v069SyncCurrencies?.()}catch(_){}
    try{renderInventory?.()}catch(_){}
    try{window.v441PaintResources?.()}catch(_){}
    try{window.renderEndgame?.()}catch(_){}
  }
  return true;
}
async function refreshEndgame(paint=true){
  if(!window.v7081UseAuthority?.('endgame')){D.endgameReady=false;return null;}
  if(endgameP)return endgameP;
  endgameP=(async()=>{
    try{
      const r=await rpc('v7073_endgame_state');
      if(!r?.ok)throw new Error(String(r?.reason||'ENDGAME_STATE_FAILED'));
      applyEndgame(r,{paint});D.lastError='';return r;
    }catch(e){
      D.endgameReady=false;D.lastError=String(e?.message||e);console.warn('[V7073] endgame refresh',e);return null;
    }finally{endgameP=null}
  })();
  return endgameP;
}
function endgameReason(r){
  const x=String(r?.reason||'SERVER_REJECTED');
  const map={
    DUNGEON_20_REQUIRED:'Schließe zuerst Dungeon 20 ab.',
    LEVEL_TOO_LOW:`Benötigtes Level: ${Number(r?.required_level)||211}.`,
    PREVIOUS_RIFT_REQUIRED:'Der vorherige Nebelriss muss zuerst abgeschlossen werden.',
    RIFT_COMPLETED:'Dieser Nebelriss ist bereits abgeschlossen.',
    INVALID_RIFT:'Ungültiger Nebelriss.'
  };
  return map[x]||x;
}
function bars(p,e,p0,e0){
  try{
    const pb=document.getElementById('v457PlayerBar'),eb=document.getElementById('v457EnemyBar');
    const pt=document.getElementById('v457PlayerText'),et=document.getElementById('v457EnemyText');
    if(pb)pb.style.width=`${Math.max(0,Math.min(100,p/Math.max(1,p0)*100))}%`;
    if(eb)eb.style.width=`${Math.max(0,Math.min(100,e/Math.max(1,e0)*100))}%`;
    if(pt)pt.textContent=`${Math.max(0,Math.round(p))} HP`;
    if(et)et.textContent=`${Math.max(0,Math.round(e))} HP`;
  }catch(_){}
}
async function animateEndgame(r){
  const f=r?.fight||{};
  const replay=Array.isArray(f.replay)?f.replay:[];
  let p0=Math.max(1,Number(f.player_hp_start||f.playerHpStart||f.max_hp||1));
  let e0=Math.max(1,Number(f.enemy_hp_start||f.enemyHpStart||r?.enemy?.hp||1));
  let p=p0,e=e0,lines=[];
  const btn=document.getElementById('v457Fight');if(btn)btn.disabled=true;
  bars(p,e,p0,e0);

  for(const ev of replay){
    const side=String(ev?.side||'');
    if(Number.isFinite(Number(ev?.player_hp)))p=Math.max(0,Number(ev.player_hp));
    if(Number.isFinite(Number(ev?.enemy_hp)))e=Math.max(0,Number(ev.enemy_hp));
    const dmg=Math.max(0,Number(ev?.damage)||0);
    if(side==='player'){
      lines.push(`${ev?.crit?'💥 KRIT!':'⚔️ Du'} verursachst ${dmg} Schaden.`);
      try{window.v6111Sfx?.(ev?.crit?'crit':'hit')}catch(_){}
    }else{
      lines.push(dmg===0?'🌫️ Angriff ausgewichen.':`🌌 Gegner verursacht ${dmg} Schaden.`);
      try{window.v6111Sfx?.(dmg?'enemyHit':'dodge')}catch(_){}
    }
    bars(p,e,p0,e0);
    const log=document.getElementById('v457Log');if(log)log.textContent=lines.slice(-7).join('\n');
    await sleep(90);
  }
}
async function runEndgame(){
  return serial(async()=>{
    if(D.busyEndgame)return null;
    D.busyEndgame=true;
    const btn=document.getElementById('v457Fight');if(btn)btn.disabled=true;
    try{
      if(!ensure())throw new Error('STATE_NOT_READY');
      const ri=Math.max(0,Math.min(8,Number(s.v457Endgame?.selected)||0));
      const r=await rpc('v7073_run_endgame',{p_rift:ri});
      if(!r?.ok){
        if(r?.snapshot?.ok)applyEndgame(r.snapshot,{paint:true});
        toast('Nebelriss','warn',endgameReason(r));
        return r;
      }
      await animateEndgame(r);
      if(r.snapshot?.ok)applyEndgame(r.snapshot,{paint:false});
      else if(r.state)applyEndgame({...r,state:r.state},{paint:false});
      D.endgameFights++;

      const reward=document.getElementById('v457Reward');
      if(r.won){
        const parts=[`🏆 Sieg · +${Math.max(0,Number(r.xp_awarded)||0).toLocaleString('de-DE')} XP · +${Math.max(0,Number(r.gold_awarded)||0).toLocaleString('de-DE')} Gold`];
        if(Number(r.harz_awarded)>0)parts.push(`+${Number(r.harz_awarded)} 🟢 Harz-Taler`);
        if(r.item?.name)parts.push(`🎁 ${r.item.name}`);
        if(reward)reward.innerHTML=`<div class="v457-reward">${parts.join('<br>')}</div>`;
        toast('🌌 Nebelriss gewonnen','success',r.item?.name||'Belohnungen serverseitig gebucht.');
      }else{
        if(reward)reward.innerHTML='<div class="v457-reward">💀 Niederlage · keine Belohnung verloren.</div>';
      }
      setTimeout(()=>{try{window.renderEndgame?.()}catch(_){}},900);
      return r;
    }catch(e){
      D.lastError=String(e?.message||e);
      toast('Nebelriss-Server nicht erreichbar','error',D.lastError);
      await refreshEndgame(true);
      return null;
    }finally{
      D.busyEndgame=false;
      if(btn)btn.disabled=false;
    }
  });
}
async function openEndgame(){
  try{v032Go?.('endgame');setTimeout(()=>window.renderEndgame?.(),0)}catch(e){console.warn('[V7073] open endgame',e)}
  void refreshEndgame(false);
}

/* Fail closed before historical local reward handlers. */
window.addEventListener('click',e=>{
  if(!(window.v7081UseAuthority?.('daily')||window.v7081UseAuthority?.('endgame')))return;
  const t=e.target instanceof Element?e.target:null;if(!t)return;

  const day=t.closest('#v484DailyLogin .v484-day.current');
  if(day){stop(e);void claimDaily();return}

  const nav=t.closest('[data-go="endgame"],[data-screen="endgame"]');
  if(nav&&!t.closest('#endgame')){stop(e);void openEndgame();return}

  const fight=t.closest('#endgame #v457Fight');
  if(fight){stop(e);if(!fight.disabled)void runEndgame();return}
},true);

window.addEventListener('keydown',e=>{
  if(!window.v7081UseAuthority?.('daily'))return;
  const t=e.target instanceof Element?e.target:null;
  if(!t||!t.closest('#v484DailyLogin .v484-day.current'))return;
  if(e.key==='Enter'||e.key===' '){stop(e);void claimDaily()}
},true);

/* Server is authoritative, so an old device-side lock may be cleared only when
   the server explicitly says today's reward is still due. */
async function boot(){
  if(!uid())return;
  const [daily]=await Promise.all([refreshDaily(false),refreshEndgame(false)]);
  if(daily?.due===true){
    setTimeout(()=>{
      try{
        if(!uid()||window.__V200_AUTH_READY__!==true)return;
        const home=document.getElementById('world');
        if(home&&!home.classList.contains('active'))return;
        window.v484OpenDailyLogin?.();
      }catch(_){}
    },1600);
  }
}
window.addEventListener('growlegends:account-ready',()=>{const run=()=>void boot();if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(run,1100);else setTimeout(run,500)},{passive:true});
window.addEventListener('pageshow',()=>{if(window.v7204StartupQuiet?.())return;setTimeout(()=>void refreshDaily(false),1200)},{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&document.getElementById('endgame')?.classList.contains('active'))setTimeout(()=>void refreshEndgame(false),350);
},{passive:true});
setTimeout(()=>{try{if(typeof v073User!=='undefined'&&v073User?.id&&!window.v7204StartupQuiet?.())void boot()}catch(_){}},5600);

window.v7073DailyRefresh=()=>refreshDaily(false);
window.v7073EndgameRefresh=()=>refreshEndgame(true);
window.v7073AuthorityDiagnostics=()=>clone({version:VERSION,...D,uid:uid()});
})();
