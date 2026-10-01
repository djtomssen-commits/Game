(function(){
  const VERSION='V4.29 Stable';

  function v383CleanPlayerName(row){
    const nameEl=row?.querySelector('.v072-player-name');
    if(!nameEl)return '';

    /*
      Friend rows contain the Online/Offline badge inside .v072-player-name.
      textContent therefore produced e.g. "Tomssen Online" as the recipient.
      Read only the direct text nodes of the name element and ignore badges.
    */
    const direct=[...nameEl.childNodes]
      .filter(n=>n.nodeType===Node.TEXT_NODE)
      .map(n=>String(n.nodeValue||'').trim())
      .filter(Boolean)
      .join(' ')
      .trim();

    if(direct)return direct;

    /* Defensive fallback for rows without a direct text node. */
    const clone=nameEl.cloneNode(true);
    clone.querySelectorAll('.v329-presence,.v073-online-dot,.v073-offline-dot,[data-presence]').forEach(el=>el.remove());
    return String(clone.textContent||'').trim();
  }

  function v383FixButtons(rootSelector){
    const root=document.querySelector(rootSelector);
    if(!root)return;

    root.querySelectorAll('.v072-player-row[data-profile-id]').forEach(row=>{
      const btn=row.querySelector('.v382-message-btn');
      if(!btn)return;

      const name=v383CleanPlayerName(row);
      if(!name)return;

      btn.dataset.name=name;
      btn.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
        window.v382OpenMailTo?.(name);
      };
    });
  }

  const baseRanking=v073LoadRanking;
  v073LoadRanking=async function(){
    const result=await baseRanking.apply(this,arguments);
    v383FixButtons('#v072HallRanking');
    return result;
  };

  const baseFriends=v073LoadFriends;
  v073LoadFriends=async function(){
    const result=await baseFriends.apply(this,arguments);
    v383FixButtons('#v072FriendsList');
    return result;
  };

  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    if(id==='hall')v383FixButtons('#v072HallRanking');
    if(id==='friends')v383FixButtons('#v072FriendsList');
  },{passive:true});
  v383FixButtons('#v072HallRanking');
  v383FixButtons('#v072FriendsList');
})();
