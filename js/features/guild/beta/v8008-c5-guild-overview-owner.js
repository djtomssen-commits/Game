/* === V8.008-C5 beta merged guild overview owner: v554 + v556 + v559 === */
(function(){
  'use strict';
  const esc=v=>typeof v254GuildEsc==='function'?v254GuildEsc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const readState=()=>{try{return {guild:(typeof v254Guild!=='undefined'?v254Guild:null),membership:(typeof v254Membership!=='undefined'?v254Membership:null),members:(typeof v254Members!=='undefined'&&Array.isArray(v254Members)?v254Members:[])}}catch(e){return {guild:null,membership:null,members:[]}}};

  function installMemberRenderer(){
    const renderer=function(m){
      const p=m?.profile||(Array.isArray(m?.profiles)?m.profiles[0]:m?.profiles)||{};
      const cls=p?.class_id||'grower';
      const avatar=typeof v080AvatarFor==='function'?v080AvatarFor(cls):'';
      const role=m?.role==='leader'?'Anführer':m?.role==='officer'?'Offizier':'Mitglied';
      const online=typeof window.v329IsOnline==='function'?!!window.v329IsOnline(m):false;
      return `<div class="v254-member" data-v554-user="${esc(m?.user_id||'')}">
        <img src="${esc(avatar)}" alt="">
        <div class="v254-member-main">
          <div class="v254-member-name-line">
            <b>${esc(p?.character_name||'Spieler')}</b>
            <span class="v552-role ${esc(m?.role||'member')}">${m?.role==='leader'?'👑 ':m?.role==='officer'?'⭐ ':''}${role}</span>
          </div>
          <small>${esc(p?.class_name||'')} · Lv. ${Number(p?.level)||1}</small>
        </div>
        <div class="v6119-member-presence">
          <span class="v329-presence ${online?'online':'offline'}"><i></i><span>${online?'Online':'Offline'}</span></span>
        </div>
        <div class="v254-member-flags">
          <span class="v254-flag ${m?.attack_signed?'on':''}">⚔ ${m?.attack_signed?'Angriff':'—'}</span>
          <span class="v254-flag ${m?.defense_signed?'on':''}">🛡 ${m?.defense_signed?'Verteidigung':'—'}</span>
          <span class="v254-flag ${m?.boss_signed?'on':''}">👹 ${m?.boss_signed?'Boss':'—'}</span>
        </div>
      </div>`;
    };
    try{window.v254MemberHtml=renderer;v254MemberHtml=renderer}catch(e){window.v254MemberHtml=renderer}
  }

  function ensureTop(){
    const shell=document.querySelector('#guild .v254-guild-shell');if(!shell)return null;
    let title=shell.querySelector(':scope > .v554-guild-title');
    if(!title){title=document.createElement('div');title.className='v554-guild-title';title.textContent='GILDE';shell.prepend(title)}
    let hero=shell.querySelector(':scope > .v554-guild-hero');
    if(!hero){
      hero=document.createElement('section');hero.className='v554-guild-hero';title.insertAdjacentElement('afterend',hero);
    }
    return hero;
  }

  function renderTop(){
    const hero=ensureTop();if(!hero)return;
    const st=readState();
    const has=!!st.guild&&!!st.membership;
    hero.style.display=has?'grid':'none';
    if(!has)return;
    const g=st.guild||{},tag=String(g.tag||'GL').replace(/[\[\]]/g,'').slice(0,5),buds=Math.max(0,Number(g.guild_buds)||0),count=st.members.length;
    const sig=[g.id,g.name,tag,buds,count].join('|');
    let progress=document.querySelector('#guild .v409-guild-progress');
    if(hero.dataset.sig!==sig||!hero.querySelector('.v554-progress-slot')){
      hero.innerHTML=`<div class="v554-crest"><span class="v554-leaf">🌿</span><b>[${esc(tag)}]</b></div><div class="v554-hero-copy"><div class="v554-kicker">🌿 GEMEINSAM STÄRKER</div><h2>${esc(g.name||'Gilde')}</h2><div class="v554-member-count">${count} Mitglied${count===1?'':'er'}</div><p>Kämpft gemeinsam gegen den täglichen Gildenboss, verbessert eure Boni und tretet im Gildenkrieg gegen andere Gilden an.</p></div><div class="v554-buds"><b>${buds}</b><span>Gilden-Buds</span></div><div class="v554-progress-slot"></div>`;
      hero.dataset.sig=sig;
    }
    progress=document.querySelector('#guild .v409-guild-progress');
    const slot=hero.querySelector('.v554-progress-slot');
    if(progress&&slot&&progress.parentElement!==slot)slot.appendChild(progress);
  }

  function pairAdmin(){
    const overview=document.getElementById('v254GuildOverview');if(!overview)return;
    const requests=document.getElementById('v257RequestsCard');
    const management=document.getElementById('v257GuildManagement')?.closest('.v254-card.v254-inner');
    if(!management)return;
    let grid=overview.querySelector(':scope > .v552-admin-grid');
    if(!grid){grid=document.createElement('div');grid.className='v552-admin-grid';management.before(grid)}
    if(requests&&requests.parentElement!==grid)grid.appendChild(requests);
    if(management.parentElement!==grid)grid.appendChild(management);
  }

  function installManagementPicker(){
    const st=readState();
    const box=document.getElementById('v257GuildManagement');if(!box||!st.guild||!st.membership)return;
    box.querySelector('.v554-member-admin')?.remove();
    let can=false,isLeader=false;
    try{can=typeof v257CanManage==='function'&&v257CanManage();isLeader=typeof v257IsLeader==='function'&&v257IsLeader()}catch(e){}
    if(!can)return;
    const me=String(typeof v073User!=='undefined'&&v073User?.id||'');
    const rank={leader:0,officer:1,member:2};
    const others=st.members
      .filter(m=>String(m?.user_id||'')!==me)
      .sort((a,b)=>{
        const ra=rank[String(a?.role||'member')]??9, rb=rank[String(b?.role||'member')]??9;
        if(ra!==rb)return ra-rb;
        const la=Number(a?.profile?.level)||0, lb=Number(b?.profile?.level)||0;
        if(la!==lb)return lb-la;
        return String(a?.profile?.character_name||'').localeCompare(String(b?.profile?.character_name||''),'de');
      });
    if(!others.length)return;
    const wrap=document.createElement('div');wrap.className='v554-member-admin';
    wrap.innerHTML=`<div class="v554-member-admin-title">👥 Mitglied verwalten</div><div class="v554-member-admin-row"><select class="v554-admin-target">${others.map(m=>{const p=m?.profile||(Array.isArray(m?.profiles)?m.profiles[0]:m?.profiles)||{};return `<option value="${esc(m.user_id||'')}">${esc(p.character_name||'Spieler')} · Lv. ${Number(p.level)||1} · ${m.role==='leader'?'Anführer':m.role==='officer'?'Offizier':'Mitglied'}</option>`}).join('')}</select>${isLeader?'<button type="button" class="v554-admin-role">Rolle wechseln</button>':''}<button type="button" class="v554-admin-kick bad">Entfernen</button></div>`;
    box.prepend(wrap);
    const sel=wrap.querySelector('.v554-admin-target');
    wrap.querySelector('.v554-admin-role')?.addEventListener('click',()=>{
      const uid=sel?.value;if(!uid)return;const m=others.find(x=>String(x.user_id)===String(uid));
      if(typeof v257SetRole==='function')v257SetRole(uid,m?.role==='officer'?'member':'officer');
    });
    wrap.querySelector('.v554-admin-kick')?.addEventListener('click',()=>{const uid=sel?.value;if(uid&&typeof v257KickMember==='function')v257KickMember(uid)});
  }


  const GUILD_XP_THRESH=[0,500,1500,3500,7000,12500,20500,31500,46000,65000,90000,122000,162000,212000,275000,355000,460000,600000,900000,1800000];

  function guildProgressInfo(g){
    const xp=Math.max(0,Math.floor(Number(g?.guild_xp)||0));
    let lv=1;
    for(let i=1;i<GUILD_XP_THRESH.length;i++){if(xp>=GUILD_XP_THRESH[i])lv=i+1;else break}
    lv=Math.max(1,Math.min(20,lv));
    if(lv>=20)return {lv:20,pct:100,text:`${xp.toLocaleString('de-DE')} Gilden-EP · MAX`};
    const hi=GUILD_XP_THRESH[lv];
    const pct=Math.max(0,Math.min(100,((xp/Math.max(1,hi))*100)));
    return {lv,pct,text:`${xp.toLocaleString('de-DE')} / ${hi.toLocaleString('de-DE')} Gilden-EP · noch ${(hi-xp).toLocaleString('de-DE')} bis Level ${lv+1}`};
  }

  function ensureGuildProgress(){
    const st=readState();
    const g=st.guild;
    const hero=document.querySelector('#guild .v554-guild-hero');
    if(!g||!hero)return;
    let box=hero.querySelector(':scope > .v556-progress');
    if(!box){
      box=document.createElement('div');
      box.className='v556-progress';
      hero.appendChild(box);
    }
    const z=guildProgressInfo(g);
    const sig=[z.lv,z.pct.toFixed(2),z.text].join('|');
    if(box.dataset.sig!==sig){
      box.innerHTML=`<div class="v556-progress-head"><span>🏰 GILDENFORTSCHRITT</span><b>Gildenlevel ${z.lv}</b></div><div class="v556-progress-bar"><i style="width:${z.pct.toFixed(2)}%"></i></div><small>${z.text}</small>`;
      box.dataset.sig=sig;
    }
    hero.querySelectorAll('.v554-progress-slot').forEach(x=>x.style.display='none');
    document.querySelectorAll('#guild .v409-guild-progress:not(.v556-progress)').forEach(x=>x.style.display='none');
  }


  function syncEmptyRequests(){
    const card=document.querySelector('#guild #v257RequestsCard');
    const list=document.querySelector('#guild #v257GuildRequests');
    const count=document.querySelector('#guild #v257RequestCount');
    if(!card||!list)return;
    const hasRequest=!!list.querySelector('.v257-request');
    const empty=list.querySelector('.v257-search-empty');
    const emptyText=String(empty?.textContent||'').trim().toLowerCase();
    const n=Number.parseInt(String(count?.textContent||'0').trim(),10)||0;
    const trulyEmpty=!hasRequest && n===0 && emptyText.includes('keine offenen beitrittsanfragen');
    card.classList.toggle('v559-no-requests',trulyEmpty);
  }

  function cleanLegacy(){
    document.querySelectorAll('#guild #v254GuildDashboard > .v254-guild-head').forEach(x=>x.style.display='none');
    document.querySelectorAll('#guild .v257-member-actions').forEach(x=>x.style.display='none');
  }

  function paint(){renderTop();pairAdmin();installManagementPicker();ensureGuildProgress();syncEmptyRequests();cleanLegacy();document.querySelectorAll('#guild #v257RequestsCard .v380-request-note').forEach(x=>x.style.display='none')}
  installMemberRenderer();

  if(typeof v254RenderGuild==='function'&&!window.__v554GuildWrapped){
    const base=v254RenderGuild;
    let paintQueued=false;
    v254RenderGuild=function(){
      const r=base.apply(this,arguments);
      if(!paintQueued){
        paintQueued=true;
        requestAnimationFrame(()=>{paintQueued=false;paint()});
      }
      return r;
    };
    try{window.v254RenderGuild=v254RenderGuild}catch(e){}
    window.__v554GuildWrapped=true;
  }
  if(typeof v257RenderManagement==='function'&&!window.__v554GuildMgmtWrapped){
    const base=v257RenderManagement;
    v257RenderManagement=function(){const r=base.apply(this,arguments);requestAnimationFrame(()=>{installManagementPicker();cleanLegacy()});return r};
    try{window.v257RenderManagement=v257RenderManagement}catch(e){}
    window.__v554GuildMgmtWrapped=true;
  }


  if(typeof v257RenderRequests==='function'&&!window.__v6120RequestEmptyHook){
    const baseRequests=v257RenderRequests;
    const wrappedRequests=function(){
      const r=baseRequests.apply(this,arguments);
      requestAnimationFrame(syncEmptyRequests);
      return r;
    };
    try{v257RenderRequests=wrappedRequests}catch(e){}
    window.v257RenderRequests=wrappedRequests;
    window.__v6120RequestEmptyHook=true;
  }

  /* V6.120: one deterministic startup pass instead of a repaint burst. */
  setTimeout(()=>{try{if(typeof v254RenderGuild==='function')v254RenderGuild()}catch(e){}},80);
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(paint),{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('guild')?.classList.contains('active'))requestAnimationFrame(paint)},{passive:true});
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-screen="guild"],.v254-tab,#v380RefreshGuildRequests'))setTimeout(paint,40)},true);
})();

