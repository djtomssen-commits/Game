(function(){
  const V337_VERSION='V4.29 Stable';

  function v337OpenHarzDealer(){
    try{
      if(typeof v322OpenDealer==='function')return v322OpenDealer();
      if(typeof openHarzDealer==='function')return openHarzDealer();
      const existing=document.querySelector('#v322HarzDealer,#harzDealer,.harz-dealer');
      if(existing){
        existing.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
      if(typeof toast==='function')toast('Harz Dealer konnte nicht geöffnet werden.');
    }catch(e){console.warn('V4.02 Harz dealer open',e)}
  }
  window.v337OpenHarzDealer=v337OpenHarzDealer;

  function v337AddDealerMenuItem(){
    const candidates=[
      document.querySelector('#menuDropdown'),
      document.querySelector('.dropdown-menu'),
      document.querySelector('#mainMenu'),
      document.querySelector('.menu-dropdown'),
      document.querySelector('[data-main-menu]')
    ].filter(Boolean);

    if(!candidates.length)return false;
    const menu=candidates[0];
    if(menu.querySelector('[data-v337-harz-dealer]'))return true;

    const tag=(menu.querySelector('button')?'button':'div');
    const item=document.createElement(tag);
    item.setAttribute('data-v337-harz-dealer','1');
    item.className='v337-harz-menu-item';
    item.textContent='💎 Harz & Gold & Rahmen Dealer';
    item.style.cursor='pointer';
    if(tag==='button')item.type='button';
    item.onclick=(e)=>{
      e.preventDefault();
      e.stopPropagation();
      v337OpenHarzDealer();
    };

    menu.appendChild(item);
    return true;
  }

  function v337EnsureFooter(){
    const target=document.querySelector('main')||document.body;
    let footer=document.querySelector('#v337LegalFooter');
    if(!footer){
      footer=document.createElement('footer');
      footer.id='v337LegalFooter';
      footer.innerHTML=`
        © ${new Date().getFullYear()} Grow Legends · Alle Rechte vorbehalten.<br>
        Grow Legends ist ein eigenständiges Fan-/Indie-Spielprojekt. Genannte Marken,
        Produktnamen und sonstige Kennzeichen gehören ihren jeweiligen Inhabern.
      `;
    }
    /* V4.91: Legal footer must remain below every dynamically added game screen. */
    if(footer.parentElement!==target || target.lastElementChild!==footer){
      target.appendChild(footer);
    }
  }

  /* Keep menu/footer present even if later render functions rebuild the DOM. */
  /* V6.97: global dealer/footer observer retired; startup hooks remain. */

  function v337ApplyVersion(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V337_VERSION;
    });
  }

  v337AddDealerMenuItem();
  v337EnsureFooter();
  v337ApplyVersion();
  setTimeout(v337AddDealerMenuItem,500);
  setTimeout(v337EnsureFooter,500);
  setTimeout(v337ApplyVersion,500);
  setTimeout(v337AddDealerMenuItem,1800);
  setTimeout(v337EnsureFooter,1800);
  setTimeout(v337ApplyVersion,1800);
})();
