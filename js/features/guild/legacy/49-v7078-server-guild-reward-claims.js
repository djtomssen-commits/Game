/* === v7078-server-guild-reward-claims === */
(()=>{
'use strict';
if(window.__V7078_SERVER_GUILD_REWARDS__)return;
window.__V7078_SERVER_GUILD_REWARDS__=true;

const VERSION='V7.091';
const G={bossClaims:0,warClaims:0,lastError:'',busy:false};
let chain=Promise.resolve();

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const stop=e=>{try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(_){}};
const fmt=v=>Math.max(0,Number(v)||0).toLocaleString('de-DE');
const toast=(title,type='info',detail='')=>{
  try{return window.v063Toast?.(title,type,detail)}
  catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}
};
function serial(fn){const run=()=>Promise.resolve().then(fn);chain=chain.then(run,run);return chain}

async function rpc(name,args={}){
  const x=db();
  if(!x||!uid())throw new Error('SERVER_NOT_READY');
  const {data,error}=await x.rpc(name,args);
  if(error)throw error;
  return one(data);
}

function applyProgress(p){
  if(!p||typeof s==='undefined'||!s)return;
  if(Number.isFinite(Number(p.level)))s.level=Math.max(1,Number(p.level));
  if(Number.isFinite(Number(p.xp)))s.xp=Math.max(0,Number(p.xp));
  if(Number.isFinite(Number(p.gold)))s.gold=Math.max(0,Number(p.gold));
  if(Number.isFinite(Number(p.harz)))s.harzTaler=Math.max(0,Number(p.harz));
  try{
    if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
    localStorage.setItem('grow_idle_save_v1',JSON.stringify(s));
  }catch(_){}
  try{window.v069SyncCurrencies?.()}catch(_){}
  try{window.v441PaintResources?.()}catch(_){}
  try{render?.()}catch(_){}
}

async function refreshGrow(){
  try{
    await window.v7064GrowAuthorityRefresh?.();
    await window.v7077ProgressRefresh?.();
  }catch(_){}
}
function seedLabel(id){
  const m={
    emerald:'Smaragd OG',
    gorilla:'Gorilla Glue',
    amnesia:'Amnesia Haze',
    greencrack:'Green Crack'
  };
  return m[String(id||'')]||String(id||'');
}

async function claimBoss(){
  return serial(async()=>{
    if(G.busy)return;
    G.busy=true;
    const btn=document.getElementById('v255ClaimBossReward');
    if(btn){btn.disabled=true;btn.textContent='Server bucht Belohnung …'}
    try{
      const r=await rpc('v255_claim_guild_boss_reward');
      if(!r?.ok)throw new Error(String(r?.reason||'GUILDBOSS_CLAIM_FAILED'));

      applyProgress(r.progress);
      await refreshGrow();

      G.bossClaims++;
      const seed=r.seed?` · 🌰 ${seedLabel(r.seed)}`:'';
      toast(
        r.won?'🏆 Gildenboss besiegt!':'Gildenboss-Belohnung',
        r.won?'success':'info',
        `+${fmt(r.xp)} EXP · +${fmt(r.gold)} Gold${Number(r.harz)>0?` · +${Number(r.harz)} Harz-Taler`:''}${seed}`
      );

      /* Weekly chest + Guild XP are database-triggered by reward_claimed.
         Only refresh local achievement checks; do not emit guildBossWon,
         otherwise historical client reward listeners would run again. */
      try{window.v106CheckAchievements?.(true)}catch(_){}
      try{await window.v254LoadGuild?.()}catch(_){}
      try{await window.v255LoadBoss?.()}catch(_){}
      return r;
    }catch(e){
      G.lastError=String(e?.message||e);
      toast('Gildenboss-Belohnung nicht verfügbar','warn',G.lastError);
      return null;
    }finally{
      G.busy=false;
      if(btn){btn.disabled=false;btn.textContent='🎁 Gildenboss-Belohnung abholen'}
    }
  });
}

async function claimWar(){
  return serial(async()=>{
    if(G.busy)return;
    G.busy=true;
    const btn=document.getElementById('v262WarClaim');
    if(btn){btn.disabled=true;btn.textContent='Server bucht Belohnung …'}
    try{
      const r=await rpc('v4159_claim_guild_war_reward');
      if(!r?.ok)throw new Error(String(r?.reason||'GUILDWAR_CLAIM_FAILED'));

      applyProgress(r.progress);
      await window.v7077ProgressRefresh?.();

      G.warClaims++;
      toast(
        '🎁 Gildenkrieg-Belohnung',
        'success',
        `+${fmt(r.gold)} Gold · +${fmt(r.xp)} EXP · +${Number(r.harz)||0} Harz-Taler`
      );
      try{await window.v262LoadWar?.()}catch(_){}
      return r;
    }catch(e){
      G.lastError=String(e?.message||e);
      toast('Gildenkrieg-Belohnung fehlgeschlagen','warn',G.lastError);
      return null;
    }finally{
      G.busy=false;
      if(btn){btn.disabled=false;btn.textContent='🎁 Belohnung abholen'}
    }
  });
}

/* Capture ahead of the historical handlers. The old code added the returned
   amounts locally and rolled its own Guildboss seed. Both are retired here:
   the RPC now books progress + Grow seed directly on the server. */
window.addEventListener('click',e=>{
  if(!window.v7081UseAuthority?.('guild_rewards'))return;
  const t=e.target instanceof Element?e.target:null;
  if(!t)return;

  const boss=t.closest('#v255ClaimBossReward');
  if(boss){
    stop(e);
    if(!boss.disabled)void claimBoss();
    return;
  }

  const war=t.closest('#v262WarClaim');
  if(war){
    stop(e);
    if(!war.disabled)void claimWar();
  }
},true);

window.v7078GuildRewardDiagnostics=()=>clone({
  version:VERSION,...G,uid:uid()
});
})();

