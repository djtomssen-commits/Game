(()=>{
 'use strict';
 if(window.__V6341_TOWER_RECOVERY_LIVE__)return;
 window.__V6341_TOWER_RECOVERY_LIVE__=true;
 const pad=n=>String(Math.max(0,Math.floor(Number(n)||0))).padStart(2,'0');
 const clock=ms=>{const sec=Math.max(0,Math.ceil((Number(ms)||0)/1000)),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return `${pad(h)}:${pad(m)}:${pad(s)}`};
 function info(){try{const d=window.v6250TowerRecoveryDiagnostics?.();return d?.current&&typeof d.current==='object'?d.current:null}catch(_){return null}}
 function paint(){
   if(document.hidden)return false;
   const root=document.getElementById('tower'),bar=root?.querySelector('.vT-recovery-bar');
   if(!root||!bar)return false;
   const x=info();if(!x)return false;
   let live=bar.querySelector('.v6341-recovery-live');
   if(!live){live=document.createElement('span');live.className='v6341-recovery-live';bar.appendChild(live)}
   const pct=Math.max(0,Math.min(100,Number(x.pct)||0)),step=Math.max(0,Number(x.step)||0),next=Math.max(0,Math.min(step,100-pct)),full=pct>=100;
   live.classList.toggle('full',full);
   live.innerHTML=full?'💚 100 % · VOLLSTÄNDIG ERHOLT':`💚 ${Math.round(pct)} % HP · <b>+${Math.round(next)} % in ${clock(x.nextMs)}</b>`;
   const fill=bar.querySelector(':scope > i');if(fill)fill.style.width=`${pct}%`;
   const head=root.querySelector('.vT-recovery-head strong');if(head)head.textContent=`${Math.round(pct)} %`;
   const meta=root.querySelector('.vT-recovery-meta');
   if(meta){const spans=meta.querySelectorAll('span');if(spans[0])spans[0].textContent=`+${Math.round(step)} % HP pro Stunde`;if(spans[1])spans[1].textContent=full?'Vollständig erholt':`Nächste +${Math.round(next)} % in ${clock(x.nextMs)} · 100 % in ${typeof x.fullMs==='number'?clock(x.fullMs):'--:--:--'}`}
   return true;
 }
 window.v6341PaintTowerRecoveryTimer=paint;
})();
