(()=>{'use strict';
if(window.__V8009_TOWER_RECOVERY_OWNER__)return;
window.__V8009_TOWER_RECOVERY_OWNER__=true;

const HOUR=60*60*1000;
const REFILL=20;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function step(level){
 level=Math.max(1,Math.floor(Number(level)||1));
 if(level<10)return 25;
 if(level<20)return 20;
 if(level<30)return 15;
 if(level<40)return 10;
 if(level<50)return 7;
 return 5;
}

function normalize(t,level,now=Date.now()){
 if(!t||typeof t!=='object')return 100;
 const m=t.meta||(t.meta={});
 if(!Number.isFinite(Number(m.recoveryPct))||!Number.isFinite(Number(m.recoveryAt))){
   m.recoveryPct=100;
   m.recoveryAt=now;
   m.recoveryVersion=1;
   return 100;
 }
 let pct=clamp(Number(m.recoveryPct)||0,0,100);
 let at=Math.max(0,Number(m.recoveryAt)||now);
 if(pct<100){
   const ticks=Math.max(0,Math.floor((now-at)/HOUR));
   const perHour=step(level);
   if(ticks>0){
     pct=Math.min(100,pct+ticks*perHour);
     at+=ticks*HOUR;
     m.recoveryPct=pct;
     m.recoveryAt=at;
   }
 }else{
   m.recoveryPct=100;
 }
 return pct;
}

function info(t,level,harz,now=Date.now()){
 const pct=normalize(t,level,now);
 const m=t.meta||(t.meta={});
 const perHour=step(level);
 let nextMs=0,fullMs=0;
 if(pct<100){
   const elapsed=Math.max(0,now-(Number(m.recoveryAt)||now));
   nextMs=Math.max(0,HOUR-(elapsed%HOUR));
   const steps=Math.ceil((100-pct)/perHour);
   fullMs=Math.max(0,nextMs+(steps-1)*HOUR);
 }
 return{
   pct,
   nextMs,
   fullMs,
   step:perHour,
   level:Math.max(1,Math.floor(Number(level)||1)),
   harz:Math.max(0,Number(harz)||0)
 };
}

function formatTime(ms){
 ms=Math.max(0,Number(ms)||0);
 const totalMin=Math.max(1,Math.ceil(ms/60000));
 const h=Math.floor(totalMin/60),m=totalMin%60;
 if(h<=0)return `${m} Min.`;
 return `${h} Std. ${m} Min.`;
}

function reset(t){
 if(!t||typeof t!=='object')return 0;
 const m=t.meta||(t.meta={});
 const bonus=Math.max(0,Math.min(100,Number(m.pendingWednesdayRecovery)||0));
 m.recoveryPct=bonus;
 m.recoveryAt=Date.now();
 m.recoveryVersion=1;
 m.pendingWednesdayRecovery=0;
 return bonus;
}

window.v8009TowerRecoveryOwner=Object.freeze({
 version:'V8.009-T3',
 HOUR,
 REFILL,
 step,
 normalize,
 info,
 formatTime,
 reset
});

window.v8009TowerRecoveryDiagnostics=()=>({
 owner:true,
 version:'V8.009-T3',
 hourMs:HOUR,
 refillPct:REFILL
});
})();