(function(){
  const VERSION='V4.29 Stable';

  function v382Version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  }

  function v382OpenMailTo(name){
    name=String(name||'').trim();
    if(!name)return;
    v032Go('mail');
    setTimeout(()=>{
      const compose=document.querySelector('[data-v381-tab="compose"]');
      if(compose)compose.click();
      const recipient=document.querySelector('#v381Recipient');
      if(recipient){
        recipient.value=name;
        recipient.dispatchEvent(new Event('input',{bubbles:true}));
      }
      document.querySelector('#v381Body')?.focus();
    },30);
  }
  window.v382OpenMailTo=v382OpenMailTo;

  function v382DecorateRows(rootSelector){
    const root=document.querySelector(rootSelector);
    if(!root)return;

    root.querySelectorAll('.v072-player-row[data-profile-id]').forEach(row=>{
      const id=String(row.dataset.profileId||'').trim();
      if(!id || id===String(v073User?.id||''))return;

      const actions=row.querySelector('.v073-row-actions');
      if(!actions || actions.querySelector('.v382-message-btn'))return;

      const name=String(row.querySelector('.v072-player-name')?.textContent||'').trim();
      if(!name)return;

      const btn=document.createElement('button');
      btn.type='button';
      btn.className='btn secondary v382-message-btn';
      btn.textContent='✉️ Nachricht';
      btn.dataset.v382Message=id;
      btn.dataset.name=name;
      btn.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
        v382OpenMailTo(name);
      };
      actions.appendChild(btn);
    });
  }

  function v382DecorateHall(){
    v382DecorateRows('#v072HallRanking');
  }
  function v382DecorateFriends(){
    v382DecorateRows('#v072FriendsList');
  }

  /* Extend the CURRENT final loaders. No ranking/friends logic is replaced. */
  const baseRanking=v073LoadRanking;
  v073LoadRanking=async function(){
    const result=await baseRanking.apply(this,arguments);
    v382DecorateHall();
    return result;
  };

  const baseFriends=v073LoadFriends;
  v073LoadFriends=async function(){
    const result=await baseFriends.apply(this,arguments);
    v382DecorateFriends();
    return result;
  };

  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    if(id==='hall')v382DecorateHall();
    if(id==='friends')v382DecorateFriends();
  },{passive:true});
  v382DecorateHall();
  v382DecorateFriends();
})();
