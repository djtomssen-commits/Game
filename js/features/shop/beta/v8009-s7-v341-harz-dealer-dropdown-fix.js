(function(){
  const V341_VERSION='V4.29 Stable';

  function v341OpenDealer(){
    try{
      if(typeof v032Go==='function'){
        v032Go('harzDealer');
        return;
      }
      if(typeof v322OpenDealer==='function'){
        v322OpenDealer();
        return;
      }
      const el=document.querySelector('#harzDealer');
      if(el){
        document.querySelectorAll('.page,.screen,section').forEach(x=>x.classList.remove('active'));
        el.classList.add('active');
      }
    }catch(e){console.warn('V4.02 Harz Dealer navigation',e)}
  }

  function v341FindRealDropdown(){
    /* Prefer the navigation container that already contains known game entries. */
    const all=[...document.querySelectorAll('nav,aside,.dropdown,.dropdown-menu,.menu,.menu-panel,.nav-menu,[role="menu"]')];
    let best=null,bestScore=-1;
    for(const el of all){
      const t=(el.textContent||'').toLowerCase();
      let score=0;
      if(t.includes('dungeon'))score+=2;
      if(t.includes('quest'))score+=2;
      if(t.includes('inventar'))score+=2;
      if(t.includes('nebel'))score+=2;
      if(t.includes('gilde'))score+=2;
      if(t.includes('hall'))score+=1;
      if(t.includes('rang'))score+=1;
      if(score>bestScore){best=el;bestScore=score}
    }
    return bestScore>=4?best:null;
  }

  function v341MakeLikeSibling(menu){
    const sibling=[...menu.children].find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('dungeon')||t.includes('inventar')||t.includes('gilde')||t.includes('nebel');
    });

    let item;
    if(sibling){
      item=sibling.cloneNode(false);
      item.removeAttribute('id');
      item.removeAttribute('onclick');
      item.removeAttribute('href');
      item.removeAttribute('data-page');
      item.removeAttribute('data-target');
      item.querySelectorAll?.('[id]').forEach(x=>x.removeAttribute('id'));
    }else{
      item=document.createElement('button');
      item.type='button';
    }

    item.setAttribute('data-v341-harz-menu','1');
    item.textContent='💎 Harz & Gold & Rahmen Dealer';
    item.style.cursor='pointer';
    item.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();
      v341OpenDealer();
    };
    return item;
  }

  function v341EnsureMenu(){
    /* Remove failed V4.02 insertion if it landed in a wrong generic container. */
    document.querySelectorAll('[data-v337-harz-dealer]').forEach(el=>{
      if(!el.closest('#v341Keep')) el.remove();
    });

    const menu=v341FindRealDropdown();
    if(!menu)return false;

    if(menu.querySelector('[data-v341-harz-menu]'))return true;

    const item=v341MakeLikeSibling(menu);

    /* Put it after the last real navigation entry, not in an arbitrary generic dropdown. */
    const children=[...menu.children];
    const lastNav=[...children].reverse().find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return /dungeon|quest|inventar|nebel|gilde|hall|rang/.test(t);
    });
    if(lastNav && lastNav.nextSibling)menu.insertBefore(item,lastNav.nextSibling);
    else menu.appendChild(item);

    return true;
  }

  /* V6.97: global dealer dropdown observer retired; startup retries remain. */

  function version(){
    document.querySelectorAll('.version').forEach(el=>el.textContent=V341_VERSION);
  }

  v341EnsureMenu();
  version();
  setTimeout(v341EnsureMenu,250);
  setTimeout(v341EnsureMenu,900);
  setTimeout(v341EnsureMenu,1800);
  setTimeout(version,250);
  setTimeout(version,900);
  setTimeout(version,1800);
})();
