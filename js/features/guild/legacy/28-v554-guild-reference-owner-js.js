/* === v554-guild-reference-owner-js === */
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

  function cleanLegacy(){
    document.querySelectorAll('#guild #v254GuildDashboard > .v254-guild-head').forEach(x=>x.style.display='none');
    document.querySelectorAll('#guild .v257-member-actions').forEach(x=>x.style.display='none');
  }

  function paint(){renderTop();pairAdmin();installManagementPicker();cleanLegacy()}
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

  /* V6.120: one deterministic startup pass instead of a repaint burst. */
  setTimeout(()=>{try{if(typeof v254RenderGuild==='function')v254RenderGuild()}catch(e){}},80);
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(paint),{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('guild')?.classList.contains('active'))requestAnimationFrame(paint)},{passive:true});
})();

