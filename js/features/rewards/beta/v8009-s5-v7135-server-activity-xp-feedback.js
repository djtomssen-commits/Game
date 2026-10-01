(()=>{
'use strict';
if(window.__V7135_ACTIVITY_FEEDBACK__)return;
window.__V7135_ACTIVITY_FEEDBACK__=true;
window.__V7135_ACTIVITY_FEEDBACK_SERVER__=true;
const S={ready:false,busy:false,weeklyCursor:0,guildCursor:0,lastError:'',polls:0,toasts:0,lastWeekly:0,lastGuild:0};
let timer=0,busInstalled=false;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const user=()=>{try{return (typeof v073User!=='undefined'&&v073User)||null}catch(_){return null}};
const n=v=>Math.max(0,Math.floor(Number(v)||0));
function toast(title,type,detail){try{if(typeof v063Toast==='function')v063Toast(title,type,detail)}catch(_){}}
function label(type){return ({quest:'Quest',dungeon:'Dungeon',pvp:'PvP-Sieg',grow:'Ernte',grow_order:'Grow-Auftrag',worldboss:'Weltboss',guildboss:'Gildenboss',tower:'Turm',pvp_win:'PvP-Sieg',guild_boss:'Gildenboss'})[String(type||'')]||'Aktivität'}
function updateConfirmedState(r){
 try{
  if(r&&Number.isFinite(Number(r.weekly_xp))&&typeof s!=='undefined'&&s){
   s.v6239WeeklyChest=(s.v6239WeeklyChest&&typeof s.v6239WeeklyChest==='object')?s.v6239WeeklyChest:{};
   s.v6239WeeklyChest.xp=n(r.weekly_xp);
   if(document.querySelector('#world')?.classList.contains('active'))requestAnimationFrame(()=>{try{window.v085InstallWorld?.(false)}catch(_){}});
  }
  if(r&&r.guild_xp!=null&&typeof v254Guild!=='undefined'&&v254Guild){
   v254Guild.guild_xp=n(r.guild_xp);
   if(document.querySelector('#guild')?.classList.contains('active'))requestAnimationFrame(()=>{try{window.v254RenderGuild?.()}catch(_){}});
  }
 }catch(_){}
}
async function sync(show=true){
 if(S.busy)return false;
 const d=db(),u=user();if(!d||!u||u.is_anonymous)return false;
 S.busy=true;S.polls++;
 try{
  const args=S.ready?{p_weekly_after:S.weeklyCursor,p_guild_after:S.guildCursor}:{p_weekly_after:null,p_guild_after:null};
  const {data,error}=await d.rpc('v7135_activity_feedback',args);
  if(error)throw error;
  const r=Array.isArray(data)?data[0]:data;if(!r?.ok)return false;
  const wasReady=S.ready;
  S.weeklyCursor=n(r.weekly_cursor);S.guildCursor=n(r.guild_cursor);S.ready=true;S.lastError='';
  updateConfirmedState(r);
  if(!wasReady||!show)return true;
  const wr=Array.isArray(r.weekly_events)?r.weekly_events:[];
  const gr=Array.isArray(r.guild_events)?r.guild_events:[];
  try{window.dispatchEvent(new CustomEvent('growlegends:guild-xp-feedback',{detail:{weeklyEvents:wr,guildEvents:gr,guildId:r.guild_id||null,guildXp:n(r.guild_xp),weeklyXp:n(r.weekly_xp),at:Date.now()}}))}catch(_){}
  const weekly=wr.reduce((a,x)=>a+n(x?.applied_xp),0);
  const guild=gr.reduce((a,x)=>a+n(x?.awarded),0);
  if(weekly<=0&&guild<=0)return true;
  S.lastWeekly=weekly;S.lastGuild=guild;
  /* V7.308: reward feedback is rendered inside the activity reward window.
     Do not create an additional bottom toast. */
  return true;
 }catch(e){S.lastError=String(e?.message||e);console.warn('[V7.136] activity feedback',e);return false}
 finally{S.busy=false}
}
function schedule(ms=650){clearTimeout(timer);timer=setTimeout(()=>void sync(true),Math.max(80,ms))}
function scheduleRetry(){schedule(650);setTimeout(()=>void sync(true),2200)}
function installBus(){
 const b=window.GL_EVENTS;if(!b||typeof b.on!=='function'||busInstalled)return false;
 busInstalled=true;
 ['questCompleted','dungeonWon','pvpWon','growHarvested','guildBossWon'].forEach(k=>b.on(k,()=>scheduleRetry()));
 return true;
}
/* Server actions without a central gameplay event yet. */
document.addEventListener('click',e=>{
 try{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  if(t.closest('[data-v6160-claim],[data-vt-route],#v110Fight'))scheduleRetry();
 }catch(_){}
},true);
window.addEventListener('growlegends:account-ready',()=>{const run=()=>void sync(false);if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(run,1200);else setTimeout(run,550)},{passive:true});
window.addEventListener('pageshow',()=>{if(window.v7204StartupQuiet?.())return;setTimeout(()=>void sync(false),850)},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!window.v7204StartupQuiet?.())setTimeout(()=>void sync(false),500)},{passive:true});
if(!installBus()){let tries=0;const bt=setInterval(()=>{tries++;if(installBus()||tries>30)clearInterval(bt)},400)}
setTimeout(()=>{if(!window.v7204StartupQuiet?.())void sync(false)},5600);
window.v7135ActivityFeedbackRefresh=()=>sync(true);
window.v7135ActivityFeedbackDiagnostics=()=>({...S,version:String(window.GROW_LEGENDS_VERSION?.short||'V7.136'),serverConfirmed:true});
})();
