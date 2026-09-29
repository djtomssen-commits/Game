/* === v411-guild-xp-system === */
(function(){
 const VERSION='V4.29 Stable';
 /* Level 20 is deliberately a long-term guild goal. At the theoretical daily
    cap a full 20-member guild still needs about 144 days; normal play takes longer. */
 const THRESH=[0,500,1500,3500,7000,12500,20500,31500,46000,65000,90000,122000,162000,212000,275000,355000,460000,600000,900000,1800000];
 function xp(g){return Math.max(0,Math.floor(Number(g?.guild_xp)||0))}
 function level(g){const x=xp(g);let lv=1;for(let i=1;i<THRESH.length;i++){if(x>=THRESH[i])lv=i+1;else break}return Math.max(1,Math.min(20,lv))}
 function info(g){const x=xp(g),lv=level(g);if(lv>=20)return {lv,pct:100,text:`${x.toLocaleString('de-DE')} Gilden-EP · MAX`};const lo=THRESH[lv-1],hi=THRESH[lv],pct=Math.max(0,Math.min(100,Math.round((x-lo)/Math.max(1,hi-lo)*100)));return {lv,pct,text:`${x.toLocaleString('de-DE')} / ${hi.toLocaleString('de-DE')} Gilden-EP · noch ${(hi-x).toLocaleString('de-DE')} bis Level ${lv+1}`}}
 window.v411GuildLevel=level; window.v409GuildLevel=level; window.v410GuildLevel=level;
 function paintOwn(){if(!window.v254Guild)return;const head=document.querySelector('.v254-guild-head');if(!head)return;const z=info(v254Guild);let box=document.querySelector('.v409-guild-progress');if(!box){box=document.createElement('div');box.className='v409-guild-progress';head.insertAdjacentElement('afterend',box)}box.innerHTML=`<div class="v409-guild-progress-top"><span>🏰 GILDENFORTSCHRITT</span><b>Gildenlevel ${z.lv}</b></div><div class="v409-guild-progress-bar"><i style="width:${z.pct}%"></i></div><small class="v411-xp-note">${z.text}</small>`}
 async function award(kind){try{if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User||v073User.is_anonymous)return;if(typeof v254Membership==='undefined'||!v254Membership){const {data:mem,error:memError}=await v073Db.from('guild_members').select('guild_id,role,attack_signed,defense_signed,boss_signed,joined_at').eq('user_id',v073User.id).maybeSingle();if(memError||!mem)return;v254Membership=mem}const {data,error}=await v073Db.rpc('v411_add_guild_activity',{p_kind:kind});if(error){if(/v411_add_guild_activity|does not exist|schema cache/i.test(String(error.message||'')))console.warn('V4.11 Guild XP SQL fehlt');return}const r=Array.isArray(data)?data[0]:data;if(r&&Number(r.awarded)>0&&typeof v254Guild!=='undefined'&&v254Guild){v254Guild.guild_xp=Number(r.guild_xp)||xp(v254Guild);paintOwn()}}catch(e){console.warn('V4.36 guild activity',e)}}
 window.v411AwardGuildActivity=award;

 /* Quest: only after a canonical completed quest has actually cleared active. */
 if(!window.__V6140_EVENT_BUS__){
 if(typeof claimQuest==='function'){
   const base=claimQuest;claimQuest=function(){const q=s.quests?.active,ready=!!q&&Date.now()>=Number(q.ends||0);const r=base.apply(this,arguments);if(ready&&!s.quests?.active)void award('quest');return r};window.claimQuest=claimQuest;
 }
 /* Dungeon: award only if canonical dungeon-win counter increased. */
 if(typeof fightDungeon==='function'){
   const base=fightDungeon;fightDungeon=async function(){let before=0;try{before=typeof v336CanonicalDungeonWins==='function'?Number(v336CanonicalDungeonWins())||0:Number(s.v106Achievements?.stats?.dungeonWins)||0}catch(e){}const r=await base.apply(this,arguments);let after=before;try{after=typeof v336CanonicalDungeonWins==='function'?Number(v336CanonicalDungeonWins())||0:Number(s.v106Achievements?.stats?.dungeonWins)||0}catch(e){}if(after>before)void award('dungeon');return r};window.fightDungeon=fightDungeon;
 }
 /* PvP: existing server-confirmed finish path remains authoritative; only wins contribute. */
 if(typeof v209FinishBattle==='function'){
   const base=v209FinishBattle;v209FinishBattle=async function(win){const r=await base.apply(this,arguments);if(win)void award('pvp_win');return r};window.v209FinishBattle=v209FinishBattle;
 }
 }
 /* Boss reward is already server-authoritative. Detect successful claim by its can_claim transition. */
 /* V4.14: old guild-boss click/timer activity hook disabled; confirmed RPC path owns it. */

 /* Own guild render/load uses persisted guild_xp. */
 /* Guild cleanup Phase 1: V4.36 duplicate progress render wrapper retired. */

 /* Search: enrich existing search RPC rows with server guild_xp, then render. */
 if(typeof v257SearchGuilds==='function'){
  v257SearchGuilds=async function(){const box=document.querySelector('#v257GuildSearchResults');if(!box)return;if(!(await v254EnsureOnline())){box.innerHTML='<div class="v257-search-empty">Für die Gildensuche musst du eingeloggt sein.</div>';return}const q=String(document.querySelector('#v257GuildSearchInput')?.value||'').trim();box.innerHTML='<div class="v257-search-empty">Gilden werden gesucht …</div>';const {data,error}=await v073Db.rpc('v257_search_guilds',{p_query:q});if(error){box.innerHTML=`<div class="v257-search-empty">${v254GuildEsc(error.message||'Suche fehlgeschlagen')}</div>`;return}const rows=Array.isArray(data)?data:[];if(rows.length){try{const ids=rows.map(x=>x.id).filter(Boolean);const lr=await v073Db.rpc('v411_get_guild_levels',{p_ids:ids});if(!lr.error){const m=new Map((lr.data||[]).map(x=>[String(x.id),Number(x.guild_xp)||0]));rows.forEach(x=>x.guild_xp=m.get(String(x.id))||0)}}catch(e){}}
  box.innerHTML=rows.length?rows.map(g=>{const members=Number(g.member_count)||0,max=Number(g.max_members)||20,pending=!!g.request_pending,lv=level(g),locked=typeof v6124GuildLockActive==='function'&&v6124GuildLockActive();return `<div class="v257-guild-result"><div><b><span class="v257-result-tag">[${v254GuildEsc(g.tag||'GL')}]</span>${v254GuildEsc(g.name||'Gilde')}</b><small><span class="v411-search-level">🏰 Gildenlevel ${lv}</span> · 👥 ${members}/${max} · ⭐ EXP +${v254BonusPct(g.xp_level)}% · 💰 Gold +${v254BonusPct(g.gold_level)}%</small></div><button type="button" class="btn secondary" data-v257-apply="${g.id}" ${locked||pending||members>=max?'disabled':''}>${locked?`⏳ Gesperrt · ${v6124GuildLockText()}`:pending?'✓ Anfrage gesendet':members>=max?'Gilde voll':'Beitritt anfragen'}</button></div>`}).join(''):'<div class="v257-search-empty">Keine passende Gilde gefunden.</div>';box.querySelectorAll('[data-v257-apply]').forEach(btn=>btn.onclick=()=>v257ApplyGuild(btn.dataset.v257Apply));try{v6124PaintGuildLock?.()}catch(e){}};window.v257SearchGuilds=v257SearchGuilds;
 }
 function version(){document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version').forEach(el=>{if(el)el.textContent=VERSION});document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11')}
 version();paintOwn();setTimeout(()=>{version();paintOwn()},700);setTimeout(version,2000);
})();

