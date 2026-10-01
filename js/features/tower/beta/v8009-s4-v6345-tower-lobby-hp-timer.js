(()=>{
 'use strict';
 if(window.__V6345_TOWER_LOBBY_HP_TIMER__)return;
 window.__V6345_TOWER_LOBBY_HP_TIMER__=true;
 const pad=n=>String(Math.max(0,Math.floor(Number(n)||0))).padStart(2,'0');
 const clock=ms=>{const sec=Math.max(0,Math.ceil((Number(ms)||0)/1000)),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return `${pad(h)}:${pad(m)}:${pad(s)}`};
 function info(){try{const d=window.v6250TowerRecoveryDiagnostics?.();return d?.current&&typeof d.current==='object'?d.current:null}catch(_){return null}}
 function paintLobby(){
   if(document.hidden)return false;
   const root=document.getElementById('tower');if(!root?.classList.contains('active'))return false;
   const bar=root.querySelector('.v6259-lobby-card .v6259-hp');if(!bar)return false;
   const x=info();if(!x)return false;
   const pct=Math.max(0,Math.min(100,Number(x.pct)||0)),step=Math.max(0,Number(x.step)||0),next=Math.max(0,Math.min(step,100-pct)),full=pct>=100;
   let live=bar.querySelector('.v6345-lobby-hp-live');if(!live){live=document.createElement('span');live.className='v6345-lobby-hp-live';bar.appendChild(live)}
   live.classList.toggle('full',full);
   live.innerHTML=full?'💚 100 % · VOLLSTÄNDIG ERHOLT':`💚 ${Math.round(pct)} % HP · <b>+${Math.round(next)} % in ${clock(x.nextMs)}</b>`;
   const fill=bar.querySelector(':scope > i');if(fill)fill.style.width=`${pct}%`;
   const row=[...root.querySelectorAll('.v6259-lobby-card .v6259-lobby-row')].find(x=>/Run-HP/i.test(x.textContent||''));
   const val=row?.querySelector('b');if(val)val.textContent=`${Math.round(pct)}%`;
   const note=root.querySelector('.v6259-lobby-card .v6267-recovery-note');
   if(note)note.textContent=full?'Turm-Leben vollständig regeneriert':`Automatisch +${Math.round(step)}% pro Stunde · nächste +${Math.round(next)}% in ${clock(x.nextMs)}`;
   return true;
 }
 function towerActive(){const root=document.getElementById('tower');return !document.hidden&&!!root?.classList.contains('active')}
 function paintAll(){if(!towerActive())return false;paintLobby();try{window.v6341PaintTowerRecoveryTimer?.()}catch(_){}return true}
 window.v6345PaintTowerLobbyHpTimer=paintLobby;
 window.v6345PaintTowerTimers=paintAll;
 let timer=0;
 function stop(){if(!timer)return;clearInterval(timer);timer=0}
 function start(){if(timer||!towerActive())return;paintAll();timer=window.setInterval(()=>{if(!towerActive()){stop();return}paintAll()},1000)}
 function syncTimer(){towerActive()?start():stop()}
 document.addEventListener('visibilitychange',()=>{syncTimer();if(!document.hidden)paintAll()},{passive:true});
 document.addEventListener('click',e=>{const el=e.target instanceof Element?e.target:null;if(el?.closest?.('[data-go="tower"],[data-screen="tower"],[data-vt-recover],[data-vt-start],[data-vt-tab]'))setTimeout(()=>{syncTimer();paintAll()},60)},true);
 window.addEventListener('pageshow',()=>{syncTimer();paintAll()},{passive:true});
 window.addEventListener('growlegends:account-ready',()=>{syncTimer();paintAll()},{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',()=>{syncTimer();paintAll()},{passive:true});
 syncTimer();
})();
