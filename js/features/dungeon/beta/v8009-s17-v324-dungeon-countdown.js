(function(){
  function v324LeftMs(){
    const last=Number(s.dungeonPass?.lastFree)||0;
    return Math.max(0,3600000-(Date.now()-last));
  }
  function v324Time(ms){
    const total=Math.max(0,Math.ceil(ms/1000));
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const sec=total%60;
    return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }
  function v324EnsureBox(){
    const btn=document.querySelector('#fightBtn');
    if(!btn)return null;
    let box=document.querySelector('#v324DungeonCountdown');
    if(!box){
      box=document.createElement('div');
      box.id='v324DungeonCountdown';
      btn.parentNode?.insertBefore(box,btn);
    }
    return box;
  }
  function v324Paint(){
    if(document.hidden || !document.querySelector('#dungeon')?.classList.contains('active'))return;
    const box=v324EnsureBox();
    const btn=document.querySelector('#fightBtn');
    if(!box||!btn)return;
    const left=v324LeftMs();
    const di=Math.max(0,Math.min((dungeons?.length||1)-1,Number(s.dungeon?.selected)||0));
    const done=typeof dungeonCompleted==='function' && dungeonCompleted(di);
    if(done){box.style.display='none';return;}
    box.style.display='block';
    if(left<=0){
      box.className='ready';
      box.textContent='✅ Nächster Dungeon-Kampf kostenlos bereit';
    }else{
      box.className='wait';
      box.textContent=`⏳ Nächster kostenloser Kampf in ${v324Time(left)} · oder sofort für 1 Harz-Taler`;
      if(!battleBusy && !btn.disabled) btn.textContent='🟢 Sofort kämpfen · 1 Harz-Taler';
    }
  }
  window.v324Paint=v324Paint;
  /* Phase 2 retired: countdown renderDungeon wrapper; the countdown has its own clock
     and the canonical battle owner performs an immediate paint. */
  setInterval(()=>{
    if(document.hidden||!document.querySelector('#dungeon')?.classList.contains('active'))return;
    v324Paint();
  },1000);
  setTimeout(v324Paint,250);
  
  const line=document.querySelector('#v141VersionLine');
})();
