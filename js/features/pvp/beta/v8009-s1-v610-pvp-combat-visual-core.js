
(()=>{
 'use strict';
 /* V7.156: old PvP visual observer/wrapper lane retired. This block now only
    provides the tiny DOM compatibility surface still used by the authoritative
    V7.053 replay renderer. No observer, no lifecycle timer, no fight wrapper. */
 window.__V610_PVP_COMBAT_VISUAL__=true;
 const $=q=>document.querySelector(q);
 function ensure(){
   try{window.v209EnsureBattleUi?.()}catch(_){}
   const stage=$('#v209PvpBattleOverlay .v209-stage');
   if(!stage)return null;
   let round=stage.querySelector(':scope > .v610-pvp-round');
   if(!round){round=document.createElement('div');round.className='v610-pvp-round';round.textContent='BEREIT';stage.appendChild(round)}
   let procs=stage.querySelector(':scope > .v610-pvp-procs');
   if(!procs){procs=document.createElement('div');procs.className='v610-pvp-procs';stage.appendChild(procs)}
   const hidden=$('#v209BattleLog');
   if(hidden && !$('#v209PvpBattleOverlay .v610-pvp-log')){
     const box=document.createElement('div');box.className='v610-pvp-log';
     box.innerHTML='<div class="v610-pvp-log-head"><span>📜 Kampfverlauf</span><span>letzte Runden</span></div><div class="v610-pvp-log-lines"></div>';
     hidden.insertAdjacentElement('afterend',box);
   }
   return stage;
 }
 function reset(){
   ensure();
   const host=$('#v209PvpBattleOverlay .v610-pvp-log-lines');if(host)host.innerHTML='';
   const r=$('#v209PvpBattleOverlay .v610-pvp-round');if(r)r.textContent='BEREIT';
   const p=$('#v209PvpBattleOverlay .v610-pvp-procs');if(p)p.innerHTML='';
 }
 window.v610EnsurePvpVisual=ensure;
 window.v610PvpVisualReset=reset;
 window.v7155PvpCompatDiagnostics=()=>({stage:!!ensure(),observerRetired:true,legacyFightWrappersRetired:true});
})();
