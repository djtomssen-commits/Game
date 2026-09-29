/* === v552-guild-grow-legends-js === */
(function(){
  'use strict';
  const esc=v=>typeof v254GuildEsc==='function'?v254GuildEsc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function ensureTitle(){
    const shell=document.querySelector('#guild .v254-guild-shell');if(!shell)return;
    let title=shell.querySelector(':scope > .v552-guild-title');
    if(!title){title=document.createElement('div');title.className='v552-guild-title';title.textContent='GILDE';shell.prepend(title)}
  }
  function hero(){
    const root=document.getElementById('guild'),box=root?.querySelector('.v254-guild-hero');if(!root||!box)return;
    const has=!!window.v254Guild&&!!window.v254Membership;
    root.classList.toggle('v552-has-membership',has);root.classList.toggle('v552-no-membership',!has);
    if(has){
      const g=window.v254Guild||{},members=Array.isArray(window.v254Members)?window.v254Members.length:0;
      const tag=String(g.tag||'GL').replace(/[\[\]]/g,'').slice(0,5);
      const buds=Math.max(0,Number(g.guild_buds)||0);
      box.innerHTML=`<div class="v552-guild-crest"><span class="leaf">🌿</span><b>[${esc(tag)}]</b></div>
        <div class="v552-guild-copy"><div class="v254-kicker">🌿 GEMEINSAM STÄRKER</div><h2>${esc(g.name||'Gilde')}</h2><div class="v552-guild-members-count">${members} Mitglied${members===1?'':'er'}</div><p>Kämpft gemeinsam gegen den täglichen Gildenboss, stärkt eure Gildenboni und tretet im Gildenkrieg gegen andere Gilden an.</p></div>
        <div class="v254-buds"><b id="v254GuildBuds">${buds}</b><span>Gilden-Buds</span></div>`;
    }else if(!box.dataset.v552NoGuild){
      box.dataset.v552NoGuild='1';
      box.innerHTML=`<div class="v552-guild-copy"><div class="v254-kicker">🌿 GEMEINSAM STÄRKER</div><h2>Gilden</h2><p>Gründe eine Gilde, kämpft gemeinsam gegen den täglichen Gildenboss und tretet im Gildenkrieg gegen andere Gilden an.</p></div><div class="v254-buds"><b id="v254GuildBuds">0</b><span>Gilden-Buds</span></div>`;
    }
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
  function patchMembers(){
    if(typeof window.v254MemberHtml!=='function'||window.__v552GuildMemberHtml)return;
    window.v254MemberHtml=function(m){
      const p=m?.profile||(Array.isArray(m?.profiles)?m.profiles[0]:m?.profiles)||{};
      const cls=p?.class_id||'grower';
      const avatar=typeof v080AvatarFor==='function'?v080AvatarFor(cls):'';
      const role=m?.role==='leader'?'Anführer':m?.role==='officer'?'Offizier':'Mitglied';
      const online=typeof v329IsOnline==='function'?!!v329IsOnline(m):false;
      return `<div class="v254-member"><img src="${esc(avatar)}" alt=""><div class="v254-member-main"><div class="v254-member-name-line"><b>${esc(p?.character_name||'Spieler')}</b><span class="v552-role ${m?.role||'member'}">${m?.role==='leader'?'👑 ':m?.role==='officer'?'⭐ ':''}${role}</span><span class="v329-presence ${online?'online':'offline'}">${online?'Online':'Offline'}</span></div><small>${esc(p?.class_name||'')} · Lv. ${Number(p?.level)||1}</small></div><div class="v254-member-flags"><span class="v254-flag ${m?.attack_signed?'on':''}">⚔ ${m?.attack_signed?'Angriff':'—'}</span><span class="v254-flag ${m?.defense_signed?'on':''}">🛡 ${m?.defense_signed?'Verteidigung':'—'}</span><span class="v254-flag ${m?.boss_signed?'on':''}">👹 ${m?.boss_signed?'Boss':'—'}</span></div></div>`;
    };
    try{v254MemberHtml=window.v254MemberHtml}catch(e){}
    window.__v552GuildMemberHtml=true;
  }
  function paint(){ensureTitle();hero();pairAdmin()}
  patchMembers();
  /* V6.120: V5.54 is the final visual owner. Keep only one compatibility pass. */
  paint();
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(paint),{once:true});
})();

