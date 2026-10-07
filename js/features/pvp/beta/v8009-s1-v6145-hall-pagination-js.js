/* V8.009 BETA HALL REPUSH 2026-09-30 — canonical owner unchanged */

(()=>{
 'use strict';
 if(window.__V6145_HALL_PAGINATION__)return;
 window.__V6145_HALL_PAGINATION__=true;
 const PAGE=20,TOP=3;
 const SELECT='id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,equipment,dungeon_progress,worldboss_attempts,worldboss_wins,pvp_buds,pvp_wins,pvp_losses,pvp_fights,avatar_frame_id,updated_at';
 const state={page:1,mode:'page',hallTab:'players',total:0,pages:1,ownRank:null,seq:0,topRows:[],topAt:0,guildRows:[],guildTotal:0};
 const FRAME_ASSETS=Object.freeze({
   ironwood:'assets/avatar_frames/ironwood.png',
   silver_vine:'assets/avatar_frames/silver_vine.png',
   gold_crown:'assets/avatar_frames/gold_crown.png',
   emerald_aura:'assets/avatar_frames/emerald_aura.png',
   haze_ring:'assets/avatar_frames/haze_ring.png',
   resin_flame:'assets/avatar_frames/resin_flame.png',
   prismatic_myth:'assets/avatar_frames/prismatic_myth.png',
   referral_legend:'assets/avatar_frames/referral_legend.png'
 });
 const q=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const num=v=>Math.max(0,Math.floor(Number(v)||0));
 function ownId(){try{return (!v073User?.is_anonymous&&v073User?.id)?String(v073User.id):''}catch(e){return''}}
 function ready(){try{return !!v073Db&&!!v073User&&!v073User.is_anonymous}catch(e){return false}}
 function ordered(query){return query.order('level',{ascending:false}).order('combat_power',{ascending:false}).order('id',{ascending:true})}
 function playerRow(p,index){
   const me=String(p?.id||'')===ownId();
   const friend=me?'<span class="pill">DU</span>':`<button class="btn secondary" data-v073-add="${esc(p?.id||'') }" data-name="${esc(p?.character_name||'Spieler')}">Freund</button><button class="btn secondary" data-v6145-mail="${esc(p?.character_name||'Spieler')}">✉️ Nachricht</button>`;
   const classId=String(p?.class_id||'grower').toLowerCase();
   const art=framedAvatar(p,'v646-row-avatar');
   const enhance=html=>{
     let out=String(html||'');
     out=out.replace('class="v072-player-row"','class="v072-player-row v646-row-decorated"');
     if(!/data-class-id=/.test(out))out=out.replace('data-profile-id="','data-class-id="'+esc(classId)+'" data-profile-id="');
     if(!out.includes('v646-row-avatar'))out=out.replace(/(<div class="v072-rank[^>]*>[\s\S]*?<\/div>)/,`$1${art}`);
     return out;
   };
   /* V7.193: the final paginated Hall renderer owns avatar presence itself.
      Async page/rank loads must not depend on the historical post-render decorator. */
   try{
     const fn=window.v4130SocialRow||window.v073PlayerRow;
     if(typeof fn==='function')return enhance(fn(p,index,friend,false));
   }catch(e){}
   return enhance(`<div class="v072-player-row" data-profile-id="${esc(p?.id||'')}"><div class="v072-rank">${index+1}</div><div><div class="v072-player-name">${esc(p?.character_name||'Spieler')}</div><div class="v072-player-sub">${esc(p?.class_name||'')} · Lv. ${num(p?.level)||1} · Kampfkraft ${num(p?.combat_power)}</div></div><div class="v073-row-actions">${friend}</div></div>`);
 }
 function bindRows(root){
   if(!root)return;
   try{if(typeof v073BindAddButtons==='function')v073BindAddButtons(root)}catch(e){}
   try{if(typeof v074BindProfileRows==='function')v074BindProfileRows(root)}catch(e){}
   root.querySelectorAll('[data-v6145-mail]').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();try{window.v382OpenMailTo?.(b.dataset.v6145Mail)}catch(_){}}});
   const me=ownId();root.querySelectorAll('.v072-player-row[data-profile-id]').forEach(row=>row.classList.toggle('v6145-own-row',String(row.dataset.profileId||'')===me));
 }
 function decorateHall(){try{window.v646DecorateHall?.()}catch(_){}}

 function ensureHallTabs(){
   const ranking=q('v072HallRanking');if(!ranking)return null;
   let tabs=q('v8184HallTabs');
   if(!tabs){
     tabs=document.createElement('div');
     tabs.id='v8184HallTabs';
     tabs.className='v8184-hall-tabs';
     tabs.innerHTML='<button type="button" data-v8184-hall-tab="players">⚔️ Spieler</button><button type="button" data-v8184-hall-tab="guilds">🛡️ Gilden</button>';
     ranking.insertAdjacentElement('beforebegin',tabs);
     tabs.querySelector('[data-v8184-hall-tab="players"]')?.addEventListener('click',()=>setHallTab('players'));
     tabs.querySelector('[data-v8184-hall-tab="guilds"]')?.addEventListener('click',()=>setHallTab('guilds'));
   }
   tabs.querySelectorAll('[data-v8184-hall-tab]').forEach(btn=>btn.classList.toggle('active',String(btn.dataset.v8184HallTab)===state.hallTab));
   return tabs;
 }
 function guildMedal(rank){return rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':String(rank)}
 function guildRow(g){
   const rank=num(g?.rank_no)||1,tag=String(g?.tag||'GL').replace(/[\[\]]/g,'').slice(0,5);
   return `<button type="button" class="v8184-guild-row rank-${Math.min(rank,4)}" data-v8184-guild="${esc(g?.id||'')}">
     <span class="v8184-guild-rank">${guildMedal(rank)}${rank>3?`<small>#${rank}</small>`:''}</span>
     <span class="v8184-guild-crest">[${esc(tag)}]</span>
     <span class="v8184-guild-main"><b>${esc(g?.name||'Gilde')}</b><small>Gildenlevel ${num(g?.guild_level)||1} · ${num(g?.member_count)}/${num(g?.max_members)||20} Mitglieder</small></span>
     <span class="v8184-guild-buds"><b>🌿 ${num(g?.guild_buds).toLocaleString('de-DE')}</b><small>Gilden-Buds</small></span>
     <span class="v8184-guild-open">›</span>
   </button>`;
 }
 function guildShell(rows,total){
   return `<div class="v8184-guild-shell">
     <div class="v6145-hall-head"><div class="v6145-hall-head-copy"><b>HALL OF HAZE · GILDEN</b><small>Die erfolgreichsten Gilden des Servers.</small></div><span class="v6145-rank-hint">${num(total)} Gilden</span></div>
     <div class="v8184-guild-rule"><b>Rangfolge</b><span>Gildenlevel → Gilden-Buds → Gilden-EP</span></div>
     <div class="v8184-guild-list">${rows.length?rows.map(guildRow).join(''):'<div class="v6145-empty">Noch keine Gilden in der Rangliste.</div>'}</div>
   </div>`;
 }
 function ensureGuildProfile(){
   let ov=q('v8184GuildProfile');
   if(ov)return ov;
   ov=document.createElement('div');
   ov.id='v8184GuildProfile';
   ov.className='v8184-guild-profile-overlay';
   ov.innerHTML='<div class="v8184-guild-profile-card" role="dialog" aria-modal="true"><button type="button" class="v8184-guild-profile-close" aria-label="Schließen">✕</button><div class="v8184-guild-profile-body"></div></div>';
   ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('show')});
   ov.querySelector('.v8184-guild-profile-close')?.addEventListener('click',()=>ov.classList.remove('show'));
   document.body.appendChild(ov);
   return ov;
 }
 function closeGuildProfile(){q('v8184GuildProfile')?.classList.remove('show')}
 async function openGuildProfile(id){
   id=String(id||'');if(!id)return false;
   const ov=ensureGuildProfile(),body=ov.querySelector('.v8184-guild-profile-body');
   if(!body)return false;
   ov.classList.add('show');
   body.innerHTML='<div class="v6145-loading">🛡️ Gildenprofil wird geladen …</div>';
   try{
     if(typeof v073Init==='function'&&!(await v073Init()))throw new Error('offline');
     const {data,error}=await v073Db.rpc('v8184_hall_guild_profile',{p_guild:id});if(error)throw error;
     const g=data?.guild||{},members=Array.isArray(data?.top_members)?data.top_members:[];
     const tag=String(g.tag||'GL').replace(/[\[\]]/g,'').slice(0,5);
     const description=String(g.description||'').trim();
     body.innerHTML=`<div class="v8184-profile-hero">
       <div class="v8184-profile-crest">[${esc(tag)}]</div>
       <div><small>HALL OF HAZE · GILDENRANG #${num(g.rank_no)||'—'}</small><h2>${esc(g.name||'Gilde')}</h2><p>👑 ${esc(g.leader_name||'Unbekannt')}</p></div>
     </div>
     <div class="v8184-profile-stats">
       <div><span>Gildenlevel</span><b>${num(g.guild_level)||1}</b></div>
       <div><span>Gilden-Buds</span><b>🌿 ${num(g.guild_buds).toLocaleString('de-DE')}</b></div>
       <div><span>Mitglieder</span><b>${num(g.member_count)}/${num(g.max_members)||20}</b></div>
       <div><span>Gilden-EP</span><b>${num(g.guild_xp).toLocaleString('de-DE')}</b></div>
     </div>
     <section class="v8184-profile-about"><h3>Über diese Gilde</h3><p>${description?esc(description):'Diese Gilde hat noch keine Beschreibung hinterlegt.'}</p></section>
     <section class="v8184-profile-members"><h3>Stärkste Mitglieder</h3>
       <div>${members.length?members.map((m,i)=>`<button type="button" data-v8184-member="${esc(m.id||'')}"><span>#${i+1}</span><b>${esc(m.character_name||'Spieler')}</b><small>${esc(m.class_name||'')} · Lv. ${num(m.level)||1} · ⚔ ${num(m.combat_power)}</small></button>`).join(''):'<p>Noch keine Mitgliederprofile verfügbar.</p>'}</div>
     </section>`;
     body.querySelectorAll('[data-v8184-member]').forEach(btn=>btn.addEventListener('click',()=>{const uid=btn.dataset.v8184Member;if(uid)try{void v074OpenProfile(uid)}catch(_){}}));
     return true;
   }catch(e){
     console.error('V8.184 guild profile',e);
     body.innerHTML='<div class="v072-status-offline">Gildenprofil konnte nicht geladen werden.</div>';
     return false;
   }
 }
 function bindGuildRows(el){
   el?.querySelectorAll('[data-v8184-guild]').forEach(row=>row.addEventListener('click',()=>void openGuildProfile(row.dataset.v8184Guild)));
 }
 async function loadGuildRanking(){
   const el=q('v072HallRanking');if(!el)return false;
   const seq=++state.seq;state.hallTab='guilds';ensureHallTabs();
   el.innerHTML='<div class="v6145-loading">🛡️ Gildenrangliste wird geladen …</div>';
   try{
     if(typeof v073Init==='function'&&!(await v073Init()))throw new Error('offline');
     const {data,error}=await v073Db.rpc('v8184_hall_guild_ranking',{p_offset:0,p_limit:100});if(error)throw error;if(seq!==state.seq)return false;
     const rows=Array.isArray(data?.rows)?data.rows:[];
     state.guildRows=rows;state.guildTotal=num(data?.total);
     el.innerHTML=guildShell(rows,state.guildTotal);
     bindGuildRows(el);decorateHall();return true;
   }catch(e){
     console.error('V8.184 guild ranking',e);
     el.innerHTML='<div class="v072-status-offline">Gildenrangliste konnte nicht geladen werden.</div>';
     return false;
   }
 }
 function setHallTab(tab){
   state.hallTab=tab==='guilds'?'guilds':'players';
   ensureHallTabs();
   return state.hallTab==='guilds'?loadGuildRanking():loadRanking();
 }

 async function syncOwn(){
   try{if(typeof window.vPvpBudsHallSync==='function')await window.vPvpBudsHallSync(true)}catch(e){}
   try{if(typeof window.v649SyncDungeonProgress==='function')await window.v649SyncDungeonProgress(true)}catch(e){}
   try{if(typeof v073SyncProfile==='function')await v073SyncProfile(true)}catch(e){}
 }
 async function top3(force=false){
   if(!force&&state.topRows.length&&Date.now()-state.topAt<15000)return state.topRows;
   const {data,error}=await ordered(v073Db.from('profiles').select(SELECT)).limit(TOP);
   if(error)throw error;state.topRows=Array.isArray(data)?data:[];state.topAt=Date.now();return state.topRows;
 }
 function medal(rank){return rank===1?'🥇':rank===2?'🥈':'🥉'}
 function avatarSrc(p){
   try{return typeof v080AvatarFor==='function'?(v080AvatarFor(p?.class_id||'grower')||''):''}catch(e){return ''}
 }
 function avatar(p){
   const src=avatarSrc(p);
   return src?`<img src="${esc(src)}" alt="">`:'<span>🌿</span>';
 }
 function frameArt(p){
   const id=String(p?.avatar_frame_id||'');
   const src=FRAME_ASSETS[id]||'';
   return src?`<img class="v7139-frame-art" src="${esc(src)}" alt="" aria-hidden="true" decoding="async">`:'';
 }
 function framedAvatar(p,cls){
   const id=String(p?.avatar_frame_id||'');
   const frame=frameArt(p);
   const target=frame?' v7137-frame-target':'';
   const data=frame?` data-v7137-frame="${esc(id)}"`:'';
   return `<div class="${cls}${target}" data-avatar-class="${esc(String(p?.class_id||'grower').toLowerCase())}"${data}>${avatar(p)}${frame}</div>`;
 }
 function podiumAvatar(p){
   const id=String(p?.avatar_frame_id||'');
   const src=avatarSrc(p);
   const frame=frameArt(p);
   const target=frame?' v7137-frame-target':'';
   const data=frame?` data-v7137-frame="${esc(id)}"`:'';
   const portrait=src
     ?`<span class="v6145-podium-portrait" style="background-image:url(&quot;${esc(src)}&quot;)"></span>`
     :'<span class="v6145-podium-fallback">🌿</span>';
   return `<div class="v6145-podium-avatar${target}" data-avatar-class="${esc(String(p?.class_id||'grower').toLowerCase())}"${data}>${portrait}${frame}</div>`;
 }
 function podiumHtml(rows){
   const me=ownId();
   return `<div class="v6145-podium">${(rows||[]).map((p,i)=>{const r=i+1;return `<article class="v6145-podium-card rank-${r} ${String(p?.id||'')===me?'v6145-own':''}" data-v6145-profile="${esc(p?.id||'')}"><div class="v6145-podium-top"><span class="v6145-medal">${medal(r)}</span><span class="v6145-pos">#${r}</span></div><div class="v6145-podium-body">${podiumAvatar(p)}<div class="v6145-podium-name">${esc(p?.character_name||'Spieler')}</div><div class="v6145-podium-meta">${esc(p?.class_name||'')} · Lv. ${Math.max(1,num(p?.level))}</div><div class="v6145-podium-power">⚔ ${num(p?.combat_power)} · 🌿 ${num(p?.pvp_buds)}</div></div></article>`}).join('')}</div>`;
 }
 function modeBar(){return `<div class="v6145-modebar"><button type="button" class="v6145-mode-btn ${state.mode==='page'?'active':''}" data-v6145-mode="page">🏆 Rangliste</button><button type="button" class="v6145-mode-btn" data-v6145-mode="mine">🎯 Mein Rang</button><button type="button" class="v6145-mode-btn ${state.mode==='near'?'active':''}" data-v6145-mode="near">👥 Mein Umfeld</button></div>`}
 function rankHint(){return state.ownRank?`Dein Rang #${state.ownRank} · ${state.total} Spieler`:`${state.total} Spieler`}
 function shell(top,body,pager,title){return `<div class="v6145-hall-shell"><div class="v6145-hall-head"><div class="v6145-hall-head-copy"><b>HALL OF HAZE · TOP 3</b><small>Die stärksten Legenden stehen dauerhaft an der Spitze.</small></div><span class="v6145-rank-hint">${esc(rankHint())}</span></div>${podiumHtml(top)}${modeBar()}<div class="v6145-list-title"><b>${esc(title)}</b><span>${state.mode==='near'?'11 Plätze um deinen Rang':'20 Spieler pro Seite'}</span></div><div class="v6145-list">${body}</div>${pager||''}</div>`}
 function pagerHtml(){
   if(state.total<=TOP)return '<div class="v6145-top3-note">Die Hall besteht aktuell nur aus den Top 3.</div>';
   return `<div class="v6145-pager"><button type="button" class="v6145-page-btn" data-v6145-page="prev" ${state.page<=1?'disabled':''}>◀ Zurück</button><div class="v6145-page-state">Seite ${state.page} / ${state.pages}<small>Ränge ${TOP+(state.page-1)*PAGE+1}–${Math.min(state.total,TOP+state.page*PAGE)}</small></div><button type="button" class="v6145-page-btn" data-v6145-page="next" ${state.page>=state.pages?'disabled':''}>Weiter ▶</button></div>`;
 }
 function bindControls(el){
   el.querySelectorAll('[data-v6145-profile]').forEach(card=>card.onclick=()=>{const id=card.dataset.v6145Profile;if(id)try{void v074OpenProfile(id)}catch(e){}});
   el.querySelector('[data-v6145-mode="page"]')?.addEventListener('click',()=>loadPage(state.page||1));
   el.querySelector('[data-v6145-mode="mine"]')?.addEventListener('click',()=>loadMyRank());
   el.querySelector('[data-v6145-mode="near"]')?.addEventListener('click',()=>loadNear());
   el.querySelector('[data-v6145-page="prev"]')?.addEventListener('click',()=>loadPage(Math.max(1,state.page-1)));
   el.querySelector('[data-v6145-page="next"]')?.addEventListener('click',()=>loadPage(Math.min(state.pages,state.page+1)));
   bindRows(el);
   decorateHall();
 }
 async function getOwnProfile(){
   const id=ownId();if(!id)return null;
   const {data,error}=await v073Db.from('profiles').select(SELECT).eq('id',id).maybeSingle();if(error)throw error;return data||null;
 }
 async function ownRank(force=false){
   if(state.ownRank&&!force)return state.ownRank;
   const me=await getOwnProfile();if(!me)return null;
   const level=num(me.level),cp=num(me.combat_power),id=String(me.id||'');
   let query=v073Db.from('profiles').select('id',{count:'exact',head:true});
   query=query.or(`level.gt.${level},and(level.eq.${level},combat_power.gt.${cp}),and(level.eq.${level},combat_power.eq.${cp},id.lt.${id})`);
   const {count,error}=await query;
   if(!error&&Number.isFinite(Number(count))){state.ownRank=Number(count)+1;return state.ownRank}
   console.warn('V6.145 direct rank count fallback',error);
   /* Rare fallback: only used if PostgREST rejects the composite OR expression. */
   let offset=0;
   while(offset<20000){
     const {data:e,error:err}=await ordered(v073Db.from('profiles').select('id')).range(offset,offset+499);if(err)throw err;
     const rows=Array.isArray(e)?e:[],at=rows.findIndex(x=>String(x.id)===id);if(at>=0){state.ownRank=offset+at+1;return state.ownRank}if(rows.length<500)break;offset+=500;
   }
   return null;
 }
 async function loadPage(page=1,focus=false){
   const el=q('v072HallRanking');if(!el)return false;state.hallTab='players';ensureHallTabs();const seq=++state.seq;state.mode='page';state.page=Math.max(1,Math.floor(Number(page)||1));
   el.innerHTML='<div class="v6145-loading">🌫️ Hall of Haze wird geladen …</div>';
   try{
     if(typeof v073Init==='function'&&!(await v073Init()))throw new Error('offline');
     /* V7.214: do not block first Hall paint on own-profile sync. The ranking can
        render from canonical public data immediately; refresh our own public row
        in the background and invalidate rank/top caches afterwards. */
     const ownSyncPromise=Promise.resolve().then(()=>syncOwn()).then(()=>{state.ownRank=null;state.topAt=0}).catch(()=>{});
     const tops=await top3(false);
     /* V7.232: A fresh server can have fewer than TOP players. In that case
        querying range(3,22) makes PostgREST return HTTP 416. The top query is
        already the complete ranking, so render it directly instead. */
     if(tops.length<TOP){
       if(seq!==state.seq)return false;
       state.total=tops.length;state.pages=1;state.page=1;
       const msg=state.total===0
         ?'<div class="v6145-empty">Noch kein Spieler in der Rangliste.</div>'
         :`<div class="v6145-empty">Aktuell ${state.total} ${state.total===1?'Spieler':'Spieler'} auf diesem Server.</div>`;
       el.innerHTML=shell(tops,msg,pagerHtml(),`Gesamtrangliste · ${state.total} Spieler`);
       bindControls(el);
       if(focus)focusOwn(el);
       return true;
     }
     const start=TOP+(state.page-1)*PAGE;
     const {data,count,error}=await ordered(v073Db.from('profiles').select(SELECT,{count:'exact'})).range(start,start+PAGE-1);if(error)throw error;if(seq!==state.seq)return false;
     state.total=Math.max(0,Number(count)||0);state.pages=Math.max(1,Math.ceil(Math.max(0,state.total-TOP)/PAGE));if(state.page>state.pages)return loadPage(state.pages,focus);
     const rows=Array.isArray(data)?data:[];
     const empty='<div class="v6145-empty">Auf dieser Seite sind keine weiteren Spieler.</div>';
     el.innerHTML=shell(tops,rows.length?'':empty,pagerHtml(),`Gesamtrangliste · Seite ${state.page}`);
     const list=el.querySelector('.v6145-list');
     if(rows.length&&list){
       for(let off=0;off<rows.length;off+=5){
         if(seq!==state.seq)return false;
         list.insertAdjacentHTML('beforeend',rows.slice(off,off+5).map((p,i)=>playerRow(p,start+off+i)).join(''));
         await new Promise(r=>requestAnimationFrame(r));
       }
     }
     bindControls(el);
     if(focus)focusOwn(el);return true;
   }catch(e){console.error('V6.145 Hall page',e);el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden.</div>';return false}
 }
 async function loadMyRank(){
   try{
     const rank=await ownRank(true);if(!rank){v063Toast?.('Hall of Haze','warn','Dein Rang konnte gerade nicht bestimmt werden.');return}
     if(rank<=TOP){state.page=1;await loadPage(1,false);focusOwn(q('v072HallRanking'));return}
     const page=Math.floor((rank-(TOP+1))/PAGE)+1;await loadPage(page,true);
   }catch(e){console.error('V6.145 my rank',e);v063Toast?.('Hall of Haze','warn','Dein Rang konnte nicht geladen werden.')}
 }
 async function loadNear(){
   const el=q('v072HallRanking');if(!el)return;state.hallTab='players';ensureHallTabs();const seq=++state.seq;state.mode='near';el.innerHTML='<div class="v6145-loading">🎯 Dein Rang wird gesucht …</div>';
   try{
     if(typeof v073Init==='function'&&!(await v073Init()))throw new Error('offline');await syncOwn();const rank=await ownRank(true);if(!rank)throw new Error('Rang nicht gefunden');const tops=await top3(false);
     const idx=rank-1,start=Math.max(0,idx-5),end=start+10;
     const {data,count,error}=await ordered(v073Db.from('profiles').select(SELECT,{count:'exact'})).range(start,end);if(error)throw error;if(seq!==state.seq)return;
     state.total=Math.max(0,Number(count)||0);state.pages=Math.max(1,Math.ceil(Math.max(0,state.total-TOP)/PAGE));const rows=Array.isArray(data)?data:[];
     el.innerHTML=shell(tops,rows.length?'':'<div class="v6145-empty">Kein Rangumfeld gefunden.</div>','',`Dein Umfeld · Rang #${rank}`);
     const list=el.querySelector('.v6145-list');
     if(rows.length&&list){for(let off=0;off<rows.length;off+=4){if(seq!==state.seq)return;list.insertAdjacentHTML('beforeend',rows.slice(off,off+4).map((p,i)=>playerRow(p,start+off+i)).join(''));await new Promise(r=>requestAnimationFrame(r));}}
     bindControls(el);focusOwn(el);
   }catch(e){console.error('V6.145 Hall near',e);el.innerHTML='<div class="v072-status-offline">Dein Rangumfeld konnte nicht geladen werden.</div>'}
 }
 function focusOwn(el){
   if(!el)return;const id=ownId();const node=[...el.querySelectorAll('[data-profile-id],[data-v6145-profile]')].find(x=>String(x.dataset.profileId||x.dataset.v6145Profile||'')===id);if(!node)return;node.classList.add('v6145-flash');setTimeout(()=>node.classList.remove('v6145-flash'),1800);requestAnimationFrame(()=>node.scrollIntoView({behavior:'smooth',block:'center'}));
 }
 async function loadRanking(){state.hallTab='players';ensureHallTabs();return state.mode==='near'?loadNear():loadPage(state.page||1,false)}
 try{v073LoadRanking=loadRanking;window.v073LoadRanking=loadRanking}catch(e){window.v073LoadRanking=loadRanking}
 window.v6145HallPage=loadPage;window.v6145HallMyRank=loadMyRank;window.v6145HallNear=loadNear;
 window.v8184HallGuildRanking=loadGuildRanking;window.v8184OpenGuildProfile=openGuildProfile;window.v8184CloseGuildProfile=closeGuildProfile;window.v8184HallTab=setHallTab;
 window.v6145HallRefresh=async()=>{state.topAt=0;state.ownRank=null;return state.hallTab==='guilds'?loadGuildRanking():loadPage(state.page||1,false)};
 window.v6145HallState=()=>({...state,topRows:state.topRows.map(x=>({id:x.id,name:x.character_name})),guildRows:state.guildRows.map(x=>({id:x.id,name:x.name,rank:x.rank_no}))});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGuildProfile()});
 document.addEventListener('click',e=>{if(e.target.closest?.('[data-screen="hall"],[data-go="hall"]')){state.hallTab='players';state.mode='page';state.page=1;state.ownRank=null;state.topAt=0;queueMicrotask(()=>{ensureHallTabs();void loadPage(1)})}},true);
 window.addEventListener('growlegends:account-ready',()=>{state.ownRank=null;state.topAt=0;state.guildRows=[];state.guildTotal=0});
 ensureHallTabs();
})();
