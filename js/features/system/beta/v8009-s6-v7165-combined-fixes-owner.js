(()=>{
'use strict';
if(window.__V7165_COMBINED_FIXES__)return;
window.__V7165_COMBINED_FIXES__=true;
const VERSION='V7.165';
const n=v=>Math.max(0,Math.floor(Number(v)||0));
const norm=k=>({pvp:'pvp_win',pvp_win:'pvp_win',guildboss:'guild_boss',guild_boss:'guild_boss'})[String(k||'')]||String(k||'');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Guild XP: current triggers are the writer; client only presents confirmed ledger rows. ---------- */
function rewardHost(kind){
 kind=norm(kind);
 if(kind==='quest')return document.querySelector('#v231QuestRewardExtra .v7136-reward-list')||document.querySelector('#v231QuestRewardExtra');
 if(kind==='dungeon')return document.querySelector('#v247DungeonRewardExtra .v7136-reward-list')||document.querySelector('#v247DungeonRewardExtra');
 if(kind==='pvp_win')return document.querySelector('#v211PvpResultCard');
 return null;
}
function pending(kind,sourceRef,host=null){
 kind=norm(kind);host=host||rewardHost(kind);if(!host)return null;
 let line=host.querySelector?.('.v7165-guild-reward-line');
 if(!line){line=document.createElement('div');line.className='v7165-guild-reward-line pending';
   if(kind==='pvp_win'){const btn=host.querySelector('#v211PvpResultConfirm');if(btn)host.insertBefore(line,btn);else host.appendChild(line)}
   else host.appendChild(line);
 }
 line.dataset.guildKind=kind;line.dataset.guildSource=String(sourceRef||'');
 line.className='v7165-guild-reward-line pending';line.textContent='🏰 Gilden-EP werden serverseitig geprüft …';
 setTimeout(()=>void lookupGuildLine(line,0),70);
 return line;
}
async function lookupGuildLine(line,attempt=0){
 try{
  if(!line?.isConnected||typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User?.id)return;
  const kind=norm(line.dataset.guildKind),source=String(line.dataset.guildSource||'');
  const {data,error}=await v073Db.rpc('v7165_guild_activity_result',{p_kind:kind,p_source_ref:source||null});
  if(error)throw error;const r=Array.isArray(data)?data[0]:data;if(!r?.ok)return;
  if(r.guild_id==null){line.className='v7165-guild-reward-line zero';line.textContent='🏰 0 Gilden-EP · keine aktive Gilde';return}
  if(r.found){const awarded=n(r.awarded),daily=n(r.daily_total);line.className='v7165-guild-reward-line'+(awarded>0?'':' zero');line.textContent=awarded>0?`🏰 +${awarded} Gilden-EP · heute ${daily}/625`:`🏰 0 Gilden-EP · Aktivitäts-/Tageslimit erreicht · heute ${daily}/625`;return}
  if(attempt<3){setTimeout(()=>void lookupGuildLine(line,attempt+1),260+attempt*420);return}
  line.className='v7165-guild-reward-line zero';line.textContent='🏰 Keine Gilden-EP für diese Aktivität verbucht';
 }catch(e){if(attempt<2)setTimeout(()=>void lookupGuildLine(line,attempt+1),500+attempt*500);else console.warn('[V7.165] guild reward lookup',e)}
}
function applyFeedback(detail={}){
 const events=Array.isArray(detail.guildEvents)?detail.guildEvents:[];
 document.querySelectorAll('.v7165-guild-reward-line').forEach(line=>{
   const kind=norm(line.dataset.guildKind),source=String(line.dataset.guildSource||'');
   let matches=events.filter(e=>norm(e?.kind)===kind);
   if(source){const exact=matches.filter(e=>String(e?.source_ref||'')===source);if(exact.length)matches=exact}
   if(matches.length){
     const awarded=matches.reduce((a,e)=>a+n(e?.awarded),0);
     line.className='v7165-guild-reward-line'+(awarded>0?'':' zero');
     line.textContent=awarded>0?`🏰 +${awarded} Gilden-EP`:'🏰 0 Gilden-EP · Aktivitäts-/Tageslimit erreicht';
   }else if(detail.guildId==null){
     line.className='v7165-guild-reward-line zero';line.textContent='🏰 0 Gilden-EP · keine aktive Gilde';
   }
 });
}
window.addEventListener('growlegends:guild-xp-feedback',e=>applyFeedback(e?.detail||{}),{passive:true});
function refreshFeedback(){
 [180,750,1900].forEach(ms=>setTimeout(()=>{try{void window.v7135ActivityFeedbackRefresh?.()}catch(_){}},ms));
}
window.v7165GuildRewardPending=(kind,sourceRef,host)=>{const x=pending(kind,sourceRef,host);refreshFeedback();return x};

/* Retire old client award calls. They used v411_add_guild_activity, which is a compatibility readback
   and always returns zero. The canonical DB triggers own quest/dungeon/PvP/guild-boss awards. */
window.v474AwardGuildActivity=async(kind)=>{refreshFeedback();return{ok:true,serverAuthoritative:true,kind:norm(kind)}};
window.v473AwardDungeonGuildXp=async data=>{
 const rid=Number(data?.run_id)||0;pending('dungeon',rid?`dungeon:${rid}`:'');refreshFeedback();
 return{ok:true,serverAuthoritative:true};
};

/* Complete reward surfaces: append a server-confirmed Guild-XP row for every eligible result. */
const baseReward=window.v7136ShowServerReward;
if(typeof baseReward==='function'&&!baseReward.__v7165){
 const wrapped=function(kind,bundle,ctx={}){
   const r=baseReward.apply(this,arguments);
   const k=norm(kind),id=Number(bundle?.run_id)||0;
   if(k==='quest'||k==='dungeon')pending(k,id?`${k}:${id}`:'');
   if(k==='quest'||k==='dungeon')refreshFeedback();
   return r;
 };
 wrapped.__v7165=true;wrapped.__base=baseReward;window.v7136ShowServerReward=wrapped;
}

/* PvP uses its own result modal, so put the same Guild-XP row there on wins. */
try{
 const basePvp=window.v211ShowResult||((typeof v211ShowResult==='function')?v211ShowResult:null);
 if(typeof basePvp==='function'&&!basePvp.__v7165){
  const pvpWrap=function(win){const r=basePvp.apply(this,arguments);if(win){pending('pvp_win','');refreshFeedback()}else document.querySelector('#v211PvpResultCard .v7165-guild-reward-line')?.remove();return r};
  pvpWrap.__v7165=true;pvpWrap.__base=basePvp;window.v211ShowResult=pvpWrap;try{v211ShowResult=pvpWrap}catch(_){}
 }
}catch(_){ }

/* Guild-boss rewards are trigger-owned too. Refresh feedback after the server claim. */
window.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('#v255ClaimBossReward'))refreshFeedback()},true);

/* ---------- Guild boss: keep yesterday's resolved replay/reward accessible before today's round. ---------- */
let previousResult=false;
const baseVisible=window.v4118VisibleBossParticipants||((typeof v4118VisibleBossParticipants==='function')?v4118VisibleBossParticipants:null);
if(typeof baseVisible==='function'){
 const visible=function(){if(previousResult)return Array.isArray(v255BossParticipants)?v255BossParticipants.filter(Boolean):[];return baseVisible.apply(this,arguments)};
 window.v4118VisibleBossParticipants=visible;try{v4118VisibleBossParticipants=visible}catch(_){}
}
async function fetchPreviousBoss(){
 try{
  if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User?.id)return null;
  const {data,error}=await v073Db.rpc('v7165_get_last_guild_boss_result');if(error)throw error;
  const r=Array.isArray(data)?data[0]:data;return r?.ok?r:null;
 }catch(e){console.warn('[V7.165] previous guild boss',e);return null}
}
function historyNote(){
 const panel=document.getElementById('v254GuildBoss');if(!panel)return;
 let el=document.getElementById('v7165BossHistoryNote');
 if(!previousResult){el?.remove();return}
 if(!el){el=document.createElement('div');el.id='v7165BossHistoryNote';const live=document.getElementById('v255BossLive');(live||panel.firstElementChild)?.insertAdjacentElement?.('beforebegin',el);if(!el.isConnected)panel.prepend(el)}
 const d=String(v255BossRound?.battle_date||'');let label=d;try{label=d?new Date(d+'T12:00:00').toLocaleDateString('de-DE'):''}catch(_){}
 el.textContent=`🕘 Letzter abgeschlossener Gildenboss${label?' · '+label:''} · Replay und offene Belohnung bleiben verfügbar`;
}
const baseBossLoad=window.v255LoadBoss||((typeof v255LoadBoss==='function')?v255LoadBoss:null);
if(typeof baseBossLoad==='function'&&!baseBossLoad.__v7165){
 const bossLoad=async function(){
   const r=await baseBossLoad.apply(this,arguments);
   previousResult=false;historyNote();
   if(typeof v255BossRound!=='undefined'&&v255BossRound)return r;
   const prev=await fetchPreviousBoss();
   if(prev?.round){
     previousResult=true;
     try{v255BossRound=prev.round;v255BossParticipants=Array.isArray(prev.participants)?prev.participants:[]}catch(_){}
     try{window.v255BossRound=v255BossRound;window.v255BossParticipants=v255BossParticipants}catch(_){}
     try{v255RenderBoss?.()}catch(_){}try{v260RenderDailyControls?.()}catch(_){}historyNote();
   }
   return r;
 };
 bossLoad.__v7165=true;bossLoad.__base=baseBossLoad;window.v255LoadBoss=bossLoad;try{v255LoadBoss=bossLoad}catch(_){}
}
document.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('[data-v254-tab="boss"]'))setTimeout(()=>{try{void window.v255LoadBoss?.()}catch(_){}},30)},true);

/* Final release marker. */
const V=Object.freeze({short:VERSION,label:VERSION+' Stable',number:'7.165'});
window.GROW_LEGENDS_VERSION=V;window.__GROW_LEGENDS_RELEASE__=VERSION;window.__GL_CURRENT_BUILD__=VERSION;
const paintVersion=()=>{try{document.querySelectorAll('.version,.v372-logo em,.v371-logo em,.v366-ver').forEach(el=>{if(el?.tagName!=='STYLE')el.textContent=VERSION})}catch(_){}};
paintVersion();window.addEventListener('growlegends:account-ready',paintVersion,{passive:true});
window.__V7165_FIX_DIAGNOSTICS__=()=>({version:VERSION,guildXpServerTriggers:true,dungeonGuildXpTrigger:'player_dungeon_runs',legacyGuildRpcRetired:true,classsetLegacyServerCompat:true,materialQualityServerFix:true,guildBossPreviousReplay:true,characterScrollFixPreserved:true});
})();
