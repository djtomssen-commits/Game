(function(){
  const VERSION='V4.29 Stable';

  function v387LegacyBoard(){
    const list=document.querySelector('#quests #questList');
    const board=list?.closest('.card');
    if(board)board.classList.add('v387-legacy-board');
    return board;
  }

  function v387EnsureRefresh(){
    const shell=document.querySelector('#quests .v386-shell');
    if(!shell || shell.querySelector('.v387-refresh'))return;

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='v387-refresh';
    btn.textContent='🔄 Neue Aufträge · 10 Gold';
    btn.onclick=()=>{
      const real=document.querySelector('#quests #refreshQuests');
      if(real)real.click();
    };
    shell.appendChild(btn);
  }

  function v387Clean(){
    const root=document.querySelector('#quests');
    if(!root)return;

    /* The original intro is obsolete in the new design. */
    root.querySelectorAll(':scope > .hero-card').forEach(el=>el.style.display='none');

    v387LegacyBoard();

    /* V4.02 placeholder portrait was only a temporary graphic. */
    root.querySelectorAll('.v386-mira-art').forEach(el=>el.remove());

    v387EnsureRefresh();
  }

  const baseRenderQuests=renderQuests;
  renderQuests=function(){
    const result=baseRenderQuests.apply(this,arguments);
    v387Clean();
    return result;
  };

  /* V7.122: duplicate quest-nav cleanup retired; renderQuests owns it. */

  setTimeout(()=>{
    v387Clean();
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  },650);
})();
