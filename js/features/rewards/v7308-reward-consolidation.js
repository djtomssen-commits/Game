(()=>{
'use strict';
if(window.__V7308_REWARD_CONSOLIDATION__)return;
window.__V7308_REWARD_CONSOLIDATION__=true;

const A={last:Object.create(null),prepared:Object.create(null)};
const n=v=>Math.max(0,Math.floor(Number(v)||0));
const now=()=>Date.now();
const fresh=x=>x&&now()-Number(x.at||0)<15000;

function normWeekly(type){
  type=String(type||'').toLowerCase();
  if(type==='quest')return 'quest';
  if(type==='dungeon')return 'dungeon';
  if(type==='pvp')return 'pvp';
  if(type==='tower')return 'tower';
  return '';
}
function normGuild(type){
  type=String(type||'').toLowerCase();
  if(type==='quest')return 'quest';
  if(type==='dungeon')return 'dungeon';
  if(type==='pvp_win'||type==='pvp')return 'pvp';
  if(type==='tower')return 'tower';
  return '';
}

function host(kind){
  if(kind==='quest'){
    return document.querySelector('#v231QuestRewardExtra .v7136-reward-list')
      ||document.querySelector('#v231QuestRewardExtra');
  }
  if(kind==='dungeon'){
    return document.querySelector('#v247DungeonRewardExtra .v7136-reward-list')
      ||document.querySelector('#v247DungeonRewardExtra');
  }
  if(kind==='pvp')return document.querySelector('#v211PvpResultCard');
  if(kind==='tower')return document.querySelector('#tower .v7308-activity-reward[data-v7308-kind="tower"]');
  return null;
}

function ensureWeekly(kind){
  const h=host(kind);if(!h)return null;
  let line=h.querySelector?.('.v7308-weekly-line');
  if(line)return line;
  line=document.createElement('div');
  line.className='v7308-weekly-line pending';
  line.dataset.v7308Kind=kind;
  line.textContent='⭐ Wochen-Truhen-EP werden geprüft …';

  if(kind==='pvp'){
    let wrap=h.querySelector('.v7308-activity-reward[data-v7308-kind="pvp"]');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='v7308-activity-reward';
      wrap.dataset.v7308Kind='pvp';
      const guild=h.querySelector('.v7165-guild-reward-line');
      const btn=h.querySelector('#v211PvpResultConfirm');
      h.insertBefore(wrap,guild||btn||null);
    }
    wrap.appendChild(line);
  }else{
    h.appendChild(line);
  }
  return line;
}

function guildLine(kind){
  const h=host(kind);if(!h)return null;
  if(kind==='tower')return h.querySelector('.v7308-guild-line');
  return h.querySelector('.v7165-guild-reward-line')||h.querySelector('.v7308-guild-line');
}

function apply(kind,data){
  if(!data)return;
  const w=ensureWeekly(kind);
  if(w){
    const gain=n(data.weekly);
    const total=n(data.weeklyXp);
    w.className='v7308-weekly-line'+(gain>0?'':' zero');
    w.textContent=gain>0
      ?`⭐ +${gain} Wochen-Truhen-EP · Stand ${total}/1.700`
      :`⭐ 0 Wochen-Truhen-EP · Stand ${total}/1.700`;
  }

  if(kind==='tower')return; // Tower currently has no Guild-EP economy.

  let g=guildLine(kind);
  const h=host(kind);
  if(!g&&h){
    g=document.createElement('div');
    g.className='v7308-guild-line';
    const btn=kind==='pvp'?h.querySelector('#v211PvpResultConfirm'):null;
    if(btn)h.insertBefore(g,btn);else h.appendChild(g);
  }
  if(g){
    const gain=n(data.guild);
    const hasGuild=data.guildId!=null;
    g.className=(g.classList.contains('v7165-guild-reward-line')?'v7165-guild-reward-line':'v7308-guild-line')+(gain>0?'':' zero');
    if(gain>0){
      g.textContent=`🏰 +${gain} Gilden-EP`;
    }else if(!hasGuild){
      g.textContent='🏰 0 Gilden-EP · keine aktive Gilde';
    }else{
      g.textContent='🏰 0 Gilden-EP · Aktivitäts-/Tageslimit erreicht';
    }
  }
}

function prepare(kind){
  kind=String(kind||'');
  if(!['quest','dungeon','pvp','tower'].includes(kind))return false;
  ensureWeekly(kind);
  if(kind==='tower'){
    const g=guildLine('tower');
    if(g)g.textContent='🏰 Gilden-EP · im Turm aktuell keine Vergabe';
  }
  const last=A.last[kind];
  if(fresh(last))apply(kind,last);
  [40,420,1200,2300].forEach(ms=>setTimeout(()=>{
    try{window.v7135ActivityFeedbackRefresh?.()}catch(_){}
  },ms));
  A.prepared[kind]=now();
  return true;
}
window.v7308PrepareReward=prepare;

window.addEventListener('growlegends:guild-xp-feedback',e=>{
  const d=e?.detail||{};
  const wr=Array.isArray(d.weeklyEvents)?d.weeklyEvents:[];
  const gr=Array.isArray(d.guildEvents)?d.guildEvents:[];

  const kinds=new Set;
  for(const ev of wr){const k=normWeekly(ev?.activity_type);if(k)kinds.add(k)}
  for(const ev of gr){const k=normGuild(ev?.kind);if(k)kinds.add(k)}

  for(const kind of kinds){
    const weekly=wr.filter(x=>normWeekly(x?.activity_type)===kind).reduce((a,x)=>a+n(x?.applied_xp),0);
    const guild=gr.filter(x=>normGuild(x?.kind)===kind).reduce((a,x)=>a+n(x?.awarded),0);
    const data={weekly,guild,weeklyXp:n(d.weeklyXp),guildXp:n(d.guildXp),guildId:d.guildId??null,at:now()};
    A.last[kind]=data;
    if(host(kind))apply(kind,data);
  }
},{passive:true});

/* Quest + Dungeon reward windows. v7165 is already inside the current wrapper,
   so its server-confirmed Guild-EP row remains and this adds the weekly row. */
try{
  const base=window.v7136ShowServerReward;
  if(typeof base==='function'&&!base.__v7308){
    const wrapped=function(kind,bundle,ctx={}){
      const r=base.apply(this,arguments);
      if(kind==='quest'||kind==='dungeon')setTimeout(()=>prepare(kind),0);
      return r;
    };
    wrapped.__v7308=true;wrapped.__base=base;window.v7136ShowServerReward=wrapped;
  }
}catch(e){console.warn('[V7.308] reward wrapper',e)}

/* PvP has its own result modal. Only wins receive weekly/guild activity XP. */
try{
  const base=window.v211ShowResult||((typeof v211ShowResult==='function')?v211ShowResult:null);
  if(typeof base==='function'&&!base.__v7308){
    const wrapped=function(win){
      const r=base.apply(this,arguments);
      if(win)setTimeout(()=>prepare('pvp'),0);
      else{
        document.querySelector('#v211PvpResultCard .v7308-activity-reward')?.remove();
      }
      return r;
    };
    wrapped.__v7308=true;wrapped.__base=base;
    window.v211ShowResult=wrapped;try{v211ShowResult=wrapped}catch(_){}
  }
}catch(e){console.warn('[V7.308] pvp reward wrapper',e)}

/* Last safety net: legacy reward-only success/info toasts must not leak underneath
   an already visible reward window. Errors and warnings are never suppressed. */
try{
  const base=window.v063Toast||((typeof v063Toast==='function')?v063Toast:null);
  if(typeof base==='function'&&!base.__v7308){
    const wrapped=function(title,type='info',detail=''){
      const t=String(type||'').toLowerCase();
      const all=`${String(title||'')} ${String(detail||'')}`;
      const rewardOpen=
        document.querySelector('#v231QuestReward.show')||
        document.querySelector('#v247DungeonReward.show')||
        document.querySelector('#v211PvpResultOverlay.show')||
        document.querySelector('#tower.active .v7308-activity-reward');
      const rewardOnly=/Truhen-EXP|Wochen-EP|Wochen-Truhen-EP|Gilden-EP/i.test(all);
      if(rewardOpen&&(t==='success'||t==='info')&&rewardOnly)return null;
      return base.apply(this,arguments);
    };
    wrapped.__v7308=true;wrapped.__base=base;
    window.v063Toast=wrapped;try{v063Toast=wrapped}catch(_){}
  }
}catch(e){console.warn('[V7.308] toast filter',e)}

window.v7308RewardDiagnostics=()=>({
  version:'V7.308',
  bottomActivityRewardToasts:false,
  rewardWindows:['quest','dungeon','pvp','tower'],
  cached:Object.fromEntries(Object.entries(A.last).map(([k,v])=>[k,{...v}]))
});
})();
